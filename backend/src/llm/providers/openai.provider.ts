import { Logger } from '@nestjs/common';
import OpenAI from 'openai';
import type { LlmProvider, ChatTurn } from './llm-provider.interface.js';

// gpt-4o-mini: cheap and fast — the OpenAI equivalent slot to Anthropic's Haiku
// for this workload (short grounded prose and chat replies).
const MODEL = 'gpt-4o-mini';

export class OpenAiProvider implements LlmProvider {
  private readonly logger = new Logger(OpenAiProvider.name);
  private readonly client: OpenAI | null;

  constructor(apiKey: string | undefined) {
    this.client = apiKey ? new OpenAI({ apiKey }) : null;
    if (!this.client) {
      this.logger.warn('OPENAI_API_KEY not set — OpenAI provider unavailable');
    }
  }

  async generate(params: { system: string; prompt: string; maxTokens?: number; json?: boolean }): Promise<string | null> {
    if (!this.client) return null;

    try {
      const response = await this.client.chat.completions.create({
        model:      MODEL,
        max_tokens: params.maxTokens ?? 400,
        ...(params.json ? { response_format: { type: 'json_object' as const } } : {}),
        messages: [
          { role: 'system', content: params.system },
          { role: 'user',   content: params.prompt },
        ],
      });

      return response.choices[0]?.message?.content?.trim() || null;
    } catch (err: any) {
      this.logger.error(`Generation failed: ${err.message}`);
      return null;
    }
  }

  async chat(params: { system: string; messages: ChatTurn[]; maxTokens?: number }): Promise<string | null> {
    if (!this.client) return null;

    try {
      const response = await this.client.chat.completions.create({
        model:      MODEL,
        max_tokens: params.maxTokens ?? 500,
        messages: [
          { role: 'system', content: params.system },
          ...params.messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      });

      return response.choices[0]?.message?.content?.trim() || null;
    } catch (err: any) {
      this.logger.error(`Chat failed: ${err.message}`);
      return null;
    }
  }
}
