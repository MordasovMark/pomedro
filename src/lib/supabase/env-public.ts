/**
 * Validates public Supabase env before creating the browser client.
 * Wrong/missing values cause `signUp` / `signIn` to throw TypeError: Failed to fetch.
 */
function resolvePublicSupabaseKey(): string {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
  return anon || publishable;
}

/**
 * Public client key for Supabase (JWT `anon` legacy or dashboard `sb_publishable_*`).
 * Same value passed to `createBrowserClient` / `createServerClient` as the second argument.
 */
export function getSupabasePublicEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = resolvePublicSupabaseKey();

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase env: set NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local at the project root, then restart `npm run dev`.",
    );
  }

  const isLocalHttp =
    url.startsWith("http://") &&
    (() => {
      try {
        const h = new URL(url).hostname;
        return h === "localhost" || h === "127.0.0.1";
      } catch {
        return false;
      }
    })();

  if (!url.startsWith("https://") && !isLocalHttp) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL must start with https:// (or http://localhost for local Supabase). Copy Project URL from Supabase → Settings → API.",
    );
  }

  try {
    new URL(url);
  } catch {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not a valid URL. Copy Project URL from Supabase → Settings → API.",
    );
  }

  const keyTooShort =
    anonKey.startsWith("sb_publishable_") ? anonKey.length < 24 : anonKey.length < 20;
  if (keyTooShort) {
    throw new Error(
      "Supabase public key looks too short — copy anon public or Publishable key from Supabase → Settings → API (NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).",
    );
  }

  return { url, anonKey };
}

/** True when public Supabase env parses and validates (same rules as the browser/server clients). */
export function isSupabaseConfigured(): boolean {
  try {
    getSupabasePublicEnv();
    return true;
  } catch {
    return false;
  }
}

/** True when Supabase Auth returned a network failure in `error.message` (not only thrown). */
export function isSupabaseAuthNetworkMessage(message: string | null | undefined): boolean {
  if (!message) return false;
  if (message === "Failed to fetch") return true;
  if (message.includes("NetworkError") && message.includes("fetch")) return true;
  return false;
}

export function isAuthNetworkError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const m = (err as Error).message ?? "";
  if (isSupabaseAuthNetworkMessage(m)) return true;
  if ((err as Error).name === "TypeError" && m.includes("fetch")) return true;
  return false;
}

export function authNetworkErrorMessage(): string {
  return [
    "Could not reach Supabase (network). Check:",
    "1) .env.local has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (no quotes, no spaces).",
    "2) Restart `npm run dev` after editing .env.local.",
    "3) In the browser Network tab, confirm requests go to https://<ref>.supabase.co.",
    "4) Temporarily disable ad-blockers / VPN if requests are blocked.",
  ].join(" ");
}
