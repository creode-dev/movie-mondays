import type { StreamingProvider } from "@/types/movie";

export default function StreamingBadge({ provider }: { provider: StreamingProvider }) {
  return (
    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-800">
      {provider.name}
    </span>
  );
}


