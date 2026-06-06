"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ThemeSelector } from "@/components/ThemeSelector";
import { TimerVisual, type Phase, type TimerTheme } from "@/components/TimerVisual";

const DEFAULT_WORK_MIN = 25;
const WORK_MIN = 5;
const WORK_MAX = 120;
const SHORT_BREAK_SEC = 5 * 60;
const LONG_BREAK_SEC = 15 * 60;

function clampWorkMinutes(value: number) {
  return Math.min(WORK_MAX, Math.max(WORK_MIN, Math.round(value)));
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function phaseLabel(phase: Phase) {
  switch (phase) {
    case "work":
      return "Focus";
    case "short_break":
      return "Short break";
    case "long_break":
      return "Long break";
    default:
      return "";
  }
}

export function PomodoroTimer() {
  const [phase, setPhase] = useState<Phase>("work");
  const [workMinutes, setWorkMinutes] = useState(DEFAULT_WORK_MIN);
  const [remaining, setRemaining] = useState(DEFAULT_WORK_MIN * 60);
  const [running, setRunning] = useState(false);
  const [taskLabel, setTaskLabel] = useState("");
  const [theme, setTheme] = useState<TimerTheme>("coffee");
  const [workCompleteSmoke, setWorkCompleteSmoke] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const workStartedAtRef = useRef<number | null>(null);
  const completedWorkRef = useRef(0);
  const finishingRef = useRef(false);

  const workSec = workMinutes * 60;

  const totalForPhase = useMemo(() => {
    if (phase === "work") return workSec;
    if (phase === "long_break") return LONG_BREAK_SEC;
    return SHORT_BREAK_SEC;
  }, [phase, workSec]);

  const progress = useMemo(() => {
    if (totalForPhase <= 0) return 0;
    return Math.min(1, Math.max(0, (totalForPhase - remaining) / totalForPhase));
  }, [remaining, totalForPhase]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((r) => (r <= 0 ? 0 : r - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const finishPhase = useCallback(async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    try {
      setRunning(false);
      setSaveError(null);

      if (phase === "work") {
        try {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            const end = Date.now();
            const capSec = workMinutes * 60;
            const startMs = workStartedAtRef.current ?? end - capSec * 1000;
            const duration_seconds = Math.max(
              1,
              Math.min(capSec, Math.round((end - startMs) / 1000)),
            );
            const { error } = await supabase.from("pomodoro_sessions").insert({
              user_id: user.id,
              started_at: new Date(startMs).toISOString(),
              completed_at: new Date(end).toISOString(),
              duration_seconds,
              task_label: taskLabel.trim() || "Untitled task",
            });
            if (error) setSaveError(error.message);
          }
        } catch (e) {
          setSaveError(e instanceof Error ? e.message : "Could not save session");
        }

        completedWorkRef.current += 1;
        const isLongBreak = completedWorkRef.current % 4 === 0;
        workStartedAtRef.current = null;
        setWorkCompleteSmoke(true);
        window.setTimeout(() => setWorkCompleteSmoke(false), 2600);

        setPhase(isLongBreak ? "long_break" : "short_break");
        setRemaining(isLongBreak ? LONG_BREAK_SEC : SHORT_BREAK_SEC);
        setRunning(true);
      } else {
        setPhase("work");
        setRemaining(workMinutes * 60);
        setRunning(false);
        workStartedAtRef.current = null;
      }
    } finally {
      finishingRef.current = false;
    }
  }, [phase, taskLabel, workMinutes]);

  useEffect(() => {
    if (!running || remaining > 0) return;
    void finishPhase();
  }, [running, remaining, finishPhase]);

  function startTimer() {
    if (phase === "work" && !workStartedAtRef.current) {
      workStartedAtRef.current = Date.now();
    }
    setRunning(true);
  }

  function pauseTimer() {
    setRunning(false);
  }

  function resetPhaseTimer() {
    setRunning(false);
    setRemaining(
      phase === "work" ? workMinutes * 60 : phase === "long_break" ? LONG_BREAK_SEC : SHORT_BREAK_SEC,
    );
    if (phase === "work") {
      workStartedAtRef.current = null;
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <TimerVisual
          theme={theme}
          phase={phase}
          progress={progress}
          workCompleteSmoke={workCompleteSmoke}
          reducedMotion={reducedMotion}
        />

        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{phaseLabel(phase)}</p>
              <p
                className="mt-2 text-5xl font-semibold tabular-nums tracking-tight text-white sm:text-6xl"
                aria-live="polite"
                aria-atomic="true"
              >
                {formatTime(remaining)}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {phase === "work"
                  ? `${workMinutes}m focus · breaks 5m, long 15m every 4th completion`
                  : phase === "long_break"
                    ? "Long break — stretch and reset"
                    : "Short break — breathe"}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs text-slate-400">
                  <span className="text-slate-300">Focus length (minutes)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={WORK_MIN}
                      max={WORK_MAX}
                      step={1}
                      value={workMinutes}
                      disabled={phase === "work" && running}
                      onChange={(e) => {
                        const next = clampWorkMinutes(Number(e.target.value));
                        setWorkMinutes(next);
                        if (phase === "work" && !running) {
                          setRemaining(next * 60);
                        }
                      }}
                      className="h-2 w-full min-w-[8rem] cursor-pointer accent-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <input
                      type="number"
                      min={WORK_MIN}
                      max={WORK_MAX}
                      step={1}
                      value={workMinutes}
                      disabled={phase === "work" && running}
                      onChange={(e) => {
                        const raw = Number(e.target.value);
                        if (Number.isNaN(raw)) return;
                        const next = clampWorkMinutes(raw);
                        setWorkMinutes(next);
                        if (phase === "work" && !running) {
                          setRemaining(next * 60);
                        }
                      }}
                      className="w-16 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-center text-sm text-white tabular-nums outline-none ring-sky-500/30 focus:ring-2 disabled:opacity-50"
                      aria-label="Focus length in minutes"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {WORK_MIN}–{WORK_MAX} minutes{phase === "work" && running ? " · pause to adjust" : ""}
                  </span>
                </label>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={running ? pauseTimer : startTimer}
                className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400"
              >
                {running ? "Pause" : "Start"}
              </button>
              <button
                type="button"
                onClick={resetPhaseTimer}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
              >
                Reset phase
              </button>
            </div>
          </div>

          <label className="mt-6 block space-y-2 text-sm">
            <span className="text-slate-300">Task label</span>
            <input
              value={taskLabel}
              onChange={(e) => setTaskLabel(e.target.value)}
              placeholder="Deep work, inbox, design spec…"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-sky-500/30 focus:ring-2"
            />
          </label>

          {saveError ? <p className="mt-3 text-sm text-rose-400">{saveError}</p> : null}
        </div>
      </div>

      <aside className="space-y-6">
        <ThemeSelector value={theme} onChange={setTheme} />
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4 text-sm text-slate-400">
          <p className="font-medium text-slate-200">Rhythm</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Completing a work block saves to Supabase when you are signed in (RLS).</li>
            <li>After four finished work blocks, the next break is 15 minutes.</li>
            <li>Breaks start automatically; a new work block waits for Start.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
