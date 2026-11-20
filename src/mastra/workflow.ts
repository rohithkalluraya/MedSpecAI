import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { requirementsAgent, sdlcSelectionAgent } from './healthcare-agents';
import { describeGenerationFailure, textFromGenerateResult } from './telegram-utils';
import { workspaceRoot } from './workspace';

const previewDir = join(workspaceRoot, 'artifacts/evaluation');

const listRequirements = createStep({
  id: 'list-healthcare-requirements',
  description: 'Healthcare Requirements Agent structures the brief into traceable requirements.',
  inputSchema: z.object({ prompt: z.string() }),
  outputSchema: z.object({ requirements: z.string() }),
  execute: async ({ inputData }) => {
    const result = await requirementsAgent.generate(inputData.prompt);
    const requirements = textFromGenerateResult(result);
    if (!requirements) throw new Error(`Healthcare Requirements Agent returned no text. ${describeGenerationFailure(result)}`);
    return { requirements };
  },
});

const selectSdlc = createStep({
  id: 'select-healthcare-sdlc',
  description: 'Healthcare SDLC Selection Agent chooses and justifies a lifecycle for the SRS.',
  inputSchema: z.object({ requirements: z.string() }),
  outputSchema: z.object({ requirements: z.string(), sdlc: z.string(), document: z.string() }),
  execute: async ({ inputData }) => {
    const result = await sdlcSelectionAgent.generate(`Select a suitable SDLC for this healthcare specification.\n\n${inputData.requirements}`);
    const sdlc = textFromGenerateResult(result);
    if (!sdlc) throw new Error(`Healthcare SDLC Selection Agent returned no text. ${describeGenerationFailure(result)}`);
    return { requirements: inputData.requirements, sdlc, document: `${inputData.requirements.trim()}\n\n---\n\n${sdlc.trim()}` };
  },
});

const htmlPreview = (markdown: string) => `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>MedSpec AI Healthcare Requirements and SDLC</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.8.1/github-markdown.min.css"/>
<style>body{box-sizing:border-box;min-width:200px;max-width:980px;margin:0 auto;padding:45px;background:#f3faf8}.markdown-body{background:#fff;border-top:5px solid #168a78;padding:32px;border-radius:12px;box-shadow:0 8px 28px #125c4d18}.markdown-body h1{color:#126b5e}.markdown-body h2{border-bottom-color:#cbe9e2}</style></head>
<body class="markdown-body"><div id="content"></div><script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script><script>document.getElementById('content').innerHTML=marked.parse(${JSON.stringify(markdown)});</script></body></html>`;

const writePreview = createStep({
  id: 'write-healthcare-preview',
  description: 'Write Markdown and lightly styled HTML healthcare previews under artifacts/evaluation.',
  inputSchema: z.object({ requirements: z.string(), sdlc: z.string(), document: z.string() }),
  outputSchema: z.object({ requirements: z.string(), sdlc: z.string(), document: z.string(), markdownPath: z.string(), htmlPath: z.string() }),
  execute: async ({ inputData }) => {
    await mkdir(previewDir, { recursive: true });
    const markdownPath = join(previewDir, 'latest.md');
    const htmlPath = join(previewDir, 'latest.html');
    await writeFile(markdownPath, `${inputData.document.trim()}\n`, 'utf8');
    await writeFile(htmlPath, htmlPreview(inputData.document), 'utf8');
    return { ...inputData, markdownPath, htmlPath };
  },
});

export const requirementsThenSdlc = createWorkflow({
  id: 'requirements-then-sdlc',
  description: 'Healthcare workflow: structure a brief, select a justified SDLC, and write traceable Markdown and HTML previews.',
  inputSchema: z.object({ prompt: z.string() }),
  outputSchema: z.object({ requirements: z.string(), sdlc: z.string(), document: z.string(), markdownPath: z.string(), htmlPath: z.string() }),
}).then(listRequirements).then(selectSdlc).then(writePreview).commit();

export const runRequirementsThenSdlc = async (prompt: string) => {
  const run = await requirementsThenSdlc.createRun();
  const result = await run.start({ inputData: { prompt } });
  if (result.status !== 'success') throw new Error(`Workflow failed: ${result.status === 'failed' ? result.error.message : result.status}`);
  return result.result;
};
