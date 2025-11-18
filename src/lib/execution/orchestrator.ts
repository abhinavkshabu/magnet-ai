/**
 * Workflow Orchestrator
 * Manages the execution of entire workflows
 */

import type { WorkflowNode, WorkflowConnection } from '../types';
import type { ExecutionContext, NodeExecutionResult, ExecutionLog, LogLevel } from './types';
import { executorRegistry } from './executors';
import { createExecution, updateExecutionStatus, addExecutionLog } from '../db/executions';
export class WorkflowOrchestrator {
  private executionId: string;
  private workflowId: string;
  private nodes: WorkflowNode[];
  private connections: WorkflowConnection[];
  private context: ExecutionContext;
  private logs: ExecutionLog[] = [];

  constructor(
    workflowId: string,
    nodes: WorkflowNode[],
    connections: WorkflowConnection[],
    triggerData: Record<string, any> = {}
  ) {
    this.workflowId = workflowId;
    this.nodes = nodes;
    this.connections = connections;
    this.executionId = '';

    // Initialize execution context
    this.context = {
      input: triggerData,
      nodeOutputs: new Map(),
      variables: {},
      executionId: '',
      workflowId,
      startTime: new Date(),
    };
  }

  /**
   * Execute the workflow
   */
  async execute(): Promise<{
    success: boolean;
    executionId: string;
    output?: any;
    error?: string;
  }> {
    try {
      // Create execution record
      const execution = await createExecution({
        workflowId: this.workflowId,
        userId: 'demo-user-123', // TODO: Get from auth
        triggeredBy: 'manual',
        triggerData: this.context.input,
      });

      this.executionId = execution.id;
      this.context.executionId = execution.id;

      this.log('info', 'Workflow execution started', {
        workflowId: this.workflowId,
        executionId: this.executionId,
      });

      // Find starting nodes (nodes with no incoming connections)
      const startNodes = this.findStartNodes();

      if (startNodes.length === 0) {
        throw new Error('No starting nodes found in workflow');
      }

      this.log('info', `Found ${startNodes.length} starting node(s)`);

      // Execute workflow using topological sort
      const executionOrder = this.getExecutionOrder();
      this.log('debug', 'Execution order determined', { order: executionOrder.map(n => n.id) });

      let finalOutput: any = null;

      // Execute nodes in order
      for (const node of executionOrder) {
        this.log('info', `Executing node: ${node.name}`, { nodeId: node.id, type: node.type });

        const result = await this.executeNode(node);

        if (!result.success) {
          // Node execution failed
          await updateExecutionStatus(this.executionId, 'failed', result.error);
          this.log('error', `Node execution failed: ${node.name}`, {
            nodeId: node.id,
            error: result.error,
          });

          return {
            success: false,
            executionId: this.executionId,
            error: result.error,
          };
        }

        // Store node output
        this.context.nodeOutputs.set(node.id, result.output);
        finalOutput = result.output;

        this.log('info', `Node completed: ${node.name}`, {
          nodeId: node.id,
          duration: result.metadata?.duration,
        });
      }

      // Workflow completed successfully
      await updateExecutionStatus(this.executionId, 'completed');
      this.log('info', 'Workflow execution completed successfully');

      return {
        success: true,
        executionId: this.executionId,
        output: finalOutput,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (this.executionId) {
        await updateExecutionStatus(this.executionId, 'failed', errorMessage);
      }

      this.log('error', 'Workflow execution failed', { error: errorMessage });

      return {
        success: false,
        executionId: this.executionId,
        error: errorMessage,
      };
    }
  }

  /**
   * Execute a single node
   */
  private async executeNode(node: WorkflowNode): Promise<NodeExecutionResult> {
    try {
      // Get executor for node type
      const executor = executorRegistry.get(node.type);

      if (!executor) {
        return {
          success: false,
          error: `No executor found for node type: ${node.type}`,
        };
      }

      // Validate node configuration
      const validation = executor.validate(node);
      if (!validation.valid) {
        return {
          success: false,
          error: `Node validation failed: ${validation.errors?.join(', ')}`,
        };
      }

      // Prepare input for this node from previous nodes
      const nodeInput = this.prepareNodeInput(node);
      const nodeContext: ExecutionContext = {
        ...this.context,
        input: nodeInput,
      };

      // Execute the node
      const result = await executor.execute(node, nodeContext);

      // Log execution result
      if (result.metadata) {
        await addExecutionLog({
          executionId: this.executionId,
          nodeId: node.id,
          nodeName: node.name,
          level: result.success ? 'info' : 'error',
          message: result.success
            ? `Node executed successfully: ${node.name}`
            : `Node execution failed: ${result.error}`,
          data: result.metadata,
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Node execution error: ${errorMessage}`,
      };
    }
  }

  /**
   * Prepare input for a node from its incoming connections
   */
  private prepareNodeInput(node: WorkflowNode): any {
    // Find incoming connections
    const incomingConnections = this.connections.filter((c) => c.to === node.id);

    if (incomingConnections.length === 0) {
      // No incoming connections, use trigger data
      return this.context.input;
    }

    if (incomingConnections.length === 1) {
      // Single input - use output from previous node
      const fromNodeId = incomingConnections[0].from;
      return this.context.nodeOutputs.get(fromNodeId) || {};
    }

    // Multiple inputs - merge them
    const inputs: any[] = [];
    for (const conn of incomingConnections) {
      const output = this.context.nodeOutputs.get(conn.from);
      if (output !== undefined) {
        inputs.push(output);
      }
    }

    // If all inputs are objects, merge them
    if (inputs.every((i) => typeof i === 'object' && !Array.isArray(i))) {
      return Object.assign({}, ...inputs);
    }

    // Otherwise return as array
    return inputs;
  }

  /**
   * Find nodes with no incoming connections (start nodes)
   */
  private findStartNodes(): WorkflowNode[] {
    return this.nodes.filter((node) => {
      return !this.connections.some((conn) => conn.to === node.id);
    });
  }

  /**
   * Get execution order using topological sort
   */
  private getExecutionOrder(): WorkflowNode[] {
    const visited = new Set<string>();
    const order: WorkflowNode[] = [];

    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      // Find and visit all nodes that this node depends on
      const incomingConnections = this.connections.filter((c) => c.to === nodeId);
      for (const conn of incomingConnections) {
        visit(conn.from);
      }

      // Add this node to the order
      const node = this.nodes.find((n) => n.id === nodeId);
      if (node) {
        order.push(node);
      }
    };

    // Visit all nodes
    for (const node of this.nodes) {
      visit(node.id);
    }

    return order;
  }

  /**
   * Log an event
   */
  private log(level: LogLevel, message: string, data?: any) {
    const logEntry: ExecutionLog = {
      timestamp: new Date(),
      level,
      message,
      data,
    };

    this.logs.push(logEntry);

    // Also log to database if execution has started
    if (this.executionId) {
      addExecutionLog({
        executionId: this.executionId,
        nodeId: 'orchestrator',
        nodeName: 'Orchestrator',
        level,
        message,
        data,
      }).catch((error: Error) => {
        console.error('Failed to log to database:', error);
      });
    }

    // Console log for debugging
    const logFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    logFn(`[${level.toUpperCase()}] ${message}`, data || '');
  }

  /**
   * Get all logs
   */
  getLogs(): ExecutionLog[] {
    return this.logs;
  }
}
