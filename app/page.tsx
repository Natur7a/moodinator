import AuthButton from "./components/auth-button";
import MoodDashboard from "./components/mood-dashboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--bg-accent),_var(--bg)_45%)]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-semibold tracking-tight text-slate-900">
            MOODINATOR
          </span>
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Beta
          </span>
        </div>
        <AuthButton />
      </header>
      <MoodDashboard />
    </div>
  );
}
