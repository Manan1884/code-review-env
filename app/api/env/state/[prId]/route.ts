import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PullRequest from '@/models/PullRequest';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ prId: string }> }
) {
  try {
    await connectDB();
    const { prId } = await params;
    
    const pr = await PullRequest.findById(prId).lean();
    
    if (!pr) {
      return NextResponse.json(
        { success: false, error: 'Pull request not found' },
        { status: 404 }
      );
    }
    
    const state = {
      diff: pr.diff,
      language: pr.language,
      prNumber: pr.prNumber,
      repoName: pr.repoName,
    };
    
    return NextResponse.json({ success: true, data: state });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
