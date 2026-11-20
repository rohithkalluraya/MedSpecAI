import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { createTelegramAdapter } from '@chat-adapter/telegram';
import type { ChannelHandler, ChannelHandlers } from '@mastra/core/channels';
import { config } from './config';
import { renderFinancePdf } from './pdf-tool';
import { isSessionCommand, requestsPdf } from './telegram-utils';
import { runRequirementsThenSdlc } from './workflow';

const pdfThreads = new Set<string>();

const skipLlm = async (thread: { id: string; post: (msg: { markdown: string }) => Promise<unknown> }) => {
  pdfThreads.delete(thread.id);
  await thread.post({ markdown: 'Send the brief. Requirements Agent then SDLC Selection Agent will run in sequence.' });
};

const financeTelegramHandler: ChannelHandler = async (thread, message) => {
  const text = message.text.trim();
  const command = text.split(/\s+/, 1)[0]?.toLowerCase() ?? '';

  if (isSessionCommand(text) && command !== '/compact') {
    await skipLlm(thread);
    return;
  }
  if (command === '/compact') {
    await thread.post({ markdown: 'No session to compact. Send the brief.' });
    return;
  }

  try {
    if (requestsPdf(text)) pdfThreads.add(thread.id);
    await thread.post({ markdown: 'Running Requirements Agent, then SDLC Selection Agent…' });
    const { document } = await runRequirementsThenSdlc(text);
    if (!document.trim()) {
      await thread.post({ markdown: 'The workflow returned no document text. Check LM Studio and send the brief again.' });
      return;
    }

    if (pdfThreads.has(thread.id)) {
      const pdfPath = await renderFinancePdf('Finance Requirements and SDLC', document);
      pdfThreads.delete(thread.id);
      await thread.post({
        markdown: 'Finance requirements document generated.',
        files: [{
          data: await readFile(pdfPath),
          filename: basename(pdfPath),
          mimeType: 'application/pdf',
        }],
      });
      return;
    }

    await thread.post({ markdown: document });
  } catch (error) {
    console.error('[telegram-finance] request failed', error);
    await thread.post({ markdown: 'Request failed. Check the server log and try again.' });
  }
};

const slashHandler: NonNullable<ChannelHandlers['onSlashCommand']> = async (event, defaultHandler) => {
  const command = event.command?.toLowerCase() ?? '';
  if (command === '/start' || command === '/new' || command === '/help') return;
  if (command === '/compact') return;
  await defaultHandler();
};

export const telegramChannels = config.telegram.botToken
  ? {
      adapters: {
        telegram: {
          adapter: createTelegramAdapter({
            botToken: config.telegram.botToken,
            userName: config.telegram.botUsername,
            mode: config.telegram.mode,
            longPolling: {
              deleteWebhook: false,
              retryDelayMs: 5000,
            },
          }),
          streaming: false,
          toolDisplay: 'text' as const,
        },
      },
      handlers: {
        onDirectMessage: financeTelegramHandler,
        onMention: false as const,
        onSubscribedMessage: false as const,
        onSlashCommand: slashHandler,
      },
      resolveResourceId: ({ message }: { message: typeof import('chat').Message.prototype }) =>
        `telegram:${message.author.userId}`,
      resolveThreadId: ({ thread }: { thread: import('chat').Thread }) =>
        `telegram:${thread.id}`,
    }
  : undefined;
