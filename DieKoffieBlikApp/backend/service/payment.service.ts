type CustomerInfo = {
  name: string;
  phone: string;
  email: string;
  notes: string;
};

class PaymentService {
  private static MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || '10000100'; // Fallback to sandbox
  private static MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a'; // Fallback to sandbox
  private static PAYFAST_URL = process.env.PAYFAST_URL || 'https://sandbox.payfast.co.za/eng/process'; // Fallback to sandbox

  static async initiatePayment(orderNumber: string, total: number, customerInfo: CustomerInfo) {
    try {
      // Split customer name into first and last
      const nameParts = customerInfo.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || firstName;
      
      // Ensure email exists (PayFast requires it)
      const email = customerInfo.email || `${customerInfo.phone}@tempmail.com`;
      
      // Basic payment data
      const paymentData = {
        merchant_id: this.MERCHANT_ID,
        merchant_key: this.MERCHANT_KEY,
        return_url: 'https://payment-result/success',
        cancel_url: 'https://payment-result/failed',
        notify_url: 'https://your-backend.com/api/payfast/notify', // webhook for backend verification
        name_first: firstName,
        name_last: lastName,
        email_address: email,
        m_payment_id: orderNumber,
        amount: total.toFixed(2),
        item_name: 'Coffee Shop Order',
        item_description: `Order ${orderNumber} - ${customerInfo.name}`
      };

      // Build the payment URL
      const params = new URLSearchParams(paymentData).toString();
      const paymentUrl = `${this.PAYFAST_URL}?${params}`;

      console.log('Payment URL created:', paymentUrl);

      return {
        success: true,
        message: 'Payment URL created successfully',
        paymentUrl: paymentUrl,
        orderNumber: orderNumber
      };

    } catch (error) {
      console.error('Payment service error:', error);
      return {
        success: false,
        message: 'Failed to create payment URL: ' + (error as Error).message
      };
    }
  }
}

export default PaymentService;