import { Request, Response } from "express";
import crypto from "crypto";

function validatePayFastSignature(reqBody: any, passphrase: string): boolean {
  // 1. Sort keys alphabetically, build query string (excluding signature)
  const keys = Object.keys(reqBody).filter(k => k !== "signature").sort();
  const query = keys.map(k => `${k}=${encodeURIComponent(reqBody[k])}`).join("&");
  const signatureString = passphrase ? `${query}&passphrase=${encodeURIComponent(passphrase)}` : query;
  // 2. Generate md5 hash
  const hash = crypto.createHash("md5").update(signatureString).digest("hex");
  // 3. Compare with provided signature
  return hash === reqBody.signature;
}

export async function paymentNotificationHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    console.log("PayFast notification received:", req.body);

    const supabase = req.supabase!;

    const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE || "";
    if (!validatePayFastSignature(req.body, PAYFAST_PASSPHRASE)) {
      console.error("PayFast notification - Invalid signature");
      res.status(200).send("OK");
      return;
    }

    const { payment_status, m_payment_id, pf_payment_id, amount_gross } = req.body;

    if (payment_status === "COMPLETE" && m_payment_id) {
      // Find the payment record for this order
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .select("id, amount, order_id, status")
        .eq("order_id", m_payment_id)
        .maybeSingle();

      if (paymentError || !payment) {
        console.error("PayFast notification - Payment not found for order:", m_payment_id);
      } else {
        // Check amount matches
        if (parseFloat(payment.amount) !== parseFloat(amount_gross)) {
          console.warn("PayFast notification - Amount mismatch!", { expected: payment.amount, received: amount_gross });
        }

        // Update payment status and transaction id
        const { error: updatePaymentError } = await supabase
          .from("payments")
          .update({ status: "completed", transaction_id: pf_payment_id })
          .eq("id", payment.id);

        if (updatePaymentError) {
          console.error("PayFast notification - Payment update error:", updatePaymentError);
        } else {
          console.log("PayFast notification - Payment marked as completed:", payment.id);
        }
      }
    }

    // Always return 200 OK to PayFast
    res.status(200).send("OK");
  } catch (err) {
    console.error("PayFast notification error:", err);
    res.status(200).send("OK");
  }
}