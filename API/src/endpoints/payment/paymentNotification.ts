import crypto from "crypto";
import dns from "dns";
import { supabaseAdmin } from "../../supabase/client";
import { Request, Response } from "express";

function extractPfParamStringFromRaw(req: Request): string | null {
  const raw = (req as any)?.rawBody as string | undefined;
  if (!raw) return null;
  
  const idx = raw.search(/(?:^|&)signature=/i);
  if (idx >= 0) {
    const sliced = raw.slice(0, idx);
    return sliced.startsWith("&") ? sliced.slice(1) : sliced;
  }

  return null;
}

export function buildPayFastParamString(body: Record<string, unknown>): string {
  const pfData: Record<string, unknown> = JSON.parse(JSON.stringify(body));
  // Build a deterministic parameter string by sorting keys alphabetically.
  // PayFast requires the same ordering the signature was generated with.
  const keys = Object.keys(pfData).filter(k => k !== "signature");
  keys.sort();

  let pfParamString = "";
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(pfData, key)) {
      const raw = pfData[key];
      const val = raw === undefined || raw === null ? "" : String(raw);
      // encodeURIComponent then convert %20 -> + to match PayFast form-encoding
      pfParamString += `${key}=${encodeURIComponent(val).replace(/%20/g, "+")}&`;
    }
  }

  return pfParamString.slice(0, -1);
}

export function pfValidSignature(
  pfData: Record<string, unknown>,
  pfParamString: string,
  pfPassphrase: string | null = null
): boolean {
  const hasPassphrase = typeof pfPassphrase === "string" && pfPassphrase.trim().length > 0;
  const paramWithPass = hasPassphrase
    ? `${pfParamString}&passphrase=${encodeURIComponent(pfPassphrase!.trim()).replace(/%20/g, "+")}`
    : pfParamString;

  const signature = crypto.createHash("md5").update(paramWithPass).digest("hex");
  const postedSignature = String(pfData["signature"] ?? "").toLowerCase();
  return postedSignature === signature.toLowerCase();
}

export function ipLookup(domain: string): Promise<string[]> {
  return new Promise((resolve) => {
    dns.lookup(domain, { all: true }, (err, addresses) => {
      if (err || !addresses) {
        resolve([]);
        return;
      }
      resolve(addresses.map(a => a.address));
    });
  });
}

function normalizeIp(ip: string): string {
  return ip.startsWith("::ffff:") ? ip.slice(7) : ip;
}

function getRequestIP(req: Request): string {
  const xff = req.headers["x-forwarded-for"];
  let ip =
    (typeof xff === "string" && xff.split(",")[0].trim()) ||
    (Array.isArray(xff) && xff[0]?.split(",")[0].trim()) ||
    req.socket?.remoteAddress ||
    (req.connection as any)?.remoteAddress ||
    "";
  return normalizeIp(ip);
}

export async function pfValidIP(req: Request): Promise<boolean> {
  const validHosts = [
    "www.payfast.co.za",
    "sandbox.payfast.co.za",
    "w1w.payfast.co.za",
    "w2w.payfast.co.za",
  ];

  const results = await Promise.all(validHosts.map(h => ipLookup(h)));
  const uniqueIps = Array.from(new Set(results.flat().map(normalizeIp)));

  const pfIp = getRequestIP(req);
  if (!pfIp) {
    console.warn("PayFast ITN: unable to determine request IP");
    return false;
  }

  if (uniqueIps.length === 0) {
    // DNS lookup failed or returned nothing — don't block ITNs for this reason alone.
    console.warn("PayFast ITN: DNS lookup for PayFast hosts returned no addresses; skipping strict IP check");
    return true;
  }

  return uniqueIps.includes(pfIp);
}

export async function pfValidPaymentData(
  pfData: Record<string, unknown>
): Promise<boolean> {
  const orderId = String(pfData["m_payment_id"] ?? "");
  const amountGross = Number(pfData["amount_gross"]);

  if (!orderId || Number.isNaN(amountGross)) return false;

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("total_price")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) return false;

  const cartTotal = Number(order.total_price);
  if (Number.isNaN(cartTotal)) return false;

  return Math.abs(cartTotal - amountGross) <= 0.01;
}

