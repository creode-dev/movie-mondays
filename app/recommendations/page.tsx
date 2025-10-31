"use client";

import { useEffect, useState } from "react";
import MovieCard from "@/components/MovieCard";
import UnmatchedMovieCard from "@/components/UnmatchedMovieCard";
import LoadingProgress from "@/components/LoadingProgress";
import type { Recommendation, UnmatchedRecommendation } from "@/types/movie";

export default function RecommendationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Recommendation[]>([]);
  const [otherServices, setOtherServices] = useState<Recommendation[]>([]);
  const [unmatched, setUnmatched] = useState<UnmatchedRecommendation[]>([]);
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    const raw = sessionStorage.getItem("mm_last_query");
    if (!raw) {
      setError("No query provided. Go back and search again.");
      setLoading(false);
      return;
    }
    const payload = JSON.parse(raw);
    setQuery(payload.query || "");
    fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || 'Failed to get recommendations');
        }
        return json;
      })
      .then((json) => {
        console.log('API Response:', {
          recommendations: json.recommendations?.length || 0,
          otherServices: json.otherServices?.length || 0,
          unmatched: json.unmatched?.length || 0,
        });
        setData(json.recommendations ?? []);
        setOtherServices(json.otherServices ?? []);
        setUnmatched(json.unmatched ?? []);
      })
      .catch((e) => {
        console.error('Error fetching recommendations:', e);
        setError(e.message || 'An error occurred');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingProgress />;
  }
  if (error) {
    return (
      <div className="rounded-lg border border-red-500/50 bg-red-900/20 backdrop-blur-sm p-4">
        <p className="font-medium text-red-300">Error</p>
        <p className="text-red-200">{error}</p>
        <a href="/" className="mt-2 inline-block text-[#ff6b9d] hover:text-[#ffa07a] hover:underline">← Back to search</a>
      </div>
    );
  }
  // Show unmatched or other services even if main recommendations are empty
  if (!data.length && !otherServices.length && !unmatched.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-300">No recommendations found. Try adjusting your filters.</p>
        <a href="/" className="mt-2 inline-block text-[#ff6b9d] hover:text-[#ffa07a] hover:underline">← Back to search</a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Your Recommendations</h2>
          <div className="flex gap-4">
            <a href="/favourites" className="text-sm text-[#ff6b9d] hover:text-[#ffa07a] hover:underline transition-colors">
              My Favourites
            </a>
            <a href="/" className="text-sm text-[#ff6b9d] hover:text-[#ffa07a] hover:underline transition-colors">← New search</a>
          </div>
        </div>
        {query && (
          <div className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 backdrop-blur-sm">
            <p className="text-sm text-gray-400 mb-1">Search query:</p>
            <p className="text-base font-medium text-gray-200 italic">"{query}"</p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
        {data.map((rec) => (
          <MovieCard key={rec.id} movie={rec} />
        ))}
      </div>
      {otherServices.length > 0 && (
        <div className="mt-12 space-y-6">
          <div className="border-t border-white/20 pt-6">
            <h3 className="text-xl font-bold text-white mb-2">Available on Other Streaming Services</h3>
            <p className="text-sm text-gray-400 mb-4">These films match your preferences but are available on services you haven't selected.</p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
              {otherServices.map((rec) => (
                <MovieCard key={rec.id} movie={rec} />
              ))}
            </div>
          </div>
        </div>
      )}
      {unmatched.length > 0 && (
        <div className="mt-12 space-y-6">
          <div className="border-t border-white/20 pt-6">
            <h3 className="text-xl font-bold text-white mb-2">Additional Recommendations</h3>
            <p className="text-sm text-gray-400 mb-4">These films were recommended by AI but couldn't be found in our database. You can search for them on other platforms.</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {unmatched.map((rec, idx) => (
                <UnmatchedMovieCard key={idx} recommendation={rec} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


