"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  authNetworkErrorMessage,
  isAuthNetworkError,
  isSupabaseAuthNetworkMessage,
} from "@/lib/supabase/env-public";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signError) {
        if (isSupabaseAuthNetworkMessage(signError.message)) {
          setError(authNetworkErrorMessage());
          return;
        }
        setError(signError.message);
        return;
      }
      if (data.session) {
        router.replace("/app");
        router.refresh();
        return;
      }
      setInfo("Check your email to confirm the account, then sign in.");
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("Missing Supabase")) {
        setError(err.message);
        return;
      }
      if (err instanceof Error && err.message.includes("NEXT_PUBLIC_SUPABASE")) {
        setError(err.message);
        return;
      }
      if (isAuthNetworkError(err)) {
        setError(authNetworkErrorMessage());
        return;
      }
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-inner">
      <label className="block space-y-1 text-sm">
        <span className="text-slate-300">Email</span>
        <input
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-sky-500/40 focus:ring-2"
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-slate-300">Password</span>
        <input
          required
          type="password"
          autoComplete="new-password"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-sky-500/40 focus:ring-2"
        />
      </label>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      {info ? <p className="text-sm text-emerald-400">{info}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-sky-500 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creating…" : "Sign up"}
      </button>
    </form>
  );
}
