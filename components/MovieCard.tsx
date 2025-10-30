import type { Recommendation } from "@/types/movie";
import StreamingBadge from "@/components/StreamingBadge";

function formatRuntime(minutes: number | null | undefined): string {
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
}

export default function MovieCard({ movie }: { movie: Recommendation }) {
  return (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg">
      {movie.posterUrl && (
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={movie.posterUrl} 
            alt={`${movie.title} movie poster`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col space-y-3 p-5">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {movie.title}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-gray-600">
            {movie.releaseYear && (
              <span>{movie.releaseYear}</span>
            )}
            {movie.runtime && (
              <>
                {movie.releaseYear && <span aria-hidden="true">•</span>}
                <span>{formatRuntime(movie.runtime)}</span>
              </>
            )}
          </div>
        </div>

        {/* Prominent Ratings */}
        {(movie.imdbRating || movie.rottenTomatoesRating) && (
          <div className="flex gap-3" role="group" aria-label="Movie ratings">
            {movie.imdbRating && (
              <div className="flex items-center gap-1.5 rounded-lg bg-yellow-50 px-3 py-2 ring-1 ring-yellow-200">
                <span className="text-xs font-semibold uppercase text-yellow-800" aria-label="IMDb rating">
                  IMDb
                </span>
                <span className="text-base font-bold text-yellow-900" aria-label={`${movie.imdbRating} out of 10`}>
                  {movie.imdbRating}
                </span>
              </div>
            )}
            {movie.rottenTomatoesRating && (
              <div className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 ring-1 ring-red-200">
                <span className="text-xs font-semibold uppercase text-red-800" aria-label="Rotten Tomatoes rating">
                  RT
                </span>
                <span className="text-base font-bold text-red-900" aria-label={`${movie.rottenTomatoesRating} on Rotten Tomatoes`}>
                  {movie.rottenTomatoesRating}
                </span>
              </div>
            )}
          </div>
        )}

        {movie.director && (
          <p className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">Director:</span>{" "}
            <span className="text-gray-600">{movie.director}</span>
          </p>
        )}
        {movie.actors && movie.actors.length > 0 && (
          <p className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">Cast:</span>{" "}
            <span className="text-gray-600">{movie.actors.join(", ")}</span>
          </p>
        )}

        <p className="flex-1 text-sm leading-relaxed text-gray-700 line-clamp-3">
          {movie.overview}
        </p>

        {movie.reason && (
          <div className="rounded-lg bg-gradient-to-r from-[#e94560] to-[#ff6b9d] p-4 border-2 border-[#e94560]">
            <p className="text-sm text-white">
              <span className="font-bold text-white">Why you might like it:</span>{" "}
              <span className="text-white/95">{movie.reason}</span>
            </p>
          </div>
        )}

        <div className="mt-auto space-y-3">
          {movie.providers.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
                Available on
              </p>
              <div className="flex flex-wrap gap-3">
                {movie.providers.map((p) => (
                  <StreamingBadge key={p.id} provider={p} />
                ))}
              </div>
            </div>
          )}

          {movie.trailerUrl && (
            <a 
            className="inline-flex items-center gap-2 text-sm font-medium text-[#ff6b9d] transition-colors hover:text-[#ffa07a] hover:underline focus:outline-none focus:ring-2 focus:ring-[#e94560] focus:ring-offset-2 rounded" 
            href={movie.trailerUrl}
            target="_blank" 
            rel="noreferrer"
            aria-label={`Watch trailer for ${movie.title}`}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            Watch trailer
          </a>
          )}
        </div>
      </div>
    </article>
  );
}
