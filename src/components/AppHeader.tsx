"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/app", label: "Timer" },
  { href: "/app/stats", label: "Stats" },
];

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setUser(null);
      return;
    }
    let cancelled = false;
    void supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setUser(data.user ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/app" className="text-sm font-semibold tracking-tight text-white">
          Pomedro
        </Link>
        <nav className="flex flex-1 items-center justify-center gap-1 sm:gap-2">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          {supabase && user === null ? (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-slate-500 sm:text-sm"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-sky-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-sky-400 sm:text-sm"
              >
                Sign up
              </Link>
            </>
          ) : null}
          {supabase && user ? (
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-slate-500 sm:text-sm"
            >
              Sign out
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
