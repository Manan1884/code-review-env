import { NextRequest, NextResponse } from 'next/server';
import { stepFn } from '@/lib/openenv/step';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ prId: string }> }
) {
  try {
    const body = await req.json();
    const { prId } = await params;
    
    const result = await stepFn(prId, body);
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
