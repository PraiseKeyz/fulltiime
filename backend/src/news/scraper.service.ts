import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { load, type CheerioAPI } from 'cheerio';

export type ScrapedArticle = {
  content:  string;
  coverUrl: string | null;
};

const BBC_CONTENT_COMPONENTS = [
  '[data-component="text-block"]',
  '[data-component="subheadline-block"]',
  '[data-component="crosshead-block"]',
  '[data-component="unordered-list-block"]',
  '[data-component="ordered-list-block"]',
];

// Blocks that are never article prose — remove before extraction
const BBC_NOISE_COMPONENTS = [
  '[data-component="ad-slot"]',
  '[data-component="include-block"]',
  '[data-component="social-media-block"]',
  '[data-component="video-block"]',
  '[data-component="timestamp-block"]',
  '[data-component="byline-block"]',
  '[data-component="contributor-block"]',
  '[data-component="media-block"]',
  '[data-component="tag-list"]',
  '[data-component="related-internet-links"]',
];

// Paragraphs matching these patterns are metadata, not article prose
const METADATA_PATTERNS = [
  /^published\s*\d/i,
  /^\d+\s+(minutes?|hours?|days?)\s+ago/i,
  /^by\s+[A-Z][a-z]+\s+[A-Z]/,   // "By Jane Smith" bylines
  /^share\s+(this|page)/i,
  /^bbc\s+(sport|news)/i,
  /^watch\s*:/i,
  /^listen\s*:/i,
  /^read\s+more\s*:/i,
];

const MIN_PARAGRAPH_LENGTH = 60; // characters — below this is almost always a caption or label

