import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles } from 'lucide-react';
import { Animal } from '../types';
import { PetCard } from './PetCard';

interface SuccessStoriesProps {
  animals: Animal[];
  onSelect: (animal: Animal) => void;
}

export const SuccessStories: React.FC<SuccessStoriesProps> = ({ animals, onSelect }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const confettiTriggered = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !confettiTriggered.current) {
            confettiTriggered.current = true;
            confetti({
              particleCount: 60,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#f472b6', '#fb7185', '#34d399', '#60a5fa'],
            });
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const successList = animals.filter(
    (a) => a.status === 'recovered' || a.status === 'adopted'
  );

  if (successList.length === 0) return null;

  return (
    <section id="success" ref={sectionRef} className="py-12 sm:py-20 px-3.5 sm:px-4 max-w-6xl mx-auto w-full relative z-10">
      <div className="text-center mb-8 sm:mb-12">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-pink-100 text-pink-800 border border-pink-200 mb-2.5 font-display">
          <Sparkles className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
          Triumphs of Love & Care
        </span>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display">
          Success Stories & Happy Tails 🐾
        </h2>
        <p className="text-slate-600 text-xs sm:text-base max-w-xl mx-auto mt-1.5 font-medium px-2">
          These fighters survived highway collisions, trauma, and abandonment. Today, they are healthy, healed, and thriving.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {successList.map((animal) => (
          <PetCard key={animal.id} animal={animal} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
};
