import { IReview } from '@/types';
import ActionBadge from './ActionBadge';
import ScoreBar from './ScoreBar';

interface ReviewSummaryProps {
  review: IReview;
}

export default function ReviewSummary({ review }: ReviewSummaryProps) {
  const getVerdictColor = (verdict: string): string => {
    return verdict === 'approved' ? '#34d399' : '#f87171';
  };

  return (
    <div className="p-6 rounded-lg border border-[#1f1f1f] bg-[#141414]" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Review Summary</h3>
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide"
          style={{
            backgroundColor: (review.finalVerdict === 'approved' ? '#34d399' : '#f87171') + '20',
            color: review.finalVerdict === 'approved' ? '#34d399' : '#f87171',
            border: `1px solid ${review.finalVerdict === 'approved' ? '#34d399' : '#f87171'}40`,
          }}
        >
          {review.finalVerdict === 'approved' ? 'Approved' : 'Changes Requested'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 rounded bg-[#0d0d0d] border border-[#1f1f1f]">
          <span className="text-xs text-gray-500 block mb-1">Final Verdict</span>
          <span
            className="font-bold text-lg"
            style={{ color: getVerdictColor(review.finalVerdict || '') }}
          >
            {review.finalVerdict === 'approved' ? 'Approved' : 'Changes Requested'}
          </span>
        </div>

        <div className="p-3 rounded bg-[#0d0d0d] border border-[#1f1f1f]">
          <span className="text-xs text-gray-500 block mb-1">Difficulty</span>
          <span className="font-bold text-lg capitalize text-white">
            {review.taskDifficulty}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <span className="text-xs text-gray-500 block mb-2">Agent Score</span>
        <ScoreBar score={review.agentScore || 0} />
      </div>

      <div className="mb-2">
        <span className="text-xs text-gray-500 block mb-2">Reward Score</span>
        <ScoreBar score={review.rewardScore} />
      </div>

      <div className="mt-4 pt-4 border-t border-[#1f1f1f]">
        <span className="text-xs text-gray-500 block mb-2">Agent Actions ({review.agentActions.length})</span>
        <div className="flex flex-wrap gap-2">
          {review.agentActions.map((action, index) => (
            <ActionBadge
              key={index}
              action={action.action}
              category={action.category}
              severity={action.severity}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
