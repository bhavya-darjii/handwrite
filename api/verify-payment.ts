import crypto from 'crypto';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// 1. Initialize Firebase Admin (Only once)
if (!getApps().length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
    initializeApp({
      credential: cert(serviceAccount)
    });
  } catch (e) {
    console.error("Firebase Admin Init Error:", e);
  }
}

const db = getFirestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature, 
    userId, 
    creditsToAdd 
  } = req.body;

  const secret = process.env.RAZORPAY_KEY_SECRET!; 

  // 2. Generate the expected signature to verify authenticity
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body.toString())
    .digest('hex');

  // 3. Compare signatures
  if (expectedSignature === razorpay_signature) {
    try {
      if (!userId) throw new Error("No User ID provided");

      // 4. LOGIC: Calculate Expiry (Now + 30 Days)
      const now = new Date();
      const expiryDate = new Date(now);
      expiryDate.setDate(now.getDate() + 30);

      const userRef = db.collection('users').doc(userId);
      
      // 5. Update Firestore safely
      await userRef.update({
        credits: FieldValue.increment(Number(creditsToAdd)), // Add credits
        expiryDate: Timestamp.fromDate(expiryDate),          // Set new 30-day expiry
        lastPurchaseDate: Timestamp.now(),                   // Track when they bought
        lastPaymentId: razorpay_payment_id                   // Track the payment ID
      });

      console.log(`Success: Added ${creditsToAdd} credits to user ${userId}`);

      return res.status(200).json({ 
        status: 'ok',
        newExpiry: expiryDate.toISOString() 
      });

    } catch (error: any) {
      console.error("Database Update Error:", error);
      return res.status(500).json({ status: 'error', message: error.message });
    }
  } else {
    console.error("Invalid Signature: Payment verification failed");
    return res.status(400).json({ status: 'verification_failed' });
  }
}