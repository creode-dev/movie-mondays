const TMDB_BASE = "https://api.themoviedb.org/3";

export type TmdbMovie = {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  release_date?: string;
  poster_path?: string | null;
};

export async function tmdbFetch(path: string, params: Record<string, string | number | undefined> = {}) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY is not set");
  const url = new URL(`${TMDB_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) url.searchParams.set(k, String(v));
  });
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      accept: "application/json",
    },
    // Next.js: mark as server fetch
    cache: 'no-store',
  } as any);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TMDB error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function searchMovies(query: string) {
  if (!query) return [] as TmdbMovie[];
  const data = await tmdbFetch('/search/movie', { query, include_adult: 'false', language: 'en-GB', page: 1 });
  return (data.results ?? []) as TmdbMovie[];
}

export async function searchPerson(query: string) {
  if (!query) return null;
  const data = await tmdbFetch('/search/person', { query, language: 'en-GB', page: 1 });
  const results = data.results ?? [];
  return results.length > 0 ? results[0] : null; // Return first match
}

export async function discoverByProviders(
  providerIds: number[], 
  region: string = 'GB',
  withCast?: number[],
  withCrew?: number[]
) {
  const params: Record<string, string | number | undefined> = {
    include_adult: 'false',
    language: 'en-GB',
    sort_by: 'popularity.desc',
    with_watch_providers: providerIds.join(','),
    watch_region: region,
    page: 1,
  };
  if (withCast?.length) params.with_cast = withCast.join(',');
  if (withCrew?.length) params.with_crew = withCrew.join(',');
  
  const data = await tmdbFetch('/discover/movie', params);
  return (data.results ?? []) as TmdbMovie[];
}

export async function getMovieVideos(movieId: number) {
  const data = await tmdbFetch(`/movie/${movieId}/videos`, { language: 'en-GB' });
  return data.results as Array<{ key: string; site: string; type: string }>;
}

export async function getMovieExternalIds(movieId: number) {
  return tmdbFetch(`/movie/${movieId}/external_ids`);
}

export async function getWatchProviders(movieId: number, region: string = 'GB') {
  const data = await tmdbFetch(`/movie/${movieId}/watch/providers`);
  return data.results?.[region] ?? null;
}

export async function getMovieCredits(movieId: number) {
  const data = await tmdbFetch(`/movie/${movieId}/credits`);
  return {
    cast: (data.cast || []).slice(0, 4) as Array<{ name: string; character?: string }>,
    crew: (data.crew || []) as Array<{ name: string; job: string }>,
  };
}

export async function getMovieDetails(movieId: number) {
  return tmdbFetch(`/movie/${movieId}`, { language: 'en-GB' });
}

export function tmdbImage(path?: string | null, size: 'w342' | 'w500' = 'w342') {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function tmdbLogo(path?: string | null, size: 'w45' | 'w92' | 'w154' | 'w185' | 'w300' | 'w500' = 'w92') {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}


