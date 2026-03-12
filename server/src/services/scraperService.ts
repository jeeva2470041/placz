import axios from 'axios';
import * as cheerio from 'cheerio';
import { getCached, setCache } from '../utils/cache.js';

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CONTENT_LENGTH = 8000;

export async function scrapeUrl(url: string): Promise<string> {
  const cacheKey = `scrape:${url}`;
  const cached = getCached<string>(cacheKey);
  if (cached) return cached;

  const response = await axios.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
    timeout: 15000,
    maxRedirects: 3,
  });

  const $ = cheerio.load(response.data);

  // Remove non-content elements
  $(
    'script, style, nav, footer, header, iframe, noscript, .sidebar, .advertisement, .ad, .social-share, .comments, .related-articles, .nav, .menu, .cookie-banner, [role="navigation"], [role="banner"]'
  ).remove();

  // Try site-specific selectors first (known interview prep sites)
  let content = trySelectors($, [
    // GeeksforGeeks
    '.entry-content',
    'article .text',
    '.article--viewer_content',
    // InterviewBit
    '.content-area',
    '.interview-question-answer',
    // Medium
    'article section',
    // JavaTpoint
    '.onlycontentinner',
    // General article selectors
    'article',
    '.post-content',
    '.article-content',
    '.entry-body',
    '[role="main"] article',
    'main article',
    'main',
    '#main-content',
    '.content',
  ]);

  if (!content) {
    content = extractStructuredText($, $('body').first());
  }

  content = normalizeStructuredText(content);

  // Limit content length
  const result = content.substring(0, MAX_CONTENT_LENGTH);
  setCache(cacheKey, result, CACHE_TTL);
  return result;
}

function trySelectors($: cheerio.CheerioAPI, selectors: string[]): string {
  for (const selector of selectors) {
    const el = $(selector);
    if (el.length) {
      const text = extractStructuredText($, el.first());
      if (text.length > 200) {
        return text;
      }
    }
  }
  return '';
}

function extractStructuredText(
  $: cheerio.CheerioAPI,
  root: cheerio.Cheerio<any>
): string {
  const blocks: string[] = [];

  root.find('h1, h2, h3, h4, h5, h6, p, li').each((_, element) => {
    const line = $(element)
      .text()
      .replace(/\s+/g, ' ')
      .trim();

    if (line.length >= 25) {
      blocks.push(line);
    }
  });

  if (blocks.length > 0) {
    return blocks.join('\n');
  }

  return root.text();
}

function normalizeStructuredText(content: string): string {
  return content
    .replace(/\r/g, '')
    .replace(/\t/g, ' ')
    .replace(/ +/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
