'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ScoreBar from '@/components/ScoreBar';

interface Stats {
  totalPRs: number;
  reviewedPRs: number;
  avgEasy: number;
  avgMedium: number;
  avgHard: number;
  recentReviews: any[];
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({
    totalPRs: 0,
    reviewedPRs: 0,
    avgEasy: 0,
    avgMedium: 0,
    avgHard: 0,
    recentReviews: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/leaderboard');
        const data = await res.json();
        
        if (data.success) {
          const easyScores = data.data.filter((r: any) => r.taskDifficulty === 'easy').map((r: any) => r.rewardScore);
          const mediumScores = data.data.filter((r: any) => r.taskDifficulty === 'medium').map((r: any) => r.rewardScore);
          const hardScores = data.data.filter((r: any) => r.taskDifficulty === 'hard').map((r: any) => r.rewardScore);
          
          setStats({
            totalPRs: data.data.length,
            reviewedPRs: data.data.length,
            avgEasy: easyScores.length > 0 ? easyScores.reduce((a: number, b: number) => a + b, 0) / easyScores.length : 0,
            avgMedium: mediumScores.length > 0 ? mediumScores.reduce((a: number, b: number) => a + b, 0) / mediumScores.length : 0,
            avgHard: hardScores.length > 0 ? hardScores.reduce((a: number, b: number) => a + b, 0) / hardScores.length : 0,
            recentReviews: data.data.slice(0, 5),
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);
  
  return (
    <main className="min-h-screen bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6">
            <span className="text-white">AI-Powered</span>
            <br />
            <span className="text-[#00ff88]">Code Review Environment</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            An OpenEnv implementation where AI agents read pull request diffs and perform 
            structured review actions — flagging style issues, logic bugs, and security vulnerabilities.
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center px-8 py-4 text-lg font-bold text-[#0d0d0d] bg-[#00ff88] rounded-lg hover:bg-[#00ff88]/90 transition-colors"
          >
            Submit a Pull Request
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00ff88]"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <div className="p-6 rounded-lg border border-[#1f1f1f] bg-[#141414]" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}>
                <div className="text-4xl font-bold text-[#00ff88] mb-2">{stats.totalPRs}</div>
                <div className="text-sm text-gray-400">Total PRs Submitted</div>
              </div>
              <div className="p-6 rounded-lg border border-[#1f1f1f] bg-[#141414]" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}>
                <div className="text-4xl font-bold text-[#00ff88] mb-2">{stats.reviewedPRs}</div>
                <div className="text-sm text-gray-400">PRs Reviewed</div>
              </div>
              <div className="p-6 rounded-lg border border-[#1f1f1f] bg-[#141414]" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}>
                <div className="text-4xl font-bold text-[#00ff88] mb-2">
                  {Math.round((stats.avgEasy + stats.avgMedium + stats.avgHard) / 3 * 100)}%
                </div>
                <div className="text-sm text-gray-400">Average Score</div>
              </div>
              <div className="p-6 rounded-lg border border-[#1f1f1f] bg-[#141414]" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}>
                <div className="text-4xl font-bold text-[#00ff88] mb-2">GPT-4o</div>
                <div className="text-sm text-gray-400">AI Model</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              <div className="p-6 rounded-lg border border-[#1f1f1f] bg-[#141414]" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}>
                <h2 className="text-xl font-bold mb-4">Average Score by Difficulty</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Easy (Style Review)</span>
                    </div>
                    <ScoreBar score={stats.avgEasy} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Medium (Logic Bugs)</span>
                    </div>
                    <ScoreBar score={stats.avgMedium} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Hard (Security)</span>
                    </div>
                    <ScoreBar score={stats.avgHard} />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-[#1f1f1f] bg-[#141414]" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}>
                <h2 className="text-xl font-bold mb-4">OpenEnv Loop</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#00ff88]/20 flex items-center justify-center text-[#00ff88] font-bold text-sm">1</div>
                    <span className="text-gray-300">Agent calls <code className="text-[#00ff88]">state()</code> to get PR diff</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#00ff88]/20 flex items-center justify-center text-[#00ff88] font-bold text-sm">2</div>
                    <span className="text-gray-300">Agent analyzes with GPT-4o</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#00ff88]/20 flex items-center justify-center text-[#00ff88] font-bold text-sm">3</div>
                    <span className="text-gray-300">Agent calls <code className="text-[#00ff88]">step()</code> for each action</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#00ff88]/20 flex items-center justify-center text-[#00ff88] font-bold text-sm">4</div>
                    <span className="text-gray-300">Reward calculated vs expert labels</span>
                  </div>
                </div>
              </div>
            </div>

            {stats.recentReviews.length > 0 && (
              <div className="p-6 rounded-lg border border-[#1f1f1f] bg-[#141414]" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}>
                <h2 className="text-xl font-bold mb-4">Recent Reviews</h2>
                <div className="space-y-3">
                  {stats.recentReviews.map((review) => (
                    <div key={review._id} className="flex items-center justify-between p-3 rounded bg-[#0d0d0d] border border-[#1f1f1f]">
                      <div>
                        <div className="font-medium text-white">
                          {review.prId?.title || 'Unknown PR'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {review.prId?.repoName || 'Unknown Repo'}
                        </div>
                      </div>
                      <ScoreBar score={review.rewardScore} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
