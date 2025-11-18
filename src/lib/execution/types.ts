/**
 * Execution engine types
 */

import type { WorkflowNode, WorkflowConnection } from '../types';

/**
 * Execution context - data passed between nodes
 */
export interface ExecutionContext {
  // Input data for this node
  input: Record<string, any>;
  
  // All previous node outputs
  nodeOutputs: Map<string, any>;
  
  // Workflow-level variables
  variables: Record<string, any>;
  
  // Execution metadata
  executionId: string;
  workflowId: string;
  startTime: Date;
}

/**
 * Result from executing a node
 */
export interface NodeExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  metadata?: {
    duration?: number;
    tokensUsed?: number;
    apiCalls?: number;
    [key: string]: any;
  };
}

/**
 * Node executor interface - all executors must implement this
 */
export interface NodeExecutor {
  /**
   * Execute a node with given context
   */
  execute(
    node: WorkflowNode,
    context: ExecutionContext
  ): Promise<NodeExecutionResult>;
  
  /**
   * Validate node configuration
   */
  validate(node: WorkflowNode): { valid: boolean; errors?: string[] };
}

/**
 * Execution status
 */
export type ExecutionStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Log level
 */
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

/**
 * Execution log entry
 */
export interface ExecutionLog {
  timestamp: Date;
  level: LogLevel;
  nodeId?: string;
  message: string;
  data?: any;
}
