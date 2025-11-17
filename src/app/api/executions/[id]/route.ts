import { NextRequest, NextResponse } from 'next/server';
import { getExecution, cancelExecution } from '@/lib/db/executions';

/**
 * GET /api/executions/[id] - Get execution status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const executionId = params.id;
    
    const execution = await getExecution(executionId);
    
    if (!execution) {
      return NextResponse.json(
        {
          success: false,
          error: 'Execution not found',
        },
        { status: 404 }
      );
    }
    
    // TODO: Check if user has permission to view this execution
    
    return NextResponse.json({
      success: true,
      data: execution,
    });
  } catch (error) {
    console.error('Error fetching execution:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch execution',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/executions/[id] - Cancel execution
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const executionId = params.id;
    
    const execution = await getExecution(executionId);
    if (!execution) {
      return NextResponse.json(
        {
          success: false,
          error: 'Execution not found',
        },
        { status: 404 }
      );
    }
    
    // Can only cancel running or pending executions
    if (execution.status !== 'running' && execution.status !== 'pending') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot cancel execution with status: ${execution.status}`,
        },
        { status: 400 }
      );
    }
    
    // TODO: Check if user has permission to cancel this execution
    
    await cancelExecution(executionId);
    
    return NextResponse.json({
      success: true,
      message: 'Execution cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling execution:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cancel execution',
      },
      { status: 500 }
    );
  }
}
