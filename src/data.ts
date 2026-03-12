import { addDays } from 'date-fns';

export type Subject = {
  id: string;
  name: string;
  icon: string;
  color: string;
  questionCount: number;
};

export type Question = {
  id: string;
  subjectId: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source: string;
  isSaved: boolean;
  date: Date;
};

export type Goal = {
  id: string;
  title: string;
  targetDays: number;
  currentStreak: number;
  startDate: Date;
  subjects: string[];
};

export type Flashcard = {
  id: string;
  question: string;
  answer: string;
  subject: string;
  lastReviewed: Date;
  nextReview: Date;
};

export const subjects: Subject[] = [
  { id: 'dbms', name: 'DBMS', icon: '💾', color: 'bg-blue-500', questionCount: 42 },
  { id: 'networks', name: 'Networks', icon: '🌐', color: 'bg-green-500', questionCount: 38 },
  { id: 'oops', name: 'OOPS', icon: '🔄', color: 'bg-purple-500', questionCount: 35 },
  { id: 'cp', name: 'Competitive Programming', icon: '⚡', color: 'bg-red-500', questionCount: 56 },
  { id: 'os', name: 'Operating Systems', icon: '💻', color: 'bg-yellow-500', questionCount: 45 },
  { id: 'dsa', name: 'Data Structures', icon: '📊', color: 'bg-pink-500', questionCount: 62 },
];

export const initialQuestions: Question[] = [
  {
    id: '1',
    subjectId: 'dbms',
    question: 'What is ACID properties in DBMS?',
    answer: 'ACID stands for Atomicity, Consistency, Isolation, Durability. These properties ensure reliable transaction processing.',
    difficulty: 'medium',
    source: 'InterviewBit',
    isSaved: true,
    date: new Date()
  },
  {
    id: '2',
    subjectId: 'networks',
    question: 'Explain TCP/IP model layers',
    answer: 'TCP/IP model has 4 layers: Application, Transport, Internet, Network Access. Each layer has specific protocols and functions.',
    difficulty: 'medium',
    source: 'GeeksforGeeks',
    isSaved: false,
    date: new Date()
  },
  {
    id: '3',
    subjectId: 'oops',
    question: 'What is polymorphism in OOPS?',
    answer: 'Polymorphism allows objects of different classes to be treated as objects of a common super class. It can be compile-time (overloading) or runtime (overriding).',
    difficulty: 'easy',
    source: 'TutorialsPoint',
    isSaved: true,
    date: new Date()
  },
  {
    id: '4',
    subjectId: 'dsa',
    question: 'What is the time complexity of binary search?',
    answer: 'Binary search has O(log n) time complexity as it divides the search space in half with each iteration.',
    difficulty: 'easy',
    source: 'LeetCode',
    isSaved: false,
    date: new Date()
  },
  {
    id: '5',
    subjectId: 'os',
    question: 'What is virtual memory?',
    answer: 'Virtual memory is a memory management technique that provides an "idealized abstraction" of the storage resources that are actually available on a given machine.',
    difficulty: 'medium',
    source: 'Operating Systems Concepts',
    isSaved: true,
    date: new Date()
  },
];

export const initialGoals: Goal[] = [
  {
    id: '1',
    title: '30-Day Placement Prep',
    targetDays: 30,
    currentStreak: 12,
    startDate: new Date(),
    subjects: ['dbms', 'networks', 'oops']
  },
  {
    id: '2',
    title: '90-Day Coding Challenge',
    targetDays: 90,
    currentStreak: 45,
    startDate: new Date(),
    subjects: ['cp', 'dsa']
  }
];

export const initialFlashcards: Flashcard[] = [
  {
    id: '1',
    question: 'What is normalization?',
    answer: 'Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity.',
    subject: 'dbms',
    lastReviewed: new Date(),
    nextReview: addDays(new Date(), 1)
  },
  {
    id: '2',
    question: 'Difference between TCP and UDP',
    answer: 'TCP is connection-oriented and reliable, UDP is connectionless and faster but unreliable.',
    subject: 'networks',
    lastReviewed: new Date(),
    nextReview: addDays(new Date(), 3)
  },
  {
    id: '3',
    question: 'What is inheritance in OOP?',
    answer: 'Inheritance allows a class to inherit properties and methods from another class, promoting code reuse.',
    subject: 'oops',
    lastReviewed: new Date(),
    nextReview: addDays(new Date(), 2)
  }
];

export const achievements = [
  { id: '1', title: 'First Question Saved', description: 'Save your first question', unlocked: true, icon: '🎯' },
  { id: '2', title: '7-Day Streak', description: 'Complete questions for 7 consecutive days', unlocked: true, icon: '🔥' },
  { id: '3', title: 'Subject Master', description: 'Complete 50 questions in a single subject', unlocked: false, icon: '🏆' },
  { id: '4', title: 'Flashcard Fanatic', description: 'Create 20 flashcards', unlocked: false, icon: '📚' },
  { id: '5', title: 'Web Explorer', description: 'Use web scraper 10 times', unlocked: false, icon: '🌐' },
];