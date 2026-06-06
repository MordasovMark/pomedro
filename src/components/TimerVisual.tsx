"use client";

import { useMemo, type CSSProperties, type ReactNode } from "react";

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

/** Solid pixel colors matching reference art */
const CIG_FILTER = "#f9a602";
const CIG_PAPER = "#f2efe4";
const CIG_ASH = "#4b4b4b";
const CIG_EMBER = "#ff3b00";

const PIX = 8;
const FILTER_COLS = 4;
const BODY_COLS = 24;
const ASH_COLS = 1;
const EMBER_COLS = 1;
const CIG_ROWS = 3;
const TOTAL_COLS = FILTER_COLS + BODY_COLS + ASH_COLS + EMBER_COLS;

/** Smoke voxels: ox = cells left from tip, oy = cells up from tip; dx/dy = end drift (cell units) */
const SMOKE_PIXELS: { ox: number; oy: number; color: string; delay: number; dx: number; dy: number }[] = [
  { ox: 0, oy: 0, color: "#a8a8a8", delay: 0, dx: 0, dy: -9 },
  { ox: 1, oy: 1, color: "#808080", delay: 60, dx: 2, dy: -11 },
  { ox: 0, oy: 2, color: "#9ca3af", delay: 120, dx: -3, dy: -12 },
  { ox: -1, oy: 2, color: "#6b7280", delay: 180, dx: 1, dy: -14 },
  { ox: 2, oy: 1, color: "#d1d5db", delay: 100, dx: 4, dy: -10 },
  { ox: -1, oy: 3, color: "#78716c", delay: 200, dx: -2, dy: -15 },
  { ox: 1, oy: 3, color: "#a3a3a3", delay: 260, dx: 3, dy: -16 },
  { ox: 0, oy: 4, color: "#737373", delay: 320, dx: 0, dy: -18 },
  { ox: -1, oy: 4, color: "#57534e", delay: 380, dx: -4, dy: -17 },
  { ox: 2, oy: 4, color: "#d4d4d4", delay: 280, dx: 5, dy: -14 },
  { ox: 1, oy: 5, color: "#a8a8a8", delay: 440, dx: 2, dy: -20 },
  { ox: 0, oy: 6, color: "#9ca3af", delay: 500, dx: 0, dy: -22 },
  { ox: -1, oy: 5, color: "#71717a", delay: 400, dx: -3, dy: -19 },
  { ox: 2, oy: 6, color: "#e5e5e5", delay: 520, dx: 6, dy: -18 },
];

function CigarettePixelGrid({
  progress,
  workCompleteSmoke,
}: {
  progress: number;
  workCompleteSmoke: boolean;
}) {
  const p = clamp01(progress);
  const emberGlow = workCompleteSmoke ? 1 : 0.28 + p * 0.72;

  const cells: ReactNode[] = [];
  for (let r = 0; r < CIG_ROWS; r++) {
    for (let c = 0; c < TOTAL_COLS; c++) {
      let bg = CIG_PAPER;
      if (c < FILTER_COLS) bg = CIG_FILTER;
      else if (c < FILTER_COLS + BODY_COLS) bg = CIG_PAPER;
      else if (c < FILTER_COLS + BODY_COLS + ASH_COLS) bg = CIG_ASH;
      else bg = CIG_EMBER;

      const isEmber = c >= FILTER_COLS + BODY_COLS + ASH_COLS;
      cells.push(
        <div
          key={`${r}-${c}`}
          className="box-border shrink-0 border-0"
          style={{
            width: PIX,
            height: PIX,
            backgroundColor: bg,
            opacity: isEmber ? emberGlow : 1,
            imageRendering: "pixelated",
          }}
          aria-hidden
        />,
      );
    }
  }

  const w = TOTAL_COLS * PIX;
  const h = CIG_ROWS * PIX;

  return (
    <div
      className="grid gap-0 overflow-visible border border-slate-600/80 shadow-[2px_2px_0_0_rgba(0,0,0,0.35)]"
      style={{
        gridTemplateColumns: `repeat(${TOTAL_COLS}, ${PIX}px)`,
        gridTemplateRows: `repeat(${CIG_ROWS}, ${PIX}px)`,
        width: w,
        height: h,
        imageRendering: "pixelated",
      }}
    >
      {cells}
    </div>
  );
}

function CigarettePixelSmoke({
  reducedMotion,
  active,
}: {
  reducedMotion: boolean;
  active: boolean;
}) {
  if (!active) return null;

  const smokeH = 12 * PIX;

  return (
    <div
      className="pointer-events-none absolute bottom-full left-0 z-10 overflow-visible"
      style={{
        width: TOTAL_COLS * PIX,
        height: smokeH,
        imageRendering: "pixelated",
      }}
      aria-hidden
    >
      {SMOKE_PIXELS.map((s, i) => {
        const vars = {
          "--smoke-dx": `${s.dx * PIX}px`,
          "--smoke-dy": `${s.dy * PIX}px`,
        } as CSSProperties;
        const style: CSSProperties = {
          position: "absolute",
          right: s.ox * PIX,
          bottom: s.oy * PIX,
          width: PIX,
          height: PIX,
          backgroundColor: s.color,
          imageRendering: "pixelated",
          ...vars,
        };
        if (reducedMotion) {
          style.opacity = 0.9;
        } else {
          style.animation = `pomedro-pixel-smoke 2.35s ease-out ${s.delay}ms forwards`;
        }
        return <div key={i} style={style} />;
      })}
    </div>
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
  return (
    <div className="relative mx-auto flex h-56 w-full max-w-sm flex-col items-center justify-end pb-6">
      <div className="relative inline-block">
        <CigarettePixelSmoke reducedMotion={reducedMotion} active={workCompleteSmoke} />
        <CigarettePixelGrid progress={progress} workCompleteSmoke={workCompleteSmoke} />
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
