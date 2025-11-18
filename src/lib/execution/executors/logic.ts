/**
 * Logic node executor
 * Handles conditional logic, transformations, and data manipulation
 */

import type { WorkflowNode } from '@/lib/types';
import type { ExecutionContext, NodeExecutionResult } from '../types';
import { BaseExecutor } from './base';

export class LogicExecutor extends BaseExecutor {
  async execute(
    node: WorkflowNode,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    try {
      const operation = node.content?.operation as string;

      switch (operation) {
        case 'filter':
          return this.executeFilter(node, context);
        case 'transform':
          return this.executeTransform(node, context);
        case 'condition':
          return this.executeCondition(node, context);
        case 'merge':
          return this.executeMerge(node, context);
        default:
          return this.error(`Unknown logic operation: ${operation}`);
      }
    } catch (error) {
      return this.error(
        `Logic execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Filter data based on conditions
   */
  private async executeFilter(
    node: WorkflowNode,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const condition = node.content?.condition as string;
    const input = context.input;

    if (Array.isArray(input)) {
      // Filter array
      const filtered = input.filter((item) => {
        return this.evaluateCondition(condition, item);
      });
      return this.success(filtered);
    } else {
      // Check if single item passes condition
      const passes = this.evaluateCondition(condition, input);
      return this.success(passes ? input : null);
    }
  }

  /**
   * Transform data using a template or function
   */
  private async executeTransform(
    node: WorkflowNode,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const template = node.content?.template as Record<string, any>;
    const input = context.input;

    if (!template) {
      return this.error('Transform template is required');
    }

    const transformed = this.applyTemplate(template, input);
    return this.success(transformed);
  }

  /**
   * Execute conditional logic
   */
  private async executeCondition(
    node: WorkflowNode,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const condition = node.content?.condition as string;
    const input = context.input;

    const result = this.evaluateCondition(condition, input);

    return this.success({
      passed: result,
      input,
    });
  }

  /**
   * Merge multiple inputs
   */
  private async executeMerge(
    node: WorkflowNode,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const strategy = (node.content?.strategy as string) || 'merge';

    // Get all previous node outputs
    const outputs = Array.from(context.nodeOutputs.values());

    let result;
    switch (strategy) {
      case 'merge':
        result = Object.assign({}, ...outputs);
        break;
      case 'array':
        result = outputs;
        break;
      case 'concat':
        result = outputs.flat();
        break;
      default:
        result = outputs;
    }

    return this.success(result);
  }

  /**
   * Evaluate a simple condition
   * Supports: ==, !=, >, <, >=, <=, contains
   */
  private evaluateCondition(condition: string, data: any): boolean {
    if (!condition) return true;

    // Simple condition parser
    const match = condition.match(/(\w+)\s*(==|!=|>|<|>=|<=|contains)\s*(.+)/);
    if (!match) return true;

    const [, field, operator, value] = match;
    const fieldValue = data[field];
    const compareValue = value.trim().replace(/['"]/g, '');

    switch (operator) {
      case '==':
        return fieldValue == compareValue;
      case '!=':
        return fieldValue != compareValue;
      case '>':
        return Number(fieldValue) > Number(compareValue);
      case '<':
        return Number(fieldValue) < Number(compareValue);
      case '>=':
        return Number(fieldValue) >= Number(compareValue);
      case '<=':
        return Number(fieldValue) <= Number(compareValue);
      case 'contains':
        return String(fieldValue).includes(compareValue);
      default:
        return true;
    }
  }

  /**
   * Apply a template to transform data
   */
  private applyTemplate(template: Record<string, any>, data: any): any {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(template)) {
      if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
        // Extract field name from {{field}}
        const field = value.slice(2, -2).trim();
        result[key] = data[field];
      } else if (typeof value === 'object') {
        result[key] = this.applyTemplate(value, data);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  validate(node: WorkflowNode): { valid: boolean; errors?: string[] } {
    const baseValidation = super.validate(node);
    const errors = baseValidation.errors || [];

    if (!node.content?.operation) {
      errors.push('Logic operation is required');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
