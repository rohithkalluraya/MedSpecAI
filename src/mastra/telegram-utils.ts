export const cleanAgentText = (text: string) => {
  let out = text.replace(/<think\b[^>]*>[\s\S]*?<\/think>/gi, '');
  const unclosed = out.match(/<think\b[^>]*>([\s\S]*)$/i);
  if (unclosed) out = unclosed[1] ?? '';
  out = out.replace(/<\/??think\b[^>]*>/gi, '');
  return out.replace(/\n{3,}/g, '\n\n').trim();
};

const textFromUnknown = (value: unknown, depth = 0): string => {
  if (depth > 5 || value == null) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map((item) => textFromUnknown(item, depth + 1)).filter(Boolean).join('\n');
  if (typeof value !== 'object') return '';
  const record = value as Record<string, unknown>;
  for (const key of ['text', 'content', 'value', 'output', 'message', 'parts', 'reasoningText', 'reasoning']) {
    const text = textFromUnknown(record[key], depth + 1);
    if (text) return text;
  }
  return '';
};

export const textFromGenerateResult = (result: unknown) => cleanAgentText(textFromUnknown(result));

export const describeGenerationFailure = (result: unknown) => {
  if (!result || typeof result !== 'object') return 'LM Studio returned no generation result.';
  const keys = Object.keys(result as Record<string, unknown>);
  return `LM Studio returned no readable text. Result fields: ${keys.length ? keys.join(', ') : 'none'}. Confirm that LM Studio is running, the model is loaded, and the model identifier in .env exactly matches /v1/models.`;
};
