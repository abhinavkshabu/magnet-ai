'use server';

import { getDb } from '../firebase-admin';
import { COLLECTIONS, type DbExecution, type DbExecutionLog } from './types';
import { sanitizeForFirestore, docToObject, docsToObjects } from './utils';

/**
 * Execution database operations
 */

/**
 * Create a new execution record
 */
export async function createExecution(data: {
  workflowId: string;
  userId: string;
  triggeredBy: 'manual' | 'webhook' | 'schedule' | 'api';
  triggerData?: Record<string, any>;
}): Promise<DbExecution> {
  const db = getDb();
  
  const execution: Omit<DbExecution, 'id'> = {
    workflowId: data.workflowId,
    userId: data.userId,
    status: 'pending',
    startedAt: new Date(),
    triggeredBy: data.triggeredBy,
    triggerData: data.triggerData,
  };

  const docRef = await db.collection(COLLECTIONS.EXECUTIONS).add(sanitizeForFirestore(execution));
  const doc = await docRef.get();
  
  return docToObject<DbExecution>(doc)!;
}

/**
 * Get an execution by ID
 */
export async function getExecution(executionId: string): Promise<DbExecution | null> {
  const db = getDb();
  const doc = await db.collection(COLLECTIONS.EXECUTIONS).doc(executionId).get();
  return docToObject<DbExecution>(doc);
}

/**
 * Get all executions for a workflow
 */
export async function getWorkflowExecutions(
  workflowId: string,
  limit: number = 50
): Promise<DbExecution[]> {
  const db = getDb();
  const snapshot = await db
    .collection(COLLECTIONS.EXECUTIONS)
    .where('workflowId', '==', workflowId)
    .orderBy('startedAt', 'desc')
    .limit(limit)
    .get();
  
  return docsToObjects<DbExecution>(snapshot);
}

/**
 * Get all executions for a user
 */
export async function getUserExecutions(
  userId: string,
  limit: number = 50
): Promise<DbExecution[]> {
  const db = getDb();
  const snapshot = await db
    .collection(COLLECTIONS.EXECUTIONS)
    .where('userId', '==', userId)
    .orderBy('startedAt', 'desc')
    .limit(limit)
    .get();
  
  return docsToObjects<DbExecution>(snapshot);
}

/**
 * Update execution status
 */
export async function updateExecutionStatus(
  executionId: string,
  status: DbExecution['status'],
  error?: string
): Promise<DbExecution | null> {
  const db = getDb();
  const docRef = db.collection(COLLECTIONS.EXECUTIONS).doc(executionId);
  
  const updateData: any = { status };
  
  if (status === 'completed' || status === 'failed' || status === 'cancelled') {
    updateData.completedAt = new Date();
    
    // Calculate duration
    const doc = await docRef.get();
    const execution = docToObject<DbExecution>(doc);
    if (execution) {
      updateData.duration = updateData.completedAt.getTime() - execution.startedAt.getTime();
    }
  }
  
  if (error) {
    updateData.error = error;
  }

  await docRef.update(sanitizeForFirestore(updateData));
  const updatedDoc = await docRef.get();
  
  return docToObject<DbExecution>(updatedDoc);
}

/**
 * Start execution (change status from pending to running)
 */
export async function startExecution(executionId: string): Promise<DbExecution | null> {
  return updateExecutionStatus(executionId, 'running');
}

/**
 * Complete execution successfully
 */
export async function completeExecution(executionId: string): Promise<DbExecution | null> {
  return updateExecutionStatus(executionId, 'completed');
}

/**
 * Fail execution with error
 */
export async function failExecution(executionId: string, error: string): Promise<DbExecution | null> {
  return updateExecutionStatus(executionId, 'failed', error);
}

/**
 * Cancel execution
 */
export async function cancelExecution(executionId: string): Promise<DbExecution | null> {
  return updateExecutionStatus(executionId, 'cancelled');
}

/**
 * Add a log entry for an execution
 */
export async function addExecutionLog(data: {
  executionId: string;
  nodeId: string;
  nodeName: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: Record<string, any>;
}): Promise<DbExecutionLog> {
  const db = getDb();
  
  const log: Omit<DbExecutionLog, 'id'> = {
    executionId: data.executionId,
    nodeId: data.nodeId,
    nodeName: data.nodeName,
    timestamp: new Date(),
    level: data.level,
    message: data.message,
    data: data.data,
  };

  const docRef = await db.collection(COLLECTIONS.EXECUTION_LOGS).add(sanitizeForFirestore(log));
  const doc = await docRef.get();
  
  return docToObject<DbExecutionLog>(doc)!;
}

/**
 * Get logs for an execution
 */
export async function getExecutionLogs(
  executionId: string,
  level?: 'info' | 'warn' | 'error' | 'debug'
): Promise<DbExecutionLog[]> {
  const db = getDb();
  
  let query = db
    .collection(COLLECTIONS.EXECUTION_LOGS)
    .where('executionId', '==', executionId)
    .orderBy('timestamp', 'asc');
  
  if (level) {
    query = query.where('level', '==', level);
  }
  
  const snapshot = await query.get();
  return docsToObjects<DbExecutionLog>(snapshot);
}

/**
 * Delete old executions (cleanup)
 */
export async function deleteOldExecutions(daysOld: number = 30): Promise<number> {
  const db = getDb();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const snapshot = await db
    .collection(COLLECTIONS.EXECUTIONS)
    .where('startedAt', '<', cutoffDate)
    .get();
  
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  return snapshot.size;
}
