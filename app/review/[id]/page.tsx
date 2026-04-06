'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DiffViewer from '@/components/DiffViewer';
import ReviewSummary from '@/components/ReviewSummary';
import EpisodeLog from '@/components/EpisodeLog';
import ScoreBar from '@/components/ScoreBar';
import { IPullRequest, IReview, EpisodeStep } from '@/types';

export default function ReviewPage() {
  const params = useParams();
  const prId = params.id as string;

  const [pr, setPr] = useState<IPullRequest | null>(null);
  const [review, setReview] = useState<IReview | null>(null);
  const [steps, setSteps] = useState<EpisodeStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningAgent, setIsRunningAgent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPR();
    fetchReview();
  }, [prId]);

  const fetchPR = async () => {
    try {
      const response = await fetch(`/api/prs/${prId}`);
      const result = await response.json();
      if (result.success) {
        setPr(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch PR:', err);
    }
  };

  const fetchReview = async () => {
    try {
      const response = await fetch(`/api/reviews/${prId}`);
      const result = await response.json();
      if (result.success) {
        setReview(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch review:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const runAgent = async () => {
    setIsRunningAgent(true);
    setError('');

    try {
      const response = await fetch(`/api/agent/run/${prId}`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to run agent');
      }

      setReview(result.data);
      setSteps(result.data.steps || []);
      await fetchPR();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRunningAgent(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-[#00ff88]">Loading...</div>
      </div>
    );
  }

  if (!pr) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-red-400">Pull request not found</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d0d0d] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-white mb-2">{pr.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>{pr.repoName}</span>
            <span>•</span>
            <span>PR #{pr.prNumber}</span>
            <span>•</span>
            <span className="capitalize">{pr.language}</span>
            <span>•</span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                pr.status === 'reviewed'
                  ? 'bg-green-500/20 text-green-400'
                  : pr.status === 'under_review'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}
            >
              {pr.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Code Diff</h2>
              {pr.status === 'pending' && (
                <button
                  onClick={runAgent}
                  disabled={isRunningAgent}
                  className="px-4 py-2 bg-[#00ff88] text-[#0d0d0d] font-bold rounded-lg hover:bg-[#00ff88]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRunningAgent ? 'Running AI Review...' : 'Run AI Agent Review'}
                </button>
              )}
            </div>

            <DiffViewer
              diff={pr.diff}
              annotations={review?.agentActions || []}
              language={pr.language}
            />

            {isRunningAgent && (
              <div className="mt-4 p-4 rounded-lg bg-[#141414] border border-[#1f1f1f]">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-300">AI agent is analyzing the diff...</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {review && review.finalVerdict && (
              <>
                <div
                  className="p-4 rounded-lg text-center font-bold text-lg"
                  style={{
                    backgroundColor: review.finalVerdict === 'approved' ? '#34d39920' : '#f8717120',
                    color: review.finalVerdict === 'approved' ? '#34d399' : '#f87171',
                    border: `1px solid ${review.finalVerdict === 'approved' ? '#34d39940' : '#f8717140'}`,
                  }}
                >
                  {review.finalVerdict === 'approved' ? '✓ Approved' : '✗ Changes Requested'}
                </div>

                <ReviewSummary review={review} />

                <EpisodeLog steps={steps.length > 0 ? steps : review.agentActions.map((a, i) => ({
                  stepNumber: i + 1,
                  state: '',
                  action: JSON.stringify(a),
                  reward: 0,
                  done: i === review.agentActions.length - 1,
                  timestamp: new Date(),
                }))} />

                <div className="p-4 rounded-lg border border-[#1f1f1f] bg-[#141414]">
                  <h3 className="font-bold text-white mb-3">Reward Score</h3>
                  <ScoreBar score={review.rewardScore} />
                </div>
              </>
            )}

            {!review?.finalVerdict && (
              <div className="p-6 rounded-lg border border-[#1f1f1f] bg-[#141414] text-center">
                <p className="text-gray-400 mb-4">No review has been run yet.</p>
                <button
                  onClick={runAgent}
                  disabled={isRunningAgent}
                  className="px-6 py-3 bg-[#00ff88] text-[#0d0d0d] font-bold rounded-lg hover:bg-[#00ff88]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRunningAgent ? 'Running...' : 'Run AI Agent Review'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
