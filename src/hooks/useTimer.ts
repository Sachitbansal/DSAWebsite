"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SessionLabel } from "@/types";

interface TimerStore {
  elapsed: number;        // seconds — always computed from wall clock
  running: boolean;
  paused: boolean;
  label: SessionLabel;
  sessionNotes: string;
  startTime: string | null;       // actual session start (for API record)
  effectiveStart: string | null;  // adjusted start = Date.now() - elapsed*1000, updated on resume
  intervalId: ReturnType<typeof setInterval> | null;

  setLabel: (label: SessionLabel) => void;
  setSessionNotes: (notes: string) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<void>;
  reset: () => void;
  tick: () => void;
}

export const useTimer = create<TimerStore>()(
  persist(
    (set, get) => ({
      elapsed: 0,
      running: false,
      paused: false,
      label: "LEETCODE" as SessionLabel,
      sessionNotes: "",
      startTime: null,
      effectiveStart: null,
      intervalId: null,

      setLabel: (label) => set({ label }),
      setSessionNotes: (notes) => set({ sessionNotes: notes }),

      // Compute from wall clock — immune to browser throttling
      tick: () => {
        const { effectiveStart } = get();
        if (!effectiveStart) return;
        const elapsed = Math.floor((Date.now() - new Date(effectiveStart).getTime()) / 1000);
        set({ elapsed });
      },

      start: () => {
        const state = get();
        if (state.running) return;

        const now = new Date().toISOString();
        const id = setInterval(() => get().tick(), 1000);

        set({
          running: true,
          paused: false,
          startTime: now,
          effectiveStart: now,
          elapsed: 0,
          intervalId: id,
        });
      },

      pause: () => {
        const state = get();
        if (!state.running || state.paused) return;
        if (state.intervalId) clearInterval(state.intervalId);
        // elapsed stays as-is — frozen until resume
        set({ paused: true, running: false, intervalId: null });
      },

      resume: () => {
        const state = get();
        if (state.running || !state.paused) return;

        // Shift effectiveStart so elapsed stays continuous from pause point
        const effectiveStart = new Date(Date.now() - state.elapsed * 1000).toISOString();
        const id = setInterval(() => get().tick(), 1000);

        set({ running: true, paused: false, effectiveStart, intervalId: id });
      },

      stop: async () => {
        const state = get();
        if (state.intervalId) clearInterval(state.intervalId);

        if (state.elapsed > 0 && state.startTime) {
          try {
            const res = await fetch("/api/sessions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                label: state.label,
                startTime: state.startTime,
                endTime: new Date().toISOString(),
                duration: state.elapsed,
                notes: state.sessionNotes,
                tags: [],
              }),
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              console.error("Failed to save session:", res.status, err);
            }
          } catch (error) {
            console.error("Failed to save session:", error);
          }
        }

        set({
          running: false,
          paused: false,
          elapsed: 0,
          startTime: null,
          effectiveStart: null,
          sessionNotes: "",
          intervalId: null,
        });
      },

      reset: () => {
        const state = get();
        if (state.intervalId) clearInterval(state.intervalId);
        set({
          running: false,
          paused: false,
          elapsed: 0,
          startTime: null,
          effectiveStart: null,
          sessionNotes: "",
          intervalId: null,
        });
      },
    }),
    {
      name: "dsa-timer",
      partialize: (state) => ({
        elapsed: state.elapsed,
        running: state.running,
        paused: state.paused,
        label: state.label,
        sessionNotes: state.sessionNotes,
        startTime: state.startTime,
        effectiveStart: state.effectiveStart,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.running && state.effectiveStart) {
          // Recompute elapsed immediately from wall clock on page reload
          const elapsed = Math.floor((Date.now() - new Date(state.effectiveStart).getTime()) / 1000);
          useTimer.setState({ elapsed });
          const id = setInterval(() => useTimer.getState().tick(), 1000);
          useTimer.setState({ intervalId: id });
        }
      },
    }
  )
);
