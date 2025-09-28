import { Request, Response } from "express";
import { supabase } from "../../supabase/client";

export async function paymentNotificationHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    // Log the entire request for debugging
    console.log("PayFast notification received:", req.body);
    
    const { payment_status, m_payment_id } = req.body;
    
    if (payment_status === "COMPLETE" && m_payment_id) {
      // Update the order status in the database
      const { data, error } = await supabase
        .from("orders")
        .update({ paid_status: "paid" })
        .eq("id", m_payment_id)
        .select("*")
        .maybeSingle();
        
      if (error) {
        console.error("PayFast notification - Supabase update error:", error);
      } else {
        console.log("PayFast notification - Order marked as paid:", m_payment_id);
      }
    }
    
    // Always return 200 OK to PayFast
    res.status(200).send("OK");
  } catch (err) {
    console.error("PayFast notification error:", err);
    // Always return 200 OK to PayFast even if there's an error
    res.status(200).send("OK");
  }
}