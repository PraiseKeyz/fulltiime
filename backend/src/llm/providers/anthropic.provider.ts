import { Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import type { LlmProvider, ChatTurn } from './llm-provider.interface.js';

// Haiku: cheap and fast, plenty for short grounded prose and chat replies —
// this is high-volume, low-complexity text generation, not deep reasoning.
const MODEL = 'claude-haiku-4-5-20251001';

export class AnthropicProvider implements LlmProvider {
  private readonly logger = new Logger(AnthropicProvider.name);
  private readonly client: Anthropic | null;

  constructor(apiKey: string | undefined) {
    this.client = apiKey ? new Anthropic({ apiKey }) : null;
    if (!this.client) {
      this.logger.warn('ANTHROPIC_API_KEY not set — Anthropic provider unavailable');
    }
  }

  // No native JSON-output mode on the Messages API — `json` is honored purely
  // through the prompt's own instructions; the caller validates the result.
  async generate(params: { system: string; prompt: string; maxTokens?: number; json?: boolean }): Promise<string | null> {
    if (!this.client) return null;

    try {
      const response = await this.client.messages.create({
        model:      MODEL,
        max_tokens: params.maxTokens ?? 400,
        system:     params.system,
        messages:   [{ role: 'user', content: params.prompt }],
      });

      const block = response.content.find((b) => b.type === 'text');
      return block && block.type === 'text' ? block.text.trim() : null;
    } catch (err: any) {
      this.logger.error(`Generation failed: ${err.message}`);
      return null;
    }
  }

  async chat(params: { system: string; messages: ChatTurn[]; maxTokens?: number }): Promise<string | null> {
    if (!this.client) return null;

    try {
      const response = await this.client.messages.create({
        model:      MODEL,
        max_tokens: params.maxTokens ?? 500,
        system:     params.system,
        messages:   params.messages,
      });

      const block = response.content.find((b) => b.type === 'text');
      return block && block.type === 'text' ? block.text.trim() : null;
    } catch (err: any) {
      this.logger.error(`Chat failed: ${err.message}`);
      return null;
    }
  }
}
