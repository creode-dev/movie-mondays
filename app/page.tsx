"use client";

import { useRouter } from "next/navigation";
import SearchForm from "@/components/SearchForm";

export default function HomePage() {
  const router = useRouter();

  return (
    <main>
      <SearchForm onResults={() => router.push("/recommendations")}/>
    </main>
  );
}


