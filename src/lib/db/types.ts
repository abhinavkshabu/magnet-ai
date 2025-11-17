import type { WorkflowNode, WorkflowConnection } from '../types';

/**
 * Database schema types for Firestore
 */

export type DbWorkflow = {
  id: string;
  name: string;
  description?: string;
  userId: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags?: string[];
};

export type DbExecution = {
  id: string;
  workflowId: string;
  userId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // in milliseconds
  error?: string;
  triggeredBy: 'manual' | 'webhook' | 'schedule' | 'api';
  triggerData?: Record<string, any>;
};

export type DbExecutionLog = {
  id: string;
  executionId: string;
  nodeId: string;
  nodeName: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: Record<string, any>;
};

export type DbUser = {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
  plan: 'free' | 'pro' | 'enterprise';
  apiKey?: string;
};

export type DbWebhook = {
  id: string;
  workflowId: string;
  userId: string;
  url: string;
  secret: string;
  isActive: boolean;
  createdAt: Date;
  lastTriggeredAt?: Date;
  triggerCount: number;
};

export type DbTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  createdBy: string;
  isOfficial: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Firestore collection names
 */
export const COLLECTIONS = {
  WORKFLOWS: 'workflows',
  EXECUTIONS: 'executions',
  EXECUTION_LOGS: 'execution_logs',
  USERS: 'users',
  WEBHOOKS: 'webhooks',
  TEMPLATES: 'templates',
} as const;
