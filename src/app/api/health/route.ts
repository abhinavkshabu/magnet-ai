import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';

/**
 * GET /api/health - Health check endpoint
 */
export async function GET() {
  try {
    // Check database connection
    const db = getDb();
    
    // Try to list collections instead of querying one
    const collections = await db.listCollections();
    console.log('Available collections:', collections.map(c => c.id));
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      collections: collections.map(c => c.id),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
      details: (error as any)?.details,
    });
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Database connection failed',
      },
      { status: 503 }
    );
  }
}
