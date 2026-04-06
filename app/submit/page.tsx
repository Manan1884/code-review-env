'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const prSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required'),
  repoName: z.string().min(1, 'Repository name is required'),
  prNumber: z.number().min(1, 'PR number must be positive'),
  language: z.enum(['javascript', 'typescript', 'python', 'go', 'java']),
  diff: z.string().min(1, 'Diff is required').refine(
    (val) => val.startsWith('---') || val.startsWith('@@'),
    'Diff must start with --- or @@'
  ),
});

type PRFormData = z.infer<typeof prSchema>;

export default function SubmitPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PRFormData>({
    resolver: zodResolver(prSchema),
    defaultValues: {
      prNumber: 1,
      language: 'typescript',
    },
  });

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
          <p className="text-gray-400 mb-4">Please sign in to submit a pull request.</p>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: PRFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/prs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit PR');
      }

      router.push(`/review/${result.data._id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0d0d0d] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl font-bold text-white mb-8">Submit Pull Request</h1>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              {...register('title')}
              type="text"
              className="w-full px-4 py-3 rounded-lg bg-[#141414] border border-[#1f1f1f] text-white focus:border-[#00ff88] focus:outline-none"
              placeholder="Enter PR title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-[#141414] border border-[#1f1f1f] text-white focus:border-[#00ff88] focus:outline-none"
              placeholder="Enter PR description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Repository Name</label>
              <input
                {...register('repoName')}
                type="text"
                className="w-full px-4 py-3 rounded-lg bg-[#141414] border border-[#1f1f1f] text-white focus:border-[#00ff88] focus:outline-none"
                placeholder="e.g., myorg/myrepo"
              />
              {errors.repoName && (
                <p className="mt-1 text-sm text-red-400">{errors.repoName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">PR Number</label>
              <input
                {...register('prNumber', { valueAsNumber: true })}
                type="number"
                min={1}
                className="w-full px-4 py-3 rounded-lg bg-[#141414] border border-[#1f1f1f] text-white focus:border-[#00ff88] focus:outline-none"
              />
              {errors.prNumber && (
                <p className="mt-1 text-sm text-red-400">{errors.prNumber.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
            <select
              {...register('language')}
              className="w-full px-4 py-3 rounded-lg bg-[#141414] border border-[#1f1f1f] text-white focus:border-[#00ff88] focus:outline-none"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="go">Go</option>
              <option value="java">Java</option>
            </select>
            {errors.language && (
              <p className="mt-1 text-sm text-red-400">{errors.language.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Diff</label>
            <textarea
              {...register('diff')}
              rows={15}
              className="w-full px-4 py-3 rounded-lg bg-[#141414] border border-[#1f1f1f] text-white font-mono text-sm focus:border-[#00ff88] focus:outline-none"
              placeholder="Paste the full diff here...&#10;--- a/file.js&#10;+++ b/file.js&#10;@@ -1,5 +1,5 @@..."
            />
            {errors.diff && (
              <p className="mt-1 text-sm text-red-400">{errors.diff.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-[#00ff88] text-[#0d0d0d] font-bold rounded-lg hover:bg-[#00ff88]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Pull Request'}
          </button>
        </form>
      </div>
    </main>
  );
}
