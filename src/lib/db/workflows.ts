'use server';

import { getDb } from '../firebase-admin';
import { COLLECTIONS, type DbWorkflow } from './types';
import { sanitizeForFirestore, docToObject, docsToObjects, generateId } from './utils';
import type { WorkflowNode, WorkflowConnection } from '../types';

/**
 * Workflow database operations
 */

/**
 * Create a new workflow
 */
export async function createWorkflow(data: {
  name: string;
  description?: string;
  userId: string;
  nodes?: WorkflowNode[];
  connections?: WorkflowConnection[];
  isPublic?: boolean;
  tags?: string[];
}): Promise<DbWorkflow> {
  const db = getDb();
  const now = new Date();
  
  const workflow: Omit<DbWorkflow, 'id'> = {
    name: data.name,
    description: data.description,
    userId: data.userId,
    nodes: data.nodes || [],
    connections: data.connections || [],
    createdAt: now,
    updatedAt: now,
    isPublic: data.isPublic || false,
    tags: data.tags || [],
  };

  const docRef = await db.collection(COLLECTIONS.WORKFLOWS).add(sanitizeForFirestore(workflow));
  const doc = await docRef.get();
  
  return docToObject<DbWorkflow>(doc)!;
}

/**
 * Get a workflow by ID
 */
export async function getWorkflow(workflowId: string): Promise<DbWorkflow | null> {
  const db = getDb();
  const doc = await db.collection(COLLECTIONS.WORKFLOWS).doc(workflowId).get();
  return docToObject<DbWorkflow>(doc);
}

/**
 * Get all workflows for a user
 */
export async function getUserWorkflows(userId: string): Promise<DbWorkflow[]> {
  const db = getDb();
  const snapshot = await db
    .collection(COLLECTIONS.WORKFLOWS)
    .where('userId', '==', userId)
    .orderBy('updatedAt', 'desc')
    .get();
  
  return docsToObjects<DbWorkflow>(snapshot);
}

/**
 * Update a workflow
 */
export async function updateWorkflow(
  workflowId: string,
  updates: {
    name?: string;
    description?: string;
    nodes?: WorkflowNode[];
    connections?: WorkflowConnection[];
    isPublic?: boolean;
    tags?: string[];
  }
): Promise<DbWorkflow | null> {
  const db = getDb();
  const docRef = db.collection(COLLECTIONS.WORKFLOWS).doc(workflowId);
  
  const updateData = {
    ...updates,
    updatedAt: new Date(),
  };

  await docRef.update(sanitizeForFirestore(updateData));
  const doc = await docRef.get();
  
  return docToObject<DbWorkflow>(doc);
}

/**
 * Delete a workflow
 */
export async function deleteWorkflow(workflowId: string): Promise<void> {
  const db = getDb();
  await db.collection(COLLECTIONS.WORKFLOWS).doc(workflowId).delete();
  
  // TODO: Also delete associated executions, webhooks, etc.
}

/**
 * Duplicate a workflow
 */
export async function duplicateWorkflow(
  workflowId: string,
  userId: string,
  newName?: string
): Promise<DbWorkflow> {
  const original = await getWorkflow(workflowId);
  if (!original) {
    throw new Error('Workflow not found');
  }

  return createWorkflow({
    name: newName || `${original.name} (Copy)`,
    description: original.description,
    userId,
    nodes: original.nodes,
    connections: original.connections,
    isPublic: false,
    tags: original.tags,
  });
}

/**
 * Get public workflows (for template browsing)
 */
export async function getPublicWorkflows(limit: number = 20): Promise<DbWorkflow[]> {
  const db = getDb();
  const snapshot = await db
    .collection(COLLECTIONS.WORKFLOWS)
    .where('isPublic', '==', true)
    .orderBy('updatedAt', 'desc')
    .limit(limit)
    .get();
  
  return docsToObjects<DbWorkflow>(snapshot);
}

/**
 * Search workflows by name or tags
 */
export async function searchWorkflows(
  userId: string,
  query: string
): Promise<DbWorkflow[]> {
  const db = getDb();
  
  // Note: Firestore doesn't support full-text search natively
  // This is a simple implementation - for production, use Algolia or similar
  const snapshot = await db
    .collection(COLLECTIONS.WORKFLOWS)
    .where('userId', '==', userId)
    .get();
  
  const workflows = docsToObjects<DbWorkflow>(snapshot);
  
  // Filter in memory (not ideal for large datasets)
  const lowerQuery = query.toLowerCase();
  return workflows.filter(w => 
    w.name.toLowerCase().includes(lowerQuery) ||
    w.description?.toLowerCase().includes(lowerQuery) ||
    w.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}