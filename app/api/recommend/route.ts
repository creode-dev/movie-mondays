import { NextRequest, NextResponse } from "next/server";
import { discoverByProviders, getMovieCredits, getMovieDetails, getMovieExternalIds, getMovieReleaseDates, getMovieVideos, getWatchProviders, searchMovies, tmdbImage } from "@/lib/tmdb";
import { getOmdbRatingsByImdbId } from "@/lib/omdb";
import { generateMovieRecommendations } from "@/lib/openai";
import type { Recommendation, StreamingProvider, UnmatchedRecommendation } from "@/types/movie";

export const runtime = 'nodejs';

/**
 * Parse runtime constraints from user query
 * Returns { maxMinutes: number | null, minMinutes: number | null }
 * Examples:
 * - "under 100 minutes" -> { maxMinutes: 100, minMinutes: null }
 * - "less than 2 hours" -> { maxMinutes: 120, minMinutes: null }
 * - "over 90 minutes" -> { maxMinutes: null, minMinutes: 90 }
 * - "between 80 and 120 minutes" -> { maxMinutes: 120, minMinutes: 80 }
 */
function parseRuntimeConstraints(query: string): { maxMinutes: number | null; minMinutes: number | null } {
  const lowerQuery = query.toLowerCase();
  let maxMinutes: number | null = null;
  let minMinutes: number | null = null;

  // Patterns for maximum runtime
  const maxPatterns = [
    /under\s+(\d+)\s+minutes?/i,
    /less\s+than\s+(\d+)\s+minutes?/i,
    /below\s+(\d+)\s+minutes?/i,
    /shorter\s+than\s+(\d+)\s+minutes?/i,
    /under\s+(\d+)h\s*(\d+)?\s*m/i,
    /less\s+than\s+(\d+)h\s*(\d+)?\s*m/i,
    /(\d+)h\s*(\d+)?\s*m\s+or\s+less/i,
    /(\d+)h\s*(\d+)?\s*m\s+and\s+under/i,
  ];

  // Patterns for minimum runtime
  const minPatterns = [
    /over\s+(\d+)\s+minutes?/i,
    /more\s+than\s+(\d+)\s+minutes?/i,
    /above\s+(\d+)\s+minutes?/i,
    /longer\s+than\s+(\d+)\s+minutes?/i,
    /at\s+least\s+(\d+)\s+minutes?/i,
  ];

  // Patterns for hours (convert to minutes)
  const hourMaxPatterns = [
    /under\s+(\d+)\s+hours?/i,
    /less\s+than\s+(\d+)\s+hours?/i,
    /below\s+(\d+)\s+hours?/i,
    /shorter\s+than\s+(\d+)\s+hours?/i,
  ];

  const hourMinPatterns = [
    /over\s+(\d+)\s+hours?/i,
    /more\s+than\s+(\d+)\s+hours?/i,
    /above\s+(\d+)\s+hours?/i,
    /longer\s+than\s+(\d+)\s+hours?/i,
    /at\s+least\s+(\d+)\s+hours?/i,
  ];

  // Patterns for "between X and Y"
  const rangePattern = /between\s+(\d+)\s+(?:and|\-)\s+(\d+)\s+minutes?/i;
  const hourRangePattern = /between\s+(\d+)\s+(?:and|\-)\s+(\d+)\s+hours?/i;

  // Check for hour-based constraints first (they're more specific)
  for (const pattern of hourMaxPatterns) {
    const match = lowerQuery.match(pattern);
    if (match) {
      const hours = parseInt(match[1]);
      maxMinutes = hours * 60;
      break;
    }
  }

  for (const pattern of hourMinPatterns) {
    const match = lowerQuery.match(pattern);
    if (match) {
      const hours = parseInt(match[1]);
      minMinutes = hours * 60;
      break;
    }
  }

  // Check for minute-based constraints
  if (!maxMinutes) {
    for (const pattern of maxPatterns) {
      const match = lowerQuery.match(pattern);
      if (match) {
        if (match[2]) {
          // Hours and minutes format like "1h 30m"
          maxMinutes = parseInt(match[1]) * 60 + parseInt(match[2]);
        } else {
          maxMinutes = parseInt(match[1]);
        }
        break;
      }
    }
  }

  if (!minMinutes) {
    for (const pattern of minPatterns) {
      const match = lowerQuery.match(pattern);
      if (match) {
        minMinutes = parseInt(match[1]);
        break;
      }
    }
  }

  // Check for range patterns
  const rangeMatch = lowerQuery.match(rangePattern);
  if (rangeMatch) {
    minMinutes = parseInt(rangeMatch[1]);
    maxMinutes = parseInt(rangeMatch[2]);
  }

  const hourRangeMatch = lowerQuery.match(hourRangePattern);
  if (hourRangeMatch) {
    minMinutes = parseInt(hourRangeMatch[1]) * 60;
    maxMinutes = parseInt(hourRangeMatch[2]) * 60;
  }

  return { maxMinutes, minMinutes };
}

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
    // Parse runtime constraints from query
    const runtimeConstraints = parseRuntimeConstraints(query);
    console.log(`[Recommendations] Runtime constraints parsed:`, runtimeConstraints);
    
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
      console.log(`[Recommendations] Calling AI with query: "${query}" and services: ${providerNames.join(', ') || 'none'}`);
      aiRecommendations = await generateMovieRecommendations(query, providerNames);
      console.log(`[Recommendations] AI returned ${aiRecommendations.length} recommendations`);
      if (aiRecommendations.length > 0) {
        console.log(`[Recommendations] First few AI recommendations: ${aiRecommendations.slice(0, 3).map(r => r.title).join(', ')}`);
      }
    } catch (error) {
      console.error('AI recommendation failed, using fallback:', error);
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
      console.log('[Recommendations] No AI recommendations returned, returning empty response');
      return NextResponse.json({ 
        recommendations: [],
        otherServices: [],
        unmatched: []
      });
    }

    const recommendations: Recommendation[] = [];
    const otherServicesRecommendations: Recommendation[] = [];
    const unmatchedRecommendations: UnmatchedRecommendation[] = [];
    
    // For each AI recommendation, look up the movie in TMDB
    // Track all movies processed to ensure none are lost AND prevent duplicates
    const processedTitles = new Set<string>();
    const processedMovieIds = new Set<number>(); // Track by movie ID to prevent duplicates
    
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
          if (!searchResults.length) {
            // No search results found - add to unmatched (NOT filtered out)
            console.log(`[Recommendations] Movie not found in TMDB: "${aiRec.title}" - adding to unmatched`);
            unmatchedRecommendations.push({
              title: aiRec.title,
              year: aiRec.year,
              reason: aiRec.reason
            });
            processedTitles.add(aiRec.title.toLowerCase());
            continue;
          }

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

        // CRITICAL: Check if we've already processed this movie ID to prevent duplicates
        if (processedMovieIds.has(movie.id)) {
          console.log(`[Recommendations] Skipping duplicate movie ID ${movie.id}: "${movie.title || movie.name || aiRec.title}" (already processed)`);
          processedTitles.add(aiRec.title.toLowerCase());
          continue;
        }
        
        // Mark this movie ID as processed
        processedMovieIds.add(movie.id);

        // Get movie details - wrap release dates in try-catch as it's non-critical
        const [videos, externalIds, credits, details] = await Promise.all([
          getMovieVideos(movie.id),
          getMovieExternalIds(movie.id),
          getMovieCredits(movie.id),
          getMovieDetails(movie.id),
        ]);
        
        // Fetch release dates separately (non-critical, don't fail if it errors)
        let releaseDates: string | null = null;
        try {
          releaseDates = await getMovieReleaseDates(movie.id);
        } catch (e) {
          console.log(`[Recommendations] Could not fetch age rating for "${movie.title || movie.name || aiRec.title}":`, e);
        }
        
        // Filter out documentaries (genre ID 99)
        const genres = details?.genres || [];
        const isDocumentary = genres.some((g: { id: number }) => g.id === 99);
        if (isDocumentary) {
          console.log(`[Recommendations] Filtering out documentary: "${aiRec.title}" (genre IDs: ${genres.map((g: { id: number }) => g.id).join(', ')})`);
          processedTitles.add(aiRec.title.toLowerCase());
          continue;
        }
        
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

        // Filter by runtime constraints if specified in query
        if (runtime !== null && (runtimeConstraints.maxMinutes !== null || runtimeConstraints.minMinutes !== null)) {
          const runtimeMatches = 
            (runtimeConstraints.maxMinutes === null || runtime <= runtimeConstraints.maxMinutes) &&
            (runtimeConstraints.minMinutes === null || runtime >= runtimeConstraints.minMinutes);
          
          if (!runtimeMatches) {
            console.log(`[Recommendations] Filtering out "${movieTitle}" - Runtime ${runtime}min doesn't match constraints (max: ${runtimeConstraints.maxMinutes}, min: ${runtimeConstraints.minMinutes})`);
            processedTitles.add(aiRec.title.toLowerCase());
            continue;
          }
        }

        const trailerKey = videos?.find((v) => v.site === 'YouTube' && v.type === 'Trailer')?.key;
        const trailerUrl = trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : null;

        const providersList: StreamingProvider[] = [];
        const movieTitle = movie.title || movie.name || aiRec.title;
        
        // Handle streaming providers - with better error handling and retry logic
        let watch: any = null;
        let providerError: any = null;
        
        // Try to fetch watch providers with retries
        for (let retryCount = 0; retryCount <= 2; retryCount++) {
          try {
            if (retryCount > 0) {
              console.log(`[Recommendations] Retrying watch providers fetch for "${movieTitle}" (attempt ${retryCount + 1})`);
              await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
            }
            watch = await getWatchProviders(movie.id, 'GB');
            providerError = null;
            break; // Success, exit retry loop
          } catch (err) {
            providerError = err;
            if (retryCount === 2) {
              console.error(`[Recommendations] Error fetching providers for "${movieTitle}" after 3 attempts:`, err);
            }
          }
        }

        // Process watch providers if we got them
        if (watch && watch.flatrate && watch.flatrate.length > 0) {
          for (const p of watch.flatrate) {
            if (p.provider_id && p.provider_name) {
              providersList.push({ 
                id: p.provider_id, 
                name: p.provider_name, 
                logoPath: p.logo_path || null
              });
            }
          }
          console.log(`[Recommendations] "${movieTitle}" - Found ${providersList.length} streaming providers: ${providersList.map(p => p.name).join(', ') || 'none'}`);
        } else if (watch) {
          console.log(`[Recommendations] "${movieTitle}" - No flatrate providers available`);
        } else {
          console.log(`[Recommendations] "${movieTitle}" - Watch providers API returned null/undefined`);
        }

        // Filter providers to only show those the user has selected
        const filteredProviders = providers.length > 0 
          ? providersList.filter((p) => providers.includes(p.id))
          : providersList;
        
        // Prefer OMDB poster, fallback to TMDB poster
        const posterUrl = ratings.posterUrl || tmdbImage(movie.poster_path, 'w342');

        // Create the movie recommendation object
        const movieRec: Recommendation = {
          id: movie.id,
          title: movieTitle,
          overview: movie.overview || '',
          posterUrl,
          releaseYear: movie.release_date ? movie.release_date.slice(0, 4) : (aiRec.year?.toString() || null),
          runtime: runtime || null,
          imdbRating: ratings.imdbRating || null,
          rottenTomatoesRating: ratings.rottenTomatoesRating || null,
          trailerUrl,
          reason: aiRec.reason || undefined,
          director: director || null,
          actors: actors.length > 0 ? actors : undefined,
          ageRating: releaseDates || null,
          providers: [], // Will be set below
        };

        // Decide where to place the movie based on streaming availability
        // IMPORTANT: All movies MUST go to either recommendations or otherServicesRecommendations or unmatched
        // Never filter out completely
        // RULE: Main recommendations should ONLY have movies available on user's selected services
        if (providers.length > 0) {
          // User has selected services - be strict about main recommendations
          if (filteredProviders.length > 0) {
            // Movie IS on user's selected services - main recommendations
            console.log(`[Recommendations] "${movieRec.title}" → Main Recommendations (has ${filteredProviders.length} matching providers)`);
            recommendations.push({
              ...movieRec,
              providers: filteredProviders,
            });
          } else if (providersList.length > 0) {
            // Movie has providers but NOT on user's selected services - other services section
            console.log(`[Recommendations] "${movieRec.title}" → Other Services (has ${providersList.length} providers, none match user selection)`);
            otherServicesRecommendations.push({
              ...movieRec,
              providers: [...providersList],
            });
          } else {
            // Movie has NO providers at all - still go to other services (not main)
            console.log(`[Recommendations] "${movieRec.title}" → Other Services (no providers available)`);
            otherServicesRecommendations.push({
              ...movieRec,
              providers: [],
            });
          }
        } else {
          // User hasn't selected any services - show all movies in main recommendations
          console.log(`[Recommendations] "${movieRec.title}" → Main Recommendations (no service filter)`);
          recommendations.push({
            ...movieRec,
            providers: providersList,
          });
        }
        
        processedTitles.add(aiRec.title.toLowerCase());
      } catch (e) {
        // Error processing movie - add to unmatched (NOT filtered out)
        console.error(`[Recommendations] Error processing "${aiRec.title}":`, e);
        unmatchedRecommendations.push({
          title: aiRec.title,
          year: aiRec.year,
          reason: aiRec.reason
        });
        processedTitles.add(aiRec.title.toLowerCase());
      }
    }
    
    // Verify all AI recommendations were processed
    const missingCount = aiRecommendations.filter(r => !processedTitles.has(r.title.toLowerCase())).length;
    if (missingCount > 0) {
      console.warn(`[Recommendations] WARNING: ${missingCount} AI recommendations were not processed!`);
    }

    // Final deduplication pass - remove any remaining duplicates by movie ID
    // This is a safety net in case duplicates somehow got through
    const finalRecommendationsMap = new Map<number, Recommendation>();
    const finalOtherServicesMap = new Map<number, Recommendation>();
    
    recommendations.forEach(rec => {
      if (!finalRecommendationsMap.has(rec.id)) {
        finalRecommendationsMap.set(rec.id, rec);
      } else {
        console.log(`[Recommendations] Removing duplicate from main recommendations: ID ${rec.id} - "${rec.title}"`);
      }
    });
    
    otherServicesRecommendations.forEach(rec => {
      if (!finalOtherServicesMap.has(rec.id)) {
        finalOtherServicesMap.set(rec.id, rec);
      } else {
        console.log(`[Recommendations] Removing duplicate from other services: ID ${rec.id} - "${rec.title}"`);
      }
    });

    const finalRecommendations = Array.from(finalRecommendationsMap.values());
    const otherServicesToShow = Array.from(finalOtherServicesMap.values());
    
    console.log(`[Recommendations] Final counts - Main: ${finalRecommendations.length}, Other Services: ${otherServicesToShow.length}, Unmatched: ${unmatchedRecommendations.length}`);

    return NextResponse.json({ 
      recommendations: finalRecommendations,
      otherServices: otherServicesToShow,
      unmatched: unmatchedRecommendations
    });
  } catch (e: any) {
    console.error('Recommendation API error:', e);
    console.error('Error stack:', e?.stack);
    return NextResponse.json(
      { 
        error: e?.message || 'Unexpected error', 
        recommendations: [],
        otherServices: [],
        unmatched: []
      },
      { status: 500 }
    );
  }
}

