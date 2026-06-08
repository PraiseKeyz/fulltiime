import { Module } from '@nestjs/common';
import { LlmService } from './llm.service.js';
import { MatchTextService } from './match-text.service.js';
import { MatchChatService } from './match-chat.service.js';

@Module({
  providers: [LlmService, MatchTextService, MatchChatService],
  exports:   [LlmService, MatchTextService, MatchChatService],
})
export class LlmModule {}
