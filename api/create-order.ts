import Razorpay from 'razorpay';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Now using environment variables - No more hardcoding
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!, 
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  try {
    const { amount } = req.body;
    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    // We send the order data PLUS the public key ID to the frontend
    return res.status(200).json({
      ...order,
      razorpay_public_key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}