"use client";

import { useEffect, useState } from "react";
import MovieCard from "@/components/MovieCard";
import type { Recommendation } from "@/types/movie";

export default function RecommendationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Recommendation[]>([]);

  useEffect(() => {
    const raw = sessionStorage.getItem("mm_last_query");
    if (!raw) {
      setError("No query provided. Go back and search again.");
      setLoading(false);
      return;
    }
    const payload = JSON.parse(raw);
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
      .then((json) => setData(json.recommendations ?? []))
      .catch((e) => {
        console.error('Error fetching recommendations:', e);
        setError(e.message || 'An error occurred');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#e94560] border-t-transparent"></div>
        <p className="text-lg text-gray-300">Loading recommendations…</p>
      </div>
    );
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
  if (!data.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-300">No recommendations found. Try adjusting your filters.</p>
        <a href="/" className="mt-2 inline-block text-[#ff6b9d] hover:text-[#ffa07a] hover:underline">← Back to search</a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Your Recommendations</h2>
        <a href="/" className="text-sm text-[#ff6b9d] hover:text-[#ffa07a] hover:underline transition-colors">← New search</a>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
        {data.map((rec) => (
          <MovieCard key={rec.id} movie={rec} />
        ))}
      </div>
    </div>
  );
}


