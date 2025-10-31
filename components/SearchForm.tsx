"use client";

import { useState, useEffect } from "react";

type Props = {
  onResults?: () => void;
};

const UK_PROVIDER_OPTIONS: { id: number; name: string }[] = [
  { id: 35, name: "All 4" },
  { id: 9, name: "Amazon Prime Video" },
  { id: 532, name: "Arrow Player" },
  { id: 188, name: "BBC iPlayer" },
  { id: 682, name: "BFI Player" },
  { id: 521, name: "Curzon Home Cinema" },
  { id: 337, name: "Disney Plus" },
  { id: 350, name: "Apple TV Plus" },
  { id: 15, name: "Hulu" },
  { id: 526, name: "Mubi" },
  { id: 8, name: "Netflix" },
  { id: 103, name: "Now TV" },
  { id: 384, name: "Paramount+" },
  { id: 531, name: "Peacock" },
  { id: 445, name: "Rakuten TV" },
  { id: 2, name: "Apple iTunes" },
  { id: 68, name: "Microsoft Store" },
].sort((a, b) => a.name.localeCompare(b.name));

// Template pools for generating dynamic examples
const ARTHOUSE_DIRECTORS = ["Akira Kurosawa", "Ingmar Bergman", "Andrei Tarkovsky", "Wong Kar-wai", "Chantal Akerman", "Apichatpong Weerasethakul", "Agnès Varda", "Jean-Luc Godard", "Jim Jarmusch", "Terrence Malick", "Yasujirō Ozu", "Federico Fellini"];
const ARTHOUSE_GENRES = ["slow cinema", "art house dramas", "experimental films", "international cinema", "contemporary world cinema", "postmodern cinema", "foreign language films", "auteur cinema"];
const MAINSTREAM_GENRES = ["sci-fi thrillers", "psychological dramas", "dark comedies", "neo-noir", "coming-of-age stories", "indie dramas"];
const ACTORS_OBSCURE = ["Tilda Swinton", "Isabelle Huppert", "Tony Leung", "Charlotte Rampling", "Willem Dafoe", "Juliette Binoche"];
const ACTORS_MAINSTREAM = ["Joaquin Phoenix", "Toni Collette", "Adam Driver", "Florence Pugh", "Paul Mescal"];
const THEMES = ["existentialism", "memory and time", "identity crisis", "urban alienation", "found family", "moral ambiguity", "loss and grief", "social commentary"];

function generateExampleSearches(): string[] {
  const examples: string[] = [];
  
  // Helper to get random item from array
  const getRandom = <T,>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
  };
  
  // 1. Arthouse director example (always include one)
  examples.push(`${getRandom(ARTHOUSE_DIRECTORS)} films`);
  
  // 2. Arthouse genre with theme
  examples.push(`${getRandom(ARTHOUSE_GENRES)} exploring ${getRandom(THEMES)}`);
  
  // 3. Rating filter example - mix of mainstream and arthouse
  const ratingFilters = [
    "rating over 7 on IMDB",
    "IMDB rating over 7.5",
    "IMDB rating over 8",
    "highly rated (IMDB over 7)"
  ];
  const genreForRating = getRandom([...ARTHOUSE_GENRES, ...MAINSTREAM_GENRES]);
  examples.push(`${genreForRating} with ${getRandom(ratingFilters)}`);
  
  // 4. Runtime filter example
  const runtimeFilters = [
    "running time less than 2 hours",
    "movies under 90 minutes",
    "shorter films under 100 minutes",
    "quick watches under 1h 30m",
    "films under 2 hours"
  ];
  const genreForRuntime = getRandom([...ARTHOUSE_GENRES, "indie dramas", "documentaries", "short films"]);
  examples.push(`${genreForRuntime} with ${getRandom(runtimeFilters)}`);
  
  // 5. Actor + arthouse preference
  const actor = getRandom([...ACTORS_OBSCURE, ...ACTORS_MAINSTREAM]);
  const actorGenre = getRandom([...ARTHOUSE_GENRES, "indie films"]);
  examples.push(`${actor} in ${actorGenre}`);
  
  // 6. International/obscure films
  const obscureOptions = [
    `International ${getRandom(ARTHOUSE_GENRES)}`,
    `Obscure ${getRandom(ARTHOUSE_GENRES)} from international filmmakers`,
    `Underrated ${getRandom(ARTHOUSE_GENRES)}`,
    `Hidden gem ${getRandom(ARTHOUSE_GENRES)}`
  ];
  examples.push(getRandom(obscureOptions));
  
  // 7. Combined filters (rating + runtime or theme)
  if (Math.random() > 0.5) {
    examples.push(`Well-rated ${getRandom(MAINSTREAM_GENRES)} (${getRandom(ratingFilters)}) ${getRandom(runtimeFilters)}`);
  } else {
    examples.push(`${getRandom(ARTHOUSE_GENRES)} with ${getRandom(THEMES)} and ${getRandom(ratingFilters)}`);
  }
  
  // Shuffle and return 6 examples
  return examples.sort(() => Math.random() - 0.5).slice(0, 6);
}

