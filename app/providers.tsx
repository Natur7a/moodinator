"use client";

import { SessionProvider } from "next-auth/react";
import { SpotifyPlayerProvider } from "@/app/context/spotify-player";
import PlayerBar from "@/app/components/player-bar";

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <SpotifyPlayerProvider>
        {children}
        <PlayerBar />
      </SpotifyPlayerProvider>
    </SessionProvider>
  );
}
