import mongoose, { Schema, Document } from 'mongoose';
import { IReview, AgentAction } from '@/types';

const AgentActionSchema = new Schema<AgentAction>({
  action: {
    type: String,
    enum: ['approve', 'request_changes', 'flag_line', 'add_comment'],
    required: true,
  },
  lineNumber: {
    type: Number,
    required: false,
  },
  category: {
    type: String,
    enum: ['style', 'logic', 'security'],
    required: false,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: false,
  },
  comment: {
    type: String,
    required: true,
  },
}, { _id: false });

export interface IReviewDocument extends Omit<IReview, '_id' | 'prId'>, Document {
  _id: mongoose.Types.ObjectId;
  prId: mongoose.Types.ObjectId;
}

const ReviewSchema = new Schema<IReviewDocument>({
  prId: {
    type: Schema.Types.ObjectId,
    ref: 'PullRequest',
    required: true,
    unique: true,
  },
  agentActions: {
    type: [AgentActionSchema],
    default: [],
  },
  finalVerdict: {
    type: String,
    enum: ['approved', 'changes_requested'],
    required: false,
  },
  agentScore: {
    type: Number,
    min: 0,
    max: 1,
    required: false,
  },
  expertLabels: {
    type: [AgentActionSchema],
    default: [],
  },
  rewardScore: {
    type: Number,
    min: 0,
    max: 1,
    default: 0,
  },
  taskDifficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Review || mongoose.model<IReviewDocument>('Review', ReviewSchema);
