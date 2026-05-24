export type SessionLabel =
  | "LEETCODE"
  | "STRIVER"
  | "REVISION"
  | "CONTEST"
  | "NOTES"
  | "DEBUGGING"
  | "MOCK_INTERVIEW";

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

export interface TimerState {
  elapsed: number; // seconds
  running: boolean;
  paused: boolean;
  label: SessionLabel;
  sessionNotes: string;
  startTime: Date | null;
}
