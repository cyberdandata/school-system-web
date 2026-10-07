import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';

dotenv.config();

try {
  if (getApps().length === 0) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // Use the JSON string provided in Railway environment variables
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      initializeApp({ credential: cert(serviceAccount) });
    } else {
      // Fall back to default behavior (e.g. for local dev if set up via gcloud or GOOGLE_APPLICATION_CREDENTIALS)
      initializeApp();
    }
    console.log('✅ Firebase Admin SDK initialized successfully.');
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error);
}

export const db = getApps().length > 0 ? getFirestore() : null;
export const auth = getApps().length > 0 ? getAuth() : null;
