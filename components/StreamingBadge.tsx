import type { StreamingProvider } from "@/types/movie";

export default function StreamingBadge({ provider }: { provider: StreamingProvider }) {
  // Use larger logo size for better clarity - w154 (154px) or w185 (185px) for clearer logos
  const logoUrl = provider.logoPath 
    ? `https://image.tmdb.org/t/p/w185${provider.logoPath}`
    : null;

  if (logoUrl) {
    return (
      <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-white shadow-md ring-1 ring-gray-300">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={logoUrl} 
          alt={provider.name}
          className="h-full w-full object-contain p-2"
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback to text if no logo
  return (
    <span className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 border border-gray-300" title={provider.name}>
      {provider.name}
    </span>
  );
}
