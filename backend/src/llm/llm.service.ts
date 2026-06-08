import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AnthropicProvider } from './providers/anthropic.provider.js';
import { OpenAiProvider } from './providers/openai.provider.js';
import { GeminiProvider } from './providers/gemini.provider.js';
import type { LlmProvider, ChatTurn } from './providers/llm-provider.interface.js';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly provider: LlmProvider;

  constructor(config: ConfigService) {
    const choice = (config.get<string>('LLM_PROVIDER') ?? 'anthropic').toLowerCase();

    switch (choice) {
      case 'openai':
        this.provider = new OpenAiProvider(config.get<string>('OPENAI_API_KEY'));
        break;
      case 'gemini':
        this.provider = new GeminiProvider(config.get<string>('GEMINI_API_KEY'));
        break;
      case 'anthropic':
        this.provider = new AnthropicProvider(config.get<string>('ANTHROPIC_API_KEY'));
        break;
      default:
        this.logger.warn(`Unknown LLM_PROVIDER "${choice}" — falling back to anthropic`);
        this.provider = new AnthropicProvider(config.get<string>('ANTHROPIC_API_KEY'));
    }

    this.logger.log(`LLM provider: ${choice}`);
  }

  generate(params: { system: string; prompt: string; maxTokens?: number; json?: boolean }): Promise<string | null> {
    return this.provider.generate(params);
  }

  chat(params: { system: string; messages: ChatTurn[]; maxTokens?: number }): Promise<string | null> {
    return this.provider.chat(params);
  }
}
