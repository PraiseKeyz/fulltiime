// ─── LLM provider contract ───────────────────────────────────────────────────
//
// Every provider (Anthropic, OpenAI, ...) implements this shape. LlmService
// picks one based on the LLM_PROVIDER env var and delegates to it — callers
// (MatchTextService, MatchChatService) never know which vendor is behind it.

export interface ChatTurn {
  role:    'user' | 'assistant';
  content: string;
}

export interface LlmProvider {
  /**
   * One-shot grounded generation: system rules + facts, single user prompt.
   * `json: true` asks the provider to use its native JSON-output mode where
   * available (OpenAI); providers without one (Anthropic) rely on the prompt's
   * own instructions and the caller's parsing/validation to stay safe.
   */
  generate(params: { system: string; prompt: string; maxTokens?: number; json?: boolean }): Promise<string | null>;

  /** Multi-turn chat: system rules + facts, running conversation. */
  chat(params: { system: string; messages: ChatTurn[]; maxTokens?: number }): Promise<string | null>;
}
