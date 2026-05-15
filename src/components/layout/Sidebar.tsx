"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Timer,
  Code2,
  BarChart3,
  BookOpen,
  BookMarked,
  RefreshCw,
  ClipboardCheck,
  Maximize2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTimer } from "@/hooks/useTimer";
import { formatDuration } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    shortcut: "d",
  },
  { label: "Timer", href: "/timer", icon: Timer, shortcut: "t" },
  { label: "Problems", href: "/problems", icon: Code2, shortcut: "p" },
  { label: "Analytics", href: "/analytics", icon: BarChart3, shortcut: "a" },
  { label: "Notes", href: "/notes", icon: BookOpen, shortcut: "n" },
  { label: "Journal", href: "/journal", icon: BookMarked, shortcut: "j" },
  { label: "Revisions", href: "/revisions", icon: RefreshCw, shortcut: "r" },
  { label: "Daily Review", href: "/review", icon: ClipboardCheck, shortcut: "v" },
  { label: "Focus Mode", href: "/focus", icon: Maximize2, shortcut: "f" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { elapsed, running, paused } = useTimer();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger in inputs/textareas
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;

      const item = navItems.find((n) => n.shortcut === e.key.toLowerCase());
      if (item && !e.ctrlKey && !e.metaKey && !e.altKey) {
        router.push(item.href);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-zinc-950 border-r border-zinc-800 transition-all duration-200",
        collapsed ? "w-14" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 h-14 border-b border-zinc-800">
        <div className="flex items-center justify-center w-8 h-8 bg-zinc-800 rounded-md flex-shrink-0">
          <Zap className="h-4 w-4 text-zinc-100" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm text-zinc-100 truncate">
            DSA Tracker
          </span>
        )}
      </div>

      {/* Timer indicator */}
      {(running || paused) && (
        <div
          className={cn(
            "flex items-center gap-2 mx-2 my-2 px-2 py-1.5 rounded-md",
            running ? "bg-emerald-950 border border-emerald-800" : "bg-amber-950 border border-amber-800"
          )}
        >
          <div
            className={cn(
              "w-2 h-2 rounded-full flex-shrink-0",
              running ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
            )}
          />
          {!collapsed && (
            <span className="text-xs font-mono tabular-nums text-zinc-300">
              {formatDuration(elapsed)}
            </span>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors group",
                isActive
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-zinc-100" : "text-zinc-500 group-hover:text-zinc-300"
                )}
              />
              {!collapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
              {!collapsed && (
                <span className="text-[10px] text-zinc-600 font-mono">
                  {item.shortcut}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-zinc-800 px-2 py-2 space-y-0.5">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors group",
            pathname === "/settings"
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
          )}
        >
          <Settings className="h-4 w-4 flex-shrink-0 text-zinc-500 group-hover:text-zinc-300" />
          {!collapsed && <span>Settings</span>}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-2 py-2 rounded-md text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors w-full"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
