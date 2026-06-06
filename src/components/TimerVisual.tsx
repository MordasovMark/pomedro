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

const PIXEL_COLORS = {
  B: "#000000",
  W: "#FFFFFF",
  L: "#D1E8FF",
  C: "#5D3010",
} as const;

/** 30×27 pixel mug — B outline/steam, W body, L shade, c = coffee-fill zone */
const MUG_PIXEL_ART = [
  ".............BB..BB...........",
  ".............B....B...........",
  ".............B....B...........",
  ".............BB..BB...........",
  ".............B....B...........",
  ".............B....B...........",
  "..............................",
  "..............................",
  "..........BBBBBBBBBB..........",
  "........BWWcccccccWWB.........",
  ".......BWLLcccccccLLWB........",
  "......BWLLccccccccLLLWB.......",
  ".....BWLLLccccccccLLLWWB......",
  "....BBBWLcccccccccLWWBBB......",
  "...B..BWLcccccccccLWB..B......",
  "...B..BWLcccccccccLWB..B......",
  "...B..BWLcccccccccLWB..B......",
  "...B..BWLcccccccccLWB..B......",
  "...B..BWLcccccccccLWB..B......",
  "...B..BWLcccccccccLWB..B......",
  "...B..B.Wccccccccc.WB..B......",
  "...B..B.Wccccccccc.WB..B......",
  "....BBB.Wccccccccc.WBBB.......",
  ".......BWLLcccccccLLWB........",
  "........BWLLcccccLLWB.........",
  ".........BWWWWWWWWWB..........",
  "..........BBBBBBBBBB..........",
] as const;

const MUG_W = MUG_PIXEL_ART[0].length;
const MUG_H = MUG_PIXEL_ART.length;

function CoffeeCup({ progress, reducedMotion }: { progress: number; reducedMotion: boolean }) {
  const p = clamp01(progress);

  const { mugRects, steamRects, fillRects, fillThreshold } = useMemo(() => {
    let fillMinY: number = MUG_H;
    let fillMaxY = 0;
    const mugRects: { x: number; y: number; fill: string }[] = [];
    const steamRects: { x: number; y: number }[] = [];
    const fillRects: { x: number; y: number }[] = [];

    for (let y = 0; y < MUG_H; y++) {
      const row = MUG_PIXEL_ART[y];
      for (let x = 0; x < MUG_W; x++) {
        const ch = row[x];
        if (ch === "c") {
          fillRects.push({ x, y });
          fillMinY = Math.min(fillMinY, y);
          fillMaxY = Math.max(fillMaxY, y);
        } else if (ch === "B" && y < 6) {
          steamRects.push({ x, y });
        } else if (ch !== ".") {
          mugRects.push({ x, y, fill: PIXEL_COLORS[ch as keyof typeof PIXEL_COLORS] });
        }
      }
    }

    const fillThreshold = fillMinY + (1 - p) * (fillMaxY - fillMinY + 1);
    return { mugRects, steamRects, fillRects, fillThreshold };
  }, [p]);

  const showSteam = !reducedMotion && p > 0.05;

  return (
    <div className="mx-auto flex h-56 items-center justify-center">
      <svg
        viewBox={`0 0 ${MUG_W} ${MUG_H}`}
        className="h-44 w-40 [image-rendering:pixelated]"
        role="img"
        aria-label="Pixel coffee cup"
      >
        {mugRects.map(({ x, y, fill }) => (
          <rect key={`m-${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />
        ))}
        {fillRects.map(({ x, y }) => (
          <rect
            key={`f-${x}-${y}`}
            x={x}
            y={y}
            width={1}
            height={1}
            fill={y >= fillThreshold ? PIXEL_COLORS.C : PIXEL_COLORS.W}
          />
        ))}
        <g
          className={showSteam ? "pixel-coffee-steam" : undefined}
          style={showSteam ? undefined : { opacity: p > 0 ? 0.7 : 1 }}
        >
          {steamRects.map(({ x, y }) => (
            <rect key={`s-${x}-${y}`} x={x} y={y} width={1} height={1} fill={PIXEL_COLORS.B} />
          ))}
        </g>
      </svg>
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
