"use client";

import { useEffect, useRef, useState } from "react";
import { useSpotifyPlayer } from "@/app/context/spotify-player";

function formatMs(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function PlayerBar() {
  const { state, pause, resume, skipNext, skipPrev, seek, setVolume } =
    useSpotifyPlayer();

  // Local position for smooth scrubbing without waiting for SDK state updates
  const [localPos, setLocalPos] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync localPos from SDK state whenever we are not actively dragging the bar
  useEffect(() => {
    if (!isSeeking) setLocalPos(state.position);
  }, [state.position, isSeeking]);

  // Advance localPos every 500 ms while playing
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (state.isPlaying && !isSeeking) {
      tickRef.current = setInterval(() => {
        setLocalPos((p) => Math.min(p + 500, state.duration));
      }, 500);
    }
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [state.isPlaying, isSeeking, state.duration]);

  if (!state.currentTrack && !state.error) return null;

  const track = state.currentTrack;
  const albumArt = track?.album.images[0]?.url;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t border-slate-200/80 bg-white/95 shadow-[0_-8px_30px_-10px_rgba(15,23,42,0.15)] backdrop-blur">
      {state.error && (
        <p className="bg-red-50 px-6 py-1.5 text-center text-xs font-medium text-red-600">
          {state.error}
        </p>
      )}

      {track && (
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
          {/* Track info */}
          <div className="flex w-56 shrink-0 items-center gap-3 min-w-0">
            {albumArt && (
              <img
                src={albumArt}
                alt={track.album.name}
                width={48}
                height={48}
                className="h-12 w-12 rounded-lg object-cover shadow"
              />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {track.name}
              </p>
              <p className="truncate text-xs text-slate-500">
                {track.artists.map((a) => a.name).join(", ")}
              </p>
            </div>
          </div>

          {/* Controls + progress */}
          <div className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex items-center gap-5">
              <button
                onClick={skipPrev}
                aria-label="Previous track"
                className="text-slate-400 transition hover:text-slate-900"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
                </svg>
              </button>

              <button
                onClick={state.isPlaying ? pause : resume}
                aria-label={state.isPlaying ? "Pause" : "Play"}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white shadow transition hover:scale-105 active:scale-95"
              >
                {state.isPlaying ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                onClick={skipNext}
                aria-label="Next track"
                className="text-slate-400 transition hover:text-slate-900"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            </div>

            {/* Seek bar */}
            <div className="flex w-full max-w-lg items-center gap-2 text-xs text-slate-400">
              <span className="w-9 text-right tabular-nums">{formatMs(localPos)}</span>
              <input
                type="range"
                min={0}
                max={state.duration || 1}
                value={localPos}
                aria-label="Seek"
                className="h-1 flex-1 cursor-pointer accent-slate-900"
                onChange={(e) => {
                  setIsSeeking(true);
                  setLocalPos(Number(e.target.value));
                }}
                onMouseUp={(e) => {
                  setIsSeeking(false);
                  seek(Number((e.target as HTMLInputElement).value));
                }}
                onTouchEnd={(e) => {
                  setIsSeeking(false);
                  seek(Number((e.target as HTMLInputElement).value));
                }}
              />
              <span className="w-9 tabular-nums">{formatMs(state.duration)}</span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex w-32 shrink-0 items-center justify-end gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="shrink-0 text-slate-400"
            >
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={state.volume}
              aria-label="Volume"
              className="h-1 flex-1 cursor-pointer accent-slate-900"
              onChange={(e) => setVolume(Number(e.target.value))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
