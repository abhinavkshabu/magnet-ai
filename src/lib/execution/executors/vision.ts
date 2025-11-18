/**
 * Vision node executor
 * Analyzes images using multimodal AI models (Gemini Vision)
 */

import type { WorkflowNode } from '@/lib/types';
import type { ExecutionContext, NodeExecutionResult } from '../types';
import { BaseExecutor } from './base';
import { ai } from '@/ai/genkit';

export class VisionExecutor extends BaseExecutor {
  async execute(
    node: WorkflowNode,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();

    try {
      // Get vision configuration
      const imageUrl = node.content?.imageUrl as string;
      const prompt = node.content?.prompt as string || 'Describe this image in detail.';
      const model = (node.content?.model as string) || 'googleai/gemini-2.0-flash-exp';
      const temperature = (node.content?.temperature as number) || 0.7;
      const maxTokens = (node.content?.maxTokens as number) || 1000;

      if (!imageUrl) {
        return this.error('Image URL is required for Vision node');
      }

      // Process variables in imageUrl and prompt
      const processedImageUrl = this.processVariables(imageUrl, context);
      const processedPrompt = this.processVariables(prompt, context);

      // Fetch image data
      let imageData: string;
      try {
        if (processedImageUrl.startsWith('data:')) {
          // Already a data URL
          imageData = processedImageUrl;
        } else if (processedImageUrl.startsWith('http://') || processedImageUrl.startsWith('https://')) {
          // Fetch from URL and convert to base64
          const response = await fetch(processedImageUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
          }
          const buffer = await response.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const contentType = response.headers.get('content-type') || 'image/jpeg';
          imageData = `data:${contentType};base64,${base64}`;
        } else {
          throw new Error('Invalid image URL format. Must be http(s):// or data: URL');
        }
      } catch (error) {
        return this.error(
          `Failed to load image: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

      // Call AI model with image using Genkit
      const { text } = await ai.generate({
        model,
        prompt: [
          { text: processedPrompt },
          { media: { url: imageData } }
        ],
        config: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      });

      const duration = Date.now() - startTime;

      return this.success(
        {
          text,
          analysis: text,
          imageUrl: processedImageUrl,
          prompt: processedPrompt,
        },
        {
          duration,
          model,
          imageProcessed: true,
        }
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      return this.error(
        `Vision execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { duration }
      );
    }
  }

  /**
   * Process variables in strings
   * Supports {{variable}}, {{input.key}}, and {{node.output}} syntax
   */
  private processVariables(text: string, context: ExecutionContext): string {
    let processed = text;

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

    if (!node.content?.imageUrl) {
      errors.push('Image URL is required for Vision node');
    }

    const imageUrl = node.content?.imageUrl as string;
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:') && !imageUrl.includes('{{')) {
      errors.push('Image URL must be a valid http(s):// URL, data: URL, or contain variables');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
