import React from 'react';
import { ArrowRight, Video, Sparkles, AlertCircle } from 'lucide-react';
import { Animal, formatMediaUrl } from '../types';

interface PetCardProps {
  animal: Animal;
  onSelect: (animal: Animal) => void;
}

export const PetCard: React.FC<PetCardProps> = ({ animal, onSelect }) => {
  const isVideo = animal.media?.some((m) => m.media_type === 'video');
  const fallbackImg = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800';
  const imgUrl = formatMediaUrl(animal.hero_image);

  const fundsNeeded = Number(animal.funds_needed || 0);
  const fundsRaised = Number(animal.funds_raised || 0);
  const fundPercent = fundsNeeded > 0 ? Math.min(100, Math.round((fundsRaised / fundsNeeded) * 100)) : 0;

  return (
    <div
      onClick={() => onSelect(animal)}
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 hover:-translate-y-1.5 flex flex-col cursor-pointer"
    >
      {/* Media Cover */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
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
          <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Video className="w-3 h-3 text-rose-400" />
            Video
          </span>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {animal.status === 'urgent' && (
            <span className="bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1 animate-pulse">
              <AlertCircle className="w-3 h-3" /> Urgent
            </span>
          )}
          {animal.status === 'available' && animal.category === 'adoption' && (
            <span className="bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              Adopt Me ❤️
            </span>
          )}
          {animal.status === 'in_treatment' && (
            <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              In Treatment 🏥
            </span>
          )}
          {animal.status === 'recovered' && (
            <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Recovered
            </span>
          )}
          {animal.status === 'adopted' && (
            <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              Adopted 🏡
            </span>
          )}
        </div>
      </div>

      {/* Info Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="text-xl font-black text-slate-800 group-hover:text-brand-500 transition-colors font-display">
              {animal.name}
            </h3>
            {animal.category === 'adoption' ? (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-display">Adoption</span>
            ) : (
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full font-display">Medical Care</span>
            )}
          </div>

          <p className="text-slate-600 text-sm line-clamp-2 mb-3">
            {animal.short_desc || 'Rescued dog receiving continuous rehabilitation and love.'}
          </p>

          {/* Tags */}
          {animal.tags && animal.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {animal.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-slate-100 text-slate-600 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Medical Funding Meter (if applicable) */}
        {fundsNeeded > 0 && (
          <div className="mb-4 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-500">Treatment Goal</span>
              <span className="text-brand-600">
                ₹{fundsRaised.toLocaleString('en-IN')} / ₹{fundsNeeded.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-brand-400 to-brand-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${fundPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="pt-2 flex items-center justify-between text-xs font-bold text-brand-500 group-hover:text-brand-600">
          <span>View Story & Medical Record</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  );
};
