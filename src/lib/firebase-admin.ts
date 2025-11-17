import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let db: Firestore;

/**
 * Initialize Firebase Admin SDK
 * Uses service account credentials from environment variables
 */
export function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    // For local development, you can use a service account JSON file
    // For production, use environment variables
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      app = initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      // Fallback for development - Firebase will use default credentials
      app = initializeApp();
    }
  } else {
    app = getApps()[0];
  }

  if (!db) {
    db = getFirestore(app);
  }

  return { app, db };
}

/**
 * Get Firestore database instance
 */
export function getDb(): Firestore {
  if (!db) {
    initializeFirebaseAdmin();
  }
  return db;
}

/**
 * Get Firebase Admin app instance
 */
export function getAdminApp(): App {
  if (!app) {
    initializeFirebaseAdmin();
  }
  return app;
}
