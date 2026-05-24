"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Timer,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTimer } from "@/hooks/useTimer";
import { formatDuration } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, shortcut: "d" },
  { label: "Timer", href: "/timer", icon: Timer, shortcut: "t" },
  { label: "Analytics", href: "/analytics", icon: BarChart3, shortcut: "a" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { elapsed, running, paused } = useTimer();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      const item = navItems.find((n) => n.shortcut === e.key.toLowerCase());
      if (item && !e.ctrlKey && !e.metaKey && !e.altKey) {
        router.push(item.href);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen bg-zinc-950 border-r border-zinc-800/60 transition-all duration-200 flex-shrink-0",
          collapsed ? "w-14" : "w-52"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-3 h-14 border-b border-zinc-800/60">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-600/20 border border-blue-500/30 rounded-lg flex-shrink-0">
            <Zap className="h-4 w-4 text-blue-400" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm text-zinc-100 truncate">DSA Tracker</span>
          )}
        </div>

        {/* Timer indicator */}
        {(running || paused) && (
          <div className={cn(
            "flex items-center gap-2 mx-2 mt-2 px-2 py-1.5 rounded-md border",
            running ? "bg-emerald-950/50 border-emerald-800/50" : "bg-amber-950/50 border-amber-800/50"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full flex-shrink-0",
              running ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
            )} />
            {!collapsed && (
              <span className="text-xs font-mono tabular-nums text-zinc-300">{formatDuration(elapsed)}</span>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-all group",
                  isActive
                    ? "bg-blue-600/15 text-zinc-100 border border-blue-500/20"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-blue-400" : "text-zinc-600 group-hover:text-zinc-400"
                )} />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {!collapsed && (
                  <span className="text-[10px] text-zinc-700 font-mono">{item.shortcut}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: signout + collapse */}
        <div className="border-t border-zinc-800/60 px-2 py-2 space-y-0.5">
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="flex items-center gap-3 px-2 py-2 rounded-md text-sm text-zinc-600 hover:text-red-400 hover:bg-red-950/30 transition-colors w-full"
            title={collapsed ? "Sign Out" : undefined}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-2 py-2 rounded-md text-sm text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors w-full"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 border-t border-zinc-800/60 backdrop-blur-sm">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors",
                  isActive ? "text-blue-400" : "text-zinc-600 hover:text-zinc-300"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg text-zinc-600 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-[10px] font-medium">Sign Out</span>
          </button>
        </div>
      </nav>
    </>
  );
}
