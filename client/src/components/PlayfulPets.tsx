import React, { useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PlayfulPets: React.FC = () => {
  const [petsCount, setPetsCount] = useState(0);
  const [isWagging, setIsWagging] = useState(false);
  const [speech, setSpeech] = useState("Hi friend! Pet me! 🐾");

  const handlePet = () => {
    const newCount = petsCount + 1;
    setPetsCount(newCount);
    setIsWagging(true);

    const happyQuotes = [
      "Woof! Belly rub time! 🐶",
      "Tail wagging intensifies! ❤️",
      "Thank you for caring for rescues! ✨",
      "Chikoo & Bruno say thank you! 🦴",
      "You're an animal superhero! 🦸‍♂️",
      "Street dog approved love! 🌟",
    ];

    setSpeech(happyQuotes[newCount % happyQuotes.length]);

    // Launch a cute mini confetti burst
    confetti({
      particleCount: 18,
      spread: 50,
      origin: { x: 0.9, y: 0.9 },
      colors: ['#f39c12', '#e67e22', '#ff6b6b'],
    });

    setTimeout(() => setIsWagging(false), 2000);
  };

  return (
    <>
      {/* 1. Subtle Floating Background Paw Prints */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[
          { left: '8%', size: 28, duration: '24s', delay: '0s' },
          { left: '22%', size: 34, duration: '28s', delay: '6s' },
          { left: '45%', size: 24, duration: '22s', delay: '12s' },
          { left: '68%', size: 38, duration: '30s', delay: '3s' },
          { left: '88%', size: 30, duration: '26s', delay: '9s' },
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
              className="text-brand-400"
            >
              <path d="M12 11c-2.2 0-4 1.8-4 4 0 1.9 1.3 3.5 3 3.9v.1c.3.1.7.1 1 0v-.1c1.7-.4 3-2 3-3.9 0-2.2-1.8-4-4-4zm-6-2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-9-5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </div>
        ))}
      </div>

      {/* 2. Interactive Bottom-Right Playful Pup Companion */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end group">
        {/* Thought Bubble */}
        <div className="mb-2 mr-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-lg border border-amber-200/80 text-xs font-bold text-slate-800 flex items-center gap-1.5 transition-all duration-300 animate-bounce-subtle">
          <Sparkles className="w-3.5 h-3.5 text-brand-500 fill-brand-400" />
          <span>{speech}</span>
        </div>

        {/* Pup Character Button */}
        <button
          onClick={handlePet}
          title="Pet the puppy!"
          className="relative bg-gradient-to-br from-amber-400 via-brand-500 to-orange-500 p-3.5 rounded-full shadow-2xl hover:shadow-brand-500/40 hover:scale-110 active:scale-95 transition-all border-2 border-white/90 flex items-center justify-center cursor-pointer group"
        >
          {/* Animated SVG Puppy Face with Wagging Tail */}
          <div className="relative w-10 h-10 flex items-center justify-center">
            {/* Wagging Tail */}
            <span
              className={`absolute -bottom-1 -left-2 w-4 h-4 rounded-full border-t-4 border-l-4 border-white ${
                isWagging ? 'animate-wag-tail' : 'animate-wiggle-slow'
              }`}
            />
            {/* Puppy Icon */}
            <span className="text-2xl select-none transition-transform group-hover:rotate-12">
              🐕
            </span>
          </div>

          {/* Hearts counter badge */}
          {petsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
              {petsCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
};

export const PetDivider: React.FC = () => {
  return (
    <div className="relative w-full py-8 flex items-center justify-center overflow-hidden pointer-events-none opacity-85">
      <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
      <div className="px-6 flex items-center gap-4 text-brand-400 font-display font-semibold text-xs tracking-wider uppercase">
        <span className="animate-bounce">🐾</span>
        <span className="text-slate-400">Adopt • Sponsor • Rehabilitate</span>
        <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>🐾</span>
      </div>
      <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
    </div>
  );
};
