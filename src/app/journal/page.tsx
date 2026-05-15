"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JournalEntryCard, JournalEntryForm } from "@/components/journal/JournalEntry";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, BookMarked } from "lucide-react";
import type { JournalEntry } from "@/types";

interface JournalData {
  entries: JournalEntry[];
}

export default function JournalPage() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const { data, refetch } = useQuery<JournalData>({
    queryKey: ["journal", search],
    queryFn: async () => {
      const url = search ? `/api/journal?q=${encodeURIComponent(search)}` : "/api/journal";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const entries = data?.entries ?? [];

  const handleCreate = async (formData: Partial<JournalEntry>) => {
    await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setShowForm(false);
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/journal/${id}`, { method: "DELETE" });
    refetch();
  };

  const handleUpdate = async (id: string, formData: Partial<JournalEntry>) => {
    await fetch(`/api/journal/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    refetch();
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-5 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">
              Mistake Journal
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              {entries.length} entries — learn from every mistake
            </p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              New Entry
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entries..."
            className="pl-9 bg-zinc-900 border-zinc-700"
          />
        </div>

        {/* Create form */}
        {showForm && (
          <div className="border border-zinc-700 rounded-lg p-5 bg-zinc-900/50">
            <h2 className="text-base font-medium text-zinc-200 mb-4">
              New Journal Entry
            </h2>
            <JournalEntryForm
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Entries list */}
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
            <BookMarked className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-base mb-1">No journal entries yet</p>
            <p className="text-sm mb-4">
              Document your mistakes to learn faster
            </p>
            <Button onClick={() => setShowForm(true)} variant="outline">
              Write your first entry
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <JournalEntryCard
                key={entry.id}
                entry={entry}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
