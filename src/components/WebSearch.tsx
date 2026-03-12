import { useState, useEffect } from 'react';
import { Search, Globe, ExternalLink, BookOpen, AlertCircle, Loader2, CheckCircle, Zap, AlertTriangle, Save } from 'lucide-react';
import * as api from '../services/api';

interface WebSearchProps {
  onAddQuestion?: (data: {
    question: string;
    answer: string;
    subject: string;
    difficulty: 'easy' | 'medium' | 'hard';
    source: string;
    sourceUrl?: string;
  }) => void;
}

export const WebSearch = ({ onAddQuestion }: WebSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<api.SearchResult[]>([]);
  const [extractedQuestions, setExtractedQuestions] = useState<api.ExtractedQuestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [extractingUrl, setExtractingUrl] = useState<string | null>(null);
  const [isAutoExtracting, setIsAutoExtracting] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<api.ApiHealth | null>(null);
  const [apiChecking, setApiChecking] = useState(true);
  const [savedIndices, setSavedIndices] = useState<Set<number>>(new Set());

  const subjects = [
    { id: 'all', name: 'All Subjects' },
    { id: 'dbms', name: 'DBMS' },
    { id: 'networks', name: 'Networks' },
    { id: 'oops', name: 'OOPS' },
    { id: 'dsa', name: 'Data Structures' },
    { id: 'os', name: 'Operating Systems' },
    { id: 'cp', name: 'Competitive Programming' }
  ];

  useEffect(() => {
    api.checkApiHealth()
      .then(setApiStatus)
      .catch(() => setApiStatus(null))
      .finally(() => setApiChecking(false));
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setError(null);
    setIsSearching(true);
    setSearchResults([]);

    try {
      const results = await api.searchWeb(searchQuery, selectedSubject);
      setSearchResults(results);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleExtract = async (result: api.SearchResult) => {
    setExtractingUrl(result.url);
    setError(null);

    try {
      const topic = selectedSubject === 'all' ? searchQuery : selectedSubject;
      const questions = await api.extractQuestions(result.url, topic);
      const withSource = questions.map(q => ({
        ...q,
        source: result.source,
        sourceUrl: result.url,
        sourceTitle: result.title,
      }));
      setExtractedQuestions(prev => [...prev, ...withSource]);
    } catch (err: unknown) {
      setError(`Failed to extract from ${result.source}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setExtractingUrl(null);
    }
  };

  const handleSearchAndExtract = async () => {
    if (!searchQuery.trim()) return;
    setError(null);
    setIsAutoExtracting(true);
    setSearchResults([]);
    setExtractedQuestions([]);
    setSavedIndices(new Set());

    try {
      const data = await api.searchAndExtract(searchQuery, selectedSubject);
      setSearchResults(data.searchResults);
      setExtractedQuestions(data.questions);
      if (data.errors?.length) {
        setError(`Some sources failed: ${data.errors.join('; ')}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Search and extraction failed');
    } finally {
      setIsAutoExtracting(false);
    }
  };

  const handleSaveQuestion = (q: api.ExtractedQuestion, index: number) => {
    if (onAddQuestion) {
      onAddQuestion({
        question: q.question,
        answer: q.answer,
        subject: q.subject,
        difficulty: q.difficulty,
        source: q.source || 'Web',
        sourceUrl: q.sourceUrl,
      });
      setSavedIndices(prev => new Set(prev).add(index));
    }
  };

  const isReady = !!apiStatus?.serperConfigured;

  return (
    <div className="space-y-4">
      {/* API Status Banner */}
      {apiChecking ? (
        <div className="bg-gray-50 rounded-xl p-4 flex items-center space-x-3">
          <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          <span className="text-sm text-gray-600">Connecting to server...</span>
        </div>
      ) : !apiStatus ? (
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Server not running</p>
              <p className="text-sm text-red-600 mt-1">
                Start the backend server with: <code className="bg-red-100 px-2 py-0.5 rounded">npm run dev:server</code>
              </p>
            </div>
          </div>
        </div>
      ) : !isReady ? (
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Search API key needed</p>
              <div className="text-sm text-amber-700 mt-1 space-y-1">
                {!apiStatus.serperConfigured && (
                  <p>• Serper API key missing → <a href="https://serper.dev" target="_blank" rel="noopener noreferrer" className="underline">Get free key (2500 searches)</a></p>
                )}
                {!apiStatus.geminiConfigured && (
                  <p>• Gemini API key missing → fallback extraction will be used instead of AI extraction</p>
                )}
                <p className="mt-2">Add keys to <code className="bg-amber-100 px-2 py-0.5 rounded">server/.env</code></p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Search Card */}
      <div className="bg-white rounded-xl shadow-lg p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Live Web Search</h2>
              <p className="text-sm text-gray-500">Search real websites and extract interview Q&A from live article content</p>
            </div>
          </div>
          {isReady && (
            <span className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse" />
              Live
            </span>
          )}
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for interview questions, concepts..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                disabled={!isReady}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || isAutoExtracting || !isReady}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
            >
              {isSearching ? (
                <span className="flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin" />Searching</span>
              ) : (
                'Search'
              )}
            </button>
          </div>

          {/* Quick Extract Button */}
          <button
            onClick={handleSearchAndExtract}
            disabled={!searchQuery.trim() || isSearching || isAutoExtracting || !isReady}
            className="mt-3 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
          >
            {isAutoExtracting ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching Google, scraping pages & extracting Q&A...
              </span>
            ) : (
              <span className="flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Search & Auto-Extract Q&A
              </span>
            )}
          </button>

          {/* Subject Filter */}
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Filter by subject:</p>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedSubject === subject.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {subject.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Extracted Questions */}
        {extractedQuestions.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Extracted Q&A ({extractedQuestions.length} questions)
              </h3>
              <button
                onClick={() => { setExtractedQuestions([]); setSavedIndices(new Set()); }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>

            <div className="space-y-3">
              {extractedQuestions.map((q, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        q.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {q.difficulty}
                      </span>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded">
                        {q.subject}
                      </span>
                      {q.source && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                          {q.source}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleSaveQuestion(q, idx)}
                      disabled={savedIndices.has(idx)}
                      className={`ml-2 shrink-0 p-1.5 rounded-lg transition-colors ${
                        savedIndices.has(idx)
                          ? 'text-green-600 bg-green-50'
                          : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
                      }`}
                      title={savedIndices.has(idx) ? 'Saved!' : 'Save to Questions'}
                    >
                      {savedIndices.has(idx) ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Save className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{q.question}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{q.answer}</p>
                  {q.sourceUrl && (
                    <a
                      href={q.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-blue-600 hover:text-blue-700 text-xs inline-flex items-center"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      {q.sourceTitle || q.sourceUrl}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Results (web pages) */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Web Results ({searchResults.length} pages found)
              </h3>
              <button
                onClick={() => setSearchResults([])}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>

            {searchResults.map((result, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                        {result.source}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">{result.title}</h4>
                    <p className="text-gray-600 text-sm mb-3">{result.snippet}</p>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Visit source
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Scrape this page & extract interview Q&A with AI
                  </div>
                  <button
                    onClick={() => handleExtract(result)}
                    disabled={extractingUrl === result.url || !isReady}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center"
                  >
                    {extractingUrl === result.url ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Extract Q&A
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {searchResults.length === 0 && extractedQuestions.length === 0 && !isSearching && !isAutoExtracting && (
          <div className="text-center py-8">
            <div className="inline-flex p-3 bg-gray-100 rounded-full mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Search real websites</h3>
            <p className="text-gray-500 mb-6">
              Search Google for interview questions from GeeksforGeeks, InterviewBit, Medium, and more.
              AI will extract structured Q&A from the actual page content.
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {['DBMS normalization', 'TCP vs UDP', 'OOPS polymorphism', 'Binary search tree', 'OS deadlock', 'System design basics'].map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">How it works</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-blue-600 font-medium mb-1">1. Search Google</div>
              <p className="text-xs text-gray-600">Finds real pages from GFG, InterviewBit, Medium, etc.</p>
            </div>
            <div className="p-3 bg-cyan-50 rounded-lg">
              <div className="text-cyan-600 font-medium mb-1">2. Scrape Content</div>
              <p className="text-xs text-gray-600">Extracts article text from the actual web pages</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-green-600 font-medium mb-1">3. AI Extract</div>
              <p className="text-xs text-gray-600">Gemini AI converts content into structured Q&A pairs</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-purple-600 font-medium mb-1">4. Save & Study</div>
              <p className="text-xs text-gray-600">Save questions to your study list and flashcards</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};