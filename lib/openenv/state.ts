import { EnvState } from '@/types';
import connectDB from '@/lib/mongodb';
import PullRequest from '@/models/PullRequest';

export async function stateFn(prId: string): Promise<EnvState> {
  await connectDB();
  
  const pr = await PullRequest.findById(prId).lean();
  
  if (!pr) {
    throw new Error('Pull request not found');
  }
  
  return {
    diff: pr.diff,
    language: pr.language,
    prNumber: pr.prNumber,
    repoName: pr.repoName,
  };
}
