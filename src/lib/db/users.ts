'use server';

import { getDb } from '../firebase-admin';
import { COLLECTIONS, type DbUser } from './types';
import { sanitizeForFirestore, docToObject } from './utils';
import { randomBytes } from 'crypto';

/**
 * User database operations
 */

/**
 * Create or update user profile
 */
export async function upsertUser(data: {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}): Promise<DbUser> {
  const db = getDb();
  const userRef = db.collection(COLLECTIONS.USERS).doc(data.id);
  const doc = await userRef.get();
  
  if (doc.exists) {
    // Update existing user
    await userRef.update({
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      lastLoginAt: new Date(),
    });
  } else {
    // Create new user
    const newUser: Omit<DbUser, 'id'> = {
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      plan: 'free',
    };
    await userRef.set(sanitizeForFirestore(newUser));
  }
  
  const updatedDoc = await userRef.get();
  return docToObject<DbUser>(updatedDoc)!;
}

/**
 * Get user by ID
 */
export async function getUser(userId: string): Promise<DbUser | null> {
  const db = getDb();
  const doc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
  return docToObject<DbUser>(doc);
}

/**
 * Generate API key for user
 */
export async function generateApiKey(userId: string): Promise<string> {
  const db = getDb();
  const apiKey = `magnet_${randomBytes(32).toString('hex')}`;
  
  await db.collection(COLLECTIONS.USERS).doc(userId).update({
    apiKey,
  });
  
  return apiKey;
}

/**
 * Verify API key and get user
 */
export async function verifyApiKey(apiKey: string): Promise<DbUser | null> {
  const db = getDb();
  const snapshot = await db
    .collection(COLLECTIONS.USERS)
    .where('apiKey', '==', apiKey)
    .limit(1)
    .get();
  
  if (snapshot.empty) {
    return null;
  }
  
  return docToObject<DbUser>(snapshot.docs[0]);
}

/**
 * Update user plan
 */
export async function updateUserPlan(
  userId: string,
  plan: 'free' | 'pro' | 'enterprise'
): Promise<DbUser | null> {
  const db = getDb();
  const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
  
  await userRef.update({ plan });
  
  const doc = await userRef.get();
  return docToObject<DbUser>(doc);
}
