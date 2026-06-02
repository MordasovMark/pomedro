import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; config?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirect?.startsWith("/") ? params.redirect : undefined;
  const misconfig = params.config === "1";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-8 px-6 py-16">
      {misconfig ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-500/40 bg-amber-950/40 px-4 py-3 text-sm text-amber-100"
        >
          Supabase environment variables are missing or invalid. Add{" "}
          <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
          <code className="rounded bg-black/30 px-1">.env.local</code> in the project root, then
          restart <code className="rounded bg-black/30 px-1">npm run dev</code>.
        </div>
      ) : null}
      <div>
        <h1 className="text-2xl font-semibold text-white">Sign in</h1>
        <p className="mt-2 text-sm text-slate-400">Use your email and password.</p>
      </div>
      <LoginForm redirectTo={redirectTo} />
      <p className="text-center text-sm text-slate-400">
        No account?{" "}
        <Link href="/signup" className="text-sky-400 hover:underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
