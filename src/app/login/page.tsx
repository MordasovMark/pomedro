import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { SupabaseConfigBanner } from "@/components/SupabaseConfigBanner";
import { isSupabaseConfigured } from "@/lib/supabase/env-public";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; config?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirect?.startsWith("/") ? params.redirect : undefined;
  const misconfig = params.config === "1" || !isSupabaseConfigured();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-8 px-6 py-16">
      {misconfig ? <SupabaseConfigBanner /> : null}
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
