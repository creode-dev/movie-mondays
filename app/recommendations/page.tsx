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
      <div className="text-center py-8">
        <p className="text-lg">Loading recommendations…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-4">
        <p className="font-medium text-red-800">Error</p>
        <p className="text-red-600">{error}</p>
        <a href="/" className="mt-2 inline-block text-blue-600 hover:underline">← Back to search</a>
      </div>
    );
  }
  if (!data.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No recommendations found. Try adjusting your filters.</p>
        <a href="/" className="mt-2 inline-block text-blue-600 hover:underline">← Back to search</a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((rec) => (
        <MovieCard key={rec.id} movie={rec} />
      ))}
    </div>
  );
}


