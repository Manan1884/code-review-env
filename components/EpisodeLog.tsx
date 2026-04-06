'use client';

import { useState } from 'react';
import { EpisodeStep } from '@/types';

interface EpisodeLogProps {
  steps: EpisodeStep[];
}

export default function EpisodeLog({ steps }: EpisodeLogProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border border-[#1f1f1f] rounded-lg overflow-hidden bg-[#141414]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-[#1f1f1f] transition-colors"
      >
        <span className="font-mono text-sm text-gray-300">Episode Log ({steps.length} steps)</span>
        <span className="text-gray-400">{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && (
        <div className="border-t border-[#1f1f1f]">
          <div className="max-h-64 overflow-y-auto">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`p-4 border-b border-[#1f1f1f] last:border-b-0 ${
                  step.done ? 'bg-green-500/5' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-gray-500">Step {step.stepNumber}</span>
                  <span className="font-mono text-xs" style={{ color: step.reward > 0 ? '#00ff88' : '#f87171' }}>
                    Reward: {step.reward.toFixed(3)}
                  </span>
                </div>
                <div className="text-sm text-gray-300 font-mono truncate">
                  {step.action}
                </div>
                {step.done && (
                  <span className="mt-2 inline-block px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                    Done
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
