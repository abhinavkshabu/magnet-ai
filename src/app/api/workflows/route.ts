import { NextRequest, NextResponse } from 'next/server';
import { createWorkflow, getUserWorkflows } from '@/lib/db/workflows';
import { z } from 'zod';

/**
 * GET /api/workflows - Get all workflows for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from authentication
    // For now, using a mock userId
    const userId = 'demo-user-123';
    
    const workflows = await getUserWorkflows(userId);
    
    return NextResponse.json({
      success: true,
      data: workflows,
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch workflows',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflows - Create a new workflow
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Get userId from authentication
    const userId = 'demo-user-123';
    
    const body = await request.json();
    
    // Validate request body
    const schema = z.object({
      name: z.string().min(1, 'Name is required'),
      description: z.string().optional(),
      nodes: z.array(z.any()).optional(),
      connections: z.array(z.any()).optional(),
      isPublic: z.boolean().optional(),
      tags: z.array(z.string()).optional(),
    });
    
    const validated = schema.parse(body);
    
    const workflow = await createWorkflow({
      ...validated,
      userId,
    });
    
    return NextResponse.json({
      success: true,
      data: workflow,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating workflow:', error);
    
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
        error: 'Failed to create workflow',
      },
      { status: 500 }
    );
  }
}