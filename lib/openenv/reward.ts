import { AgentAction, TaskDifficulty } from '@/types';

export function rewardFn(
  agentActions: AgentAction[],
  expertLabels: AgentAction[],
  taskDifficulty: TaskDifficulty
): number {
  if (expertLabels.length === 0) {
    return 0;
  }
  
  switch (taskDifficulty) {
    case 'easy':
      return calculateStyleReward(agentActions, expertLabels);
    case 'medium':
      return calculateLogicReward(agentActions, expertLabels);
    case 'hard':
      return calculateSecurityReward(agentActions, expertLabels);
    default:
      return 0;
  }
}

function calculateStyleReward(agentActions: AgentAction[], expertLabels: AgentAction[]): number {
  const styleLabels = expertLabels.filter(label => label.category === 'style');
  
  if (styleLabels.length === 0) {
    return 0;
  }
  
  const styleAgentActions = agentActions.filter(action => action.category === 'style');
  
  let matches = 0;
  for (const label of styleLabels) {
    const match = styleAgentActions.find(action => 
      action.lineNumber === label.lineNumber &&
      action.category === label.category
    );
    if (match) {
      matches++;
    }
  }
  
  return matches / styleLabels.length;
}

function calculateLogicReward(agentActions: AgentAction[], expertLabels: AgentAction[]): number {
  const logicLabels = expertLabels.filter(label => label.category === 'logic');
  
  if (logicLabels.length === 0) {
    return 0;
  }
  
  const logicAgentActions = agentActions.filter(action => action.category === 'logic');
  
  let matches = 0;
  for (const label of logicLabels) {
    const match = logicAgentActions.find(action => 
      action.lineNumber === label.lineNumber &&
      action.category === label.category
    );
    if (match) {
      matches++;
    }
  }
  
  return matches / logicLabels.length;
}

function calculateSecurityReward(agentActions: AgentAction[], expertLabels: AgentAction[]): number {
  const securityLabels = expertLabels.filter(label => label.category === 'security');
  
  if (securityLabels.length === 0) {
    return 0;
  }
  
  const securityAgentActions = agentActions.filter(action => action.category === 'security');
  
  for (const label of securityLabels) {
    const match = securityAgentActions.find(action => 
      action.lineNumber === label.lineNumber &&
      action.category === label.category &&
      action.severity === label.severity
    );
    if (!match) {
      return 0;
    }
  }
  
  return 1.0;
}
