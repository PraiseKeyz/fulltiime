import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { load, type CheerioAPI, type Cheerio, type Element } from 'cheerio';

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
      this.cleanDom($);

      const raw      = this.extractContent($);
      const content  = raw ? this.sanitize(raw) : '';
      const coverUrl = this.extractCoverImage($);

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

  // ── Remove noise ─────────────────────────────────────────────────────────────

  private cleanDom($: CheerioAPI): void {
    $('script, style, noscript, iframe, nav, header, footer, aside, [data-component="ad-slot"]').remove();
    $('[data-component="include-block"]').remove();
    $('[data-component="social-media-block"]').remove();
    $('[data-component="video-block"]').remove();
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
    for (const selector of ['article', '[class*="article-body"]', '[class*="story-body"]', 'main']) {
      const el = $(selector).first();
      if (!el.length) continue;
      const html = el.html()?.trim() ?? '';
      if (html) return html;
    }
    return '';
  }

  // ── Sanitizer — strips BBC wrapper divs and class/id noise ───────────────────
  // Takes the raw BBC HTML and outputs clean semantic HTML ready to render.

  private sanitize(rawHtml: string): string {
    const $ = load(`<body>${rawHtml}</body>`);
    const out: string[] = [];

    $('body').find('p, h2, h3, h4, ul, ol').each((_, el) => {
      const $el = $(el);

      // Avoid double-processing: skip items already inside a list we'll handle
      if ((el.name === 'ul' || el.name === 'ol') && $el.parents('ul, ol').length) return;
      if (el.name === 'p' && $el.parents('li').length) return;

      if (el.name === 'ul' || el.name === 'ol') {
        const items = $el.find('li').map((_, li) => {
          return `<li>${$(li).text().trim()}</li>`;
        }).get();
        if (items.length) out.push(`<${el.name}>${items.join('')}</${el.name}>`);
      } else {
        // Strip all attributes, unwrap meaningless wrappers, keep inline formatting
        this.stripAttribs($, $el);
        $el.find('div, span').each((_, wrapper) => {
          $(wrapper).replaceWith($(wrapper).contents());
        });
        const html = $el.html()?.trim() ?? '';
        if (html && $el.text().trim().length > 5) {
          out.push(`<${el.name}>${html}</${el.name}>`);
        }
      }
    });

    return out.join('\n');
  }

  // Strip every attribute except href (on <a>) and src/alt (on <img>)
  private stripAttribs($: CheerioAPI, $el: Cheerio<Element>): void {
    $el.find('*').addBack().each((_, node) => {
      if (node.type !== 'tag') return;
      const keep = node.name === 'a'   ? ['href']           :
                   node.name === 'img' ? ['src', 'alt']     : [];
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
