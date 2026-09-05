import { AIMessage, AIContext } from '../types/assistant';
import { API_BASE_URL, fetchWithTimeout } from './apiClient';

export interface StreamResult {
  content: string;
  sources: AIMessage['sources'];
}

export const sendToBhairav = async (message: string, context?: AIContext): Promise<AIMessage> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `MSG-${Math.floor(Math.random() * 10000)}`,
        role: 'assistant',
        content: `I've analyzed your request regarding "${message}". Based on current intelligence, there are 3 related events that require attention.`,
        timestamp: new Date().toISOString(),
        actions: [
          { label: 'View Network', action: 'NAVIGATE_NETWORK' },
          { label: 'View Timeline', action: 'NAVIGATE_TIMELINE' }
        ],
        references: [
          { id: 'BH-P-104', type: 'person', label: 'Unknown Subject Alpha' }
        ]
      });
    }, 1500);
  });
};

export const streamFromBhairav = async (
  messages: { role: string; content: string }[],
  context: AIContext | undefined,
  onChunk: (chunk: string) => void
): Promise<StreamResult> => {
  const response = await fetchWithTimeout(`${API_BASE_URL}/ai/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      context,
    }),
  }, 120000);

  if (!response.ok) {
    if (response.status === 500) {
      throw new Error('API Key configuration missing on server.');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server returned ${response.status}`);
  }

  if (!response.body) {
    throw new Error('ReadableStream not yet supported in this browser.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    fullText += chunk;
    onChunk(chunk);
  }

  const sources = parseSources(fullText);
  const cleanContent = sources.length > 0 ? fullText.split('\n\nSources:')[0] : fullText;

  return { content: cleanContent, sources };
};

function parseSources(text: string): AIMessage['sources'] {
  const marker = '\n\nSources:';
  const idx = text.lastIndexOf(marker);
  if (idx === -1) return [];

  const sourcesBlock = text.slice(idx + marker.length).trim();
  const lines = sourcesBlock.split('\n').filter((line) => line.trim());
  const sources: AIMessage['sources'] = [];

  for (const line of lines) {
    const match = line.match(/^\[(\d+)\]\s+(.*?)\s+-\s+(.*?)\n(.*?)$/);
    if (!match) continue;
    const url = match[4].trim();
    if (!url.startsWith('http')) continue;
    let domain = '';
    try {
      domain = new URL(url).hostname.replace(/^www\./, '');
    } catch {
      domain = url;
    }
    sources.push({
      title: match[3].trim() || match[2].trim() || url,
      url,
      domain,
      snippet: '',
    });
  }

  return sources;
}
