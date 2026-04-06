"use client";

import { signIn } from "next-auth/react";

export default function LoginCard() {
  return (
    <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.5)]">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Welcome!</h1>
        <p className="text-3xl font-bold text-slate-900">
          To the <span className="font-mono">MOODINATOR</span>
        </p>
      </div>

      <form className="mt-8 space-y-5">
        <div>
          <label className="text-sm font-semibold text-slate-700">Email</label>
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100/70 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
            placeholder="Enter your email"
            type="email"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700">
            Password
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100/70 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
            placeholder="Enter your password"
            type="password"
          />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <label className="flex items-center gap-2">
            <input className="h-4 w-4 rounded border-slate-300" type="checkbox" />
            Remember me
          </label>
          <button
            className="text-xs font-semibold text-blue-600 hover:underline"
            type="button"
          >
            Forgot Your Password?
          </button>
        </div>
        <button
          className="w-full rounded-2xl bg-[#7d97ff] py-3 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-[#6f8cff]"
          type="button"
        >
          Sign Up
        </button>
      </form>

      <div className="my-6 flex items-center gap-4 text-xs font-semibold text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        OR
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="space-y-3">
        <button
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5"
          onClick={() => signIn("spotify")}
          type="button"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#1ed760] text-xs font-bold text-white">
            ♫
          </span>
          Continue with Spotify
        </button>
        <button
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 py-3 text-sm font-semibold text-slate-400"
          disabled
          type="button"
        >
          Continue with Google
        </button>
        <button
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 py-3 text-sm font-semibold text-slate-400"
          disabled
          type="button"
        >
          Continue with Facebook
        </button>
      </div>
    </div>
  );
}
