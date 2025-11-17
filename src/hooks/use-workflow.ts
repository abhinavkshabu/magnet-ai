import { useState, useEffect, useCallback } from 'react';
import { workflowApi } from '@/lib/api/client';
import type { DbWorkflow } from '@/lib/db/types';
import type { WorkflowNode, WorkflowConnection } from '@/lib/types';
import { useToast } from './use-toast';

/**
 * Hook for managing workflow state with auto-save
 */
export function useWorkflow(workflowId?: string | null) {
  const { toast } = useToast();
  const [workflow, setWorkflow] = useState<DbWorkflow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load workflow
  const loadWorkflow = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await workflowApi.get(id);
      setWorkflow(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load workflow';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Create new workflow
  const createWorkflow = useCallback(async (data: {
    name: string;
    description?: string;
    nodes?: WorkflowNode[];
    connections?: WorkflowConnection[];
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const newWorkflow = await workflowApi.create(data);
      setWorkflow(newWorkflow);
      toast({
        title: 'Success',
        description: 'Workflow created successfully',
      });
      return newWorkflow;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create workflow';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Update workflow
  const updateWorkflow = useCallback(async (updates: {
    name?: string;
    description?: string;
    nodes?: WorkflowNode[];
    connections?: WorkflowConnection[];
  }) => {
    if (!workflow?.id) return;

    setIsSaving(true);
    try {
      const updated = await workflowApi.update(workflow.id, updates);
      setWorkflow(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save workflow';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [workflow?.id, toast]);

  // Auto-save nodes
  const updateNodes = useCallback(async (nodes: WorkflowNode[]) => {
    if (!workflow) return;
    setWorkflow({ ...workflow, nodes });
    await updateWorkflow({ nodes });
  }, [workflow, updateWorkflow]);

  // Auto-save connections
  const updateConnections = useCallback(async (connections: WorkflowConnection[]) => {
    if (!workflow) return;
    setWorkflow({ ...workflow, connections });
    await updateWorkflow({ connections });
  }, [workflow, updateWorkflow]);

  // Load workflow on mount if ID provided
  useEffect(() => {
    if (workflowId && workflowId !== null) {
      loadWorkflow(workflowId);
    }
  }, [workflowId, loadWorkflow]);

  return {
    workflow,
    isLoading,
    isSaving,
    error,
    loadWorkflow,
    createWorkflow,
    updateWorkflow,
    updateNodes,
    updateConnections,
  };
}
