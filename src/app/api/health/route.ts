import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';

/**
 * GET /api/health - Health check endpoint
 */
export async function GET() {
  try {
    // Check database connection
    const db = getDb();
    await db.collection('_health_check').limit(1).get();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'operational',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
      },
      { status: 503 }
    );
  }
}
