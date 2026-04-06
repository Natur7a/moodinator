"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import * as faceapi from "face-api.js";

type MoodKey = "happy" | "sad" | "angry" | "surprised" | "neutral";

type Track = {
  id: string;
  name: string;
  artists: string;
  uri: string;
};

const moodDetails: Record<
  MoodKey,
  { label: string; description: string; badge: string }
> = {
  happy: {
    label: "Happy",
    badge: "bg-lime-200 text-lime-900",
    description:
      "We're recommending upbeat, feel-good songs to match your positive energy and keep the vibes high.",
  },
  sad: {
    label: "Sad",
    badge: "bg-sky-200 text-sky-900",
    description:
      "We've lined up gentle, warm tracks to help you feel seen and supported.",
  },
  angry: {
    label: "Angry",
    badge: "bg-rose-200 text-rose-900",
    description:
      "High-energy picks ahead to channel that intensity into something powerful.",
  },
  surprised: {
    label: "Surprised",
    badge: "bg-amber-200 text-amber-900",
    description:
      "Expect bold, playful tracks to match that wide-eyed energy.",
  },
  neutral: {
    label: "Neutral",
    badge: "bg-slate-200 text-slate-900",
    description:
      "Calm, focused songs to keep things steady and comfortable.",
  },
};

function mapExpressionToMood(expression: string): MoodKey {
  switch (expression) {
    case "happy":
      return "happy";
    case "sad":
      return "sad";
    case "angry":
      return "angry";
    case "surprised":
      return "surprised";
    case "fearful":
      return "surprised";
    case "disgusted":
      return "angry";
    case "neutral":
    default:
      return "neutral";
  }
}

