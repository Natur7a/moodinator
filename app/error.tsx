"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  unstable_retry: retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
      <h2 className="text-2xl font-semibold text-slate-900">
        Something went wrong
      </h2>
      <p className="max-w-md text-sm text-slate-600">
        We hit an unexpected error. You can retry or refresh the page.
      </p>
      <button
        className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5"
        onClick={() => retry()}
        type="button"
      >
        Try again
      </button>
    </div>
  );
}
