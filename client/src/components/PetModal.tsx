import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  ShieldAlert,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  Phone,
  Share2,
  Maximize2,
  Minimize2,
  Video as VideoIcon,
} from 'lucide-react';
import { Animal, AnimalMedia, formatMediaUrl, MediaType } from '../types';
import { ShareModal } from './ShareModal';

interface PetModalProps {
  animal: Animal | null;
  onClose: () => void;
  onDonateForAnimal: (animalName: string) => void;
}

export const PetModal: React.FC<PetModalProps> = ({ animal, onClose, onDonateForAnimal }) => {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'photo' | 'xray' | 'prescription' | 'bill' | 'video'>('all');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [imageFit, setImageFit] = useState<'cover' | 'contain'>('cover');

  useEffect(() => {
    setActiveMediaIndex(0);
    setSelectedFilter('all');
  }, [animal?.id, animal?.slug]);

  if (!animal) return null;

  // Build full media list including hero_image
  const rawMediaList: AnimalMedia[] = [];

  if (animal.hero_image) {
    rawMediaList.push({
      id: 'hero',
      media_type: 'photo',
      url: formatMediaUrl(animal.hero_image),
      caption: `${animal.name || 'Rescue'}'s profile photo`,
      sort_order: 0,
    });
  }

  // Parse media safely whether it's an array, a JSON string from Postgres, or null
  let parsedMedia: any[] = [];
  if (Array.isArray(animal.media)) {
    parsedMedia = animal.media;
  } else if (typeof animal.media === 'string') {
    try {
      parsedMedia = JSON.parse(animal.media);
    } catch {
      parsedMedia = [];
    }
  }

  if (Array.isArray(parsedMedia)) {
    parsedMedia.forEach((m, idx) => {
      if (!m) return;
      const mediaUrl = typeof m === 'string' ? m : m?.url;
      if (!mediaUrl || typeof mediaUrl !== 'string') return;

      const cleanUrl = formatMediaUrl(mediaUrl);
      if (cleanUrl !== formatMediaUrl(animal.hero_image)) {
        const isVid = cleanUrl.endsWith('.mp4') || cleanUrl.includes('/video/');
        const mediaType = (typeof m === 'object' && m?.media_type) ? m.media_type : isVid ? 'video' : 'photo';
        rawMediaList.push({
          id: (typeof m === 'object' && m?.id) ? String(m.id) : `media-${idx}`,
          media_type: mediaType,
          url: cleanUrl,
          caption: (typeof m === 'object' && m?.caption) ? String(m.caption) : '',
          sort_order: (typeof m === 'object' && m?.sort_order !== undefined) ? Number(m.sort_order) : idx + 1,
        });
      }
    });
  }

  // Parse tags safely
  const safeTags: string[] = Array.isArray(animal.tags)
    ? animal.tags
    : typeof animal.tags === 'string'
    ? (animal.tags as string).split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const safeStatus = (animal.status || 'available').toString();

  // Filtered media by category tab
  const filteredMedia = rawMediaList.filter((m) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'photo') return m.media_type === 'photo' || m.media_type === 'image';
    if (selectedFilter === 'xray') return m.media_type === 'xray';
    if (selectedFilter === 'prescription') return m.media_type === 'prescription';
    if (selectedFilter === 'bill') return m.media_type === 'bill';
    if (selectedFilter === 'video') return m.media_type === 'video';
    return true;
  });

  const currentMedia = filteredMedia[activeMediaIndex] || filteredMedia[0] || rawMediaList[0];

  useEffect(() => {
    if (
      currentMedia?.media_type === 'xray' ||
      currentMedia?.media_type === 'bill' ||
      currentMedia?.media_type === 'prescription'
    ) {
      setImageFit('contain');
    } else {
      setImageFit('cover');
    }
  }, [currentMedia?.media_type, activeMediaIndex]);

  const fundsNeeded = Number(animal.funds_needed || 0);
  const fundsRaised = Number(animal.funds_raised || 0);
  const fundPercent = fundsNeeded > 0 ? Math.min(100, Math.round((fundsRaised / fundsNeeded) * 100)) : 0;
  const isCompleted = animal.status === 'adopted' || animal.status === 'recovered';

  // Counts by category
  const xrayCount = rawMediaList.filter((m) => m.media_type === 'xray').length;
  const billCount = rawMediaList.filter((m) => m.media_type === 'bill').length;
  const reportCount = rawMediaList.filter((m) => m.media_type === 'prescription').length;
  const videoCount = rawMediaList.filter((m) => m.media_type === 'video').length;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
        <div
          className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-y-auto flex flex-col border border-pink-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Controls: Share & Close */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsShareOpen(true)}
              className="p-2 sm:p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-all shadow-md flex items-center gap-1 text-xs font-bold font-display"
              title="Help fundraise by sharing"
            >
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-300" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-all shadow-md"
              aria-label="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Media Preview Section - Generous height & ambient fill to eliminate mobile letterboxing */}
          <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full min-h-[300px] sm:min-h-[380px] bg-slate-950 overflow-hidden flex items-center justify-center">
            {/* Ambient blurred backdrop so letterbox gaps never look like an empty black void */}
            {currentMedia?.media_type !== 'video' && (
              <div
                className="absolute inset-0 bg-cover bg-center blur-2xl opacity-50 scale-125 pointer-events-none transition-all duration-500"
                style={{
                  backgroundImage: `url(${currentMedia?.url || animal.hero_image})`,
                }}
              />
            )}

            {currentMedia?.media_type === 'video' ? (
              <video
                src={currentMedia.url}
                controls
                autoPlay
                playsInline
                className="relative z-10 w-full h-full object-contain"
              />
            ) : (
              <img
                src={currentMedia?.url || animal.hero_image}
                alt={animal.name}
                className={`relative z-10 w-full h-full cursor-zoom-in transition-all duration-300 ${
                  imageFit === 'cover' ? 'object-cover' : 'object-contain'
                }`}
                onClick={() => setLightboxUrl(currentMedia?.url || animal.hero_image || null)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    animal.hero_image ||
                    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800';
                }}
              />
            )}

            {/* Media Type & Caption Tag */}
            <div className="absolute bottom-2.5 left-2.5 sm:bottom-4 sm:left-4 z-20 bg-slate-900/85 backdrop-blur-md text-white text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 max-w-[65%] border border-white/10 shadow-lg">
              <span className="font-bold text-pink-300 uppercase tracking-wider text-[9px] sm:text-[10px]">
                {currentMedia?.media_type === 'xray'
                  ? '🩻 X-Ray'
                  : currentMedia?.media_type === 'bill'
                  ? '🧾 Vet Bill'
                  : currentMedia?.media_type === 'prescription'
                  ? '📋 Report'
                  : currentMedia?.media_type === 'video'
                  ? '🎥 Video'
                  : '📸 Photo'}
              </span>
              {currentMedia?.caption && (
                <span className="truncate border-l border-slate-700 pl-1.5 text-slate-200">
                  {currentMedia.caption}
                </span>
              )}
            </div>

            {/* Controls Cluster: Fit/Fill Toggle & Zoom */}
            {currentMedia?.media_type !== 'video' && (
              <div className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 z-20 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setImageFit((prev) => (prev === 'cover' ? 'contain' : 'cover'))}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white text-[11px] sm:text-xs flex items-center gap-1 font-bold shadow-lg border border-white/10 backdrop-blur-md transition-all active:scale-95"
                  title={imageFit === 'cover' ? 'Show full uncropped image (Fit)' : 'Fill top banner (Fill)'}
                >
                  {imageFit === 'cover' ? (
                    <Minimize2 className="w-3.5 h-3.5 text-pink-300" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5 text-pink-300" />
                  )}
                  <span className="hidden sm:inline">{imageFit === 'cover' ? 'Fit' : 'Fill'}</span>
                </button>

                {currentMedia?.url && (
                  <button
                    type="button"
                    onClick={() => setLightboxUrl(currentMedia.url)}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white text-[11px] sm:text-xs flex items-center gap-1 font-bold shadow-lg border border-white/10 backdrop-blur-md transition-all active:scale-95"
                    title="Zoom into photo/document"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Zoom</span>
                  </button>
                )}
              </div>
            )}

            {/* Carousel Arrows */}
            {filteredMedia.length > 1 && (
              <div className="absolute inset-y-0 inset-x-2 sm:inset-x-3 flex items-center justify-between pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMediaIndex((prev) => (prev > 0 ? prev - 1 : filteredMedia.length - 1));
                  }}
                  className="pointer-events-auto p-1.5 sm:p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-colors shadow-md"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMediaIndex((prev) => (prev < filteredMedia.length - 1 ? prev + 1 : 0));
                  }}
                  className="pointer-events-auto p-1.5 sm:p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-colors shadow-md"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery Strip (Shows all uploaded photos & videos) */}
          {rawMediaList.length > 1 && (
            <div className="bg-slate-900 border-b border-slate-800 px-3.5 py-2.5 flex items-center gap-2.5 overflow-x-auto scrollbar-none">
              <span className="text-[10px] uppercase font-black text-pink-400 tracking-wider font-display shrink-0 pl-0.5 flex items-center gap-1">
                <span>📸</span>
                <span>Gallery ({rawMediaList.length}):</span>
              </span>
              {filteredMedia.map((item, idx) => {
                const isActive = activeMediaIndex === idx;
                return (
                  <button
                    key={item.id || idx}
                    type="button"
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      isActive
                        ? 'border-pink-500 scale-105 shadow-md shadow-pink-500/40 ring-2 ring-pink-400/50'
                        : 'border-slate-700 opacity-60 hover:opacity-100 hover:border-slate-500'
                    }`}
                    title={item.caption || `View item ${idx + 1}`}
                  >
                    {item.media_type === 'video' ? (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white">
                        <VideoIcon className="w-5 h-5 text-pink-400" />
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.caption || `Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {item.media_type === 'video' && (
                      <span className="absolute bottom-1 right-1 bg-black/80 rounded px-1 text-[8px] text-pink-300 font-bold">
                        VID
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Categorized Media Filter Tabs - Scrollable on mobile */}
          {rawMediaList.length > 1 && (
            <div className="bg-slate-50 border-b border-pink-100 px-3 py-2 flex items-center gap-1.5 overflow-x-auto text-[11px] sm:text-xs font-bold font-display scrollbar-none">
              <button
                onClick={() => {
                  setSelectedFilter('all');
                  setActiveMediaIndex(0);
                }}
                className={`px-2.5 py-1 rounded-full transition-all whitespace-nowrap ${
                  selectedFilter === 'all'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-pink-50'
                }`}
              >
                All ({rawMediaList.length})
              </button>

              {xrayCount > 0 && (
                <button
                  onClick={() => {
                    setSelectedFilter('xray');
                    setActiveMediaIndex(0);
                  }}
                  className={`px-2.5 py-1 rounded-full transition-all whitespace-nowrap flex items-center gap-1 ${
                    selectedFilter === 'xray'
                      ? 'bg-pink-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-pink-50'
                  }`}
                >
                  🩻 X-Rays ({xrayCount})
                </button>
              )}

              {reportCount > 0 && (
                <button
                  onClick={() => {
                    setSelectedFilter('prescription');
                    setActiveMediaIndex(0);
                  }}
                  className={`px-2.5 py-1 rounded-full transition-all whitespace-nowrap flex items-center gap-1 ${
                    selectedFilter === 'prescription'
                      ? 'bg-pink-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-pink-50'
                  }`}
                >
                  📋 Reports ({reportCount})
                </button>
              )}

              {billCount > 0 && (
                <button
                  onClick={() => {
                    setSelectedFilter('bill');
                    setActiveMediaIndex(0);
                  }}
                  className={`px-2.5 py-1 rounded-full transition-all whitespace-nowrap flex items-center gap-1 ${
                    selectedFilter === 'bill'
                      ? 'bg-pink-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-pink-50'
                  }`}
                >
                  🧾 Bills ({billCount})
                </button>
              )}

              {videoCount > 0 && (
                <button
                  onClick={() => {
                    setSelectedFilter('video');
                    setActiveMediaIndex(0);
                  }}
                  className={`px-2.5 py-1 rounded-full transition-all whitespace-nowrap flex items-center gap-1 ${
                    selectedFilter === 'video'
                      ? 'bg-pink-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-pink-50'
                  }`}
                >
                  🎥 Videos ({videoCount})
                </button>
              )}
            </div>
          )}

          {/* Modal Details Content */}
          <div className="p-4 sm:p-8 flex-1 flex flex-col justify-between">
            <div>
              {/* Title & Tags */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2 font-display">
                    {animal.name}
                    {isCompleted && <Sparkles className="w-5 h-5 text-pink-500" />}
                  </h2>
                  <p className="text-xs sm:text-sm font-bold text-pink-600 mt-0.5 font-display">
                    Category: {animal.category === 'adoption' ? 'Adoption' : 'Emergency Medical Rescue'}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-black bg-pink-100 text-pink-800 border border-pink-200">
                  {safeStatus.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Tags */}
              {safeTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {safeTags.map((t, idx) => (
                    <span
                      key={idx}
                      className="bg-pink-50 text-pink-700 text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full border border-pink-100"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Medical Funding Meter */}
              {fundsNeeded > 0 && (
                <div className="bg-pink-50/80 border border-pink-200/80 rounded-2xl p-4 sm:p-5 mb-5">
                  <div className="flex justify-between items-center text-xs sm:text-sm font-bold mb-1.5">
                    <span className="text-slate-700 font-display">Treatment Funding Progress</span>
                    <span className="text-pink-600 font-black font-display">
                      ₹{fundsRaised.toLocaleString('en-IN')} of ₹{fundsNeeded.toLocaleString('en-IN')} ({fundPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-pink-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${fundPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Rescue Story */}
              <div className="mb-5 space-y-2.5">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-1 font-display">About & Rescue Story</h4>
                {animal.short_desc && animal.full_story && animal.short_desc !== animal.full_story && (
                  <p className="text-pink-900 bg-pink-50/80 border-l-4 border-pink-500 p-3 rounded-r-xl text-xs sm:text-sm font-medium leading-relaxed">
                    {animal.short_desc}
                  </p>
                )}
                <p className="text-slate-700 text-xs sm:text-sm md:text-base leading-relaxed whitespace-pre-line font-sans">
                  {animal.full_story || animal.short_desc || 'No detailed background provided.'}
                </p>
              </div>

              {/* Medical Details */}
              {animal.medical_details && (
                <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-4 sm:p-5 mb-5">
                  <h4 className="text-xs sm:text-sm font-bold text-rose-900 flex items-center gap-1.5 mb-1.5 font-display">
                    <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                    Veterinary Medical History & Care Plan
                  </h4>
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    {animal.medical_details}
                  </p>
                </div>
              )}
            </div>

            {/* Action CTAs - Responsive Mobile Stacking */}
            <div className="pt-4 mt-2 border-t border-pink-100 flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-between items-stretch sm:items-center">
              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-full border border-pink-200 bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all font-display active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                Help Fundraise by Sharing
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-full text-slate-600 hover:bg-slate-100 font-bold text-xs sm:text-sm text-center"
                >
                  Close
                </button>

                {isCompleted ? (
                  <div className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md">
                    <Check className="w-3.5 h-3.5" /> Recovered / Rehomed
                  </div>
                ) : animal.category === 'adoption' ? (
                  <a
                    href={`https://wa.me/917217739614?text=${encodeURIComponent(
                      `Hi! I am interested in adopting ${animal.name} from Paws&Hearts.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/20 active:scale-95 transition-all font-display"
                  >
                    <Phone className="w-3.5 h-3.5" /> Adopt on WhatsApp
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      onClose();
                      onDonateForAnimal(animal.name);
                    }}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/25 active:scale-95 transition-all font-display"
                  >
                    <Heart className="w-3.5 h-3.5 fill-white" /> Sponsor {animal.name}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-3 sm:p-4 backdrop-blur-md"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightboxUrl}
            alt="Medical document"
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        animal={animal}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </>
  );
};
