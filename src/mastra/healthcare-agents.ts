import { Agent } from '@mastra/core/agent';
import { chatModel } from './lm-studio';
import { REQUIREMENTS_PROMPT, SDLC_PROMPT } from './prompts';
import { ragContextProcessor } from './rag';
import { architectWorkspace } from './workspace';

const options = {
  modelSettings: { maxOutputTokens: 3500 },
  providerOptions: { lmStudio: { reasoningEffort: 'none', enable_thinking: false } },
} as const;

export const requirementsAgent = new Agent({
  id: 'healthcare-requirements-agent',
  name: 'Healthcare Requirements Agent',
  description: '(i) Identify and classify software requirements for a healthcare project in India.',
  instructions: REQUIREMENTS_PROMPT,
  model: chatModel,
  defaultOptions: options,
  workspace: architectWorkspace,
  inputProcessors: [ragContextProcessor],
});

export const sdlcSelectionAgent = new Agent({
  id: 'healthcare-sdlc-selection-agent',
  name: 'Healthcare SDLC Selection Agent',
  description: '(ii) Identify and justify a suitable lifecycle for a healthcare requirements specification.',
  instructions: SDLC_PROMPT,
  model: chatModel,
  defaultOptions: { ...options, modelSettings: { maxOutputTokens: 3000 } },
  workspace: architectWorkspace,
  inputProcessors: [ragContextProcessor],
});
