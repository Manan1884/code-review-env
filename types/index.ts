export type UserRole = 'user' | 'admin';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
}

export type PRStatus = 'pending' | 'under_review' | 'reviewed';
export type Language = 'javascript' | 'typescript' | 'python' | 'go' | 'java';

export interface IPullRequest {
  _id: string;
  userId: string | IUser;
  title: string;
  description: string;
  repoName: string;
  prNumber: number;
  diff: string;
  language: Language;
  status: PRStatus;
  submittedAt: Date;
  updatedAt: Date;
}

export type ActionType = 'approve' | 'request_changes' | 'flag_line' | 'add_comment';
export type Category = 'style' | 'logic' | 'security';
export type Severity = 'low' | 'medium' | 'high';
export type Verdict = 'approved' | 'changes_requested';
export type TaskDifficulty = 'easy' | 'medium' | 'hard';

export interface AgentAction {
  action: ActionType;
  lineNumber?: number;
  category?: Category;
  severity?: Severity;
  comment: string;
}

export interface IReview {
  _id: string;
  prId: string | IPullRequest;
  agentActions: AgentAction[];
  finalVerdict: Verdict;
  agentScore: number;
  expertLabels: AgentAction[];
  rewardScore: number;
  taskDifficulty: TaskDifficulty;
  createdAt: Date;
}

export interface EpisodeStep {
  stepNumber: number;
  state: string;
  action: string;
  reward: number;
  done: boolean;
  timestamp: Date;
}

export interface IEpisodeLog {
  _id: string;
  prId: string | IPullRequest;
  reviewId: string | IReview;
  steps: EpisodeStep[];
}

export interface ActionPayload {
  type: ActionType;
  lineNumber?: number;
  category?: Category;
  severity?: Severity;
  comment?: string;
}

export interface EnvState {
  diff: string;
  language: string;
  prNumber: number;
  repoName: string;
}

export interface StepResult {
  newState: EnvState;
  reward: number;
  done: boolean;
}