export default function MoodDashboard() {
  const { data: session } = useSession();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const detectingRef = useRef(false);
  const lastRequestedMoodRef = useRef<MoodKey | null>(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dominantExpression, setDominantExpression] = useState<string>("neutral");
  const [confidence, setConfidence] = useState(0);
  const [hasFace, setHasFace] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlistStatus, setPlaylistStatus] = useState<{
    state: "idle" | "loading" | "ready" | "error";
    message?: string;
  }>({ state: "idle" });
  const [savingPlaylist, setSavingPlaylist] = useState(false);
  const [savedPlaylistUrl, setSavedPlaylistUrl] = useState<string | null>(null);

  const moodKey = useMemo(
    () => mapExpressionToMood(dominantExpression),
    [dominantExpression]
  );

  useEffect(() => {
    let active = true;

    async function loadModels() {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceExpressionNet.loadFromUri("/models"),
        ]);
        if (active) {
          setModelsLoaded(true);
        }
      } catch (error) {
        if (active) {
          setModelsLoaded(false);
        }
      }
    }

    loadModels();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function initCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraReady(true);
        setCameraError(null);
      } catch (error) {
        setCameraError("Camera permission denied or unavailable.");
      }
    }

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  async function analyzeFrame() {
    if (!videoRef.current) return;
    if (detectingRef.current) return;
    detectingRef.current = true;
    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 224,
      scoreThreshold: 0.5,
    });
    try {
      const result = await faceapi
        .detectSingleFace(videoRef.current, options)
        .withFaceExpressions();

      if (!result?.expressions) {
        setConfidence(0);
        setDominantExpression("neutral");
        setHasFace(false);
        return;
      }

      const entries = Object.entries(result.expressions);
      const [topExpression, topScore] = entries.sort((a, b) => b[1] - a[1])[0];
      setDominantExpression(topExpression);
      setConfidence(topScore);
      setHasFace(true);
    } finally {
      detectingRef.current = false;
    }
  }

  function startAnalyzing() {
    if (!modelsLoaded || !cameraReady || !videoRef.current) return;
    if (intervalRef.current) return;
    setIsAnalyzing(true);
    intervalRef.current = window.setInterval(() => {
      analyzeFrame();
    }, 500);
  }

  function stopAnalyzing() {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsAnalyzing(false);
  }

  useEffect(() => {
    if (!isAnalyzing) return;
    if (!session?.accessToken) return;
    if (!hasFace) return;
    if (lastRequestedMoodRef.current === moodKey) return;

    lastRequestedMoodRef.current = moodKey;
    setPlaylistStatus({ state: "loading" });
    setSavedPlaylistUrl(null);

    fetch(`/api/spotify/recommendations?mood=${moodKey}`, {
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error ?? "Failed to fetch recommendations.");
        }
        return res.json();
      })
      .then((data) => {
        setTracks(data.tracks ?? []);
        setPlaylistStatus({ state: "ready" });
      })
      .catch((error) => {
        setPlaylistStatus({
          state: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      });
  }, [isAnalyzing, moodKey, session?.accessToken, hasFace]);

  async function handleSavePlaylist() {
    if (!session?.accessToken || tracks.length === 0) return;
    setSavingPlaylist(true);
    setSavedPlaylistUrl(null);

    try {
      const response = await fetch("/api/spotify/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: moodKey,
          tracks: tracks.map((track) => track.uri),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error ?? "Failed to save playlist.");
      }

      const data = await response.json();
      setSavedPlaylistUrl(data.url ?? null);
    } catch (error) {
      setPlaylistStatus({
        state: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSavingPlaylist(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-16">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-white/80 bg-white/90 p-8 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.6)] backdrop-blur">
          <h2 className="text-2xl font-semibold text-slate-900">
            Detect your mood!
          </h2>
          <div className="relative mt-6 aspect-video overflow-hidden rounded-2xl bg-slate-900/10">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              muted
              playsInline
            />
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-200/70 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Waiting for camera...
              </div>
            )}
          </div>
          {cameraError && (
            <p className="mt-3 text-sm text-red-600">{cameraError}</p>
          )}
          <button
            className="mt-6 w-full rounded-full bg-gradient-to-r from-[var(--accent-warm)] to-[var(--accent)] py-3 text-lg font-semibold text-white shadow-[0_12px_25px_-18px_rgba(255,106,106,0.9)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={isAnalyzing ? stopAnalyzing : startAnalyzing}
            type="button"
            disabled={!modelsLoaded || !cameraReady}
          >
            {isAnalyzing ? "Stop" : "Analyze"}
          </button>
          {!modelsLoaded && (
            <p className="mt-3 text-xs text-slate-500">
              Loading face detection models...
            </p>
          )}
        </div>

        <div className="rounded-[32px] border border-white/80 bg-white/90 p-8 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.6)] backdrop-blur">
          <h3 className="text-xl font-semibold text-slate-900">
            Judul Playlist
          </h3>
          <div className="mt-6 space-y-3">
            {playlistStatus.state === "loading" ? (
              <div className="rounded-2xl bg-slate-100/90 px-4 py-3 text-sm font-medium text-slate-500">
                Generating recommendations...
              </div>
            ) : tracks.length === 0 ? (
              <div className="rounded-2xl bg-slate-100/90 px-4 py-3 text-sm font-medium text-slate-500">
                {session?.accessToken
                  ? "Analyze to generate tracks."
                  : "Login to generate tracks from Spotify."}
              </div>
            ) : null}
            {tracks.map((track) => (
              <div
                key={track.id}
                className="rounded-2xl bg-slate-100/90 px-4 py-3 text-sm font-medium text-slate-700 shadow-[0_10px_25px_-20px_rgba(15,23,42,0.4)]"
              >
                {track.name} - {track.artists}
              </div>
            ))}
          </div>
          {playlistStatus.state === "error" && (
            <p className="mt-4 text-sm text-red-600">
              {playlistStatus.message}
            </p>
          )}
          {session?.error && (
            <p className="mt-4 text-sm text-amber-600">
              Your Spotify session expired. Please log in again.
            </p>
          )}
          <button
            className="mt-6 w-full rounded-full bg-gradient-to-r from-[#66f05e] to-[#2ecf4f] py-3 text-lg font-semibold text-white shadow-[0_12px_25px_-18px_rgba(46,207,79,0.8)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            disabled={!session?.accessToken || tracks.length === 0 || savingPlaylist}
            onClick={handleSavePlaylist}
          >
            {savingPlaylist ? "Saving..." : "Save to Spotify"}
          </button>
          {savedPlaylistUrl && (
            <p className="mt-3 text-xs text-emerald-600">
              Playlist saved.{" "}
              <a
                className="font-semibold text-emerald-700 underline"
                href={savedPlaylistUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open it in Spotify
              </a>
              .
            </p>
          )}
        </div>
      </section>

      <section className="rounded-[32px] border border-white/80 bg-white/90 p-8 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.6)]">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-lg font-semibold text-slate-900">You seem</span>
          <span
            className={`rounded-full px-4 py-1 text-sm font-semibold ${moodDetails[moodKey].badge}`}
          >
            {moodDetails[moodKey].label}
          </span>
          <span className="text-xs font-semibold text-slate-400">
            {Math.round(confidence * 100)}% confidence
          </span>
        </div>
        <p className="mt-4 text-base font-medium text-slate-700">
          {moodDetails[moodKey].description}
        </p>
        {!hasFace && isAnalyzing && (
          <p className="mt-3 text-sm text-amber-600">
            We can&apos;t see a face yet. Try better lighting or adjust your
            camera position.
          </p>
        )}
        <div className="mt-6 text-sm font-semibold text-slate-800">
          Is this accurate?
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5"
            type="button"
          >
            Yes
          </button>
          <button
            className="rounded-full bg-red-500 px-6 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5"
            type="button"
          >
            No
          </button>
        </div>
      </section>
    </main>
  );
}
