export type MoodKey = "happy" | "sad" | "angry" | "surprised" | "neutral";

export function getSpotifyRecommendationParams(mood: MoodKey) {
  switch (mood) {
    case "happy":
      return {
        seed_genres: ["pop", "dance", "electronic"],
        target_valence: 0.85,
        target_energy: 0.8,
      };
    case "sad":
      return {
        seed_genres: ["acoustic", "indie", "folk"],
        target_valence: 0.25,
        target_energy: 0.3,
        target_acousticness: 0.7,
      };
    case "angry":
      return {
        seed_genres: ["rock", "metal", "hard-rock"],
        target_valence: 0.2,
        target_energy: 0.9,
      };
    case "surprised":
      return {
        seed_genres: ["edm", "pop", "dance"],
        target_valence: 0.65,
        target_energy: 0.75,
      };
    case "neutral":
    default:
      return {
        seed_genres: ["jazz", "classical", "acoustic"],
        target_valence: 0.5,
        target_energy: 0.45,
      };
  }
}
