"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import type { Difficulty, Platform } from "@/types";

interface AddProblemModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TOPICS = [
  "Array", "String", "Hash Map", "Two Pointers", "Sliding Window",
  "Binary Search", "Linked List", "Stack", "Queue", "Tree", "BST",
  "Heap", "Graph", "BFS", "DFS", "Dynamic Programming", "Greedy",
  "Backtracking", "Bit Manipulation", "Math", "Trie", "Segment Tree",
  "DSU", "Monotonic Stack", "Prefix Sum", "Intervals",
];

export function AddProblemModal({
  open,
  onClose,
  onSuccess,
}: AddProblemModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    platform: "LEETCODE" as Platform,
    difficulty: "MEDIUM" as Difficulty,
    topics: [] as string[],
    solvedIndependently: true,
    timeTaken: "",
    confidenceRating: 3,
    notes: "",
    url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          timeTaken: form.timeTaken ? parseInt(form.timeTaken) : null,
          confidenceRating: Number(form.confidenceRating),
        }),
      });

      if (!res.ok) throw new Error("Failed to add problem");

      setForm({
        name: "",
        platform: "LEETCODE",
        difficulty: "MEDIUM",
        topics: [],
        solvedIndependently: true,
        timeTaken: "",
        confidenceRating: 3,
        notes: "",
        url: "",
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topic: string) => {
    setForm((f) => ({
      ...f,
      topics: f.topics.includes(topic)
        ? f.topics.filter((t) => t !== topic)
        : [...f.topics, topic],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Problem</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Problem name */}
          <div className="space-y-1.5">
            <Label>Problem Name *</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Two Sum"
              className="bg-zinc-900 border-zinc-700"
            />
          </div>

          {/* Platform & Difficulty */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Platform</Label>
              <Select
                value={form.platform}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, platform: v as Platform }))
                }
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LEETCODE">LeetCode</SelectItem>
                  <SelectItem value="CODEFORCES">Codeforces</SelectItem>
                  <SelectItem value="ATCODER">AtCoder</SelectItem>
                  <SelectItem value="HACKERRANK">HackerRank</SelectItem>
                  <SelectItem value="GFGS">GeeksForGeeks</SelectItem>
                  <SelectItem value="STRIVER">Striver</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <Select
                value={form.difficulty}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, difficulty: v as Difficulty }))
                }
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Topics */}
          <div className="space-y-1.5">
            <Label>Topics</Label>
            <div className="flex flex-wrap gap-1.5 p-3 bg-zinc-900 border border-zinc-700 rounded-md">
              {TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggleTopic(topic)}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                    form.topics.includes(topic)
                      ? "bg-zinc-700 border-zinc-500 text-zinc-100"
                      : "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* URL */}
          <div className="space-y-1.5">
            <Label>Problem URL</Label>
            <Input
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://leetcode.com/problems/..."
              className="bg-zinc-900 border-zinc-700"
            />
          </div>

          {/* Time & Confidence */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Time Taken (minutes)</Label>
              <Input
                type="number"
                value={form.timeTaken}
                onChange={(e) =>
                  setForm((f) => ({ ...f, timeTaken: e.target.value }))
                }
                placeholder="30"
                className="bg-zinc-900 border-zinc-700"
                min={0}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Confidence (1-5)</Label>
              <Select
                value={String(form.confidenceRating)}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, confidenceRating: Number(v) }))
                }
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Very Low</SelectItem>
                  <SelectItem value="2">2 - Low</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="4">4 - High</SelectItem>
                  <SelectItem value="5">5 - Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Solved independently */}
          <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-md border border-zinc-700">
            <Label className="cursor-pointer">Solved independently</Label>
            <Switch
              checked={form.solvedIndependently}
              onCheckedChange={(v) =>
                setForm((f) => ({ ...f, solvedIndependently: v }))
              }
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Key observations, approach..."
              className="bg-zinc-900 border-zinc-700 h-24 resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-zinc-700"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Problem"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
