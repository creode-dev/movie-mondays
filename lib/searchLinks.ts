/**
 * Helper functions to generate search URLs for external platforms
 */

export function getImdbSearchUrl(title: string, year?: number): string {
  const searchQuery = year ? `${title} ${year}` : title;
  return `https://www.imdb.com/find?q=${encodeURIComponent(searchQuery)}`;
}

export function getLetterboxdSearchUrl(title: string): string {
  return `https://letterboxd.com/search/${encodeURIComponent(title)}/`;
}

export function getGoogleSearchUrl(title: string, year?: number): string {
  const searchQuery = year ? `${title} ${year} movie` : `${title} movie`;
  return `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
}

