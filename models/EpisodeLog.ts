import mongoose, { Schema, Document } from 'mongoose';
import { IEpisodeLog, EpisodeStep } from '@/types';

const EpisodeStepSchema = new Schema<EpisodeStep>({
  stepNumber: {
    type: Number,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  reward: {
    type: Number,
    required: true,
  },
  done: {
    type: Boolean,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

export interface IEpisodeLogDocument extends Omit<IEpisodeLog, '_id' | 'prId' | 'reviewId'>, Document {
  _id: mongoose.Types.ObjectId;
  prId: mongoose.Types.ObjectId;
  reviewId: mongoose.Types.ObjectId;
}

const EpisodeLogSchema = new Schema<IEpisodeLogDocument>({
  prId: {
    type: Schema.Types.ObjectId,
    ref: 'PullRequest',
    required: true,
  },
  reviewId: {
    type: Schema.Types.ObjectId,
    ref: 'Review',
    required: true,
  },
  steps: {
    type: [EpisodeStepSchema],
    default: [],
  },
});

export default mongoose.models.EpisodeLog || mongoose.model<IEpisodeLogDocument>('EpisodeLog', EpisodeLogSchema);
