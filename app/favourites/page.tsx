"use client";

import { useEffect, useState } from "react";
import MovieCard from "@/components/MovieCard";
import type { Recommendation } from "@/types/movie";

export default function FavouritesPage() {
  const [favourites, setFavourites] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavourites = () => {
    if (typeof window !== 'undefined') {
      // Get stored movie data from localStorage (stored when favouriting)
      const storedMovies = JSON.parse(localStorage.getItem('mm_favourite_movies') || '[]');
      const favouriteIds = JSON.parse(localStorage.getItem('mm_favourites') || '[]');
      
      // Filter to only show movies that are still in the favourites list (in case user removed some)
      const validFavourites = storedMovies.filter((movie: Recommendation) => 
        favouriteIds.includes(movie.id)
      );
      
      setFavourites(validFavourites);
      
      // Also clean up localStorage if there are mismatches
      if (storedMovies.length !== validFavourites.length) {
        localStorage.setItem('mm_favourite_movies', JSON.stringify(validFavourites));
      }
      
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavourites();
    
    // Listen for storage changes (when favourites are updated from other tabs/pages)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mm_favourites' || e.key === 'mm_favourite_movies') {
        loadFavourites();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (when favourites are updated on the same page)
    const handleFavouriteChange = () => {
      loadFavourites();
    };
    
    window.addEventListener('favouriteUpdated', handleFavouriteChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favouriteUpdated', handleFavouriteChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#e94560] border-t-transparent"></div>
        <p className="text-lg text-gray-300">Loading favourites…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">My Favourite Films</h2>
        <a href="/" className="text-sm text-[#ff6b9d] hover:text-[#ffa07a] hover:underline transition-colors">← Back to search</a>
      </div>
      {favourites.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-300 mb-2">You haven't favourited any films yet.</p>
          <p className="text-sm text-gray-400 mb-4">Click the heart icon on any movie card to add it to your favourites.</p>
          <a href="/" className="inline-block text-[#ff6b9d] hover:text-[#ffa07a] hover:underline">Start browsing →</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {favourites.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}

