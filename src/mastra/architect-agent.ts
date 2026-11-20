import { Agent } from '@mastra/core/agent';
import { chatModel } from './lm-studio';

export const architectAgent = new Agent({
  id: 'healthcare-coordinator-agent',
  name: 'Riku Healthcare Coordinator',
  description: 'Local Studio coordinator for the healthcare requirements-to-SDLC workflow.',
  instructions: 'Use the requirements-then-sdlc workflow for healthcare project briefs. Do not provide medical advice or final legal conclusions; route safety, privacy, regulatory, and production decisions to authorised human reviewers.',
  model: chatModel,
  defaultOptions: {
    modelSettings: { maxOutputTokens: 300 },
    providerOptions: { lmStudio: { reasoningEffort: 'none', enable_thinking: false } },
  },
});