const SCRAPE_HEADERS = {
  'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  'Accept-Language': 'en-GB,en;q=0.9',
  'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  async scrapeArticle(url: string): Promise<ScrapedArticle | null> {
    let html: string;

    try {
      const { data } = await axios.get<string>(url, {
        headers:      SCRAPE_HEADERS,
        timeout:      12_000,
        responseType: 'text',
      });
      html = data;
    } catch (err: any) {
      this.logger.error(`HTTP fetch failed [${url}]: ${err.message}`);
      return null;
    }

    try {
      const $ = load(html);

      // Extract cover image BEFORE cleaning — image blocks are removed afterward
      const coverUrl = this.extractCoverImage($);

      this.cleanDom($);

      const raw     = this.extractContent($);
      const content = raw ? this.sanitize(raw) : '';

      if (!content) {
        this.logger.warn(`No content extracted from [${url}]`);
        return null;
      }

      return { content, coverUrl };
    } catch (err: any) {
      this.logger.error(`Parse failed [${url}]: ${err.message}`);
      return null;
    }
  }

  // ── DOM cleanup ───────────────────────────────────────────────────────────────

  private cleanDom($: CheerioAPI): void {
    $('script, style, noscript, iframe, nav, header, footer, aside').remove();
    $(BBC_NOISE_COMPONENTS.join(',')).remove();
    // Remove image blocks AFTER cover image is extracted — captions won't leak in
    $('[data-component="image-block"]').remove();
  }

  // ── Content extraction ────────────────────────────────────────────────────────

  private extractContent($: CheerioAPI): string {
    const structured = this.extractStructured($);
    if (structured) return structured;
    return this.extractFallback($);
  }

  private extractStructured($: CheerioAPI): string {
    const parts: string[] = [];
    $(BBC_CONTENT_COMPONENTS.join(',')).each((_, el) => {
      const inner = $(el).html()?.trim();
      if (inner) parts.push(inner);
    });
    return parts.length >= 3 ? parts.join('\n') : '';
  }

  private extractFallback($: CheerioAPI): string {
    // Walk candidate containers and collect only qualifying <p> tags surgically
    for (const selector of ['article', '[class*="article-body"]', '[class*="story-body"]', 'main']) {
      const el = $(selector).first();
      if (!el.length) continue;

      const parts: string[] = [];
      el.find('p').each((_, p) => {
        const text = $(p).text().trim();
        if (this.isQualifyingText(text)) {
          parts.push($(p).html()?.trim() ?? '');
        }
      });

      if (parts.length >= 3) return parts.map(p => `<p>${p}</p>`).join('\n');
    }
    return '';
  }

  // ── Sanitizer ─────────────────────────────────────────────────────────────────

  private sanitize(rawHtml: string): string {
    const $ = load(`<body>${rawHtml}</body>`);
    const out: string[] = [];

    $('body').find('p, h2, h3, h4, ul, ol').each((_, el) => {
      const $el = $(el);

      if ((el.name === 'ul' || el.name === 'ol') && $el.parents('ul, ol').length) return;
      if (el.name === 'p' && $el.parents('li').length) return;

      if (el.name === 'ul' || el.name === 'ol') {
        const items = $el.find('li').map((_, li) => {
          const text = $(li).text().trim();
          return text ? `<li>${text}</li>` : null;
        }).get().filter(Boolean);
        if (items.length) out.push(`<${el.name}>${items.join('')}</${el.name}>`);

      } else if (el.name === 'h2' || el.name === 'h3' || el.name === 'h4') {
        const text = $el.text().trim();
        if (text.length > 3) out.push(`<${el.name}>${text}</${el.name}>`);

      } else {
        // Paragraph — apply full quality gate
        const text = $el.text().trim();
        if (!this.isQualifyingText(text)) return;

        this.stripAttribs($, $el);
        $el.find('div, span').each((_, wrapper) => {
          $(wrapper).replaceWith($(wrapper).contents());
        });

        const html = $el.html()?.trim() ?? '';
        if (html) out.push(`<p>${html}</p>`);
      }
    });

    return out.join('\n');
  }

  // A paragraph qualifies as real article prose if it:
  // - meets the minimum length
  // - doesn't match any known metadata pattern
  private isQualifyingText(text: string): boolean {
    if (text.length < MIN_PARAGRAPH_LENGTH) return false;
    if (METADATA_PATTERNS.some(re => re.test(text))) return false;
    return true;
  }

  // Strip every attribute except href (on <a>) and src/alt (on <img>)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private stripAttribs(_$: CheerioAPI, $el: any): void {
    $el.find('*').addBack().each((__: unknown, node: any) => {
      if (node.type !== 'tag') return;
      const keep = node.name === 'a'   ? ['href']       :
                   node.name === 'img' ? ['src', 'alt'] : [];
      for (const attr of Object.keys(node.attribs)) {
        if (!keep.includes(attr)) delete node.attribs[attr];
      }
    });
  }

  // ── Cover image extraction ────────────────────────────────────────────────────

  private extractCoverImage($: CheerioAPI): string | null {
    const bbcImgEl  = $('[data-component="image-block"] img').first();
    const bbcSrcset = bbcImgEl.attr('srcset');
    if (bbcSrcset) {
      const best = this.bestSrcset(bbcSrcset);
      if (best && !this.isBbcBrand(best)) return best;
    }
    const bbcSrc = bbcImgEl.attr('src');
    if (bbcSrc && !this.isBbcBrand(bbcSrc)) return bbcSrc;

    const og = $('meta[property="og:image"]').attr('content');
    if (og && !this.isBbcBrand(og)) return og;

    const figureImg = $('article figure img, main figure img').first().attr('src');
    if (figureImg && !this.isBbcBrand(figureImg)) return figureImg;

    return null;
  }

  private bestSrcset(srcset: string): string | null {
    let best: { url: string; w: number } | null = null;
    for (const part of srcset.split(',')) {
      const [url, descriptor] = part.trim().split(/\s+/);
      const w = descriptor ? parseInt(descriptor) : 0;
      if (!best || w > best.w) best = { url, w };
    }
    return best?.url ?? null;
  }

  private isBbcBrand(url: string): boolean {
    return /bbc[_-]?(news|sport)[_-]?logo|bbc-blocks|\/static\/images\/bbc|newsspec/i.test(url);
  }
}
