'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { IReview, AgentAction } from '@/types';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [expertLabels, setExpertLabels] = useState<AgentAction[]>([]);
  const [taskDifficulty, setTaskDifficulty] = useState<string>('medium');

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchReviews();
    }
  }, [session]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/leaderboard');
      const result = await response.json();
      if (result.success) {
        setReviews(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (review: IReview) => {
    setEditingReview(review._id.toString());
    setExpertLabels([...review.expertLabels]);
    setTaskDifficulty(review.taskDifficulty);
  };

  const addExpertLabel = () => {
    setExpertLabels([...expertLabels, {
      action: 'flag_line',
      lineNumber: 1,
      category: 'style',
      severity: 'low',
      comment: '',
    }]);
  };

  const removeExpertLabel = (index: number) => {
    setExpertLabels(expertLabels.filter((_, i) => i !== index));
  };

  const updateExpertLabel = (index: number, field: keyof AgentAction, value: any) => {
    const updated = [...expertLabels];
    updated[index] = { ...updated[index], [field]: value };
    setExpertLabels(updated);
  };

  const saveReview = async (prId: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${prId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expertLabels, taskDifficulty }),
      });

      if (response.ok) {
        setEditingReview(null);
        fetchReviews();
      }
    } catch (err) {
      console.error('Failed to save review:', err);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-[#00ff88]">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d0d0d] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl font-bold text-white mb-8">Admin Panel</h1>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-[#00ff88]">Loading...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const pr = review.prId as any;
              const isEditing = editingReview === review._id.toString();

              return (
                <div
                  key={review._id.toString()}
                  className="p-4 rounded-lg border border-[#1f1f1f] bg-[#141414]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-white">{pr?.title || 'Unknown'}</h3>
                      <div className="text-sm text-gray-400">{pr?.repoName || 'Unknown'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 capitalize">
                        Difficulty: {review.taskDifficulty}
                      </span>
                      {!isEditing && (
                        <button
                          onClick={() => startEditing(review)}
                          className="px-3 py-1.5 bg-[#00ff88]/20 text-[#00ff88] text-sm font-medium rounded hover:bg-[#00ff88]/30 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-4 p-4 rounded bg-[#0d0d0d] border border-[#1f1f1f]">
                      <div className="mb-4">
                        <label className="block text-sm text-gray-400 mb-2">Task Difficulty</label>
                        <select
                          value={taskDifficulty}
                          onChange={(e) => setTaskDifficulty(e.target.value)}
                          className="w-full px-3 py-2 rounded bg-[#141414] border border-[#1f1f1f] text-white"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm text-gray-400">Expert Labels</label>
                          <button
                            onClick={addExpertLabel}
                            className="px-3 py-1 bg-[#00ff88]/20 text-[#00ff88] text-xs rounded hover:bg-[#00ff88]/30 transition-colors"
                          >
                            + Add Label
                          </button>
                        </div>

                        <div className="space-y-2">
                          {expertLabels.map((label, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 rounded bg-[#141414]">
                              <select
                                value={label.category}
                                onChange={(e) => updateExpertLabel(index, 'category', e.target.value)}
                                className="px-2 py-1 rounded bg-[#0d0d0d] border border-[#1f1f1f] text-sm text-white"
                              >
                                <option value="style">Style</option>
                                <option value="logic">Logic</option>
                                <option value="security">Security</option>
                              </select>
                              <select
                                value={label.severity}
                                onChange={(e) => updateExpertLabel(index, 'severity', e.target.value)}
                                className="px-2 py-1 rounded bg-[#0d0d0d] border border-[#1f1f1f] text-sm text-white"
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                              </select>
                              <input
                                type="number"
                                value={label.lineNumber}
                                onChange={(e) => updateExpertLabel(index, 'lineNumber', parseInt(e.target.value))}
                                className="w-20 px-2 py-1 rounded bg-[#0d0d0d] border border-[#1f1f1f] text-sm text-white"
                                placeholder="Line"
                              />
                              <input
                                type="text"
                                value={label.comment}
                                onChange={(e) => updateExpertLabel(index, 'comment', e.target.value)}
                                className="flex-1 px-2 py-1 rounded bg-[#0d0d0d] border border-[#1f1f1f] text-sm text-white"
                                placeholder="Comment"
                              />
                              <button
                                onClick={() => removeExpertLabel(index)}
                                className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded hover:bg-red-500/30"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingReview(null)}
                          className="px-4 py-2 bg-[#1f1f1f] text-gray-300 rounded hover:bg-[#2f2f2f] transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveReview(pr?._id || review.prId.toString())}
                          className="px-4 py-2 bg-[#00ff88] text-[#0d0d0d] font-bold rounded hover:bg-[#00ff88]/90 transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}

                  {review.expertLabels.length > 0 && !isEditing && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {review.expertLabels.map((label, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 rounded text-xs"
                          style={{
                            backgroundColor: label.category === 'style' ? '#60a5fa20' : label.category === 'logic' ? '#fbbf2420' : '#f8717120',
                            color: label.category === 'style' ? '#60a5fa' : label.category === 'logic' ? '#fbbf24' : '#f87171',
                          }}
                        >
                          {label.category} @ L{label.lineNumber}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
