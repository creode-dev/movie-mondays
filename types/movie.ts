export type StreamingProvider = {
  id: number;
  name: string;
  logoPath?: string | null;
};

export type Recommendation = {
  id: number;
  title: string;
  overview: string;
  posterUrl?: string | null;
  releaseYear?: string | null;
  runtime?: number | null; // Runtime in minutes
  imdbRating?: string | null;
  rottenTomatoesRating?: string | null;
  trailerUrl?: string | null;
  reason?: string | null;
  providers: StreamingProvider[];
  director?: string | null;
  actors?: string[]; // Top 3-4 actors
  ageRating?: string | null; // UK age rating (e.g., "12", "PG", "15", "18", "R")
};

export type RecommendRequest = {
  queryText?: string;
  actors?: string[];
  directors?: string[];
  themes?: string[];
  streamingServices?: number[]; // TMDB provider IDs
};

export type UnmatchedRecommendation = {
  title: string;
  year?: number;
  reason: string;
};


