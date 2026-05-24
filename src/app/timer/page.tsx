"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { TimerWidget } from "@/components/timer/TimerWidget";

export default function TimerPage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] md:min-h-screen p-4 sm:p-6">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Study Session</h1>
            <p className="text-sm text-zinc-500 mt-1">Track your focused DSA practice time</p>
          </div>
          <TimerWidget />
        </div>
      </div>
    </AppLayout>
  );
}