export default function SearchForm({ onResults }: Props) {
  const [queryText, setQueryText] = useState("");
  const [exampleSearches, setExampleSearches] = useState<string[]>([]);
  
  // Load streaming services from localStorage or use defaults
  const [providers, setProviders] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mm_streaming_services');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.error('Failed to parse saved streaming services:', e);
        }
      }
    }
    return [9, 8, 188, 337]; // Amazon Prime, Netflix, BBC iPlayer, Disney Plus
  });

  // Generate new examples on mount - different each time
  useEffect(() => {
    setExampleSearches(generateExampleSearches());
  }, []);

  // Save to localStorage whenever providers change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mm_streaming_services', JSON.stringify(providers));
    }
  }, [providers]);

  function toggleProvider(id: number) {
    setProviders((prev) => {
      const updated = prev.includes(id) 
        ? prev.filter((p) => p !== id) 
        : [...prev, id];
      return updated;
    });
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
        <p className="mb-2 text-sm text-gray-300">Quick examples:</p>
        <div className="flex flex-wrap gap-2">
          {exampleSearches.length > 0 ? (
            exampleSearches.map((example, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadExample(example)}
                className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-gray-200 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white border border-[#e94560]/20"
              >
                {example}
              </button>
            ))
          ) : (
            <div className="text-xs text-gray-400">Loading examples...</div>
          )}
        </div>
      </div>

      <div>
        <label className="block">
          <span className="text-sm font-medium text-gray-200">What kind of movies are you looking for?</span>
          <textarea
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-gray-100 placeholder:text-gray-400 backdrop-blur-sm focus:border-[#e94560] focus:outline-none focus:ring-2 focus:ring-[#e94560]/50 transition-colors"
            placeholder="e.g. 'Arthouse films exploring existentialism', 'IMDB rating over 7.5 with running time less than 2 hours', 'International cinema from Wong Kar-wai', 'Slow cinema with moral ambiguity'..."
            rows={3}
          />
          <p className="mt-1 text-xs text-gray-400">Describe what you want: genres, actors, directors, themes, ratings, runtime, similar movies, etc. AI will understand natural language.</p>
        </label>
      </div>

      <div className="rounded-lg border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
        <span className="text-sm font-medium text-gray-200">Streaming services (UK)</span>
        <p className="mt-1 mb-3 text-xs text-gray-400">Select the services you subscribe to</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {UK_PROVIDER_OPTIONS.map((p) => (
            <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded-md p-2 text-gray-200 hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                checked={providers.includes(p.id)}
                onChange={() => toggleProvider(p.id)}
                className="h-4 w-4 rounded border-white/30 bg-white/5 text-[#e94560] focus:ring-2 focus:ring-[#e94560]/50 focus:ring-offset-0"
              />
              <span className="text-sm">{p.name}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-gradient-accent px-6 py-3 text-base font-semibold text-white shadow-lg shadow-[#e94560]/30 transition-all hover:shadow-xl hover:shadow-[#e94560]/40 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#e94560] focus:ring-offset-2 focus:ring-offset-[#1a1a2e] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        disabled={!queryText.trim()}
      >
        Get recommendations
      </button>
    </form>
  );
}
