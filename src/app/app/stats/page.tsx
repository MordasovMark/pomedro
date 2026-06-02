import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatsDashboard, type SessionPoint } from "@/components/StatsDashboard";

export default async function StatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/app/stats");
  }

  const since = new Date();
  since.setDate(since.getDate() - 420);

  const { data: sessions, error } = await supabase
    .from("pomodoro_sessions")
    .select("started_at, duration_seconds")
    .gte("started_at", since.toISOString())
    .order("started_at", { ascending: true });

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-white">Stats</h1>
        <p className="text-sm text-rose-400">
          Could not load sessions ({error.message}). Confirm the SQL migration ran in Supabase.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Stats</h1>
        <p className="text-sm text-slate-400">Heatmap and summaries use saved work sessions.</p>
      </div>
      <StatsDashboard sessions={(sessions ?? []) as SessionPoint[]} />
    </div>
  );
}
