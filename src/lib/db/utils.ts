import { Timestamp } from 'firebase-admin/firestore';

/**
 * Database utility functions
 */

/**
 * Convert Firestore Timestamp to JavaScript Date
 */
export function timestampToDate(timestamp: Timestamp | Date): Date {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return timestamp.toDate();
}

/**
 * Convert JavaScript Date to Firestore Timestamp
 */
export function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

/**
 * Generate a unique ID for documents
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Sanitize data for Firestore (remove undefined values)
 */
export function sanitizeForFirestore<T extends Record<string, any>>(data: T): T {
  const sanitized = { ...data };
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === undefined) {
      delete sanitized[key];
    }
  });
  return sanitized;
}

/**
 * Convert Firestore document to typed object
 */
export function docToObject<T>(doc: FirebaseFirestore.DocumentSnapshot): T | null {
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() } as T;
}

/**
 * Batch convert Firestore documents to typed objects
 */
export function docsToObjects<T>(docs: FirebaseFirestore.QuerySnapshot): T[] {
  return docs.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
}
