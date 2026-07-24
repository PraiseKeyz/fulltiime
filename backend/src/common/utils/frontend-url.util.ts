import { ConfigService } from '@nestjs/config';

/**
 * Base URL for links in emails. FRONTEND_URL may be a comma-separated list
 * (shared with CORS) — use the first entry.
 */
export function getFrontendUrl(config: ConfigService): string {
  const raw = config.get<string>('FRONTEND_URL') ?? '';
  const first = raw.split(',').map((s) => s.trim()).find(Boolean);
  return (first ?? 'http://localhost:3000').replace(/\/$/, '');
}
