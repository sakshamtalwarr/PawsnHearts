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
              particleCount: 80,
              spread: 70,
              origin: { y: 0.7 },
              colors: ['#f39c12', '#e67e22', '#2ecc71', '#3498db'],
            });
          }
        });
      },
      { threshold: 0.25 }
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
    <section id="success" ref={sectionRef} className="py-20 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          Triumphs of Love & Care
        </span>
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
          Success Stories & Happy Tails
        </h2>
        <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto mt-2">
          These fighters survived terrible highway collisions, trauma, and abandonment. Today, they are healthy, healed, and thriving.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {successList.map((animal) => (
          <PetCard key={animal.id} animal={animal} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
};
