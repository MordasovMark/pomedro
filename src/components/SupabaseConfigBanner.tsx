/**
 * Shown when Supabase public env is missing/invalid or when redirected with ?config=1.
 */
export function SupabaseConfigBanner() {
  return (
    <div
      role="alert"
      className="rounded-xl border border-amber-500/40 bg-amber-950/40 px-4 py-3 text-sm text-amber-100"
    >
      Supabase environment variables are missing or invalid. Add{" "}
      <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
      <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> or{" "}
      <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> to{" "}
      <code className="rounded bg-black/30 px-1">.env.local</code> in the project root, then restart{" "}
      <code className="rounded bg-black/30 px-1">npm run dev</code>. For production (e.g. Vercel), set
      the same variables in the host dashboard and redeploy.
    </div>
  );
}
