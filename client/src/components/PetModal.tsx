import React, { useState, useEffect, useCallback } from 'react';
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
  ZoomIn,
  Video as VideoIcon,
  Play,
  Camera,
} from 'lucide-react';
import { Animal, AnimalMedia, formatMediaUrl, MediaType } from '../types';
import { ShareModal } from './ShareModal';
import ThumbnailImageViewer from './ui/thumbnail-image-viewer';

// Generates an instant high-res JPEG poster thumbnail for Cloudinary videos
export const getVideoPoster = (url?: string): string => {
  if (!url) return '';
  if (url.includes('cloudinary.com') && url.includes('/video/upload/')) {
    return url.replace(/\.(mp4|mov|webm|avi|m4v)(\?.*)?$/i, '.jpg$2');
  }
  return '';
};

interface PetModalProps {
  animal: Animal | null;
  onClose: () => void;
  onDonateForAnimal: (animalName: string) => void;
}

export const PetModal: React.FC<PetModalProps> = ({ animal, onClose, onDonateForAnimal }) => {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'photo' | 'xray' | 'prescription' | 'bill' | 'video'>('all');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    setActiveMediaIndex(0);
    setSelectedFilter('all');
    setIsLightboxOpen(false);
  }, [animal?.id, animal?.slug]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        setActiveMediaIndex((prev) => prev - 1);
      } else if (e.key === 'ArrowRight') {
        setActiveMediaIndex((prev) => prev + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const totalCount = filteredMedia.length;
  const safeIndex = totalCount > 0 ? ((activeMediaIndex % totalCount) + totalCount) % totalCount : 0;
  const currentMedia = filteredMedia[safeIndex] || rawMediaList[0];

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
          className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-y-auto flex flex-col border border-pink-100 pet-modal-scroll-area scroll-smooth"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Controls: Share & Close (Floating on top right of viewer) */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-40 flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsShareOpen(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white transition-all shadow-xl flex items-center gap-1 text-xs font-bold font-display border border-white/10 backdrop-blur-md cursor-pointer active:scale-95"
              title="Help fundraise by sharing"
            >
              <Share2 className="w-3.5 h-3.5 text-pink-300" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 sm:p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white transition-all shadow-xl border border-white/10 backdrop-blur-md cursor-pointer active:scale-95"
              aria-label="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* High-End Thumbnail Image & Video Viewer */}
          <ThumbnailImageViewer
            title={`${animal.name}'s Rescue Gallery`}
            items={rawMediaList}
            onZoom={() => setIsLightboxOpen(true)}
            className="rounded-t-2xl sm:rounded-t-3xl rounded-b-none border-x-0 border-t-0"
          />

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

              {/* Complete Photo, Document & Video Transparency Gallery */}
              {rawMediaList.length > 1 && (
                <div className="mb-5 p-4 sm:p-5 bg-slate-900 text-white rounded-2xl sm:rounded-3xl border border-slate-800 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2 font-display uppercase tracking-wider">
                        <Camera className="w-4 h-4 text-pink-400" />
                        Photos, Case Records & Videos ({rawMediaList.length})
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Tap any photo or video below to inspect full-size in the viewer above.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                    {rawMediaList.map((item, idx) => {
                      const isCurrent = currentMedia?.url === item.url;
                      const videoPoster = getVideoPoster(item.url);
                      return (
                        <button
                          key={item.id || idx}
                          type="button"
                          onClick={() => {
                            setSelectedFilter('all');
                            setActiveMediaIndex(idx);
                            const modalContent = document.querySelector('.pet-modal-scroll-area');
                            if (modalContent) modalContent.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`group relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all cursor-pointer text-left bg-slate-950 ${
                            isCurrent
                              ? 'border-pink-500 ring-2 ring-pink-500/50 shadow-lg shadow-pink-500/30'
                              : 'border-slate-800 hover:border-pink-400/60 opacity-80 hover:opacity-100'
                          }`}
                        >
                          {item.media_type === 'video' ? (
                            <div className="relative w-full h-full">
                              {videoPoster ? (
                                <img
                                  src={videoPoster}
                                  alt={item.caption || 'Video'}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                  <VideoIcon className="w-8 h-8 text-pink-400" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-all">
                                <div className="w-9 h-9 rounded-full bg-pink-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                  <Play className="w-4 h-4 fill-white ml-0.5" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <img
                              src={item.url}
                              alt={item.caption || 'Photo'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}

                          {/* Badge tag */}
                          <div className="absolute top-1.5 left-1.5 z-10">
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-pink-300 border border-white/10 shadow-sm">
                              {item.media_type === 'video'
                                ? '🎥 Video'
                                : item.media_type === 'xray'
                                ? '🩻 X-Ray'
                                : item.media_type === 'prescription'
                                ? '📋 Report'
                                : item.media_type === 'bill'
                                ? '🧾 Bill'
                                : '📸 Photo'}
                            </span>
                          </div>

                          {/* Caption footer */}
                          {item.caption && (
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2">
                              <p className="text-[10px] text-slate-200 truncate font-medium">
                                {item.caption}
                              </p>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
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

      {/* Fullscreen Lightbox Modal with Carousel Navigation */}
      {isLightboxOpen && currentMedia && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-3 sm:p-6 backdrop-blur-md animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Bar: Counter & Close */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-40 pointer-events-none">
            <span className="pointer-events-auto text-white/90 text-xs sm:text-sm font-bold bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-white/10 font-display shadow-lg">
              {safeIndex + 1} / {filteredMedia.length}
            </span>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="pointer-events-auto p-2 sm:p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all shadow-lg cursor-pointer"
              aria-label="Close fullscreen view"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Lightbox Media Container */}
          <div
            className="relative max-w-full max-h-[82vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {currentMedia.media_type === 'video' ? (
              <video
                key={currentMedia.url}
                src={currentMedia.url}
                poster={getVideoPoster(currentMedia.url)}
                controls
                playsInline
                preload="auto"
                className="max-w-full max-h-[82vh] rounded-2xl shadow-2xl bg-black"
              >
                <source src={currentMedia.url} type="video/mp4" />
                Your browser does not support HTML5 video playback.
              </video>
            ) : (
              <img
                src={currentMedia.url}
                alt={currentMedia.caption || animal.name}
                className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl"
              />
            )}
          </div>

          {/* Lightbox Caption */}
          {currentMedia.caption && (
            <p className="mt-3 text-white/90 text-xs sm:text-sm max-w-lg text-center bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10 shadow-lg">
              {currentMedia.caption}
            </p>
          )}

          {/* Lightbox Previous / Next Navigation Arrows */}
          {filteredMedia.length > 1 && (
            <div className="absolute inset-y-0 inset-x-2 sm:inset-x-6 flex items-center justify-between z-40 pointer-events-none">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setActiveMediaIndex((prev) => (prev > 0 ? prev - 1 : filteredMedia.length - 1));
                }}
                className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center transition-all shadow-2xl border border-white/20 active:scale-90 hover:scale-105 cursor-pointer"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setActiveMediaIndex((prev) => (prev < filteredMedia.length - 1 ? prev + 1 : 0));
                }}
                className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center transition-all shadow-2xl border border-white/20 active:scale-90 hover:scale-105 cursor-pointer"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
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
