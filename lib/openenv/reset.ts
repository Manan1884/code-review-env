import { EnvState } from '@/types';
import connectDB from '@/lib/mongodb';
import PullRequest from '@/models/PullRequest';
import Review from '@/models/Review';
import { stateFn } from './state';

export async function resetFn(prId: string): Promise<EnvState> {
  await connectDB();
  
  const pr = await PullRequest.findById(prId);
  if (!pr) {
    throw new Error('Pull request not found');
  }
  
  const review = await Review.findOne({ prId });
  if (review) {
    review.agentActions = [];
    review.finalVerdict = undefined;
    review.agentScore = undefined;
    review.rewardScore = 0;
    await review.save();
  }
  
  pr.status = 'pending';
  await pr.save();
  
  return stateFn(prId);
}
