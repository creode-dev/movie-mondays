"use client";

import { useState } from "react";

type Props = {
  onResults?: () => void;
};

const UK_PROVIDER_OPTIONS: { id: number; name: string }[] = [
  { id: 8, name: "Netflix" },
  { id: 9, name: "Amazon Prime Video" },
  { id: 337, name: "Disney Plus" },
  { id: 350, name: "Apple TV Plus" },
  { id: 15, name: "Hulu" },
  { id: 384, name: "Paramount+" },
  { id: 531, name: "Peacock" },
  { id: 103, name: "Now TV" },
  { id: 188, name: "BBC iPlayer" },
  { id: 35, name: "All 4" },
  { id: 526, name: "Mubi" },
  { id: 682, name: "BFI Player" },
  { id: 521, name: "Curzon Home Cinema" },
  { id: 532, name: "Arrow Player" },
  { id: 445, name: "Rakuten TV" },
  { id: 2, name: "Apple iTunes" },
  { id: 68, name: "Microsoft Store" },
];

const EXAMPLE_SEARCHES = [
  "Movies like Blade Runner with dark sci-fi themes",
  "Christopher Nolan films with complex narratives",
  "Feel-good movies with Chris Pratt",
  "Time travel movies that make you think",
  "Popular action movies from the last few years",
];

export default function SearchForm({ onResults }: Props) {
  const [queryText, setQueryText] = useState("");
  const [providers, setProviders] = useState<number[]>([8, 9, 337]);

  function toggleProvider(id: number) {
    setProviders((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function loadExample(example: string) {
    setQueryText(example);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!queryText.trim()) return;
    const payload = {
      query: queryText.trim(),
      streamingServices: providers,
    };
    sessionStorage.setItem("mm_last_query", JSON.stringify(payload));
    onResults?.();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <p className="mb-2 text-sm text-gray-600">Quick examples:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_SEARCHES.map((example, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadExample(example)}
              className="rounded bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block">
          <span className="text-sm font-medium">What kind of movies are you looking for?</span>
          <textarea
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            placeholder="e.g. 'Sci-fi movies like Inception with mind-bending plots', 'Feel-good comedies with found family themes', 'Christopher Nolan films', 'Action movies with strong female leads'..."
            rows={3}
          />
          <p className="mt-1 text-xs text-gray-500">Describe what you want: genres, actors, directors, themes, similar movies, etc. AI will understand natural language.</p>
        </label>
      </div>

      <div>
        <span className="text-sm font-medium">Streaming services (UK)</span>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {UK_PROVIDER_OPTIONS.map((p) => (
            <label key={p.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={providers.includes(p.id)}
                onChange={() => toggleProvider(p.id)}
              />
              <span>{p.name}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
      >
        Get recommendations
      </button>
    </form>
  );
}


