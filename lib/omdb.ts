export type OmdbRatings = {
  imdbRating?: string | null;
  rottenTomatoesRating?: string | null;
  posterUrl?: string | null;
};

export async function getOmdbRatingsByImdbId(imdbId?: string | null): Promise<OmdbRatings> {
  if (!imdbId) return { imdbRating: null, rottenTomatoesRating: null, posterUrl: null };
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) return { imdbRating: null, rottenTomatoesRating: null, posterUrl: null };
  const url = new URL("https://www.omdbapi.com/");
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("i", imdbId);
  const res = await fetch(url.toString(), { cache: 'no-store' as any });
  if (!res.ok) return { imdbRating: null, rottenTomatoesRating: null, posterUrl: null };
  const data = await res.json();
  
  // Check if response indicates error
  if (data.Response === 'False') {
    return { imdbRating: null, rottenTomatoesRating: null, posterUrl: null };
  }
  
  const ratings: Array<{ Source: string; Value: string }> = data.Ratings || [];
  const imdbRating = data.imdbRating || null;
  const rtRating = ratings.find((r) => r.Source === 'Rotten Tomatoes')?.Value || null;
  const posterUrl = data.Poster && data.Poster !== 'N/A' ? data.Poster : null;
  
  return { imdbRating, rottenTomatoesRating: rtRating, posterUrl };
}


