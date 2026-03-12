const API_BASE = '/api';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export interface ExtractedQuestion {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  source?: string;
  sourceUrl?: string;
  sourceTitle?: string;
}

export interface ApiHealth {
  status: string;
  serperConfigured: boolean;
  geminiConfigured: boolean;
}

export async function checkApiHealth(): Promise<ApiHealth> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Server not reachable');
  return res.json();
}

export async function searchWeb(
  query: string,
  subject?: string,
  numResults = 10
): Promise<SearchResult[]> {
  const res = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, subject, numResults }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Search failed');
  }
  const data = await res.json();
  return data.results;
}

export async function extractQuestions(
  url: string,
  topic: string
): Promise<ExtractedQuestion[]> {
  const res = await fetch(`${API_BASE}/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, topic }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Extraction failed');
  }
  const data = await res.json();
  return data.questions;
}

export async function searchAndExtract(
  query: string,
  subject?: string,
  maxSources = 3
): Promise<{
  questions: ExtractedQuestion[];
  sources: SearchResult[];
  searchResults: SearchResult[];
  errors?: string[];
}> {
  const res = await fetch(`${API_BASE}/search-and-extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, subject, maxSources }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Search and extraction failed');
  }
  return res.json();
}
