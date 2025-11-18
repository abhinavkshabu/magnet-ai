/**
 * API node executor
 * Makes API calls to external services
 */

import type { WorkflowNode } from '@/lib/types';
import type { ExecutionContext, NodeExecutionResult } from '../types';
import { BaseExecutor } from './base';

export class APIExecutor extends BaseExecutor {
  async execute(
    node: WorkflowNode,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();

    try {
      // Get API configuration
      const url = node.content?.url as string;
      const method = (node.content?.method as string) || 'GET';
      const headers = (node.content?.headers as Record<string, string>) || {};
      const queryParams = node.content?.queryParams as Record<string, string>;
      const body = node.content?.body;
      const auth = node.content?.auth as { type: string; token?: string };

      if (!url) {
        return this.error('API URL is required');
      }

      // Build URL with query params
      let fullUrl = url;
      if (queryParams) {
        const params = new URLSearchParams(queryParams);
        fullUrl = `${url}?${params.toString()}`;
      }

      // Build headers
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
      };

      // Add authentication
      if (auth?.type === 'bearer' && auth.token) {
        requestHeaders['Authorization'] = `Bearer ${auth.token}`;
      } else if (auth?.type === 'apikey' && auth.token) {
        requestHeaders['X-API-Key'] = auth.token;
      }

      // Make API request
      const response = await fetch(fullUrl, {
        method,
        headers: requestHeaders,
        body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
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
          `API request failed: ${response.status} ${response.statusText}`,
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
        url: fullUrl,
        method,
        apiCalls: 1,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      return this.error(
        `API execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { duration }
      );
    }
  }

  validate(node: WorkflowNode): { valid: boolean; errors?: string[] } {
    const baseValidation = super.validate(node);
    const errors = baseValidation.errors || [];

    if (!node.content?.url) {
      errors.push('API URL is required');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
