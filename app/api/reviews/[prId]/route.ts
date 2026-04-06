import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ prId: string }> }
) {
  try {
    await connectDB();
    const { prId } = await params;
    
    const review = await Review.findOne({ prId })
      .populate('prId', 'title repoName language status');
    
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: review });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ prId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    await connectDB();
    
    const { expertLabels, taskDifficulty } = await req.json();
    const { prId } = await params;
    
    const review = await Review.findOne({ prId });
    
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }
    
    if (expertLabels !== undefined) {
      review.expertLabels = expertLabels;
    }
    
    if (taskDifficulty !== undefined) {
      review.taskDifficulty = taskDifficulty;
    }
    
    await review.save();
    
    return NextResponse.json({ success: true, data: review });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
