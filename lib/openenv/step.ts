import { ActionPayload, StepResult, EnvState } from '@/types';
import connectDB from '@/lib/mongodb';
import PullRequest from '@/models/PullRequest';
import Review from '@/models/Review';
import { stateFn } from './state';
import { rewardFn } from './reward';

export async function stepFn(prId: string, action: ActionPayload): Promise<StepResult> {
  await connectDB();
  
  const pr = await PullRequest.findById(prId);
  if (!pr) {
    throw new Error('Pull request not found');
  }
  
  let review = await Review.findOne({ prId });
  if (!review) {
    review = await Review.create({ prId });
  }
  
  const agentAction = {
    action: action.type,
    lineNumber: action.lineNumber,
    category: action.category,
    severity: action.severity,
    comment: action.comment || '',
  };
  
  review.agentActions.push(agentAction);
  
  const done = action.type === 'approve' || action.type === 'request_changes';
  
  if (done) {
    review.finalVerdict = action.type === 'approve' ? 'approved' : 'changes_requested';
    pr.status = 'reviewed';
  } else {
    pr.status = 'under_review';
  }
  
  await review.save();
  await pr.save();
  
  const reward = await rewardFn(review.agentActions, review.expertLabels, review.taskDifficulty);
  review.rewardScore = reward;
  await review.save();
  
  const newState = await stateFn(prId);
  
  return {
    newState,
    reward,
    done,
  };
}
