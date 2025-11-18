/**
 * Executor registry
 * Maps node types to their executors
 */

import type { NodeType } from '@/lib/types';
import type { NodeExecutor } from '../types';
import { WebhookExecutor } from './webhook';
import { LLMExecutor } from './llm';
import { APIExecutor } from './api';
import { IoTExecutor } from './iot';
import { OutputExecutor } from './output';
import { LogicExecutor } from './logic';

/**
 * Executor registry - maps node types to executor instances
 */
class ExecutorRegistry {
  private executors: Map<NodeType, NodeExecutor>;

  constructor() {
    this.executors = new Map();
    this.registerDefaultExecutors();
  }

  /**
   * Register default executors for all node types
   */
  private registerDefaultExecutors() {
    this.register('webhook', new WebhookExecutor());
    this.register('llm', new LLMExecutor());
    this.register('api', new APIExecutor());
    this.register('iot', new IoTExecutor());
    this.register('output', new OutputExecutor());
    this.register('logic', new LogicExecutor());
  }

  /**
   * Register a custom executor for a node type
   */
  register(type: NodeType, executor: NodeExecutor): void {
    this.executors.set(type, executor);
  }

  /**
   * Get executor for a node type
   */
  get(type: NodeType): NodeExecutor | undefined {
    return this.executors.get(type);
  }

  /**
   * Check if executor exists for a node type
   */
  has(type: NodeType): boolean {
    return this.executors.has(type);
  }
}

// Export singleton instance
export const executorRegistry = new ExecutorRegistry();

// Export individual executors
export { WebhookExecutor } from './webhook';
export { LLMExecutor } from './llm';
export { APIExecutor } from './api';
export { IoTExecutor } from './iot';
export { OutputExecutor } from './output';
export { LogicExecutor } from './logic';
