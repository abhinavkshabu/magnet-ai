/**
 * Webhook node executor
 * Handles HTTP requests to external services
 */

import type { WorkflowNode } from '@/lib/types';
import type { ExecutionContext, NodeExecutionResult } from '../types';
import { BaseExecutor } from './base';

export class WebhookExecutor extends BaseExecutor {
  async execute(
    node: WorkflowNode,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();

    try {
      // Get webhook configuration
      const url = node.content?.url as string;
      const method = (node.content?.method as string) || 'POST';
      const headers = (node.content?.headers as Record<string, string>) || {};
      const body = node.content?.body || context.input;

      if (!url) {
        return this.error('Webhook URL is required');
      }

      // Validate URL
      try {
        new URL(url);
      } catch {
        return this.error('Invalid webhook URL');
      }

      // Make HTTP request
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: method !== 'GET' ? JSON.stringify(body) : undefined,
      });

      const duration = Date.now() - startTime;

      // Parse response
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        return this.error(
          `Webhook request failed: ${response.status} ${response.statusText}`,
          {
            duration,
            statusCode: response.status,
            response: responseData,
          }
        );
      }

      return this.success(responseData, {
        duration,
        statusCode: response.status,
        url,
        method,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      return this.error(
        `Webhook execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { duration }
      );
    }
  }

  validate(node: WorkflowNode): { valid: boolean; errors?: string[] } {
    const baseValidation = super.validate(node);
    const errors = baseValidation.errors || [];

    if (!node.content?.url) {
      errors.push('Webhook URL is required');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
