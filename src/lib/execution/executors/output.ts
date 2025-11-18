/**
 * Output node executor
 * Handles output/result nodes
 */

import type { WorkflowNode } from '@/lib/types';
import type { ExecutionContext, NodeExecutionResult } from '../types';
import { BaseExecutor } from './base';

export class OutputExecutor extends BaseExecutor {
  async execute(
    node: WorkflowNode,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    try {
      // Get output configuration
      const format = (node.content?.format as string) || 'json';
      const template = node.content?.template as string;

      let output;

      if (template) {
        // Process template with context data
        output = this.processTemplate(template, context);
      } else {
        // Return raw input
        output = context.input;
      }

      // Format output
      let formattedOutput;
      switch (format.toLowerCase()) {
        case 'json':
          formattedOutput = typeof output === 'string' ? output : JSON.stringify(output, null, 2);
          break;
        case 'text':
          formattedOutput = String(output);
          break;
        case 'html':
          formattedOutput = this.toHTML(output);
          break;
        default:
          formattedOutput = output;
      }

      return this.success({
        output: formattedOutput,
        format,
      });
    } catch (error) {
      return this.error(
        `Output execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Process template with context data
   */
  private processTemplate(template: string, context: ExecutionContext): string {
    let processed = template;

    // Replace {{input.key}} with input data
    processed = processed.replace(/\{\{input\.(\w+)\}\}/g, (_, key) => {
      return String(context.input[key] || '');
    });

    // Replace {{node_id.output}} with node outputs
    processed = processed.replace(/\{\{(\w+)\.output\}\}/g, (_, nodeId) => {
      const output = context.nodeOutputs.get(nodeId);
      if (typeof output === 'object') {
        return JSON.stringify(output);
      }
      return String(output || '');
    });

    return processed;
  }

  /**
   * Convert data to HTML
   */
  private toHTML(data: any): string {
    if (typeof data === 'string') {
      return `<p>${data}</p>`;
    }

    if (typeof data === 'object') {
      return `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    }

    return `<p>${String(data)}</p>`;
  }
}
