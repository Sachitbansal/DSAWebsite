"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession, signOut } from "next-auth/react";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-2xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Settings</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            App configuration
          </p>
        </div>

        {/* Account */}
        <Card className="bg-zinc-900/30 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                value={session?.user?.email ?? ""}
                readOnly
                className="bg-zinc-900 border-zinc-700 opacity-60"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                defaultValue={session?.user?.name ?? ""}
                className="bg-zinc-900 border-zinc-700"
                placeholder="Your name"
              />
            </div>
            <Button
              variant="outline"
              className="border-red-900 text-red-400 hover:bg-red-950"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="bg-zinc-900/30 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-200">Revision Reminders</p>
                <p className="text-xs text-zinc-500">
                  Browser notifications for due revisions
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-200">Auto-save Sessions</p>
                <p className="text-xs text-zinc-500">
                  Automatically save sessions &gt;30s
                </p>
              </div>
              <Switch checked={autoSave} onCheckedChange={setAutoSave} />
            </div>
          </CardContent>
        </Card>

        {/* Keyboard shortcuts */}
        <Card className="bg-zinc-900/30 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Keyboard Shortcuts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { key: "d", label: "Dashboard" },
                { key: "t", label: "Timer" },
                { key: "p", label: "Problems" },
                { key: "a", label: "Analytics" },
                { key: "n", label: "Notes" },
                { key: "j", label: "Journal" },
                { key: "r", label: "Revisions" },
                { key: "f", label: "Focus Mode" },
                { key: "v", label: "Daily Review" },
              ].map(({ key, label }) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-1.5 px-3 rounded-md bg-zinc-900/50"
                >
                  <span className="text-zinc-400">{label}</span>
                  <kbd className="text-xs font-mono bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded text-zinc-300">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data */}
        <Card className="bg-zinc-900/30 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-zinc-500">
              Export your data or manage your account.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-zinc-700"
                size="sm"
                onClick={async () => {
                  const res = await fetch("/api/analytics");
                  const data = await res.json();
                  const blob = new Blob([JSON.stringify(data, null, 2)], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "dsa-tracker-analytics.json";
                  a.click();
                }}
              >
                Export Analytics JSON
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
