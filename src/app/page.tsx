import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-10 px-6 py-16">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Pomodoro + Supabase</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Pomedro keeps your focus sessions{" "}
          <span className="text-sky-400">measurable</span>.
        </h1>
        <p className="max-w-xl text-lg text-slate-300">
          Classic 25 / 5 / 15 timing, long breaks every fourth work block, themed visuals, and a
          stats view backed by Row Level Security in Supabase.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/signup"
          className="rounded-xl bg-sky-500 px-5 py-3 text-sm font-medium text-slate-950 shadow-lg shadow-sky-500/25 transition hover:bg-sky-400"
        >
          Create account
        </Link>
        <Link
          href="/login"
          className="rounded-xl border border-slate-600 px-5 py-3 text-sm font-medium text-slate-100 transition hover:border-slate-400"
        >
          Sign in
        </Link>
        <Link
          href="/app"
          className="rounded-xl px-5 py-3 text-sm font-medium text-slate-400 underline-offset-4 hover:text-white hover:underline"
        >
          Open app (requires login)
        </Link>
      </div>
    </main>
  );
}
