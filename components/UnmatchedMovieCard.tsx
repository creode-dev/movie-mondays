"use client";

import type { UnmatchedRecommendation } from "@/types/movie";
import { getImdbSearchUrl, getLetterboxdSearchUrl, getGoogleSearchUrl } from "@/lib/searchLinks";

export default function UnmatchedMovieCard({ recommendation }: { recommendation: UnmatchedRecommendation }) {
  return (
    <div className="rounded-lg border border-white/20 bg-white/5 p-5 backdrop-blur-sm">
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-bold text-white">
            {recommendation.title}
          </h3>
          {recommendation.year && (
            <p className="mt-1 text-sm text-gray-400">{recommendation.year}</p>
          )}
        </div>

        {recommendation.reason && (
          <div className="rounded-lg bg-gradient-to-r from-[#e94560]/30 to-[#ff6b9d]/30 p-3 border border-[#e94560]/30">
            <p className="text-sm text-gray-200">
              <span className="font-semibold text-white">Why you might like it:</span>{" "}
              {recommendation.reason}
            </p>
          </div>
        )}

        <div className="rounded-lg bg-gray-800/50 p-3 border border-gray-700/50">
          <p className="text-xs text-gray-400 mb-3">
            This film couldn't be found in our database. Search for it on these platforms:
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={getImdbSearchUrl(recommendation.title, recommendation.year)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-yellow-600/20 px-3 py-1.5 text-xs font-medium text-yellow-300 hover:bg-yellow-600/30 transition-colors border border-yellow-600/30"
            >
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.5 0h-23C.225 0 0 .225 0 .5v23c0 .275.225.5.5.5h23c.275 0 .5-.225.5-.5v-23c0-.275-.225-.5-.5-.5zM8.133 20.467H4.267v-9.6h3.866v9.6zM6.2 9.2H6.133c-1.295 0-2.133-.891-2.133-2.001C4 5.891 4.838 5 6.133 5c1.295 0 2.133.891 2.2 2.199 0 1.11-.838 2.001-2.133 2.001zm14.467 11.267h-3.867v-4.667c0-1.175-.025-2.691-1.641-2.691-1.641 0-1.891 1.282-1.891 2.609v4.749h-3.867V9.733h3.711v1.301h.05c.516-.976 1.774-2.008 3.65-2.008 3.908 0 4.629 2.567 4.629 5.899v5.642z"/>
              </svg>
              IMDb
            </a>
            <a
              href={getLetterboxdSearchUrl(recommendation.title)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600/20 px-3 py-1.5 text-xs font-medium text-blue-300 hover:bg-blue-600/30 transition-colors border border-blue-600/30"
            >
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0L4.5 3v9c0 4.97 3.41 9.47 7.5 10.46 4.09-1 7.5-5.49 7.5-10.46V3L12 0z"/>
              </svg>
              Letterboxd
            </a>
            <a
              href={getGoogleSearchUrl(recommendation.title, recommendation.year)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-gray-600/20 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600/30 transition-colors border border-gray-600/30"
            >
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

