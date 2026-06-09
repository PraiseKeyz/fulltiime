import { Injectable, Logger } from '@nestjs/common';
import Parser from 'rss-parser';

type FeedItem = Parser.Item & {
  'media:thumbnail'?: { $: { url: string } };
  'media:content'?:   { $: { url: string } };
};

export type ParsedFeedItem = {
  title:       string;
  link:        string;
  excerpt:     string | null;
  pubDate:     Date;
  thumbnail:   string | null;
  categories:  string[];
};

@Injectable()
export class RssService {
  private readonly logger = new Logger(RssService.name);

  private readonly parser = new Parser<Record<string, never>, FeedItem>({
    customFields: {
      item: [
        ['media:thumbnail', 'media:thumbnail'],
        ['media:content',   'media:content'],
      ],
    },
    timeout: 10_000,
  });

  async fetchFeed(url: string): Promise<ParsedFeedItem[]> {
    try {
      const feed = await this.parser.parseURL(url);

      return (feed.items ?? [])
        .filter(item => !!item.link && !!item.title)
        .map(item => ({
          title:      item.title!.trim(),
          link:       item.link!.trim(),
          excerpt:    item.contentSnippet?.trim() ?? null,
          pubDate:    item.pubDate ? new Date(item.pubDate) : new Date(),
          thumbnail:  this.extractThumbnail(item),
          categories: item.categories ?? [],
        }));
    } catch (err: any) {
      this.logger.error(`RSS fetch failed [${url}]: ${err.message}`);
      return [];
    }
  }

  private extractThumbnail(item: FeedItem): string | null {
    const raw =
      item['media:thumbnail']?.$?.url ??
      item['media:content']?.$?.url ??
      null;

    if (!raw) return null;

    // Upgrade BBC thumbnail to a higher resolution width
    return raw.replace(/\/\d{2,4}\/cpsprodpb/, '/1024/cpsprodpb');
  }
}
