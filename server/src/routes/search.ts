import { Router, Request, Response } from 'express';
import { searchWeb } from '../services/searchService.js';
import { scrapeUrl } from '../services/scraperService.js';
import { extractQuestionsFromContent } from '../services/geminiService.js';

export const searchRouter = Router();

// Search the web for interview resources
searchRouter.post('/search', async (req: Request, res: Response) => {
  try {
    const { query, subject, numResults = 10 } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    const searchQuery =
      subject && subject !== 'all'
        ? `${query} ${subject} interview questions`
        : `${query} interview questions`;

    const results = await searchWeb(searchQuery, numResults);
    res.json({ results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Search failed';
    console.error('Search error:', message);
    res.status(500).json({ error: message });
  }
});

// Extract Q&A from a specific URL using AI
searchRouter.post('/extract', async (req: Request, res: Response) => {
  try {
    const { url, topic } = req.body;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'URL is required' });
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      res.status(400).json({ error: 'Invalid URL format' });
      return;
    }

    console.log(`Scraping: ${url}`);
    const content = await scrapeUrl(url);

    console.log(`Extracting Q&A from ${content.length} chars of content...`);
    const questions = await extractQuestionsFromContent(
      content,
      topic || 'General',
      url
    );

    res.json({
      questions,
      contentPreview: content.substring(0, 300) + '...',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Extraction failed';
    console.error('Extract error:', message);
    res.status(500).json({ error: message });
  }
});

// Combined: search Google + scrape top results + extract Q&A in one call
searchRouter.post('/search-and-extract', async (req: Request, res: Response) => {
  try {
    const { query, subject, maxSources = 3 } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    const searchQuery =
      subject && subject !== 'all'
        ? `${query} ${subject} interview questions`
        : `${query} interview questions`;

    console.log(`Searching: "${searchQuery}"`);
    const results = await searchWeb(searchQuery, maxSources + 2);

    const allQuestions: Array<{
      question: string;
      answer: string;
      difficulty: 'easy' | 'medium' | 'hard';
      subject: string;
      source: string;
      sourceUrl: string;
      sourceTitle: string;
    }> = [];
    const processedSources: typeof results = [];
    const errors: string[] = [];

    // Process sources sequentially to avoid rate limits
    for (const result of results.slice(0, maxSources)) {
      try {
        console.log(`Scraping: ${result.url}`);
        const content = await scrapeUrl(result.url);

        console.log(`Extracting Q&A from ${result.source}...`);
        const questions = await extractQuestionsFromContent(
          content,
          subject && subject !== 'all' ? subject : query,
          result.url
        );

        allQuestions.push(
          ...questions.map((q) => ({
            ...q,
            source: result.source,
            sourceUrl: result.url,
            sourceTitle: result.title,
          }))
        );
        processedSources.push(result);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.warn(`Failed to process ${result.url}: ${msg}`);
        errors.push(`${result.source}: ${msg}`);
        continue;
      }
    }

    res.json({
      questions: allQuestions,
      sources: processedSources,
      searchResults: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Search and extraction failed';
    console.error('Search-and-extract error:', message);
    res.status(500).json({ error: message });
  }
});
