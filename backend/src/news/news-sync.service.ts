import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@/prisma/prisma.service.js';
import { RssService } from './rss.service.js';
import { ScraperService } from './scraper.service.js';
import { ArticleStatus, Section } from '../../generated/prisma/index.js';

const BBC_FEED_URL    = 'https://feeds.bbci.co.uk/sport/football/rss.xml';
const BBC_AUTHOR_EMAIL = 'bbc-sport@system.internal';
const MAX_PER_RUN     = 10;   // cap new articles per cron run to avoid rate-limiting
const SCRAPE_DELAY_MS = 2000; // pause between article scrapes

// BBC's RSS feed has no per-item <category> tags, so transfer news is
// detected from the headline itself.
const TRANSFER_PATTERNS = [
  /\btransfer(s|red)?\b/i,
  /\bsigns?\b/i,
  /\bsigning\b/i,
  /\bjoins?\b/i,
  /\bloan\b/i,
  /\bmoves? to\b/i,
  /\bagrees? (a |to )?(deal|move|terms)\b/i,
  /\bin talks\b/i,
  /\blinked with\b/i,
  /\b(undergoes|completes) (a |his |her )?medical\b/i,
];

@Injectable()
export class NewsSyncService implements OnModuleInit {
  private readonly logger = new Logger(NewsSyncService.name);
  private bbcAuthorId: string | null = null;

  constructor(
    private readonly prisma:   PrismaService,
    private readonly rss:      RssService,
    private readonly scraper:  ScraperService,
  ) {}

  async onModuleInit() {
    this.bbcAuthorId = await this.ensureBbcAuthor();
  }

  // ── Cron ─────────────────────────────────────────────────────────────────────

  @Cron('*/15 * * * *') // every 15 minutes — matches BBC feed TTL
  async syncNews() {
    if (!this.bbcAuthorId) {
      this.bbcAuthorId = await this.ensureBbcAuthor();
    }

    this.logger.log('Starting BBC news sync...');

    const items = await this.rss.fetchFeed(BBC_FEED_URL);
    if (!items.length) {
      this.logger.warn('RSS feed returned no items');
      return;
    }

    let synced = 0;

    for (const item of items) {
      if (synced >= MAX_PER_RUN) break;

      // Normalise the source URL — strip tracking query params so dedup is stable
      const cleanUrl = this.cleanUrl(item.link);

      // Skip video and iPlayer URLs — they have no article text
      if (/\/videos\/|\/iplayer\/|\/watch\?/i.test(item.link)) {
        this.logger.log(`Skipping non-article: ${item.link}`);
        continue;
      }

      // Skip if already stored (idempotent — source_url is unique)
      const exists = await this.prisma.article.findUnique({
        where:  { source_url: cleanUrl },
        select: { id: true },
      });
      if (exists) continue;

      const scraped = await this.scraper.scrapeArticle(item.link);
      if (!scraped) {
        this.logger.warn(`Skipping (no content): ${item.link}`);
        continue;
      }

      try {
        const slug = this.buildSlug(item.title, item.link);

        await this.prisma.article.create({
          data: {
            title:        item.title,
            slug,
            excerpt:      item.excerpt,
            content:      scraped.content,
            cover_url:    item.thumbnail ?? scraped.coverUrl,
            section:      this.detectSection(item.title),
            status:       ArticleStatus.PUBLISHED,
            published_at: item.pubDate,
            author_id:    this.bbcAuthorId!,
            tags:         item.categories,
            source_url:   cleanUrl,
          },
        });

        this.logger.log(`Synced: ${item.title}`);
        synced++;

        if (synced < MAX_PER_RUN) {
          await this.delay(SCRAPE_DELAY_MS);
        }
      } catch (err: any) {
        // Slug collision or other DB error — log and move on
        this.logger.error(`Failed to save article [${item.link}]: ${err.message}`);
      }
    }

    this.logger.log(`News sync complete — ${synced} new article(s) added`);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  private async ensureBbcAuthor(): Promise<string> {
    try {
      const existing = await this.prisma.user.findUnique({
        where:  { email: BBC_AUTHOR_EMAIL },
        select: { id: true },
      });
      if (existing) return existing.id;

      const created = await this.prisma.user.create({
        data: {
          email:         BBC_AUTHOR_EMAIL,
          username:      'bbc_sport',
          full_name:     'BBC Sport',
          password_hash: '__system_no_login__',
          is_verified:   true,
        },
        select: { id: true },
      });

      this.logger.log('Created BBC Sport system author');
      return created.id;
    } catch (err: any) {
      this.logger.error(`Failed to ensure BBC author: ${err.message}`);
      throw err;
    }
  }

  // Slug derived from BBC article URL's last path segment + title base —
  // guaranteed unique across reruns because source_url is the real dedup key.
  private buildSlug(title: string, url: string): string {
    const pathname = new URL(url).pathname;
    const urlId    = pathname.split('/').filter(Boolean).pop() ?? Date.now().toString(36);
    const base     = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 60);
    return `${base}-${urlId}`;
  }

  // Strip tracking query params so the stored URL is stable across RSS refreshes
  private cleanUrl(url: string): string {
    try {
      const u = new URL(url);
      return `${u.origin}${u.pathname}`;
    } catch {
      return url;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private detectSection(title: string): Section {
    return TRANSFER_PATTERNS.some(re => re.test(title)) ? 'TRANSFERS' : 'NEWS';
  }
}
