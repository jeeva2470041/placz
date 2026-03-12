import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchRouter } from './routes/search.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  })
);

app.use(express.json());

// Rate limiting: 50 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many requests. Please wait a few minutes.' },
});

app.use('/api', limiter);
app.use('/api', searchRouter);

// Health check & API key status
app.get('/api/health', (_req, res) => {
  const serperKey = process.env.SERPER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  res.json({
    status: 'ok',
    serperConfigured:
      !!serperKey && serperKey !== 'your_serper_api_key_here',
    geminiConfigured:
      !!geminiKey && geminiKey !== 'your_gemini_api_key_here',
  });
});

// In production, serve the built frontend
const distPath = path.resolve(__dirname, '..', '..', 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 PrepPal Server running on http://localhost:${PORT}`);
  console.log('─'.repeat(50));

  const serperKey = process.env.SERPER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!serperKey || serperKey === 'your_serper_api_key_here') {
    console.log('⚠️  SERPER_API_KEY not set → Get free key at https://serper.dev');
  } else {
    console.log('✅ Serper API key configured');
  }

  if (!geminiKey || geminiKey === 'your_gemini_api_key_here') {
    console.log('⚠️  GEMINI_API_KEY not set → Get free key at https://aistudio.google.com/apikey');
  } else {
    console.log('✅ Gemini API key configured');
  }

  console.log('─'.repeat(50));
  console.log('API endpoints:');
  console.log('  POST /api/search            → Search the web');
  console.log('  POST /api/extract           → Extract Q&A from a URL');
  console.log('  POST /api/search-and-extract → Search + scrape + extract');
  console.log('  GET  /api/health            → Server status\n');
});
