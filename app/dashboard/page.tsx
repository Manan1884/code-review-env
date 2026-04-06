'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ScoreBar from '@/components/ScoreBar';
import { IPullRequest } from '@/types';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [prs, setPrs] = useState<IPullRequest[]>([]);
  const [stats, setStats] = useState({ total: 0, avgScore: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserPRs();
    }
  }, [session]);

  const fetchUserPRs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/prs');
      const result = await response.json();
      if (result.success) {
        const userPrs = result.data.filter((pr: IPullRequest) => 
          (pr.userId as any)?._id === session?.user?.id || pr.userId.toString() === session?.user?.id
        );
        setPrs(userPrs);
        
        const reviewedPrs = userPrs.filter((pr: any) => pr.status === 'reviewed');
        const totalScore = reviewedPrs.reduce((acc: number, pr: any) => acc + (pr.rewardScore || 0), 0);
        
        setStats({
          total: userPrs.length,
          avgScore: reviewedPrs.length > 0 ? totalScore / reviewedPrs.length : 0,
        });
      }
    } catch (err) {
      console.error('Failed to fetch PRs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePR = async (id: string) => {
    if (!confirm('Are you sure you want to delete this PR?')) return;
    
    try {
      const response = await fetch(`/api/prs/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setPrs(prs.filter(pr => pr._id.toString() !== id));
      }
    } catch (err) {
      console.error('Failed to delete PR:', err);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-[#00ff88]">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Sign in Required</h1>
          <p className="text-gray-400">Please sign in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d0d0d] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl font-bold text-white mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 rounded-lg border border-[#1f1f1f] bg-[#141414]" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}>
            <div className="text-4xl font-bold text-[#00ff88] mb-2">{stats.total}</div>
            <div className="text-sm text-gray-400">Total PRs Submitted</div>
          </div>
          <div className="p-6 rounded-lg border border-[#1f1f1f] bg-[#141414]" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}>
            <div className="text-4xl font-bold text-[#00ff88] mb-2">{Math.round(stats.avgScore * 100)}%</div>
            <div className="text-sm text-gray-400">Average Score</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Your Pull Requests</h2>
          <Link
            href="/submit"
            className="px-4 py-2 bg-[#00ff88] text-[#0d0d0d] font-bold rounded-lg hover:bg-[#00ff88]/90 transition-colors"
          >
            Submit New PR
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-[#00ff88]">Loading...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {prs.map((pr) => (
              <div
                key={pr._id.toString()}
                className="flex items-center justify-between p-4 rounded-lg border border-[#1f1f1f] bg-[#141414]"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-white truncate">{pr.title}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold uppercase shrink-0 ${
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
                  <div className="text-sm text-gray-400">
                    {pr.repoName} • {pr.language}
                  </div>
                  {(pr as any).rewardScore !== undefined && (
                    <div className="mt-2 w-48">
                      <ScoreBar score={(pr as any).rewardScore || 0} />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {pr.status === 'pending' && (
                    <Link
                      href={`/review/${pr._id}`}
                      className="px-3 py-1.5 bg-[#00ff88]/20 text-[#00ff88] text-sm font-medium rounded hover:bg-[#00ff88]/30 transition-colors"
                    >
                      Run Review
                    </Link>
                  )}
                  <Link
                    href={`/review/${pr._id}`}
                    className="px-3 py-1.5 bg-[#1f1f1f] text-gray-300 text-sm font-medium rounded hover:bg-[#2f2f2f] transition-colors"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => deletePR(pr._id.toString())}
                    className="px-3 py-1.5 bg-red-500/20 text-red-400 text-sm font-medium rounded hover:bg-red-500/30 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && prs.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="mb-4">You haven&apos;t submitted any pull requests yet.</p>
            <Link
              href="/submit"
              className="px-4 py-2 bg-[#00ff88] text-[#0d0d0d] font-bold rounded-lg hover:bg-[#00ff88]/90 transition-colors"
            >
              Submit Your First PR
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
