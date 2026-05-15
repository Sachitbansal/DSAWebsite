"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { JournalEntry as JournalEntryType } from "@/types";
import { formatRelativeDate } from "@/lib/utils";
import { ChevronDown, ChevronUp, Tag, Edit2, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface JournalEntryProps {
  entry: JournalEntryType;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<JournalEntryType>) => void;
}

interface JournalFormProps {
  onSubmit: (data: Partial<JournalEntryType>) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<JournalEntryType>;
}

export function JournalEntryCard({ entry, onDelete, onUpdate }: JournalEntryProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);

  const fields = [
    { key: "initialThought", label: "Initial Thought" },
    { key: "stuckPoint", label: "Where I Got Stuck" },
    { key: "wrongIntuition", label: "Wrong Intuition" },
    { key: "correctIntuition", label: "Correct Intuition" },
    { key: "missedPattern", label: "Missed Pattern" },
    { key: "implementationBug", label: "Implementation Bug" },
    { key: "edgeCaseMissed", label: "Edge Case Missed" },
    { key: "learningOutcome", label: "Learning Outcome" },
  ] as const;

  if (editing) {
    return (
      <div className="border border-zinc-700 rounded-lg p-4">
        <JournalEntryForm
          initialData={entry}
          onSubmit={async (data) => {
            await onUpdate(entry.id, data);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-colors">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-zinc-100 truncate">{entry.title}</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-zinc-500">
              {formatRelativeDate(entry.createdAt)}
            </span>
            {entry.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3 text-zinc-600" />
                <span className="text-xs text-zinc-500">
                  {entry.tags.slice(0, 3).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(entry.id);
            }}
            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-zinc-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-zinc-800 p-4 space-y-3">
          {fields.map(({ key, label }) => {
            const value = entry[key];
            if (!value) return null;
            return (
              <div key={key}>
                <p className="text-xs font-medium text-zinc-500 mb-1">{label}</p>
                <div className="text-sm text-zinc-300 markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {value}
                  </ReactMarkdown>
                </div>
              </div>
            );
          })}

          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-800">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-zinc-800 rounded text-zinc-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function JournalEntryForm({
  onSubmit,
  onCancel,
  initialData,
}: JournalFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    initialThought: initialData?.initialThought ?? "",
    stuckPoint: initialData?.stuckPoint ?? "",
    wrongIntuition: initialData?.wrongIntuition ?? "",
    correctIntuition: initialData?.correctIntuition ?? "",
    missedPattern: initialData?.missedPattern ?? "",
    implementationBug: initialData?.implementationBug ?? "",
    edgeCaseMissed: initialData?.edgeCaseMissed ?? "",
    learningOutcome: initialData?.learningOutcome ?? "",
    tags: initialData?.tags?.join(", ") ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "initialThought" as const, label: "What I Initially Thought", placeholder: "My first approach was..." },
    { key: "stuckPoint" as const, label: "Where I Got Stuck", placeholder: "I got confused when..." },
    { key: "wrongIntuition" as const, label: "Wrong Intuition", placeholder: "I incorrectly thought that..." },
    { key: "correctIntuition" as const, label: "Correct Intuition", placeholder: "The right approach is..." },
    { key: "missedPattern" as const, label: "Missed Pattern", placeholder: "The pattern I missed was..." },
    { key: "implementationBug" as const, label: "Implementation Bug", placeholder: "The bug was..." },
    { key: "edgeCaseMissed" as const, label: "Edge Case Missed", placeholder: "I forgot to handle..." },
    { key: "learningOutcome" as const, label: "Learning Outcome *", placeholder: "Key takeaway: ..." },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Title *</Label>
        <Input
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Problem name or topic"
          className="bg-zinc-900 border-zinc-700"
        />
      </div>

      {fields.map(({ key, label, placeholder }) => (
        <div key={key} className="space-y-1.5">
          <Label>{label}</Label>
          <Textarea
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            placeholder={placeholder}
            className="bg-zinc-900 border-zinc-700 h-20 resize-none text-sm"
          />
        </div>
      ))}

      <div className="space-y-1.5">
        <Label>Tags (comma-separated)</Label>
        <Input
          value={form.tags}
          onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          placeholder="dp, graph, two-pointers"
          className="bg-zinc-900 border-zinc-700"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : initialData?.title ? "Update Entry" : "Add Entry"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-zinc-700"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
