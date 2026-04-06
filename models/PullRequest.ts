import mongoose, { Schema, Document } from 'mongoose';
import { IPullRequest } from '@/types';

export interface IPullRequestDocument extends Omit<IPullRequest, '_id' | 'userId'>, Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
}

const PullRequestSchema = new Schema<IPullRequestDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    maxlength: [200, 'Title cannot be more than 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  repoName: {
    type: String,
    required: [true, 'Please provide a repository name'],
  },
  prNumber: {
    type: Number,
    required: [true, 'Please provide a PR number'],
    min: [1, 'PR number must be positive'],
  },
  diff: {
    type: String,
    required: [true, 'Please provide a diff'],
  },
  language: {
    type: String,
    enum: ['javascript', 'typescript', 'python', 'go', 'java'],
    required: [true, 'Please specify a language'],
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'reviewed'],
    default: 'pending',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: { createdAt: 'submittedAt', updatedAt: 'updatedAt' } });

export default mongoose.models.PullRequest || mongoose.model<IPullRequestDocument>('PullRequest', PullRequestSchema);
