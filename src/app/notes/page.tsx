"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Plus, BookOpen, Edit2, Trash2, Save, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { AlgorithmNote } from "@/types";

interface NotesData {
  notes: AlgorithmNote[];
}

const CATEGORIES = [
  "Arrays & Strings",
  "Binary Search",
  "Two Pointers",
  "Sliding Window",
  "Linked List",
  "Stack & Queue",
  "Trees",
  "Graphs",
  "Dynamic Programming",
  "Greedy",
  "Backtracking",
  "Heap / Priority Queue",
  "Trie",
  "Segment Tree",
  "DSU",
  "Number Theory",
  "Bit Manipulation",
  "Intervals",
  "Other",
];

interface NoteFormData {
  category: string;
  title: string;
  content: string;
  tricks: string;
  edgeCases: string;
  templates: string;
}

export default function NotesPage() {
  const [selectedNote, setSelectedNote] = useState<AlgorithmNote | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<NoteFormData>({
    category: CATEGORIES[0],
    title: "",
    content: "",
    tricks: "",
    edgeCases: "",
    templates: "",
  });

  const { data, isLoading, refetch } = useQuery<NotesData>({
    queryKey: ["notes"],
    queryFn: async () => {
      const res = await fetch("/api/notes");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const notes = data?.notes ?? [];

  // Group by category
  const categorized: Record<string, AlgorithmNote[]> = {};
  notes.forEach((note) => {
    if (!categorized[note.category]) categorized[note.category] = [];
    categorized[note.category].push(note);
  });

  const filteredNotes =
    selectedCategory === "all"
      ? notes
      : categorized[selectedCategory] ?? [];

  const handleCreateNew = () => {
    setForm({
      category: CATEGORIES[0],
      title: "",
      content: "",
      tricks: "",
      edgeCases: "",
      templates: "",
    });
    setIsCreating(true);
    setIsEditing(false);
    setSelectedNote(null);
  };

  const handleEdit = (note: AlgorithmNote) => {
    setForm({
      category: note.category,
      title: note.title,
      content: note.content,
      tricks: note.tricks ?? "",
      edgeCases: note.edgeCases ?? "",
      templates: note.templates ?? "",
    });
    setSelectedNote(note);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isCreating) {
        await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            codeSnippets: [],
            complexity: {},
          }),
        });
      } else if (isEditing && selectedNote) {
        await fetch(`/api/notes/${selectedNote.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      await refetch();
      setIsEditing(false);
      setIsCreating(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (note: AlgorithmNote) => {
    if (!confirm("Delete this note?")) return;
    await fetch(`/api/notes/${note.id}`, { method: "DELETE" });
    if (selectedNote?.id === note.id) setSelectedNote(null);
    refetch();
  };

  return (
    <AppLayout>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="w-60 border-r border-zinc-800 flex flex-col bg-zinc-950">
          <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-300">Notes</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCreateNew}
              className="h-7 w-7 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="overflow-y-auto flex-1 py-1">
            {/* All */}
            <button
              onClick={() => setSelectedCategory("all")}
              className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                selectedCategory === "all"
                  ? "text-zinc-100 bg-zinc-800"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              All Notes ({notes.length})
            </button>

            {/* Categories */}
            {Object.entries(categorized).map(([cat, catNotes]) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                  selectedCategory === cat
                    ? "text-zinc-100 bg-zinc-800"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {cat} ({catNotes.length})
              </button>
            ))}
          </div>
        </div>

        {/* Note list */}
        <div className="w-56 border-r border-zinc-800 flex flex-col bg-zinc-950">
          <div className="p-3 border-b border-zinc-800">
            <p className="text-xs text-zinc-500">
              {filteredNotes.length} notes
            </p>
          </div>
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="p-3 space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-zinc-800/50 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="p-4 text-center text-zinc-600 text-xs">
                No notes yet
              </div>
            ) : (
              filteredNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => {
                    setSelectedNote(note);
                    setIsEditing(false);
                    setIsCreating(false);
                  }}
                  className={`w-full text-left px-3 py-3 border-b border-zinc-800/50 transition-colors ${
                    selectedNote?.id === note.id
                      ? "bg-zinc-800"
                      : "hover:bg-zinc-900"
                  }`}
                >
                  <p className="text-sm text-zinc-200 truncate">{note.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 truncate">
                    {note.category}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-y-auto">
          {isCreating || isEditing ? (
            <div className="p-6 max-w-3xl space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-medium text-zinc-100">
                  {isCreating ? "New Note" : "Edit Note"}
                </h2>
                <div className="ml-auto flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving || !form.title}
                    size="sm"
                  >
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setIsCreating(false);
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                  >
                    <SelectTrigger className="bg-zinc-900 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    placeholder="e.g. BFS Template"
                    className="bg-zinc-900 border-zinc-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Content (Markdown)</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, content: e.target.value }))
                  }
                  placeholder="Write notes in markdown..."
                  className="bg-zinc-900 border-zinc-700 min-h-[250px] font-mono text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Common Tricks</Label>
                <Textarea
                  value={form.tricks}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tricks: e.target.value }))
                  }
                  placeholder="Key patterns and tricks..."
                  className="bg-zinc-900 border-zinc-700 min-h-[80px] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Edge Cases</Label>
                  <Textarea
                    value={form.edgeCases}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, edgeCases: e.target.value }))
                    }
                    placeholder="Watch out for..."
                    className="bg-zinc-900 border-zinc-700 min-h-[80px] text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Templates</Label>
                  <Textarea
                    value={form.templates}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, templates: e.target.value }))
                    }
                    placeholder="Reusable code templates..."
                    className="bg-zinc-900 border-zinc-700 min-h-[80px] font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          ) : selectedNote ? (
            <div className="p-6 max-w-3xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">
                    {selectedNote.category}
                  </p>
                  <h2 className="text-xl font-semibold text-zinc-100">
                    {selectedNote.title}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(selectedNote)}
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(selectedNote)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {selectedNote.content && (
                <div className="markdown-content prose-sm mb-6">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedNote.content}
                  </ReactMarkdown>
                </div>
              )}

              {selectedNote.tricks && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Tricks
                  </h3>
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                    {selectedNote.tricks}
                  </p>
                </div>
              )}

              {selectedNote.edgeCases && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Edge Cases
                  </h3>
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                    {selectedNote.edgeCases}
                  </p>
                </div>
              )}

              {selectedNote.templates && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Templates
                  </h3>
                  <pre className="text-xs font-mono text-zinc-300 bg-zinc-900 p-3 rounded-md overflow-x-auto">
                    {selectedNote.templates}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-600">
              <BookOpen className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-base mb-1">Select a note</p>
              <p className="text-sm">or create a new one</p>
              <Button
                variant="outline"
                className="mt-4 border-zinc-700"
                onClick={handleCreateNew}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
