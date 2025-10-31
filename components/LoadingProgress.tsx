"use client";

import { useState, useEffect } from "react";

const loadingMessages = [
  "Searching for films...",
  "Checking the ratings...",
  "Finding images...",
  "Identifying streaming services...",
  "Gathering recommendations...",
];

export default function LoadingProgress() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <div className="relative">
        {/* Outer spinning circle */}
        <div className="h-16 w-16 rounded-full border-4 border-[#e94560]/20"></div>
        {/* Inner spinning circle */}
        <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-transparent border-t-[#e94560] animate-spin"></div>
        {/* Inner pulsing circle */}
        <div className="absolute top-2 left-2 h-12 w-12 rounded-full bg-gradient-to-r from-[#e94560] to-[#ff6b9d] animate-pulse opacity-75"></div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-white transition-all duration-500">
          {loadingMessages[currentMessageIndex]}
        </p>
        <div className="flex justify-center space-x-1">
          {loadingMessages.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                idx === currentMessageIndex
                  ? "bg-[#ff6b9d] scale-125"
                  : "bg-gray-500/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

