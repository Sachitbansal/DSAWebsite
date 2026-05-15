"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { CheckCircle2, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { DailyReview } from "@/types";

interface ReviewData {
  review: DailyReview | null;
}

const REVIEW_PROMPTS = [
  {
    key: "wentWell" as const,
    label: "What went well today?",
    placeholder: "Problems I solved, concepts I understood...",
    color: "text-emerald-400",
  },
  {
    key: "wastedTime" as const,
    label: "What wasted time?",
    placeholder: "Distractions, unproductive habits...",
    color: "text-red-400",
  },
  {
    key: "wasDifficult" as const,
    label: "What was difficult?",
    placeholder: "Problems I struggled with, concepts I need to revisit...",
    color: "text-amber-400",
  },
  {
    key: "improveNext" as const,
    label: "What to improve tomorrow?",
    placeholder: "Specific actions for next session...",
    color: "text-blue-400",
  },
];

export default function ReviewPage() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    wentWell: "",
    wastedTime: "",
    wasDifficult: "",
    improveNext: "",
  });

  const { data, refetch } = useQuery<ReviewData>({
    queryKey: ["review", selectedDate],
    queryFn: async () => {
      const res = await fetch(`/api/reviews?date=${selectedDate}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  // Load existing review
  useEffect(() => {
    if (data?.review) {
      setForm({
        wentWell: data.review.wentWell ?? "",
        wastedTime: data.review.wastedTime ?? "",
        wasDifficult: data.review.wasDifficult ?? "",
        improveNext: data.review.improveNext ?? "",
      });
    } else {
      setForm({
        wentWell: "",
        wastedTime: "",
        wasDifficult: "",
        improveNext: "",
      });
    }
    setSaved(false);
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date(selectedDate).toISOString(),
          ...form,
        }),
      });
      setSaved(true);
      refetch();
    } finally {
      setSaving(false);
    }
  };

  const navigateDay = (dir: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + dir);
    setSelectedDate(format(current, "yyyy-MM-dd"));
  };

  const isToday = selectedDate === format(new Date(), "yyyy-MM-dd");

  return (
    <AppLayout>
      <div className="p-6 max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-zinc-100">Daily Review</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              End-of-day reflection
            </p>
          </div>

          {/* Date navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDay(-1)}
              className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5 text-sm text-zinc-300">
              <Calendar className="h-4 w-4 text-zinc-500" />
              <span>
                {isToday
                  ? "Today"
                  : format(new Date(selectedDate), "MMM d, yyyy")}
              </span>
            </div>
            <button
              onClick={() => navigateDay(1)}
              disabled={isToday}
              className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Existing review indicator */}
        {data?.review && !saved && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900/50 border border-zinc-800 rounded-md px-3 py-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Review exists for this day — editing will update it
          </div>
        )}

        {saved && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-900 rounded-md px-3 py-2">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Review saved
          </div>
        )}

        {/* Form */}
        <div className="space-y-5">
          {REVIEW_PROMPTS.map(({ key, label, placeholder, color }) => (
            <div key={key} className="space-y-2">
              <Label className={`${color} text-sm`}>{label}</Label>
              <Textarea
                value={form[key]}
                onChange={(e) => {
                  setForm((f) => ({ ...f, [key]: e.target.value }));
                  setSaved(false);
                }}
                placeholder={placeholder}
                className="bg-zinc-900 border-zinc-700 min-h-[100px] resize-y text-sm"
              />
            </div>
          ))}
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? "Saving..." : "Save Review"}
        </Button>
      </div>
    </AppLayout>
  );
}
