import 'dotenv/config';
import { createReadStream, existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import '../mastra/index.js';
import { runRequirementsThenSdlc } from '../mastra/workflow.js';

const projectRoot = join(fileURLToPath(new URL('.', import.meta.url)), '../..');
const publicRoot = join(projectRoot, 'public');
const port = Number(process.env.MEDSPEC_PORT ?? process.env.PORT ?? 4173);
const host = process.env.MEDSPEC_HOST ?? '127.0.0.1';

const contentTypes: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };

const sendJson = (response: ServerResponse, status: number, body: unknown) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' });
  response.end(JSON.stringify(body));
};

const readBody = async (request: IncomingMessage) => {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
};

const serveStatic = async (requestPath: string, response: ServerResponse) => {
  const requested = requestPath === '/' ? '/index.html' : requestPath;
  const safePath = normalize(requested).replace(/^\.\.(?:[\\/]|$)/, '');
  const filePath = join(publicRoot, safePath);
  if (!filePath.startsWith(publicRoot) || !existsSync(filePath)) return false;
  const content = await readFile(filePath);
  response.writeHead(200, { 'Content-Type': contentTypes[extname(filePath)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' });
  response.end(content);
  return true;
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? `${host}:${port}`}`);
    if (request.method === 'OPTIONS') { response.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' }); response.end(); return; }
    if (url.pathname === '/api/health') { sendJson(response, 200, { ok: true, service: 'medspec-ai', workflow: 'requirements-then-sdlc' }); return; }
    if (url.pathname === '/api/analyze' && request.method === 'POST') {
      const body = JSON.parse(await readBody(request)) as { prompt?: unknown };
      const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
      if (prompt.length < 20) { sendJson(response, 400, { error: 'Please provide a healthcare project brief of at least 20 characters.' }); return; }
      const result = await runRequirementsThenSdlc(prompt);
      sendJson(response, 200, result);
      return;
    }
    if (request.method === 'GET' && await serveStatic(url.pathname, response)) return;
    sendJson(response, 404, { error: 'Not found' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    console.error(`[MedSpec AI] ${message}`);
    sendJson(response, 500, { error: message });
  }
});

server.listen(port, host, () => {
  console.log(`MedSpec AI custom app: http://${host}:${port}`);
  console.log('Mastra workflow backend: requirements-then-sdlc');
  console.log('Press Ctrl+C to stop.');
});