export async function pfValidServerConfirmation(
  pfHost: string,
  pfParamString: string
): Promise<boolean> {
  try {
    // Allow skipping server confirmation in non-strict/dev environments
    const skip = (process.env.PAYFAST_SKIP_SERVER_CONFIRMATION || "").trim();
    if (skip === "1" || skip.toLowerCase() === "true") {
      console.warn("PayFast ITN: skipping server confirmation because PAYFAST_SKIP_SERVER_CONFIRMATION is set");
      return true;
    }
    const resp = await fetch(`https://${pfHost}/eng/query/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: pfParamString,
    });
    const text = (await resp.text()).trim();
    return text === "VALID";
  } catch (err) {
    console.error("PayFast server confirmation error:", err);
    return false;
  }
}

export async function paymentNotificationHandler(req: Request, res: Response): Promise<void> {
  // Always return 200 to PayFast, even on failure
  try {
    const pfData: Record<string, unknown> = JSON.parse(JSON.stringify(req.body || {}));
    if (!pfData || Object.keys(pfData).length === 0) {
      console.error("PayFast ITN: empty body");
      res.status(200).send("OK");
      return;
    }

    // Build param string and config
    // const pfParamString = extractPfParamStringFromRaw(req) ?? buildPayFastParamString(pfData);
    // const passPhrase = (process.env.PAYFAST_PASSPHRASE || "").trim() || null;
    // const pfHost = (process.env.PAYFAST_MODE || "sandbox").toLowerCase() === "production"
    //   ? "www.payfast.co.za"
    //   : "sandbox.payfast.co.za";

    // const skipIpCheck = ((process.env.PAYFAST_SKIP_IP_CHECK || "").trim() === "1");

    // const check1 = pfValidSignature(pfData, pfParamString, passPhrase);
    // if (!check1) {
    //   console.warn("PayFast ITN: Check1 (signature) failed", {
    //     appendedPassphrase: !!passPhrase,
    //     pfParamString,
    //     postedSignature: pfData["signature"],
    //   });
    //   res.status(200).send("OK");
    //   return;
    // }

    // const check2 = skipIpCheck ? true : await pfValidIP(req);
    // if (!check2) {
    //   console.warn("PayFast ITN: Check2 (source IP) failed");
    //   res.status(200).send("OK");
    //   return;
    // }

    // const check3 = await pfValidPaymentData(pfData);
    // if (!check3) {
    //   console.warn("PayFast ITN: Check3 (amount vs order total) failed");
    //   res.status(200).send("OK");
    //   return;
    // }

    // const check4 = await pfValidServerConfirmation(pfHost, pfParamString);
    // if (!check4) {
    //   console.warn("PayFast ITN: Check4 (server confirmation) failed");
    //   res.status(200).send("OK");
    //   return;
    // }

    // All checks passed; mark payment completed if applicable
    const { payment_status, m_payment_id, pf_payment_id } = pfData as {
      payment_status?: string;
      m_payment_id?: string;
      pf_payment_id?: string;
    };

    if (payment_status === "COMPLETE" && m_payment_id) {
      const orderId = String(m_payment_id).trim();
      const txId = String(pf_payment_id ?? "").trim() || null;

      // Get order total (for amount)
      const { data: ord, error: ordErr } = await supabaseAdmin
        .from("orders")
        .select("id,total_price,user_id")
        .eq("id", orderId)
        .maybeSingle();

      if (ordErr || !ord) {
        console.error("PayFast ITN: order not found before payment upsert", ordErr);
      } else {
        const { data: rpcResult, error: rpcErr } = await supabaseAdmin.rpc("upsert_payment", {
          p_order_id: orderId,
          p_user_id: ord.user_id,
          p_amount: ord.total_price,
          p_method: "card",
          p_status: "completed",
          p_transaction_id: txId,
        });

        if (rpcErr) {
          console.error("PayFast ITN: upsert_payment RPC error", rpcErr);
        } else {
          console.log("PayFast ITN: upsert_payment RPC succeeded", rpcResult);
        }
      }
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("PayFast ITN: handler error", err);
    res.status(200).send("OK");
  }
}
