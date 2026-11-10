import React, { useState } from 'react';
import { X, Heart, ShieldAlert, Sparkles, Check, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import { Animal, formatMediaUrl } from '../types';

interface PetModalProps {
  animal: Animal | null;
  onClose: () => void;
  onDonateForAnimal: (animalName: string) => void;
}

export const PetModal: React.FC<PetModalProps> = ({ animal, onClose, onDonateForAnimal }) => {
  if (!animal) return null;

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const mediaList = animal.media && animal.media.length > 0
    ? animal.media.map(m => ({ ...m, url: formatMediaUrl(m.url) }))
    : [{ id: '1', media_type: 'image' as const, url: formatMediaUrl(animal.hero_image), sort_order: 0 }];

  const currentMedia = mediaList[activeMediaIndex] || mediaList[0];

  const fundsNeeded = Number(animal.funds_needed || 0);
  const fundsRaised = Number(animal.funds_raised || 0);
  const fundPercent = fundsNeeded > 0 ? Math.min(100, Math.round((fundsRaised / fundsNeeded) * 100)) : 0;

  const isCompleted = animal.status === 'adopted' || animal.status === 'recovered';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Preview Section */}
        <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden">
          {currentMedia?.media_type === 'video' ? (
            <video
              src={currentMedia.url}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={currentMedia?.url || animal.hero_image}
              alt={animal.name}
              className="w-full h-full object-cover"
            />
          )}

          {/* Carousel Arrows if multiple */}
          {mediaList.length > 1 && (
            <div className="absolute inset-y-0 inset-x-3 flex items-center justify-between pointer-events-none">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMediaIndex((prev) => (prev > 0 ? prev - 1 : mediaList.length - 1));
                }}
                className="pointer-events-auto p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMediaIndex((prev) => (prev < mediaList.length - 1 ? prev + 1 : 0));
                }}
                className="pointer-events-auto p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Media pagination dots */}
          {mediaList.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {mediaList.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveMediaIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    activeMediaIndex === i ? 'bg-brand-400 w-6' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
          <div>
            {/* Title & Tags */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900 flex items-center gap-2">
                  {animal.name}
                  {isCompleted && <Sparkles className="w-6 h-6 text-brand-400" />}
                </h2>
                <p className="text-sm font-semibold text-brand-600 mt-0.5">
                  Category: {animal.category === 'adoption' ? 'Adoption' : 'Emergency Medical Care'}
                </p>
              </div>

              {/* Status pill */}
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-800">
                Status: {animal.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {/* Tags */}
            {animal.tags && animal.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {animal.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Medical Funds bar */}
            {fundsNeeded > 0 && (
              <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center text-sm font-bold mb-2">
                  <span className="text-slate-700">Treatment Funding Status</span>
                  <span className="text-brand-600">
                    ₹{fundsRaised.toLocaleString('en-IN')} of ₹{fundsNeeded.toLocaleString('en-IN')} (
                    {fundPercent}%)
                  </span>
                </div>
                <div className="w-full bg-amber-200/50 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-brand-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${fundPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Rescue Story */}
            <div className="mb-6">
              <h4 className="text-base font-bold text-slate-900 mb-2">About & Rescue Story</h4>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-line">
                {animal.full_story || animal.short_desc || 'No detailed background provided.'}
              </p>
            </div>

            {/* Medical Details */}
            {animal.medical_details && (
              <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-5 mb-6">
                <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  Veterinary & Medical Treatment Notes
                </h4>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                  {animal.medical_details}
                </p>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3 justify-end items-center">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-slate-600 hover:bg-slate-100 font-bold text-sm"
            >
              Close
            </button>

            {isCompleted ? (
              <div className="px-6 py-3 rounded-full bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-md">
                <Check className="w-4 h-4" /> Happily Recovered / Rehomed
              </div>
            ) : animal.category === 'adoption' ? (
              <a
                href={`https://wa.me/917217739614?text=${encodeURIComponent(
                  `Hi! I am interested in adopting ${animal.name} from Paws&Hearts.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-brand-500/20 hover:scale-105 transition-all"
              >
                <Phone className="w-4 h-4" /> Adopt {animal.name} via WhatsApp
              </a>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onDonateForAnimal(animal.name);
                }}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-rose-500 to-brand-500 hover:from-rose-600 hover:to-brand-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
              >
                <Heart className="w-4 h-4 fill-white" /> Sponsor {animal.name}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
