import { NextRequest, NextResponse } from 'next/server';
import { resetFn } from '@/lib/openenv/reset';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ prId: string }> }
) {
  try {
    const { prId } = await params;
    
    const state = await resetFn(prId);
    
    return NextResponse.json({
      success: true,
      data: state,
    });
  } catch (error: any) {
    console.error('Reset error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Reset failed' },
      { status: error.message === 'Pull request not found' ? 404 : 500 }
    );
  }
}
