/**
 * LLM node executor
 * Executes AI model calls using Genkit
 */

import type { WorkflowNode } from '@/lib/types';
import type { ExecutionContext, NodeExecutionResult } from '../types';
import { BaseExecutor } from './base';
import { ai } from '@/ai/genkit';

export class LLMExecutor extends BaseExecutor {
  async execute(
    node: WorkflowNode,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();

    try {
      // Get LLM configuration
      const prompt = node.content?.prompt as string;
      const model = (node.content?.model as string) || 'googleai/gemini-2.0-flash-exp';
      const temperature = (node.content?.temperature as number) || 0.7;
      const maxTokens = (node.content?.maxTokens as number) || 1000;

      if (!prompt) {
        return this.error('Prompt is required for LLM node');
      }

      // Replace variables in prompt with context data
      const processedPrompt = this.processPrompt(prompt, context);

      // Call AI model using Genkit
      const { text } = await ai.generate({
        model,
        prompt: processedPrompt,
        config: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      });

      const duration = Date.now() - startTime;

      return this.success(
        {
          text,
          prompt: processedPrompt,
        },
        {
          duration,
          model,
        }
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      return this.error(
        `LLM execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { duration }
      );
    }
  }

  /**
   * Process prompt by replacing variables with context data
   * Supports {{variable}} and {{node.output}} syntax
   */
  private processPrompt(prompt: string, context: ExecutionContext): string {
    let processed = prompt;

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

    // Replace {{variable}} with workflow variables
    processed = processed.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return String(context.variables[key] || '');
    });

    return processed;
  }

  validate(node: WorkflowNode): { valid: boolean; errors?: string[] } {
    const baseValidation = super.validate(node);
    const errors = baseValidation.errors || [];

    if (!node.content?.prompt) {
      errors.push('Prompt is required for LLM node');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
