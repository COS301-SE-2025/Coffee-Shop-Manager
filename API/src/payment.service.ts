type CustomerInfo = {
  name: string;
  phone: string;
  email: string;
  notes: string;
};

class PaymentService {
  private static MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || "10000100";
  private static MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || "46f0cd694581a";
  private static PAYFAST_URL = process.env.PAYFAST_URL || "https://sandbox.payfast.co.za/eng/process";
  private static RETURN_URL = process.env.PAYFAST_RETURN_URL || "http://localhost:3000/userdashboard";
  private static CANCEL_URL = process.env.PAYFAST_CANCEL_URL || "http://localhost:3000/userdashboard";
  private static NOTIFY_URL = process.env.PAYFAST_NOTIFY_URL || "http://localhost:5000/userdashboard";

  static async initiatePayment(
    orderNumber: string,
    total: number,
    customerInfo: CustomerInfo,
  ) {
    try {
      // Log environment variables for debugging
      console.log('Return URL:', this.RETURN_URL);
      console.log('Cancel URL:', this.CANCEL_URL);
      console.log('Notify URL:', this.NOTIFY_URL);

      // Split customer name into first and last
      const nameParts = customerInfo.name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || firstName;

      // Ensure email exists (PayFast requires it)
      const email = customerInfo.email || `${customerInfo.phone}@tempmail.com`;

      // Basic payment data
      const paymentData = {
        merchant_id: this.MERCHANT_ID,
        merchant_key: this.MERCHANT_KEY,
        return_url: this.RETURN_URL,
        cancel_url: this.CANCEL_URL,
        notify_url: this.NOTIFY_URL,
        name_first: firstName,
        name_last: lastName,
        email_address: email,
        m_payment_id: orderNumber,
        amount: total.toFixed(2),
        item_name: `Coffee Shop Order #${orderNumber}`,
        item_description: customerInfo.notes || `Order for ${customerInfo.name}`,
      };

      // Build the payment URL
      const params = new URLSearchParams(paymentData).toString();
      const paymentUrl = `${this.PAYFAST_URL}?${params}`;

      console.log("Payment URL created:", paymentUrl);

      return {
        success: true,
        paymentUrl,
        orderNumber,
      };
    } catch (error) {
      console.error("Payment initiation error:", error);
      return {
        success: false,
        message: (error as Error).message,
      };
    }
  }
}

export default PaymentService;
