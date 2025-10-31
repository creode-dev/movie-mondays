import type { StreamingProvider } from "@/types/movie";

export default function StreamingBadge({ provider }: { provider: StreamingProvider }) {
  // Use larger logo size for better clarity - w154 (154px) or w185 (185px) for clearer logos
  const logoUrl = provider.logoPath 
    ? `https://image.tmdb.org/t/p/w185${provider.logoPath}`
    : null;

  if (logoUrl) {
    return (
      <div className="relative aspect-square w-full flex-shrink-0 overflow-hidden rounded-lg bg-white shadow-md ring-1 ring-gray-300 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={logoUrl} 
          alt={provider.name}
          className="max-h-full max-w-full object-contain p-2"
          loading="lazy"
          style={{ objectPosition: 'center' }}
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
