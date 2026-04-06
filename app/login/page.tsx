import LoginCard from "../components/login-card";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eef4ff,_#f4f7fb_45%)]">
      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center px-6 py-6">
          <span className="text-2xl font-semibold tracking-tight text-slate-900">
            MOODINATOR
          </span>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl items-center justify-center px-6 py-16">
        <LoginCard />
      </main>
    </div>
  );
}
