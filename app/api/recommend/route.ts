import { NextRequest, NextResponse } from "next/server";
import { discoverByProviders, getMovieCredits, getMovieDetails, getMovieExternalIds, getMovieVideos, getWatchProviders, searchMovies, tmdbImage } from "@/lib/tmdb";
import { getOmdbRatingsByImdbId } from "@/lib/omdb";
import { generateMovieRecommendations } from "@/lib/openai";
import type { Recommendation, StreamingProvider } from "@/types/movie";

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json() as { query?: string; streamingServices?: number[] };
  const { query, streamingServices } = body || {};
  const providers = streamingServices && streamingServices.length ? streamingServices : [9, 8, 188, 337]; // Amazon Prime, Netflix, BBC iPlayer, Disney Plus
  
  if (!query || !query.trim()) {
    return NextResponse.json(
      { error: 'Query is required', recommendations: [] },
      { status: 400 }
    );
  }

  try {
    // Get streaming service names for AI prompt
    const providerMap: Record<number, string> = {
      8: 'Netflix', 9: 'Amazon Prime Video', 337: 'Disney Plus', 350: 'Apple TV Plus',
      15: 'Hulu', 384: 'Paramount+', 531: 'Peacock', 103: 'Now TV', 188: 'BBC iPlayer', 
      35: 'All 4', 526: 'Mubi', 682: 'BFI Player', 521: 'Curzon Home Cinema',
      532: 'Arrow Player', 445: 'Rakuten TV', 2: 'Apple iTunes', 68: 'Microsoft Store'
    };
    
    const providerNames = streamingServices?.map(id => providerMap[id] || '').filter(Boolean) || [];

    // Try AI-generated recommendations first
    let aiRecommendations: Array<{ title: string; year?: number; reason: string }> = [];
    try {
      aiRecommendations = await generateMovieRecommendations(query, providerNames);
    } catch (error) {
      console.log('AI recommendation failed, using fallback:', error);
    }
    
    // Fallback: If AI fails or returns no results, use TMDB search + discovery
    let isFallback = false;
    let fallbackMovies: Array<{ id: number; title: string; overview: string; release_date?: string; poster_path?: string | null }> = [];
    
    if (!aiRecommendations.length) {
      console.log('Using fallback: TMDB search and discovery');
      isFallback = true;
      const [searchResults, discoveredMovies] = await Promise.all([
        searchMovies(query),
        discoverByProviders(providers, 'GB'),
      ]);
      
      // Deduplicate by movie ID
      const movieMap = new Map<number, typeof searchResults[0]>();
      [...searchResults, ...discoveredMovies].forEach(movie => {
        if (!movieMap.has(movie.id)) {
          movieMap.set(movie.id, movie);
        }
      });
      
      fallbackMovies = Array.from(movieMap.values())
        .slice(0, 10)
        .map(m => ({
          id: m.id,
          title: m.title || m.name || '',
          overview: m.overview || '',
          release_date: m.release_date,
          poster_path: m.poster_path
        }));
      
      // Create AI-style recommendations for consistency
      aiRecommendations = fallbackMovies.map(movie => ({
        title: movie.title,
        year: movie.release_date ? parseInt(movie.release_date.slice(0, 4)) : undefined,
        reason: `Recommended based on your search for "${query}"`
      }));
    }
    
    if (!aiRecommendations.length) {
      return NextResponse.json({ recommendations: [] });
    }

    const recommendations: Recommendation[] = [];
    
    // For each AI recommendation, look up the movie in TMDB
    for (let i = 0; i < aiRecommendations.length; i++) {
      const aiRec = aiRecommendations[i];
      try {
        let movie: { id: number; title?: string; name?: string; overview: string; release_date?: string; poster_path?: string | null };
        
        // If fallback, use the movie directly (already matched)
        if (isFallback && fallbackMovies[i]) {
          movie = fallbackMovies[i];
        } else {
          // Search TMDB for the movie - improve matching to prevent wrong matches
          const searchResults = await searchMovies(aiRec.title);
          if (!searchResults.length) continue;

          // Try to match by exact title first, then by year, then use first result
          let matchedMovie = null;
          
          // First, try exact title match
          matchedMovie = searchResults.find(m => 
            (m.title || m.name || '').toLowerCase() === aiRec.title.toLowerCase()
          );
          
          // If we have a year, prefer exact title + year match
          if (!matchedMovie && aiRec.year) {
            matchedMovie = searchResults.find(m => {
              const releaseYear = m.release_date ? parseInt(m.release_date.slice(0, 4)) : null;
              const titleMatch = (m.title || m.name || '').toLowerCase() === aiRec.title.toLowerCase();
              return titleMatch && releaseYear === aiRec.year;
            });
          }
          
          // If still no match and we have a year, try any result with matching year
          if (!matchedMovie && aiRec.year) {
            matchedMovie = searchResults.find(m => {
              const releaseYear = m.release_date ? parseInt(m.release_date.slice(0, 4)) : null;
              return releaseYear === aiRec.year;
            });
          }
          
          // Fallback to first result
          movie = matchedMovie || searchResults[0];
        }

        // Get movie details
        const [videos, externalIds, watch, credits, details] = await Promise.all([
          getMovieVideos(movie.id),
          getMovieExternalIds(movie.id),
          getWatchProviders(movie.id, 'GB'),
          getMovieCredits(movie.id),
          getMovieDetails(movie.id),
        ]);
        
        // Extract director and top actors
        const director = credits.crew.find(person => person.job === 'Director')?.name || null;
        const actors = credits.cast.slice(0, 4).map(person => person.name);

        const imdbId: string | null = externalIds?.imdb_id || null;
        const ratings = await getOmdbRatingsByImdbId(imdbId);
        
        // Get runtime from TMDB (in minutes) or parse from OMDB
        let runtime: number | null = details?.runtime || null;
        if (!runtime && ratings.runtime) {
          // Parse "136 min" to 136
          const match = ratings.runtime.match(/(\d+)/);
          runtime = match ? parseInt(match[1]) : null;
        }

        const trailerKey = videos?.find((v) => v.site === 'YouTube' && v.type === 'Trailer')?.key;
        const trailerUrl = trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : null;

        const providersList: StreamingProvider[] = [];
        const flatrate = watch?.flatrate || [];
        for (const p of flatrate) {
          providersList.push({ 
            id: p.provider_id, 
            name: p.provider_name, 
            logoPath: p.logo_path // TMDB provides logo paths for streaming services
          });
        }

        // Filter providers to only show those the user has selected
        const filteredProviders = providers.length > 0 
          ? providersList.filter((p) => providers.includes(p.id))
          : providersList;
        
        // Only include movies that are available on at least one of the user's selected streaming services
        if (providers.length > 0 && filteredProviders.length === 0) {
          continue; // Skip this movie if it's not available on any selected service
        }

        // Prefer OMDB poster, fallback to TMDB poster
        const posterUrl = ratings.posterUrl || tmdbImage(movie.poster_path, 'w342');

        recommendations.push({
          id: movie.id,
          title: movie.title || movie.name || aiRec.title,
          overview: movie.overview || '',
          posterUrl,
          releaseYear: movie.release_date ? movie.release_date.slice(0, 4) : (aiRec.year?.toString() || null),
          runtime: runtime || null,
          imdbRating: ratings.imdbRating || null,
          rottenTomatoesRating: ratings.rottenTomatoesRating || null,
          trailerUrl,
          reason: aiRec.reason || undefined,
          providers: filteredProviders, // Only show filtered providers (user's selected services)
          director: director || null,
          actors: actors.length > 0 ? actors : undefined,
        });
      } catch (e) {
        console.error(`Error processing movie "${aiRec.title}":`, e);
        // Continue to next movie
      }
    }

    return NextResponse.json({ recommendations });
  } catch (e: any) {
    console.error('Recommendation API error:', e);
    return NextResponse.json(
      { error: e?.message || 'Unexpected error', recommendations: [] },
      { status: 500 }
    );
  }
}
