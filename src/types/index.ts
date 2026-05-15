// TypeScript types mirroring Prisma models

export type SessionLabel =
  | "LEETCODE"
  | "STRIVER"
  | "REVISION"
  | "CONTEST"
  | "NOTES"
  | "DEBUGGING"
  | "MOCK_INTERVIEW";

export type Platform =
  | "LEETCODE"
  | "CODEFORCES"
  | "ATCODER"
  | "HACKERRANK"
  | "GFGS"
  | "STRIVER"
  | "OTHER";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  createdAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  label: SessionLabel;
  startTime: Date;
  endTime?: Date | null;
  duration?: number | null; // seconds
  notes?: string | null;
  tags: string[];
  createdAt: Date;
}

export interface Problem {
  id: string;
  userId: string;
  name: string;
  platform: Platform;
  difficulty: Difficulty;
  topics: string[];
  solvedIndependently: boolean;
  timeTaken?: number | null; // minutes
  revisionCount: number;
  confidenceRating: number; // 1-5
  notes?: string | null;
  url?: string | null;
  dateSolved: Date;
  nextRevisionDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Revision {
  id: string;
  problemId: string;
  userId: string;
  revisedAt: Date;
  notes?: string | null;
  confidenceAfter: number; // 1-5
}

export interface JournalEntry {
  id: string;
  userId: string;
  problemId?: string | null;
  title: string;
  initialThought?: string | null;
  stuckPoint?: string | null;
  wrongIntuition?: string | null;
  correctIntuition?: string | null;
  missedPattern?: string | null;
  implementationBug?: string | null;
  edgeCaseMissed?: string | null;
  learningOutcome?: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AlgorithmNote {
  id: string;
  userId: string;
  category: string;
  title: string;
  content: string; // markdown
  codeSnippets: CodeSnippet[];
  complexity: ComplexityInfo;
  tricks?: string | null;
  edgeCases?: string | null;
  templates?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeSnippet {
  language: string;
  code: string;
  description?: string;
}

export interface ComplexityInfo {
  time?: string;
  space?: string;
  notes?: string;
}

export interface Pattern {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  examples: PatternExample[];
  linkedProblems: string[];
  tags: string[];
  createdAt: Date;
}

export interface PatternExample {
  problem: string;
  explanation: string;
}

export interface DailyReview {
  id: string;
  userId: string;
  date: Date;
  wentWell?: string | null;
  wastedTime?: string | null;
  wasDifficult?: string | null;
  improveNext?: string | null;
  createdAt: Date;
}

// Analytics types
export interface DailyStats {
  date: string;
  hours: number;
  problems: number;
  revisions: number;
}

export interface WeeklyStats {
  week: string;
  hours: number;
  problems: number;
}

export interface TopicStats {
  topic: string;
  count: number;
  percentage: number;
}

export interface AnalyticsSummary {
  totalHours: number;
  totalProblems: number;
  currentStreak: number;
  longestStreak: number;
  avgSessionLength: number;
  totalSessions: number;
  problemsByDifficulty: { easy: number; medium: number; hard: number };
  problemsByTopic: TopicStats[];
  weeklyHours: WeeklyStats[];
  dailyActivity: DailyStats[];
  revisionCompletionRate: number;
}

// Timer state
export interface TimerState {
  elapsed: number; // seconds
  running: boolean;
  paused: boolean;
  label: SessionLabel;
  sessionNotes: string;
  startTime: Date | null;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
