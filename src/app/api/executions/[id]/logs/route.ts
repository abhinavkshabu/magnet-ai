import { NextRequest, NextResponse } from 'next/server';
import { getExecution } from '@/lib/db/executions';
import { getExecutionLogs } from '@/lib/db/executions';

/**
 * GET /api/executions/[id]/logs - Get execution logs
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const executionId = params.id;
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level') as 'info' | 'warn' | 'error' | 'debug' | null;
    
    // Check if execution exists
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
    
    // TODO: Check if user has permission to view these logs
    
    const logs = await getExecutionLogs(executionId, level || undefined);
    
    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('Error fetching execution logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch execution logs',
      },
      { status: 500 }
    );
  }
}
