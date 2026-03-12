import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ExtractedQA {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
}

const QUESTION_PREFIXES = [
  'what',
  'why',
  'how',
  'when',
  'where',
  'which',
  'who',
  'explain',
  'describe',
  'differentiate',
  'compare',
  'define',
  'list',
  'can',
  'is',
  'are',
  'does',
  'do',
];

export async function extractQuestionsFromContent(
  content: string,
  topic: string,
  sourceUrl: string
): Promise<ExtractedQA[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return extractQuestionsHeuristically(content, topic);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    });

    const prompt = `You are an expert interview preparation assistant. Analyze the following article content scraped from a real website and extract structured interview questions with comprehensive answers.

Topic: ${topic}
Source: ${sourceUrl}

Article Content:
${content}

Instructions:
- Extract 5-8 high-quality interview questions with detailed, interview-ready answers
- Questions must be based on ACTUAL content from the article (not made up)
- Answers should be comprehensive (3-5 sentences minimum), accurate, and ready to use in a real interview
- Include a mix of conceptual, practical, and scenario-based questions
- Assign difficulty: "easy" for definitions/basics, "medium" for explanations/comparisons, "hard" for deep concepts/design
- Categorize each into one subject: DBMS, Networks, OS, DSA, OOPS, System Design, Web Development, Java, Python, or the most fitting subject

Return ONLY a valid JSON array (no markdown, no code blocks, no extra text) with this exact format:
[{"question":"...","answer":"...","difficulty":"easy|medium|hard","subject":"..."}]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('AI did not return valid JSON. Raw response: ' + text.substring(0, 200));
    }

    const questions: ExtractedQA[] = JSON.parse(jsonMatch[0]);

    const validQuestions = questions.filter(
      (q) =>
        q.question &&
        q.answer &&
        ['easy', 'medium', 'hard'].includes(q.difficulty) &&
        q.subject
    );

    return validQuestions.length > 0
      ? validQuestions
      : extractQuestionsHeuristically(content, topic);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown Gemini error';
    console.warn(`Gemini extraction unavailable, using heuristic fallback: ${message}`);
    return extractQuestionsHeuristically(content, topic);
  }
}

function extractQuestionsHeuristically(content: string, topic: string): ExtractedQA[] {
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const questions: ExtractedQA[] = [];
  const subject = inferSubject(topic, content);

  for (let index = 0; index < lines.length; index += 1) {
    const candidate = normalizeQuestionLine(lines[index]);
    if (!candidate) {
      continue;
    }

    const answerLines: string[] = [];
    let cursor = index + 1;

    while (cursor < lines.length && answerLines.join(' ').length < 650) {
      const nextLine = lines[cursor];
      if (normalizeQuestionLine(nextLine)) {
        break;
      }

      if (nextLine.length >= 35) {
        answerLines.push(nextLine);
      }
      cursor += 1;
    }

    const answer = answerLines.join(' ').trim();
    if (answer.length < 80) {
      continue;
    }

    questions.push({
      question: candidate,
      answer,
      difficulty: classifyDifficulty(candidate, answer),
      subject,
    });

    if (questions.length >= 8) {
      break;
    }
  }

  if (questions.length > 0) {
    return dedupeQuestions(questions).slice(0, 8);
  }

  return buildTopicFallback(content, subject, topic);
}

function normalizeQuestionLine(line: string): string | null {
  const stripped = line
    .replace(/^\d+[.):-]\s*/, '')
    .replace(/^q\d+[.):-]?\s*/i, '')
    .trim();

  if (stripped.length < 12 || stripped.length > 180) {
    return null;
  }

  const lower = stripped.toLowerCase();
  const isQuestionLike =
    stripped.endsWith('?') ||
    QUESTION_PREFIXES.some((prefix) => lower.startsWith(prefix + ' '));

  if (!isQuestionLike) {
    return null;
  }

  return stripped.endsWith('?') ? stripped : `${stripped}?`;
}

function classifyDifficulty(
  question: string,
  answer: string
): 'easy' | 'medium' | 'hard' {
  const combined = `${question} ${answer}`.toLowerCase();

  if (
    combined.includes('design') ||
    combined.includes('architecture') ||
    combined.includes('optimiz') ||
    combined.includes('trade-off') ||
    answer.length > 500
  ) {
    return 'hard';
  }

  if (
    combined.includes('difference') ||
    combined.includes('compare') ||
    combined.includes('explain') ||
    combined.includes('how') ||
    answer.length > 220
  ) {
    return 'medium';
  }

  return 'easy';
}

function inferSubject(topic: string, content: string): string {
  const combined = `${topic} ${content.substring(0, 2000)}`.toLowerCase();

  if (/(dbms|sql|normalization|acid|database|functional dependency)/.test(combined)) {
    return 'DBMS';
  }
  if (/(tcp|udp|network|dns|http|osi|routing)/.test(combined)) {
    return 'Networks';
  }
  if (/(oops|oop|inheritance|polymorphism|encapsulation|abstraction|object oriented)/.test(combined)) {
    return 'OOPS';
  }
  if (/(deadlock|process|thread|paging|os|operating system|scheduling)/.test(combined)) {
    return 'OS';
  }
  if (/(array|tree|graph|stack|queue|algorithm|complexity|dsa)/.test(combined)) {
    return 'DSA';
  }

  return topic.trim() || 'General';
}

function dedupeQuestions(questions: ExtractedQA[]): ExtractedQA[] {
  const seen = new Set<string>();
  return questions.filter((item) => {
    const key = item.question.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function buildTopicFallback(
  content: string,
  subject: string,
  topic: string
): ExtractedQA[] {
  const sentences = content
    .replace(/\n/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 80)
    .slice(0, 6);

  if (sentences.length === 0) {
    return [];
  }

  return sentences.slice(0, 5).map((sentence, index) => ({
    question:
      index === 0
        ? `What is ${topic}?`
        : `Explain this key ${subject} concept from the source article.` ,
    answer: sentence,
    difficulty: index === 0 ? 'easy' : 'medium',
    subject,
  }));
}
