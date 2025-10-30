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
  imdbRating?: string | null;
  rottenTomatoesRating?: string | null;
  trailerUrl?: string | null;
  reason?: string | null;
  providers: StreamingProvider[];
};

export type RecommendRequest = {
  queryText?: string;
  actors?: string[];
  directors?: string[];
  themes?: string[];
  streamingServices?: number[]; // TMDB provider IDs
};


