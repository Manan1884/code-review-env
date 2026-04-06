'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ScoreBar from '@/components/ScoreBar';
import ActionBadge from '@/components/ActionBadge';
import { IPullRequest } from '@/types';

export default function PRsPage() {
  const [prs, setPrs] = useState<IPullRequest[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    language: '',
    difficulty: '',
    sort: 'date',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPRs();
  }, [filters]);

  const fetchPRs = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.language) queryParams.append('language', filters.language);
      if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
      if (filters.sort) queryParams.append('sort', filters.sort);

      const response = await fetch(`/api/prs?${queryParams.toString()}`);
      const result = await response.json();
      if (result.success) {
        setPrs(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch PRs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0d0d0d] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl font-bold text-white">Pull Requests</h1>
          <Link
            href="/submit"
            className="px-4 py-2 bg-[#00ff88] text-[#0d0d0d] font-bold rounded-lg hover:bg-[#00ff88]/90 transition-colors"
          >
            Submit PR
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 rounded-lg bg-[#141414] border border-[#1f1f1f] text-white focus:border-[#00ff88] focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="reviewed">Reviewed</option>
          </select>

          <select
            value={filters.language}
            onChange={(e) => setFilters({ ...filters, language: e.target.value })}
            className="px-4 py-2 rounded-lg bg-[#141414] border border-[#1f1f1f] text-white focus:border-[#00ff88] focus:outline-none"
          >
            <option value="">All Languages</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="go">Go</option>
            <option value="java">Java</option>
          </select>

          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="px-4 py-2 rounded-lg bg-[#141414] border border-[#1f1f1f] text-white focus:border-[#00ff88] focus:outline-none"
          >
            <option value="date">Sort by Date</option>
            <option value="score">Sort by Score</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-[#00ff88]">Loading...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prs.map((pr) => (
              <Link
                key={pr._id.toString()}
                href={`/review/${pr._id}`}
                className="block p-6 rounded-lg border border-[#1f1f1f] bg-[#141414] hover:border-[#00ff88]/50 transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-white truncate pr-4">{pr.title}</h3>
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

                <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
                  <span>{pr.repoName}</span>
                  <span>•</span>
                  <span className="capitalize">{pr.language}</span>
                </div>

                {(pr as any).rewardScore !== undefined && (
                  <ScoreBar score={(pr as any).rewardScore || 0} />
                )}
              </Link>
            ))}
          </div>
        )}

        {!isLoading && prs.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No pull requests found.
          </div>
        )}
      </div>
    </main>
  );
}
