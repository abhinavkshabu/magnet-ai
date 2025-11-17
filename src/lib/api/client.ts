/**
 * Client-side API utilities for making requests to our backend
 */

import type { DbWorkflow, DbExecution, DbExecutionLog } from '../db/types';
import type { WorkflowNode, WorkflowConnection } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

/**
 * API Response wrapper
 */
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  message?: string;
};

/**
 * Make an API request
 */
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}/api${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const result: ApiResponse<T> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'API request failed');
  }

  return result.data as T;
}

/**
 * Workflow API
 */
export const workflowApi = {
  /**
   * Get all workflows for current user
   */
  list: async (): Promise<DbWorkflow[]> => {
    return apiRequest<DbWorkflow[]>('/workflows');
  },

  /**
   * Get a specific workflow
   */
  get: async (id: string): Promise<DbWorkflow> => {
    return apiRequest<DbWorkflow>(`/workflows/${id}`);
  },

  /**
   * Create a new workflow
   */
  create: async (data: {
    name: string;
    description?: string;
    nodes?: WorkflowNode[];
    connections?: WorkflowConnection[];
    tags?: string[];
  }): Promise<DbWorkflow> => {
    return apiRequest<DbWorkflow>('/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a workflow
   */
  update: async (
    id: string,
    updates: {
      name?: string;
      description?: string;
      nodes?: WorkflowNode[];
      connections?: WorkflowConnection[];
      tags?: string[];
    }
  ): Promise<DbWorkflow> => {
    return apiRequest<DbWorkflow>(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete a workflow
   */
  delete: async (id: string): Promise<void> => {
    await apiRequest(`/workflows/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Execute a workflow
   */
  execute: async (
    id: string,
    triggerData?: Record<string, any>
  ): Promise<{ executionId: string; status: string; message: string }> => {
    return apiRequest(`/workflows/${id}/execute`, {
      method: 'POST',
      body: JSON.stringify(triggerData || {}),
    });
  },
};

/**
 * Execution API
 */
export const executionApi = {
  /**
   * Get execution status
   */
  get: async (id: string): Promise<DbExecution> => {
    return apiRequest<DbExecution>(`/executions/${id}`);
  },

  /**
   * Get execution logs
   */
  getLogs: async (
    id: string,
    level?: 'info' | 'warn' | 'error' | 'debug'
  ): Promise<DbExecutionLog[]> => {
    const query = level ? `?level=${level}` : '';
    return apiRequest<DbExecutionLog[]>(`/executions/${id}/logs${query}`);
  },

  /**
   * Cancel execution
   */
  cancel: async (id: string): Promise<void> => {
    await apiRequest(`/executions/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Health check
 */
export const healthApi = {
  check: async (): Promise<{ status: string; timestamp: string }> => {
    return apiRequest('/health');
  },
};
