import { Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import type { LlmProvider, ChatTurn } from './llm-provider.interface.js';

const MODEL = 'gemini-2.5-flash';

export class GeminiProvider implements LlmProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly client: GoogleGenAI | null;

  constructor(apiKey: string | undefined) {
    this.client = apiKey ? new GoogleGenAI({ apiKey }) : null;
    if (!this.client) {
      this.logger.warn('GEMINI_API_KEY not set — Gemini provider unavailable');
    }
  }

  async generate(params: { system: string; prompt: string; maxTokens?: number; json?: boolean }): Promise<string | null> {
    if (!this.client) return null;
    try {
      const response = await this.client.models.generateContent({
        model:    MODEL,
        contents: params.prompt,
        config: {
          systemInstruction: params.system,
          maxOutputTokens:   params.maxTokens ?? 400,
          thinkingConfig:    { thinkingBudget: 0 },
          ...(params.json ? { responseMimeType: 'application/json' } : {}),
        },
      });
      return response.text?.trim() || null;
    } catch (err: any) {
      this.logger.error(`Generation failed: ${err.message}`);
      return null;
    }
  }

  async chat(params: { system: string; messages: ChatTurn[]; maxTokens?: number }): Promise<string | null> {
    if (!this.client) return null;
    try {
      const response = await this.client.models.generateContent({
        model: MODEL,
        contents: params.messages.map((m) => ({
          role:  m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        config: {
          systemInstruction: params.system,
          maxOutputTokens:   params.maxTokens ?? 500,
          thinkingConfig:    { thinkingBudget: 0 },
        },
      });
      return response.text?.trim() || null;
    } catch (err: any) {
      this.logger.error(`Chat failed: ${err.message}`);
      return null;
    }
  }
}
