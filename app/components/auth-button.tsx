"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  if (loading) {
    return (
      <button
        className="rounded-full bg-slate-200 px-6 py-2 text-sm font-semibold text-slate-500 shadow-sm"
        disabled
        type="button"
      >
        Loading...
      </button>
    );
  }

  if (session) {
    return (
      <button
        className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
        onClick={() => signOut()}
        type="button"
      >
        Logout
      </button>
    );
  }

  return (
    <Link
      className="rounded-full bg-[#7b59ff] px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#6a48f5]"
      href="/login"
    >
      Login
    </Link>
  );
}
