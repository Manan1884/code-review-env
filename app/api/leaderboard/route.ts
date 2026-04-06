import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const reviews = await Review.find()
      .sort({ rewardScore: -1 })
      .limit(20)
      .populate({
        path: 'prId',
        select: 'title repoName language userId',
        populate: {
          path: 'userId',
          select: 'name email',
        },
      });
    
    return NextResponse.json({ success: true, data: reviews });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
