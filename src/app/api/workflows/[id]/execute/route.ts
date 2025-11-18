import { NextRequest, NextResponse } from 'next/server';
import { getWorkflow } from '@/lib/db/workflows';
import { WorkflowOrchestrator } from '@/lib/execution/orchestrator';
import { createExecution, startExecution, completeExecution, failExecution, addExecutionLog } from '@/lib/db/executions';

/**
 * POST /api/workflows/[id]/execute - Execute a workflow
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflowId = params.id;
    
    // TODO: Get userId from authentication
    const userId = 'demo-user-123';
    
    // Get workflow
    const workflow = await getWorkflow(workflowId);
    if (!workflow) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow not found',
        },
        { status: 404 }
      );
    }
    
    // TODO: Check if user has permission to execute this workflow
    
    // Get trigger data from request body
    const body = await request.json().catch(() => ({}));
    
    // Create execution record
    const execution = await createExecution({
      workflowId,
      userId,
      triggeredBy: 'manual',
      triggerData: body,
    });
    
    // Validate workflow has nodes
    if (!workflow.nodes || workflow.nodes.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow has no nodes to execute',
        },
        { status: 400 }
      );
    }
    
    // Create orchestrator
    const orchestrator = new WorkflowOrchestrator(
      workflowId,
      workflow.nodes,
      workflow.connections || [],
      body
    );
    
    // Start execution in background (don't await)
    executeWorkflowInBackground(execution.id, orchestrator).catch((error) => {
      console.error('Background execution failed:', error);
    });
    
    return NextResponse.json({
      success: true,
      data: {
        executionId: execution.id,
        status: execution.status,
        message: 'Workflow execution started',
      },
    }, { status: 202 });
  } catch (error) {
    console.error('Error starting workflow execution:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to start workflow execution',
      },
      { status: 500 }
    );
  }
}

/**
 * Execute workflow in background using the orchestrator
 */
async function executeWorkflowInBackground(
  executionId: string,
  orchestrator: WorkflowOrchestrator
) {
  try {
    // Start execution
    await startExecution(executionId);
    
    // Log start
    await addExecutionLog({
      executionId,
      nodeId: 'system',
      nodeName: 'System',
      level: 'info',
      message: 'Workflow execution started',
    });
    
    // Execute the workflow
    const result = await orchestrator.execute();
    
    if (!result.success) {
      console.error('Workflow execution failed:', result.error);
      await failExecution(executionId, result.error || 'Unknown error');
      await addExecutionLog({
        executionId,
        nodeId: 'system',
        nodeName: 'System',
        level: 'error',
        message: 'Workflow execution failed',
        data: { error: result.error },
      });
    } else {
      console.log('Workflow execution completed:', result.executionId);
      await completeExecution(executionId);
      await addExecutionLog({
        executionId,
        nodeId: 'system',
        nodeName: 'System',
        level: 'info',
        message: 'Workflow execution completed successfully',
      });
    }
  } catch (error) {
    console.error('Execution error:', error);
    
    await failExecution(executionId, error instanceof Error ? error.message : 'Unknown error');
    
    await addExecutionLog({
      executionId,
      nodeId: 'system',
      nodeName: 'System',
      level: 'error',
      message: 'Workflow execution failed with exception',
      data: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
  }
}
