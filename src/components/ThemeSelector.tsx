"use client";

import { useEffect, useState } from "react";
import type { TimerTheme } from "@/components/TimerVisual";

const STORAGE_KEY = "pomedro-timer-theme";

const options: { id: TimerTheme; label: string; hint: string }[] = [
  { id: "coffee", label: "Coffee cup", hint: "Liquid rises with progress" },
  { id: "tree", label: "Growing tree", hint: "Branches expand as you focus" },
  { id: "cigarette", label: "Cigarette break", hint: "Smoke only after a work block" },
];

type Props = {
  value: TimerTheme;
  onChange: (theme: TimerTheme) => void;
};

export function ThemeSelector({ value, onChange }: Props) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY) as TimerTheme | null;
      if (raw === "coffee" || raw === "tree" || raw === "cigarette") {
        onChange(raw);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  function select(theme: TimerTheme) {
    onChange(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Theme</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => select(opt.id)}
              className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                active
                  ? "border-sky-500 bg-sky-500/10 text-white"
                  : "border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-600"
              }`}
            >
              <div className="font-medium">{opt.label}</div>
              <div className="mt-1 text-xs text-slate-500">{opt.hint}</div>
            </button>
          );
        })}
      </div>
      {!hydrated ? <p className="text-xs text-slate-600">Restoring saved theme…</p> : null}
    </div>
  );
}
