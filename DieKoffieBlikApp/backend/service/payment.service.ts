import crypto from 'crypto';
import { PAYFAST_CONFIG } from '../config/payment';

export function generateSignature(params: Record<string, string>) {
  const queryString = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key] ?? '').replace(/%20/g, '+')}`)
    .join('&');
  
  return crypto.createHash('md5').update(queryString).digest('hex');
}
