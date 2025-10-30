import Image from "next/image";
import type { Recommendation } from "@/types/movie";
import StreamingBadge from "@/components/StreamingBadge";

export default function MovieCard({ movie }: { movie: Recommendation }) {
  return (
    <article className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
      {movie.posterUrl && (
        <div className="relative h-80 w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover"/>
        </div>
      )}
      <div className="space-y-2 p-4">
        <h3 className="text-lg font-semibold">
          {movie.title}
          {movie.releaseYear ? <span className="text-gray-500"> ({movie.releaseYear})</span> : null}
        </h3>
        <p className="text-sm text-gray-700 line-clamp-4">{movie.overview}</p>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {movie.imdbRating && <span>IMDb: {movie.imdbRating}</span>}
          {movie.rottenTomatoesRating && <span>RT: {movie.rottenTomatoesRating}</span>}
        </div>
        {movie.reason && (
          <p className="text-sm text-gray-900"><span className="font-medium">Why you might like it:</span> {movie.reason}</p>
        )}
        <div className="flex flex-wrap gap-2 pt-2">
          {movie.providers.map((p) => (
            <StreamingBadge key={p.id} provider={p} />
          ))}
        </div>
        {movie.trailerUrl && (
          <div className="pt-2">
            <a className="text-blue-600 hover:underline" href={movie.trailerUrl} target="_blank" rel="noreferrer">Watch trailer</a>
          </div>
        )}
      </div>
    </article>
  );
}


