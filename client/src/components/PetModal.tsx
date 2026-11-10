import React, { useState } from 'react';
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
  FileText,
  Activity,
  Maximize2,
  Video as VideoIcon,
  Receipt,
  Camera,
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

  if (!animal) return null;

  // Build full media list including hero_image
  const rawMediaList: AnimalMedia[] = [];

  if (animal.hero_image) {
    rawMediaList.push({
      id: 'hero',
      media_type: 'photo',
      url: formatMediaUrl(animal.hero_image),
      caption: `${animal.name}'s profile photo`,
      sort_order: 0,
    });
  }

  if (animal.media && animal.media.length > 0) {
    animal.media.forEach((m, idx) => {
      // Avoid duplicate if hero is same url
      if (m.url !== animal.hero_image) {
        rawMediaList.push({
          ...m,
          url: formatMediaUrl(m.url),
          media_type: m.media_type || (m.url.endsWith('.mp4') ? 'video' : 'photo'),
          sort_order: m.sort_order ?? idx + 1,
        });
      }
    });
  }

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
        <div
          className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-y-auto flex flex-col border border-pink-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Controls: Share & Close */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button
              onClick={() => setIsShareOpen(true)}
              className="p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-all shadow-md hover:scale-105 flex items-center gap-1.5 text-xs font-bold"
              title="Help fundraise by sharing"
            >
              <Share2 className="w-4 h-4 text-pink-300" />
              <span className="hidden sm:inline">Share Story</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-all shadow-md"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Media Preview Section with Lightbox option */}
          <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden flex items-center justify-center">
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
                className="w-full h-full object-contain cursor-zoom-in"
                onClick={() => setLightboxUrl(currentMedia?.url || animal.hero_image || null)}
              />
            )}

            {/* Media Type & Caption Tag */}
            <div className="absolute bottom-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md text-white text-xs px-3.5 py-1.5 rounded-full flex items-center gap-2 max-w-[80%]">
              <span className="font-bold text-pink-300 uppercase tracking-wider text-[10px]">
                {currentMedia?.media_type === 'xray'
                  ? '🩻 X-Ray Scan'
                  : currentMedia?.media_type === 'bill'
                  ? '🧾 Vet Bill'
                  : currentMedia?.media_type === 'prescription'
                  ? '📋 Medical Report'
                  : currentMedia?.media_type === 'video'
                  ? '🎥 Recovery Video'
                  : '📸 Photo'}
              </span>
              {currentMedia?.caption && (
                <span className="truncate border-l border-slate-700 pl-2 text-slate-200">
                  {currentMedia.caption}
                </span>
              )}
            </div>

            {/* Inspect / Zoom Button */}
            {currentMedia?.media_type !== 'video' && currentMedia?.url && (
              <button
                onClick={() => setLightboxUrl(currentMedia.url)}
                className="absolute bottom-4 right-4 z-10 p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white text-xs flex items-center gap-1 font-bold shadow-md"
                title="Zoom into document/photo"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Zoom</span>
              </button>
            )}

            {/* Carousel Arrows if multiple */}
            {filteredMedia.length > 1 && (
              <div className="absolute inset-y-0 inset-x-3 flex items-center justify-between pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMediaIndex((prev) => (prev > 0 ? prev - 1 : filteredMedia.length - 1));
                  }}
                  className="pointer-events-auto p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMediaIndex((prev) => (prev < filteredMedia.length - 1 ? prev + 1 : 0));
                  }}
                  className="pointer-events-auto p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Categorized Media Filter Tabs */}
          {rawMediaList.length > 1 && (
            <div className="bg-slate-50 border-b border-pink-100 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs font-bold">
              <span className="text-slate-400 font-semibold text-[11px] uppercase mr-1">Gallery:</span>
              <button
                onClick={() => {
                  setSelectedFilter('all');
                  setActiveMediaIndex(0);
                }}
                className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
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
                  className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap flex items-center gap-1 ${
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
                  className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap flex items-center gap-1 ${
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
                  className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap flex items-center gap-1 ${
                    selectedFilter === 'bill'
                      ? 'bg-pink-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-pink-50'
                  }`}
                >
                  🧾 Vet Bills ({billCount})
                </button>
              )}

              {videoCount > 0 && (
                <button
                  onClick={() => {
                    setSelectedFilter('video');
                    setActiveMediaIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap flex items-center gap-1 ${
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

          {/* Modal Details */}
          <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
            <div>
              {/* Title & Tags */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 flex items-center gap-2 font-display">
                    {animal.name}
                    {isCompleted && <Sparkles className="w-6 h-6 text-pink-500" />}
                  </h2>
                  <p className="text-sm font-bold text-pink-600 mt-0.5 font-display">
                    Category: {animal.category === 'adoption' ? 'Adoption' : 'Emergency Medical Rescue'}
                  </p>
                </div>

                {/* Status pill */}
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-pink-100 text-pink-800 border border-pink-200">
                  {animal.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Tags */}
              {animal.tags && animal.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {animal.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="bg-pink-50 text-pink-700 text-xs font-semibold px-3 py-1 rounded-full border border-pink-100"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Medical Funding Status Meter */}
              {fundsNeeded > 0 && (
                <div className="bg-pink-50/80 border border-pink-200/80 rounded-2xl p-5 mb-6">
                  <div className="flex justify-between items-center text-sm font-bold mb-2">
                    <span className="text-slate-700 font-display">Treatment Funding Progress</span>
                    <span className="text-pink-600 font-black">
                      ₹{fundsRaised.toLocaleString('en-IN')} of ₹{fundsNeeded.toLocaleString('en-IN')} ({fundPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-pink-100 rounded-full h-3.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${fundPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    100% of contributions are allocated to {animal.name}'s clinic treatments, surgery, and rehabilitation medicines.
                  </p>
                </div>
              )}

              {/* Rescue Story */}
              <div className="mb-6">
                <h4 className="text-base font-bold text-slate-900 mb-2 font-display">About & Rescue Story</h4>
                <p className="text-slate-700 text-sm md:text-base leading-relaxed whitespace-pre-line font-sans">
                  {animal.full_story || animal.short_desc || 'No detailed background provided.'}
                </p>
              </div>

              {/* Medical Treatment Details */}
              {animal.medical_details && (
                <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-5 mb-6">
                  <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2 mb-2 font-display">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    Veterinary Medical History & Care Plan
                  </h4>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                    {animal.medical_details}
                  </p>
                </div>
              )}
            </div>

            {/* Action CTAs */}
            <div className="pt-6 border-t border-pink-100 flex flex-wrap gap-3 justify-between items-center">
              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                className="px-4 py-2.5 rounded-full border border-pink-200 bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs md:text-sm flex items-center gap-2 transition-all hover:scale-105 font-display"
              >
                <Share2 className="w-4 h-4" />
                Help Fundraise by Sharing
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full text-slate-600 hover:bg-slate-100 font-bold text-xs md:text-sm"
                >
                  Close
                </button>

                {isCompleted ? (
                  <div className="px-6 py-3 rounded-full bg-emerald-500 text-white font-bold text-xs md:text-sm flex items-center gap-2 shadow-md">
                    <Check className="w-4 h-4" /> Happily Recovered / Rehomed
                  </div>
                ) : animal.category === 'adoption' ? (
                  <a
                    href={`https://wa.me/917217739614?text=${encodeURIComponent(
                      `Hi! I am interested in adopting ${animal.name} from Paws&Hearts.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-pink-500/20 hover:scale-105 transition-all font-display"
                  >
                    <Phone className="w-4 h-4" /> Adopt {animal.name} via WhatsApp
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      onClose();
                      onDonateForAnimal(animal.name);
                    }}
                    className="px-7 py-3 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-bold text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-pink-500/25 hover:scale-105 transition-all font-display"
                  >
                    <Heart className="w-4 h-4 fill-white" /> Sponsor {animal.name}'s Care
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Full-Res Document/X-ray Inspection */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxUrl}
            alt="Medical document"
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="text-white text-xs mt-3 font-semibold">
            Press ESC or click anywhere outside to close inspection
          </p>
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
