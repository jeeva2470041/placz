import axios from 'axios';
import { getCached, setCache } from '../utils/cache.js';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function searchWeb(query: string, numResults = 10): Promise<SearchResult[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey || apiKey === 'your_serper_api_key_here') {
    throw new Error('SERPER_API_KEY not configured. Get one free at https://serper.dev');
  }

  const cacheKey = `search:${query}:${numResults}`;
  const cached = getCached<SearchResult[]>(cacheKey);
  if (cached) return cached;

  const response = await axios.post(
    'https://google.serper.dev/search',
    { q: query, num: numResults },
    {
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
    }
  );

  const organic = response.data.organic || [];
  const results: SearchResult[] = organic.map((result: Record<string, string>) => ({
    title: result.title || '',
    url: result.link || '',
    snippet: result.snippet || '',
    source: extractDomain(result.link || ''),
  }));

  setCache(cacheKey, results, CACHE_TTL);
  return results;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}
