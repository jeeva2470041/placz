import { useState, useEffect } from 'react';
import { 
  Brain, 
  BookOpen, 
  Target, 
  Save, 
  CheckCircle, 
  ChevronRight,
  Plus,
  Search,
  Clock,
  Trophy,
  TrendingUp,
  Menu,
  X,
  Home,
  Settings,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { WebSearch } from './components/WebSearch';
import { subjects as initialSubjects, initialQuestions, initialGoals, initialFlashcards } from './data';

type Subject = {
  id: string;
  name: string;
  icon: string;
  color: string;
  questionCount: number;
};

type Question = {
  id: string;
  subjectId: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source: string;
  isSaved: boolean;
  date: Date;
};

type Goal = {
  id: string;
  title: string;
  targetDays: number;
  currentStreak: number;
  startDate: Date;
  subjects: string[];
};

type Flashcard = {
  id: string;
  question: string;
  answer: string;
  subject: string;
  lastReviewed: Date;
  nextReview: Date;
};

const App = () => {
  const [subjects] = useState<Subject[]>(initialSubjects);

  const [questions, setQuestions] = useState<Question[]>(initialQuestions);

  const [goals] = useState<Goal[]>(initialGoals);

  const [flashcards] = useState<Flashcard[]>(initialFlashcards);

  const [activeTab, setActiveTab] = useState<'home' | 'questions' | 'goals' | 'flashcards' | 'search'>('home');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [dailyQuestions, setDailyQuestions] = useState<Question[]>([]);

  useEffect(() => {
    // Generate daily questions - in real app, this would come from web scraping
    const daily = questions.slice(0, 3);
    setDailyQuestions(daily);
  }, [questions]);

  const toggleSaveQuestion = (id: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, isSaved: !q.isSaved } : q
    ));
  };

  const addNewSubject = () => {
    if (newSubjectName.trim()) {
      // In a real app, this would make an API call
      alert(`Subject "${newSubjectName}" added successfully!`);
      setNewSubjectName('');
    }
  };

  const getSubjectById = (id: string) => subjects.find(s => s.id === id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PrepPal</h1>
              <p className="text-xs text-gray-500">Placement Preparation</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg mt-1 px-4 py-3">
            <div className="space-y-3">
              <button className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-50">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </button>
              <button className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-50">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </button>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm text-gray-500 px-2">Current streak: 12 days 🔥</p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-white">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'questions', label: 'Questions', icon: BookOpen },
            { id: 'search', label: 'Search', icon: Search },
            { id: 'goals', label: 'Goals', icon: Target },
            { id: 'flashcards', label: 'Flashcards', icon: Save }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 flex flex-col items-center justify-center ${
                activeTab === tab.id 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-500'
              }`}
            >
              <tab.icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="p-4 space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">Daily Prep</h2>
                <Trophy className="h-6 w-6" />
              </div>
              <p className="text-indigo-100 mb-4">Your daily questions are ready! Complete them to maintain your streak.</p>
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
                  🔥 12-day streak
                </div>
                <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
                  📚 3 questions today
                </div>
              </div>
            </div>

            {/* Daily Questions */}
            <div className="bg-white rounded-xl shadow-md p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Today's Questions</h3>
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                {dailyQuestions.map((q) => {
                  const subject = getSubjectById(q.subjectId);
                  return (
                    <div key={q.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${subject?.color} text-white`}>
                              {subject?.icon} {subject?.name}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              q.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                              q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {q.difficulty}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-2">{q.question}</h4>
                          <p className="text-sm text-gray-600">{q.answer.substring(0, 100)}...</p>
                        </div>
                        <button 
                          onClick={() => toggleSaveQuestion(q.id)}
                          className="ml-2"
                        >
                          {q.isSaved ? (
                            <Save className="h-5 w-5 text-indigo-600 fill-indigo-600" />
                          ) : (
                            <Save className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                        <span>Source: {q.source}</span>
                        <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                          View Answer <ChevronRight className="h-4 w-4 inline ml-1" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subjects Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Study Subjects</h3>
                <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                  View All
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {subjects.slice(0, 4).map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => {
                      setSelectedSubject(subject.id);
                      setActiveTab('questions');
                    }}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`${subject.color} w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl`}>
                        {subject.icon}
                      </span>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{subject.name}</h4>
                    <p className="text-sm text-gray-500">{subject.questionCount} questions</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-md p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Active Goals</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{goals.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Save className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Saved Cards</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">{flashcards.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="p-4 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Interview Questions</h2>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                  <Search className="h-4 w-4 inline mr-2" />
                  Search Web
                </button>
              </div>

              {/* Subject Filter */}
              <div className="flex space-x-2 overflow-x-auto pb-2 mb-4">
                <button
                  onClick={() => setSelectedSubject(null)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${
                    selectedSubject === null 
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  All Subjects
                </button>
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject.id)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap ${
                      selectedSubject === subject.id 
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {subject.icon} {subject.name}
                  </button>
                ))}
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {questions
                  .filter(q => !selectedSubject || q.subjectId === selectedSubject)
                  .map((q) => {
                    const subject = getSubjectById(q.subjectId);
                    return (
                      <div key={q.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {subject?.name}
                              </span>
                              <span className={`text-xs font-medium px-2 py-1 rounded ${
                                q.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {q.difficulty}
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">{q.question}</h4>
                            <p className="text-gray-600 text-sm">{q.answer}</p>
                          </div>
                          <button 
                            onClick={() => toggleSaveQuestion(q.id)}
                            className="ml-4"
                          >
                            {q.isSaved ? (
                              <Save className="h-5 w-5 text-indigo-600 fill-indigo-600" />
                            ) : (
                              <Save className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                          <span>Source: {q.source}</span>
                          <span>{format(q.date, 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Add New Subject */}
            <div className="bg-white rounded-xl shadow-md p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Subject</h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="Enter subject name (e.g., Cloud Computing)"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={addNewSubject}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Add custom subjects to expand your preparation scope
              </p>
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="p-4 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Study Goals</h2>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                  <Plus className="h-4 w-4 inline mr-2" />
                  New Goal
                </button>
              </div>

              {/* Goals List */}
              <div className="space-y-4">
                {goals.map((goal) => {
                  const progress = (goal.currentStreak / goal.targetDays) * 100;
                  return (
                    <div key={goal.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Target className="h-6 w-6 text-indigo-600" />
                          <div>
                            <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                            <p className="text-sm text-gray-500">
                              Started {format(goal.startDate, 'MMM d')} • {goal.currentStreak}/{goal.targetDays} days
                            </p>
                          </div>
                        </div>
                        <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                          {Math.round(progress)}%
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                          <span>{goal.currentStreak} days completed</span>
                          <span>{goal.targetDays - goal.currentStreak} days remaining</span>
                        </div>
                      </div>

                      {/* Subjects in Goal */}
                      <div className="flex flex-wrap gap-2">
                        {goal.subjects.map((subjectId) => {
                          const subject = getSubjectById(subjectId);
                          return (
                            <span 
                              key={subjectId} 
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center"
                            >
                              {subject?.icon} {subject?.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Streak Calendar */}
            <div className="bg-white rounded-xl shadow-md p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Streak</h3>
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">12</div>
                  <div className="text-sm text-gray-500">Current Days</div>
                </div>
                <div className="h-12 w-px bg-gray-200" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">45</div>
                  <div className="text-sm text-gray-500">Best Record</div>
                </div>
                <div className="h-12 w-px bg-gray-200" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">18</div>
                  <div className="text-sm text-gray-500">Days Remaining</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                  <p className="text-sm text-amber-800">
                    You're on a 12-day streak! Keep it up to unlock achievement badges.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Flashcards Tab */}
        {activeTab === 'flashcards' && (
          <div className="p-4 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Flashcards</h2>
                <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                  Review All
                </button>
              </div>

              {/* Flashcards Grid */}
              <div className="grid grid-cols-1 gap-4">
                {flashcards.map((card) => {
                  const subject = getSubjectById(card.subject);
                  return (
                    <div 
                      key={card.id} 
                      className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className={`${subject?.color} w-8 h-8 rounded-lg flex items-center justify-center text-white`}>
                            {subject?.icon}
                          </span>
                          <span className="font-medium text-gray-700">{subject?.name}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Review {format(card.nextReview, 'MMM d')}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-3 text-lg">Q: {card.question}</h4>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <p className="text-gray-700">{card.answer}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Last reviewed: {format(card.lastReviewed, 'MMM d, h:mm a')}</span>
                        <div className="flex space-x-2">
                          <button className="text-green-600 hover:text-green-700">
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button className="text-red-600 hover:text-red-700">
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save New Flashcard */}
            <div className="bg-white rounded-xl shadow-md p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Save New Flashcard</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
                    rows={2}
                    placeholder="Enter question from interview..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
                    rows={3}
                    placeholder="Enter detailed answer..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500">
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:opacity-90">
                  Save Flashcard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="p-4">
            <WebSearch 
              onAddQuestion={(data) => {
                // Map subject name to a known subjectId
                const subjectMap: Record<string, string> = {
                  'dbms': 'dbms', 'database': 'dbms', 'sql': 'dbms',
                  'networks': 'networks', 'networking': 'networks', 'network': 'networks', 'tcp': 'networks',
                  'oops': 'oops', 'oop': 'oops', 'object': 'oops', 'java': 'oops',
                  'dsa': 'dsa', 'data structures': 'dsa', 'algorithms': 'dsa', 'algorithm': 'dsa',
                  'os': 'os', 'operating': 'os', 'operating systems': 'os',
                  'cp': 'cp', 'competitive': 'cp', 'competitive programming': 'cp',
                  'system design': 'dsa', 'web development': 'cp', 'python': 'cp',
                };
                
                const subjectLower = data.subject.toLowerCase();
                let subjectId = 'dsa'; // fallback
                for (const [key, value] of Object.entries(subjectMap)) {
                  if (subjectLower.includes(key)) {
                    subjectId = value;
                    break;
                  }
                }

                const newQuestion: Question = {
                  id: `extracted-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                  subjectId,
                  question: data.question,
                  answer: data.answer,
                  difficulty: data.difficulty || 'medium',
                  source: data.source || 'Web',
                  isSaved: false,
                  date: new Date()
                };
                setQuestions(prev => [...prev, newQuestion]);
              }}
            />
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h3>
              <p className="text-blue-800 text-sm">
                Use specific search terms like "DBMS normalization" or "TCP vs UDP" for best results.
                The search scrapes real content from GeeksforGeeks, InterviewBit, Medium, and more — then uses AI to extract structured Q&A.
                Saved questions appear in the Questions tab.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2">
        <div className="flex justify-around">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'questions', label: 'Questions', icon: BookOpen },
            { id: 'search', label: 'Search', icon: Search },
            { id: 'goals', label: 'Goals', icon: Target },
            { id: 'flashcards', label: 'Flashcards', icon: Save }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center space-y-1 flex-1 px-1 py-2 rounded-lg transition-colors ${
                activeTab === tab.id 
                  ? 'text-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                activeTab === tab.id ? 'bg-indigo-50' : ''
              }`}>
                <tab.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;