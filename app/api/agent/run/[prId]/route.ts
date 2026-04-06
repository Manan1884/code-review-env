import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PullRequest from '@/models/PullRequest';
import Review from '@/models/Review';
import EpisodeLog from '@/models/EpisodeLog';
import { rewardFn } from '@/lib/openenv/reward';
import { stateFn } from '@/lib/openenv/state';
import { stepFn } from '@/lib/openenv/step';
import { AgentAction } from '@/types';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ prId: string }> }
) {
  try {
    const { prId } = await params;
    
    // Lazy load OpenAI only when needed
    const { default: openai } = await import('@/lib/openai');
    
    await connectDB();
    
    const pr = await PullRequest.findById(prId);
    if (!pr) {
      return NextResponse.json(
        { success: false, error: 'Pull request not found' },
        { status: 404 }
      );
    }
    
    const state = await stateFn(prId);
    
    const systemPrompt = `You are an expert code reviewer. Analyze the given code diff and return a JSON array of review actions. Each object must have: action (flag_line | add_comment | approve | request_changes), lineNumber (integer or null), category (style | logic | security), severity (low | medium | high), comment (string). Return only a valid JSON array with no explanation and no markdown.`;
    
    const response = await openai.chat.completions.create({
      model: process.env.GROQ_API_KEY ? 'llama-3.3-70b-versatile' : 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Language: ${state.language}\n\nDiff:\n${state.diff}` },
      ],
      temperature: 0.3,
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
    
    let review = await Review.findOne({ prId });
    if (!review) {
      review = await Review.create({ prId });
    }
    
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
        state: JSON.stringify(result.newState),
        action: JSON.stringify(action),
        reward: result.reward,
        done: result.done,
        timestamp: new Date(),
      });
      
      if (result.done) {
        done = true;
        break;
      }
    }
    
    if (!done && actions.length > 0) {
      const finalAction = actions[actions.length - 1];
      if (finalAction.action !== 'approve' && finalAction.action !== 'request_changes') {
        const result = await stepFn(prId, {
          type: 'request_changes',
          comment: 'Review completed without explicit verdict',
        });
        
        steps.push({
          stepNumber: steps.length + 1,
          state: JSON.stringify(result.newState),
          action: JSON.stringify({ type: 'request_changes', comment: 'Review completed without explicit verdict' }),
          reward: result.reward,
          done: true,
          timestamp: new Date(),
        });
      }
    }
    
    const finalReward = rewardFn(review.agentActions, review.expertLabels, review.taskDifficulty);
    review.rewardScore = finalReward;
    review.agentScore = finalReward;
    await review.save();
    
    await EpisodeLog.create({
      prId,
      reviewId: review._id,
      steps,
    });
    
    return NextResponse.json({
      success: true,
      data: {
        reviewId: review._id,
        agentActions: review.agentActions,
        finalVerdict: review.finalVerdict,
        agentScore: review.agentScore,
        rewardScore: review.rewardScore,
        taskDifficulty: review.taskDifficulty,
        steps,
      },
    });
  } catch (error: any) {
    if (error.message?.includes('OpenAI') || error.message?.includes('AI')) {
      return NextResponse.json(
        { success: false, error: 'AI service error' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
