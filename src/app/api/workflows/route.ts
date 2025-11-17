import { NextRequest, NextResponse } from 'next/server';
import { getWorkflow, updateWorkflow, deleteWorkflow } from '@/lib/db/workflows';
import { z } from 'zod';

/**
 * GET /api/workflows/[id] - Get a specific workflow
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflowId = params.id;
    
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
    
    // TODO: Check if user has permission to view this workflow
    
    return NextResponse.json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch workflow',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workflows/[id] - Update a workflow
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflowId = params.id;
    const body = await request.json();
    
    // Check if workflow exists
    const existing = await getWorkflow(workflowId);
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow not found',
        },
        { status: 404 }
      );
    }
    
    // TODO: Check if user has permission to edit this workflow
    
    // Validate request body
    const schema = z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      nodes: z.array(z.any()).optional(),
      connections: z.array(z.any()).optional(),
      isPublic: z.boolean().optional(),
      tags: z.array(z.string()).optional(),
    });
    
    const validated = schema.parse(body);
    
    const workflow = await updateWorkflow(workflowId, validated);
    
    return NextResponse.json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    console.error('Error updating workflow:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update workflow',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workflows/[id] - Delete a workflow
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflowId = params.id;
    
    // Check if workflow exists
    const existing = await getWorkflow(workflowId);
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow not found',
        },
        { status: 404 }
      );
    }
    
    // TODO: Check if user has permission to delete this workflow
    
    await deleteWorkflow(workflowId);
    
    return NextResponse.json({
      success: true,
      message: 'Workflow deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete workflow',
      },
      { status: 500 }
    );
  }
}