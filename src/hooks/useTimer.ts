"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SessionLabel } from "@/types";

interface TimerStore {
  elapsed: number; // seconds
  running: boolean;
  paused: boolean;
  label: SessionLabel;
  sessionNotes: string;
  startTime: string | null; // ISO string for serialization
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
      intervalId: null,

      setLabel: (label) => set({ label }),
      setSessionNotes: (notes) => set({ sessionNotes: notes }),

      tick: () => {
        set((state) => ({ elapsed: state.elapsed + 1 }));
      },

      start: () => {
        const state = get();
        if (state.running) return;

        const now = new Date().toISOString();

        const id = setInterval(() => {
          get().tick();
        }, 1000);

        set({
          running: true,
          paused: false,
          startTime: now,
          elapsed: 0,
          intervalId: id,
        });
      },

      pause: () => {
        const state = get();
        if (!state.running || state.paused) return;

        if (state.intervalId) {
          clearInterval(state.intervalId);
        }

        set({ paused: true, running: false, intervalId: null });
      },

      resume: () => {
        const state = get();
        if (state.running || !state.paused) return;

        const id = setInterval(() => {
          get().tick();
        }, 1000);

        set({ running: true, paused: false, intervalId: id });
      },

      stop: async () => {
        const state = get();

        if (state.intervalId) {
          clearInterval(state.intervalId);
        }

        // Save session to API
        if (state.elapsed > 30 && state.startTime) {
          try {
            await fetch("/api/sessions", {
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
          } catch (error) {
            console.error("Failed to save session:", error);
          }
        }

        set({
          running: false,
          paused: false,
          elapsed: 0,
          startTime: null,
          sessionNotes: "",
          intervalId: null,
        });
      },

      reset: () => {
        const state = get();
        if (state.intervalId) {
          clearInterval(state.intervalId);
        }
        set({
          running: false,
          paused: false,
          elapsed: 0,
          startTime: null,
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
      }),
      onRehydrateStorage: () => (state) => {
        // Resume interval if timer was running
        if (state && (state.running || state.paused) && state.elapsed > 0) {
          if (state.running) {
            const id = setInterval(() => {
              state.tick();
            }, 1000);
            state.intervalId = id;
          }
        }
      },
    }
  )
);
