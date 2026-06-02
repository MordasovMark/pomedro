"use client";

import { useMemo } from "react";

export type TimerTheme = "coffee" | "tree" | "cigarette";
export type Phase = "work" | "short_break" | "long_break";

type TimerVisualProps = {
  theme: TimerTheme;
  phase: Phase;
  /** 0–1 elapsed fraction of the active phase */
  progress: number;
  /** Cigarette theme: show subtle smoke after a work block completes */
  workCompleteSmoke: boolean;
  reducedMotion: boolean;
};

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function CoffeeCup({ progress, reducedMotion }: { progress: number; reducedMotion: boolean }) {
  const p = clamp01(progress);
  return (
    <div className="relative mx-auto flex h-56 w-40 items-end justify-center">
      <div className="relative h-44 w-32 overflow-hidden rounded-b-3xl border-2 border-amber-900/60 bg-slate-900/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-900 via-amber-700 to-amber-500/90 ${
            reducedMotion ? "" : "transition-[height] duration-700 ease-out"
          }`}
          style={{ height: `${p * 100}%` }}
        />
        <div className="pointer-events-none absolute inset-x-4 top-6 h-3 rounded-full bg-white/10 blur-sm" />
      </div>
      <div className="absolute -right-6 bottom-10 h-3 w-10 rounded-full bg-amber-900/40" aria-hidden />
    </div>
  );
}

function GrowingTree({ progress, reducedMotion }: { progress: number; reducedMotion: boolean }) {
  const p = clamp01(progress);
  const scale = 0.35 + p * 0.85;
  return (
    <div className="mx-auto flex h-56 items-end justify-center">
      <svg
        viewBox="0 0 120 140"
        className="h-52 w-44 text-emerald-400"
        role="img"
        aria-label="Growing tree visual"
      >
        <defs>
          <linearGradient id="trunk" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3f2e1f" />
            <stop offset="100%" stopColor="#2a1d14" />
          </linearGradient>
          <linearGradient id="leaf" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <g
          style={{
            transformOrigin: "60px 120px",
            transform: `scale(${scale})`,
            transition: reducedMotion ? "none" : "transform 900ms ease-out",
          }}
        >
          <rect x="54" y="70" width="12" height="50" fill="url(#trunk)" rx="2" />
          <circle cx="60" cy="52" r="26" fill="url(#leaf)" opacity="0.95" />
          <circle cx="44" cy="64" r="16" fill="url(#leaf)" opacity="0.85" />
          <circle cx="78" cy="62" r="18" fill="url(#leaf)" opacity="0.88" />
        </g>
        <ellipse cx="60" cy="128" rx="40" ry="6" fill="rgba(15,23,42,0.55)" />
      </svg>
    </div>
  );
}

function SmokePuff({ delay, reducedMotion }: { delay: number; reducedMotion: boolean }) {
  return (
    <span
      className="pointer-events-none absolute bottom-8 left-1/2 h-10 w-10 -translate-x-1/2 rounded-full bg-slate-200/25 blur-md"
      style={
        reducedMotion
          ? { opacity: 0.35 }
          : {
              animation: `pomedro-smoke 2.4s ease-out ${delay}ms forwards`,
            }
      }
    />
  );
}

function CigaretteBreak({
  progress,
  workCompleteSmoke,
  reducedMotion,
}: {
  progress: number;
  workCompleteSmoke: boolean;
  reducedMotion: boolean;
}) {
  const p = clamp01(progress);
  const lit = workCompleteSmoke;

  return (
    <div className="relative mx-auto flex h-56 w-full max-w-sm flex-col items-center justify-end pb-6">
      <div className="relative flex w-56 items-center">
        {workCompleteSmoke ? (
          <div className="pointer-events-none absolute -top-10 left-1/2 h-24 w-24 -translate-x-1/2">
            {!reducedMotion ? (
              <>
                <SmokePuff delay={0} reducedMotion={reducedMotion} />
                <SmokePuff delay={220} reducedMotion={reducedMotion} />
                <SmokePuff delay={440} reducedMotion={reducedMotion} />
              </>
            ) : (
              <span className="absolute bottom-0 left-1/2 h-12 w-16 -translate-x-1/2 rounded-full bg-slate-300/20 blur-lg" />
            )}
          </div>
        ) : null}
        <div className="h-2 w-40 rounded-full bg-gradient-to-r from-slate-700 via-slate-200 to-amber-100 shadow-inner" />
        <div
          className="absolute right-10 h-3 w-3 rounded-full bg-orange-500 shadow-[0_0_18px_rgba(251,146,60,0.9)] transition-opacity duration-300"
          style={{ opacity: lit ? 1 : 0.15 + p * 0.35 }}
          aria-hidden
        />
      </div>
      <p className="mt-4 text-center text-xs text-slate-500">
        Stylized prop — not endorsing smoking. Smoke appears briefly after a finished work block.
      </p>
    </div>
  );
}

export function TimerVisual({ theme, phase, progress, workCompleteSmoke, reducedMotion }: TimerVisualProps) {
  const body = useMemo(() => {
    switch (theme) {
      case "coffee":
        return <CoffeeCup progress={progress} reducedMotion={reducedMotion} />;
      case "tree":
        return <GrowingTree progress={progress} reducedMotion={reducedMotion} />;
      case "cigarette":
        return (
          <CigaretteBreak
            progress={progress}
            workCompleteSmoke={workCompleteSmoke}
            reducedMotion={reducedMotion}
          />
        );
      default:
        return <CoffeeCup progress={progress} reducedMotion={reducedMotion} />;
    }
  }, [theme, progress, workCompleteSmoke, reducedMotion]);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/50 p-4 shadow-inner">{body}</div>
  );
}
