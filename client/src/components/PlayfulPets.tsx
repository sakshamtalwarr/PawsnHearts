import React, { useState } from 'react';
import { Heart, Sparkles, Dog } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PlayfulPets: React.FC = () => {
  const [petsCount, setPetsCount] = useState(0);
  const [isWagging, setIsWagging] = useState(false);
  const [speech, setSpeech] = useState("Hi! Pet me!");
  const [showBubble, setShowBubble] = useState(false);

  const handlePet = () => {
    const newCount = petsCount + 1;
    setPetsCount(newCount);
    setIsWagging(true);
    setShowBubble(true);

    const happyQuotes = [
      "Woof! Belly rub time!",
      "Tail wagging intensifies!",
      "Thank you for caring!",
      "Street dog approved love!",
      "You're an animal superhero!",
    ];

    setSpeech(happyQuotes[newCount % happyQuotes.length]);

    // Launch a cute mini confetti burst
    confetti({
      particleCount: 16,
      spread: 45,
      origin: { x: 0.9, y: 0.9 },
      colors: ['#f472b6', '#fb7185', '#fbbf24'],
    });

    setTimeout(() => {
      setIsWagging(false);
    }, 2000);

    // Hide bubble after 3.5s on mobile
    setTimeout(() => {
      setShowBubble(false);
    }, 3500);
  };

  return (
    <>
      {/* 1. Subtle Floating Background Paw Prints */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[
          { left: '6%', size: 24, duration: '24s', delay: '0s' },
          { left: '25%', size: 30, duration: '28s', delay: '6s' },
          { left: '50%', size: 22, duration: '22s', delay: '12s' },
          { left: '75%', size: 32, duration: '30s', delay: '3s' },
          { left: '90%', size: 26, duration: '26s', delay: '9s' },
        ].map((paw, idx) => (
          <div
            key={idx}
            className="floating-paw opacity-15"
            style={{
              left: paw.left,
              animationDuration: paw.duration,
              animationDelay: paw.delay,
            }}
          >
            <svg
              width={paw.size}
              height={paw.size}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 11c-2.2 0-4 1.8-4 4 0 1.9 1.3 3.5 3 3.9v.1c.3.1.7.1 1 0v-.1c1.7-.4 3-2 3-3.9 0-2.2-1.8-4-4-4zm-6-2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-9-5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </div>
        ))}
      </div>

      {/* 2. Interactive Companion - Optimized for Mobile Thumb Reach */}
      <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-40 flex flex-col items-end group">
        {/* Thought Bubble - Shows on tap or hover, compact */}
        {showBubble && (
          <div className="mb-2 mr-1 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-lg border border-pink-200 text-[11px] sm:text-xs font-bold text-slate-800 flex items-center gap-1.5 animate-bounce-subtle max-w-[200px] truncate font-display">
            <Sparkles className="w-3.5 h-3.5 text-pink-500 fill-pink-400 shrink-0" />
            <span className="truncate">{speech}</span>
          </div>
        )}

        {/* Pup Character Button */}
        <button
          onClick={handlePet}
          title="Pet the puppy!"
          className="relative bg-gradient-to-br from-pink-400 via-rose-500 to-amber-400 p-2.5 sm:p-3 rounded-full shadow-xl hover:shadow-pink-500/30 hover:scale-110 active:scale-95 transition-all border-2 border-white/90 flex items-center justify-center cursor-pointer"
        >
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center">
            <span
              className={`absolute -bottom-0.5 -left-1.5 w-3.5 h-3.5 rounded-full border-t-2 border-l-2 border-white ${
                isWagging ? 'animate-wag-tail' : 'animate-wiggle-slow'
              }`}
            />
            <Dog className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>

          {/* Hearts counter badge */}
          {petsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
              {petsCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
};

export const PetDivider: React.FC = () => (
  <div className="relative py-4 sm:py-6 flex items-center justify-center overflow-hidden pointer-events-none opacity-40">
    <div className="h-[1px] bg-gradient-to-r from-transparent via-pink-300 to-transparent w-full max-w-2xl" />
    <Heart className="absolute bg-[#fff0f5] px-2.5 w-8 h-8 text-pink-300 fill-pink-200" />
  </div>
);
