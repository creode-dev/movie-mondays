import Image from 'next/image';
import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="relative w-full max-w-2xl mx-auto block hover:opacity-90 transition-opacity">
      <Image
        src="/movie-mondays-logo-landscape.svg"
        alt="Movie Mondays Logo"
        width={800}
        height={200}
        className="w-full h-auto object-contain max-h-[100px]"
        priority
      />
    </Link>
  );
}
