import React, { useState } from 'react';
import { ArrowRight, Video, Sparkles, AlertCircle, Share2, Heart } from 'lucide-react';
import { Animal, formatMediaUrl } from '../types';
import { ShareModal } from './ShareModal';

interface PetCardProps {
  animal: Animal;
  onSelect: (animal: Animal) => void;
  onDonate?: (animalName: string) => void;
}

export const PetCard: React.FC<PetCardProps> = ({ animal, onSelect, onDonate }) => {
  const [isShareOpen, setIsShareOpen] = useState(false);

  const isVideo = Array.isArray(animal.media) && animal.media.some((m) => m?.media_type === 'video' || (typeof m?.url === 'string' && m.url.endsWith('.mp4')));
  const fallbackImg = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800';
  const imgUrl = formatMediaUrl(animal.hero_image);

  const fundsNeeded = Number(animal.funds_needed || 0);
  const fundsRaised = Number(animal.funds_raised || 0);
  const fundPercent = fundsNeeded > 0 ? Math.min(100, Math.round((fundsRaised / fundsNeeded) * 100)) : 0;

  const safeTags: string[] = Array.isArray(animal.tags)
    ? animal.tags
    : typeof animal.tags === 'string'
    ? (animal.tags as string).split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <>
      <div
        onClick={() => onSelect(animal)}
        className="group bg-white/95 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-pink-200/50 border border-pink-200/70 hover:border-pink-300 transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer"
      >
        {/* Media Cover */}
        <div className="relative aspect-[16/11] sm:aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <img
            src={imgUrl}
            alt={animal.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackImg;
            }}
          />

          {/* Video inside badge */}
          {isVideo && (
            <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full flex items-center gap-1 shadow-md">
              <Video className="w-3 h-3 text-rose-400" />
              Video
            </span>
          )}

          {/* Status Badge */}
          <div className="absolute top-2.5 right-2.5">
            {animal.status === 'urgent' && (
              <span className="bg-rose-500 text-white text-[11px] sm:text-xs font-black px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md flex items-center gap-1 animate-pulse">
                <AlertCircle className="w-3 h-3" /> Urgent
              </span>
            )}
            {animal.status === 'available' && animal.category === 'adoption' && (
              <span className="bg-pink-500 text-white text-[11px] sm:text-xs font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md">
                Adopt Me ❤️
              </span>
            )}
            {animal.status === 'in_treatment' && (
              <span className="bg-amber-500 text-white text-[11px] sm:text-xs font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md">
                In Treatment 🏥
              </span>
            )}
            {animal.status === 'recovered' && (
              <span className="bg-emerald-500 text-white text-[11px] sm:text-xs font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Recovered
              </span>
            )}
            {animal.status === 'adopted' && (
              <span className="bg-indigo-600 text-white text-[11px] sm:text-xs font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md">
                Adopted 🏡
              </span>
            )}
          </div>
        </div>

        {/* Info Body */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="text-lg sm:text-xl font-black text-slate-800 group-hover:text-pink-600 transition-colors font-display truncate">
                {animal.name}
              </h3>
              {animal.category === 'adoption' ? (
                <span className="text-[10px] sm:text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-display shrink-0">
                  Adoption
                </span>
              ) : (
                <span className="text-[10px] sm:text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-display shrink-0">
                  Medical Care
                </span>
              )}
            </div>

            <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 mb-3 font-medium leading-relaxed">
              {animal.short_desc || 'Rescued dog receiving continuous rehabilitation and love.'}
            </p>

            {/* Tags */}
            {safeTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3.5">
                {safeTags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-pink-50 text-pink-700 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full border border-pink-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            {/* Medical Funding Meter (if applicable) */}
            {fundsNeeded > 0 && (
              <div className="mb-3.5 pt-2 border-t border-pink-100">
                <div className="flex justify-between text-[11px] sm:text-xs font-bold mb-1">
                  <span className="text-slate-500">Goal</span>
                  <span className="text-pink-600 font-display">
                    ₹{fundsRaised.toLocaleString('en-IN')} / ₹{fundsNeeded.toLocaleString('en-IN')} ({fundPercent}%)
                  </span>
                </div>
                <div className="w-full bg-pink-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${fundPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Bottom Actions: View details + Share & Sponsor buttons */}
            <div className="pt-2 flex items-center justify-between gap-1.5 border-t border-slate-50">
              <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-pink-600 group-hover:text-pink-700 font-display shrink-0">
                <span>View Story</span>
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </div>

              <div className="flex items-center gap-1.5">
                {/* Share Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsShareOpen(true);
                  }}
                  title="Share profile to WhatsApp or social media"
                  className="px-2.5 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-[11px] sm:text-xs font-bold flex items-center gap-1 border border-pink-200/80 transition-all font-display hover:scale-105 active:scale-95"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Share 📢</span>
                </button>

                {fundsNeeded > 0 && onDonate && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDonate(animal.name);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-all shadow-sm font-display hover:scale-105 active:scale-95"
                  >
                    <Heart className="w-3 h-3 fill-white" />
                    <span>Sponsor</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        animal={animal}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </>
  );
};
