/**
 * Baseline Inference Script for Code Review Environment
 * 
 * This script runs a baseline AI agent (GPT-4o) against all test PRs
 * with expert labels, calculates reproducible scores, and generates
 * a report comparing agent performance to expert labels.
 * 
 * Usage:
 *   npx ts-node scripts/baseline.ts
 *   npx ts-node scripts/baseline.ts --difficulty=easy
 *   npx ts-node scripts/baseline.ts --difficulty=medium
 *   npx ts-node scripts/baseline.ts --difficulty=hard
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import connectDB from '../lib/mongodb';
import PullRequest from '../models/PullRequest';
import Review from '../models/Review';
import EpisodeLog from '../models/EpisodeLog';
import { stateFn } from '../lib/openenv/state';
import { stepFn } from '../lib/openenv/step';
import { rewardFn } from '../lib/openenv/reward';
import { resetFn } from '../lib/openenv/reset';
import { AgentAction, TaskDifficulty } from '../types';

interface BaselineResult {
  prId: string;
  prTitle: string;
  difficulty: TaskDifficulty;
  expectedReward: number;
  actualReward: number;
  precision: number;
  recall: number;
  f1Score: number;
  steps: number;
  duration: number;
}

interface AggregateScores {
  totalPRs: number;
  avgReward: number;
  avgPrecision: number;
  avgRecall: number;
  avgF1: number;
  totalDuration: number;
}

async function runBaselineAgent(prId: string): Promise<AgentAction[]> {
  const { default: openai } = await import('../lib/openai');
  
  const state = await stateFn(prId);
  
  const systemPrompt = `You are an expert code reviewer. Analyze the given code diff and return a JSON array of review actions.

Each action object must have:
- action: "flag_line" | "add_comment" | "approve" | "request_changes"
- lineNumber: integer (for flag_line/add_comment, null for others)
- category: "style" | "logic" | "security"
- severity: "low" | "medium" | "high"
- comment: string (descriptive comment)

Guidelines:
- Flag style issues: indentation, semicolons, naming conventions, unused variables
- Flag logic bugs: off-by-one errors, wrong conditionals, null pointer risks, infinite loops
- Flag security: SQL injection, XSS, hardcoded secrets, insecure dependencies
- Use appropriate severity based on impact
- Always end with "approve" or "request_changes"

Return only a valid JSON array with no explanation and no markdown formatting.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Language: ${state.language}\n\nDiff:\n${state.diff}` },
    ],
    temperature: 0.1,
    seed: 42,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('No response from AI');
  }

  let actions: AgentAction[];
  try {
    actions = JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      actions = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Invalid JSON response from AI');
    }
  }

  if (!Array.isArray(actions)) {
    throw new Error('AI response is not an array');
  }

  return actions;
}

async function evaluatePR(prId: string, difficulty: TaskDifficulty): Promise<BaselineResult> {
  const startTime = Date.now();
  
  // Reset environment to ensure clean state
  await resetFn(prId);
  
  // Get the review with expert labels
  const review = await Review.findOne({ prId });
  if (!review) {
    throw new Error(`No review found for PR ${prId}`);
  }
  
  const expertLabels = review.expertLabels || [];
  if (expertLabels.length === 0) {
    throw new Error(`No expert labels for PR ${prId}`);
  }

  // Run baseline agent
  const actions = await runBaselineAgent(prId);
  
  // Execute actions through environment
  const steps = [];
  let done = false;
  
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    const result = await stepFn(prId, {
      type: action.action,
      lineNumber: action.lineNumber,
      category: action.category,
      severity: action.severity,
      comment: action.comment,
    });
    
    steps.push({
      stepNumber: i + 1,
      action,
      reward: result.reward,
      done: result.done,
    });
    
    if (result.done) {
      done = true;
      break;
    }
  }
  
  // Ensure episode ends
  if (!done && actions.length > 0) {
    const lastAction = actions[actions.length - 1];
    if (lastAction.action !== 'approve' && lastAction.action !== 'request_changes') {
      await stepFn(prId, {
        type: 'request_changes',
        comment: 'Baseline review completed',
      });
    }
  }
  
  // Get updated review with final scores
  const finalReview = await Review.findOne({ prId });
  const actualReward = finalReview?.rewardScore || 0;
  
  // Calculate expected reward (perfect match to expert labels)
  const expectedReward = 1.0;
  
  // Calculate precision, recall, F1
  const agentActions = finalReview?.agentActions || [];
  const flagActions = agentActions.filter((a: { action: string; }) => a.action === 'flag_line');
  const expertFlagActions = expertLabels.filter((l: { action: string; }) => l.action === 'flag_line');
  
  let matches = 0;
  for (const label of expertFlagActions) {
    const match = flagActions.find((a: { lineNumber: any; category: any; }) => 
      a.lineNumber === label.lineNumber && 
      a.category === label.category
    );
    if (match) matches++;
  }
  
  const precision = flagActions.length > 0 ? matches / flagActions.length : 0;
  const recall = expertFlagActions.length > 0 ? matches / expertFlagActions.length : 0;
  const f1Score = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  
  const duration = Date.now() - startTime;
  
  // Log episode
  await EpisodeLog.create({
    prId,
    reviewId: finalReview?._id,
    steps: steps.map(async (s, idx) => ({
      stepNumber: idx + 1,
      state: JSON.stringify(await stateFn(prId)),
      action: JSON.stringify(s.action),
      reward: s.reward,
      done: s.done,
      timestamp: new Date(),
    })),
    isBaseline: true,
  });
  
  const pr = await PullRequest.findById(prId);
  
  return {
    prId,
    prTitle: pr?.title || 'Unknown',
    difficulty,
    expectedReward,
    actualReward,
    precision,
    recall,
    f1Score,
    steps: steps.length,
    duration,
  };
}

function calculateAggregateScores(results: BaselineResult[]): AggregateScores {
  const total = results.length;
  return {
    totalPRs: total,
    avgReward: results.reduce((sum, r) => sum + r.actualReward, 0) / total,
    avgPrecision: results.reduce((sum, r) => sum + r.precision, 0) / total,
    avgRecall: results.reduce((sum, r) => sum + r.recall, 0) / total,
    avgF1: results.reduce((sum, r) => sum + r.f1Score, 0) / total,
    totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
  };
}

function printReport(results: BaselineResult[], aggregates: AggregateScores) {
  console.log('\n' + '='.repeat(80));
  console.log('BASELINE INFERENCE REPORT - Code Review Environment');
  console.log('='.repeat(80));
  console.log(`Model: GPT-4o (temperature=0.1, seed=42)`);
  console.log(`Total PRs Evaluated: ${aggregates.totalPRs}`);
  console.log(`Total Duration: ${(aggregates.totalDuration / 1000).toFixed(2)}s`);
  console.log('-'.repeat(80));
  
  // Group by difficulty
  const byDifficulty: Record<TaskDifficulty, BaselineResult[]> = {
    easy: [],
    medium: [],
    hard: [],
  };
  
  for (const result of results) {
    byDifficulty[result.difficulty].push(result);
  }
  
  for (const [difficulty, diffResults] of Object.entries(byDifficulty)) {
    if (diffResults.length === 0) continue;
    
    console.log(`\n${difficulty.toUpperCase()} TASKS (${diffResults.length} PRs):`);
    console.log('-'.repeat(40));
    
    for (const r of diffResults) {
      console.log(`  ${r.prTitle}`);
      console.log(`    Reward: ${r.actualReward.toFixed(3)}/${r.expectedReward.toFixed(3)} | ` +
                  `P: ${r.precision.toFixed(3)} | R: ${r.recall.toFixed(3)} | F1: ${r.f1Score.toFixed(3)} | ` +
                  `${r.steps} steps | ${r.duration}ms`);
    }
    
    const diffAgg = calculateAggregateScores(diffResults);
    console.log(`\n  ${difficulty.toUpperCase()} AVERAGES:`);
    console.log(`    Reward: ${diffAgg.avgReward.toFixed(3)} | ` +
                `Precision: ${diffAgg.avgPrecision.toFixed(3)} | ` +
                `Recall: ${diffAgg.avgRecall.toFixed(3)} | ` +
                `F1: ${diffAgg.avgF1.toFixed(3)}`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('OVERALL AVERAGES');
  console.log('='.repeat(80));
  console.log(`  Average Reward:    ${aggregates.avgReward.toFixed(3)}`);
  console.log(`  Average Precision: ${aggregates.avgPrecision.toFixed(3)}`);
  console.log(`  Average Recall:    ${aggregates.avgRecall.toFixed(3)}`);
  console.log(`  Average F1 Score:  ${aggregates.avgF1.toFixed(3)}`);
  console.log('='.repeat(80) + '\n');
}

async function main() {
  // Parse command line args
  const args = process.argv.slice(2);
  const difficultyFilter = args.find(arg => arg.startsWith('--difficulty='))?.split('=')[1] as TaskDifficulty | undefined;
  
  // Validate environment
  if (!process.env.MONGODB_URI || !process.env.OPENAI_API_KEY) {
    console.error('❌ Missing required environment variables:');
    if (!process.env.MONGODB_URI) console.error('   - MONGODB_URI');
    if (!process.env.OPENAI_API_KEY) console.error('   - OPENAI_API_KEY');
    process.exit(1);
  }
  
  console.log('🔌 Connecting to database...');
  await connectDB();
  
  // Build query
  const query: any = { expertLabels: { $exists: true, $not: { $size: 0 } } };
  if (difficultyFilter) {
    query.taskDifficulty = difficultyFilter;
    console.log(`🎯 Filtering for ${difficultyFilter} difficulty tasks`);
  }
  
  // Find reviews with expert labels
  const reviews = await Review.find(query).populate('prId');
  
  if (reviews.length === 0) {
    console.error('❌ No PRs with expert labels found. Run seed script first.');
    process.exit(1);
  }
  
  console.log(`📋 Found ${reviews.length} PRs with expert labels`);
  console.log('🤖 Running baseline agent (GPT-4o)...\n');
  
  const results: BaselineResult[] = [];
  
  for (let i = 0; i < reviews.length; i++) {
    const review = reviews[i];
    const prId = review.prId._id.toString();
    const difficulty = review.taskDifficulty || 'easy';
    const prTitle = review.prId.title || 'Unknown';
    
    console.log(`[${i + 1}/${reviews.length}] Evaluating: ${prTitle} (${difficulty})`);
    
    try {
      const result = await evaluatePR(prId, difficulty);
      results.push(result);
      console.log(`  ✓ Reward: ${result.actualReward.toFixed(3)} | F1: ${result.f1Score.toFixed(3)}`);
    } catch (error: any) {
      console.error(`  ✗ Error: ${error.message}`);
    }
  }
  
  if (results.length === 0) {
    console.error('❌ No successful evaluations');
    process.exit(1);
  }
  
  // Calculate and display aggregate scores
  const aggregates = calculateAggregateScores(results);
  printReport(results, aggregates);
  
  // Save results to file for reproducibility
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `baseline-results-${timestamp}.json`;
  const fs = await import('fs');
  
  fs.writeFileSync(
    filename,
    JSON.stringify({
      model: 'gpt-4o',
      temperature: 0.1,
      seed: 42,
      timestamp: new Date().toISOString(),
      aggregates,
      results,
    }, null, 2)
  );
  
  console.log(`💾 Results saved to: ${filename}\n`);
  
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
