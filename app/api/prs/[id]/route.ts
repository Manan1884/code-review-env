import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import PullRequest from '@/models/PullRequest';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    const pr = await PullRequest.findById(id).populate('userId', 'name email');
    
    if (!pr) {
      return NextResponse.json(
        { success: false, error: 'Pull request not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: pr });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    const { id } = await params;
    
    const pr = await PullRequest.findById(id);
    
    if (!pr) {
      return NextResponse.json(
        { success: false, error: 'Pull request not found' },
        { status: 404 }
      );
    }
    
    if (pr.userId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    await PullRequest.findByIdAndDelete(id);
    
    return NextResponse.json({ success: true, data: null });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
