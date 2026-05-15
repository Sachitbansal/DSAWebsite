"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { TimerWidget } from "@/components/timer/TimerWidget";
import Link from "next/link";
import { Maximize2 } from "lucide-react";

export default function TimerPage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-screen p-6 relative">
        {/* Focus mode link */}
        <Link
          href="/focus"
          className="absolute top-6 right-6 flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          Focus Mode
        </Link>

        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <h1 className="text-lg font-medium text-zinc-300">Study Session</h1>
            <p className="text-sm text-zinc-600 mt-1">
              Track focused DSA time
            </p>
          </div>
          <TimerWidget />
        </div>
      </div>
    </AppLayout>
  );
}
