import { PomodoroTimer } from "@/components/PomodoroTimer";

export default function TimerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Timer</h1>
        <p className="text-sm text-slate-400">Work sessions are saved when a Pomodoro completes.</p>
      </div>
      <PomodoroTimer />
    </div>
  );
}
