export interface PaymentResult {
  success: boolean;
  reference: string;
  method: string;
  error?: string;
}

export interface PaymentProvider {
  processPayment(amount: number, metadata: Record<string, string>): Promise<PaymentResult>;
}

class DemoPaymentProvider implements PaymentProvider {
  async processPayment(amount: number, metadata: Record<string, string>): Promise<PaymentResult> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 90% success rate for demo
    const success = Math.random() > 0.1;
    const reference = `DEMO-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    
    return {
      success,
      reference,
      method: 'DEMO_PAYMENT',
      error: success ? undefined : 'Payment declined by demo provider'
    };
  }
}

export function getPaymentProvider(): PaymentProvider {
  // In production, check env for real provider
  // if (process.env.PAYMENT_PROVIDER === 'razorpay') return new RazorpayProvider();
  return new DemoPaymentProvider();
}
