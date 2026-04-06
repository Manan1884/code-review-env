'use client';

import { useEffect, useState } from 'react';

interface ScoreBarProps {
  score: number;
}

export default function ScoreBar({ score }: ScoreBarProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const getColor = (s: number): string => {
    if (s >= 0.8) return '#34d399';
    if (s >= 0.5) return '#fbbf24';
    return '#f87171';
  };

  const percentage = Math.round(animatedScore * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-xs font-mono text-gray-400">Score</span>
        <span className="text-xs font-mono font-bold" style={{ color: getColor(score) }}>
          {percentage}%
        </span>
      </div>
      <div className="h-2 bg-[#1f1f1f] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: getColor(score),
          }}
        />
      </div>
    </div>
  );
}
