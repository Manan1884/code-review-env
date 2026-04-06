'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ScoreBar from '@/components/ScoreBar';
import { IReview } from '@/types';

export default function LeaderboardPage() {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/leaderboard');
      const result = await response.json();
      if (result.success) {
        setReviews(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (activeTab === 'all') return true;
    return review.taskDifficulty === activeTab;
  });

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'easy', label: 'Easy' },
    { id: 'medium', label: 'Medium' },
    { id: 'hard', label: 'Hard' },
  ];

  return (
    <main className="min-h-screen bg-[#0d0d0d] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl font-bold text-white mb-8">Leaderboard</h1>

        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#00ff88] text-[#0d0d0d]'
                  : 'bg-[#141414] text-gray-300 hover:bg-[#1f1f1f]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-[#00ff88]">Loading...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1f1f1f]">
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Rank</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">PR Title</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Repository</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Language</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Score</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((review, index) => {
                  const pr = review.prId as any;
                  return (
                    <tr
                      key={review._id.toString()}
                      className="border-b border-[#1f1f1f] hover:bg-[#141414] transition-colors"
                    >
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                            index < 3
                              ? 'bg-[#00ff88]/20 text-[#00ff88]'
                              : 'bg-[#1f1f1f] text-gray-400'
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Link
                          href={`/review/${pr?._id}`}
                          className="font-medium text-white hover:text-[#00ff88] transition-colors"
                        >
                          {pr?.title || 'Unknown'}
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-gray-400">{pr?.repoName || 'Unknown'}</td>
                      <td className="py-4 px-4">
                        <span className="capitalize text-gray-400">{pr?.language || 'Unknown'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-32">
                          <ScoreBar score={review.rewardScore} />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                            review.finalVerdict === 'approved'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {review.finalVerdict === 'approved' ? 'Approved' : 'Changes'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredReviews.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No reviews found for this difficulty level.
          </div>
        )}
      </div>
    </main>
  );
}
