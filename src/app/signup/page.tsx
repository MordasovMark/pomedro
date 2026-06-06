import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";
import { SupabaseConfigBanner } from "@/components/SupabaseConfigBanner";
import { isSupabaseConfigured } from "@/lib/supabase/env-public";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ config?: string }>;
}) {
  const params = await searchParams;
  const misconfig = params.config === "1" || !isSupabaseConfigured();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-8 px-6 py-16">
      {misconfig ? <SupabaseConfigBanner /> : null}
      <div>
        <h1 className="text-2xl font-semibold text-white">Create account</h1>
        <p className="mt-2 text-sm text-slate-400">Email and password — confirm in your inbox if required.</p>
      </div>
      <SignupForm />
      <p className="text-center text-sm text-slate-400">
        Already registered?{" "}
        <Link href="/login" className="text-sky-400 hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
