"use client";

import { useMemo, useState } from "react";

/** Matches `pomodoro_sessions` rows (work blocks only in current schema). */
export type SessionPoint = {
  started_at: string;
  duration_seconds: number;
};

type Period = "day" | "week" | "month" | "year";

function startOfLocalDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function localDateKey(d: Date) {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatHours(seconds: number) {
  const h = seconds / 3600;
  if (h < 0.05 && seconds > 0) return `${Math.round(seconds / 60)} min`;
  return `${h.toFixed(h >= 10 ? 0 : 1)} h`;
}

function periodRange(period: Period, now = new Date()) {
  const end = new Date(now);
  let start = new Date(now);
  if (period === "day") {
    start = startOfLocalDay(now);
  } else if (period === "week") {
    const day = now.getDay();
    const diffToMonday = (day + 6) % 7;
    start = startOfLocalDay(addDays(now, -diffToMonday));
  } else if (period === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    start = new Date(now.getFullYear(), 0, 1);
  }
  return { start, end };
}

function workSeconds(s: SessionPoint) {
  return Math.max(0, s.duration_seconds);
}

function sumWorkSecondsInRange(sessions: SessionPoint[], start: Date, end: Date) {
  const t0 = start.getTime();
  const t1 = end.getTime();
  return sessions.reduce((acc, s) => {
    const t = new Date(s.started_at).getTime();
    if (t >= t0 && t <= t1) return acc + workSeconds(s);
    return acc;
  }, 0);
}

function buildDailyWorkTotals(sessions: SessionPoint[]) {
  const map = new Map<string, number>();
  for (const s of sessions) {
    const key = localDateKey(new Date(s.started_at));
    const sec = workSeconds(s);
    map.set(key, (map.get(key) ?? 0) + sec);
  }
  return map;
}

function intensityClass(seconds: number, max: number) {
  if (seconds <= 0) return "bg-slate-800/60";
  const p = max > 0 ? seconds / max : 1;
  if (p < 0.25) return "bg-emerald-900/80";
  if (p < 0.5) return "bg-emerald-700/90";
  if (p < 0.75) return "bg-emerald-500/90";
  return "bg-emerald-300/90";
}

export function StatsDashboard({ sessions }: { sessions: SessionPoint[] }) {
  const [period, setPeriod] = useState<Period>("week");

  const dailyTotals = useMemo(() => buildDailyWorkTotals(sessions), [sessions]);

  const { heatmapCells, maxDay } = useMemo(() => {
    const cols = 53;
    const rows = 7;
    const totalDays = cols * rows;
    const end = startOfLocalDay(new Date());
    const start = addDays(end, -(totalDays - 1));
    const cells: { key: string; seconds: number; date: Date }[] = [];
    let maxDay = 0;
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const dayIndex = col * rows + row;
        const date = addDays(start, dayIndex);
        const key = localDateKey(date);
        const seconds = dailyTotals.get(key) ?? 0;
        maxDay = Math.max(maxDay, seconds);
        cells.push({ key, seconds, date });
      }
    }
    return { heatmapCells: cells, maxDay };
  }, [dailyTotals]);

  const periodTotal = useMemo(() => {
    const { start, end } = periodRange(period);
    return sumWorkSecondsInRange(sessions, start, end);
  }, [sessions, period]);

  const tabs: { id: Period; label: string }[] = [
    { id: "day", label: "Day" },
    { id: "week", label: "Week" },
    { id: "month", label: "Month" },
    { id: "year", label: "Year" },
  ];

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Work time</h2>
            <p className="text-sm text-slate-400">Saved Pomodoro work blocks (`duration_seconds`).</p>
          </div>
          <div className="flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setPeriod(t.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  period === t.id ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-6 text-4xl font-semibold tabular-nums text-white">{formatHours(periodTotal)}</p>
        <p className="text-sm text-slate-500">Total focused time in the selected window.</p>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Heatmap</h2>
            <p className="text-sm text-slate-400">Last {53 * 7} days · local dates · seconds per day</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Less</span>
            <span className="h-3 w-3 rounded-sm bg-slate-800/60" />
            <span className="h-3 w-3 rounded-sm bg-emerald-900/80" />
            <span className="h-3 w-3 rounded-sm bg-emerald-700/90" />
            <span className="h-3 w-3 rounded-sm bg-emerald-500/90" />
            <span className="h-3 w-3 rounded-sm bg-emerald-300/90" />
            <span>More</span>
          </div>
        </div>
        <div
          className="mt-4 grid w-full max-w-full gap-[3px] overflow-x-auto"
          style={{ gridTemplateColumns: "repeat(53, minmax(0, 1fr))" }}
          role="img"
          aria-label="Daily work time heatmap"
        >
          {heatmapCells.map((cell) => (
            <div
              key={cell.key}
              title={`${cell.key} · ${formatHours(cell.seconds)}`}
              className={`aspect-square rounded-[2px] ${intensityClass(cell.seconds, maxDay)}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
