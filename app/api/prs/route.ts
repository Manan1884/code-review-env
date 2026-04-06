import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import PullRequest from '@/models/PullRequest';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const language = searchParams.get('language');
    const difficulty = searchParams.get('difficulty');
    const sort = searchParams.get('sort');
    
    let query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (language) {
      query.language = language;
    }
    
    let prsQuery = PullRequest.find(query).populate('userId', 'name email');
    
    if (sort === 'score') {
      prsQuery = prsQuery.sort({ rewardScore: -1 });
    } else if (sort === 'date') {
      prsQuery = prsQuery.sort({ submittedAt: -1 });
    } else {
      prsQuery = prsQuery.sort({ submittedAt: -1 });
    }
    
    const prs = await prsQuery;
    
    return NextResponse.json({ success: true, data: prs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const { title, description, repoName, prNumber, language, diff } = await req.json();
    
    if (!title || !description || !repoName || !prNumber || !language || !diff) {
      return NextResponse.json(
        { success: false, error: 'Please provide all required fields' },
        { status: 400 }
      );
    }
    
    if (!diff.startsWith('---') && !diff.startsWith('@@')) {
      return NextResponse.json(
        { success: false, error: 'Diff must start with --- or @@' },
        { status: 400 }
      );
    }
    
    if (prNumber < 1) {
      return NextResponse.json(
        { success: false, error: 'PR number must be positive' },
        { status: 400 }
      );
    }
    
    const pr = await PullRequest.create({
      userId: session.user.id,
      title,
      description,
      repoName,
      prNumber,
      language,
      diff,
    });
    
    await pr.populate('userId', 'name email');
    
    return NextResponse.json({ success: true, data: pr }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
