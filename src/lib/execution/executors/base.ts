/**
 * Base executor class with common functionality
 */

import type { WorkflowNode } from '@/lib/types';
import type { ExecutionContext, NodeExecutionResult, NodeExecutor } from '../types';

export abstract class BaseExecutor implements NodeExecutor {
  /**
   * Execute the node - must be implemented by subclasses
   */
  abstract execute(
    node: WorkflowNode,
    context: ExecutionContext
  ): Promise<NodeExecutionResult>;

  /**
   * Validate node configuration - can be overridden
   */
  validate(node: WorkflowNode): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!node.name) {
      errors.push('Node name is required');
    }

    if (!node.type) {
      errors.push('Node type is required');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Helper: Get input from previous node
   */
  protected getInput(context: ExecutionContext, key?: string): any {
    if (key) {
      return context.input[key];
    }
    return context.input;
  }

  /**
   * Helper: Get output from a specific previous node
   */
  protected getNodeOutput(context: ExecutionContext, nodeId: string): any {
    return context.nodeOutputs.get(nodeId);
  }

  /**
   * Helper: Create success result
   */
  protected success(output: any, metadata?: any): NodeExecutionResult {
    return {
      success: true,
      output,
      metadata,
    };
  }

  /**
   * Helper: Create error result
   */
  protected error(error: string, metadata?: any): NodeExecutionResult {
    return {
      success: false,
      error,
      metadata,
    };
  }

  /**
   * Helper: Measure execution time
   */
  protected async measureTime<T>(
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration };
  }
}
