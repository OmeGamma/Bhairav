import { AIMessage, AIContext } from '../types/assistant';

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
