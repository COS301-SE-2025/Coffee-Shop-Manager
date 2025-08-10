export const PAYFAST_CONFIG = {
  merchantId: process.env.PAYFAST_MERCHANT_ID!,
  merchantKey: process.env.PAYFAST_MERCHANT_KEY!,
  passphrase: process.env.PAYFAST_PASSPHRASE!,
  returnUrl: process.env.PAYFAST_RETURN_URL!,
  cancelUrl: process.env.PAYFAST_CANCEL_URL!,
  notifyUrl: 'http://localhost:3000/payment/notify',
  sandbox: true
};
