const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface PaymentInitResponse {
  success: boolean;
  paymentUrl?: string;
  message?: string;
}

class PaymentService {
  private async makeRequest(endpoint: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    return result;
  }

  async initiatePayment(
    orderId: string, 
    amount: number, 
    customer: {
      email: string;
      name: string;
    }
  ): Promise<PaymentInitResponse> {
    try {
      const response = await this.makeRequest('payments/initiate', {
        orderId,
        amount,
        customerEmail: customer.email,
        customerName: customer.name,
        itemName: `Order #${orderId}`
      });

      return {
        success: true,
        paymentUrl: response.paymentUrl
      };
    } catch (error) {
      console.error('Payment initiation failed:', error);
      return {
        success: false,
        message: 'Failed to initiate payment'
      };
    }
  }
}

export default new PaymentService();
