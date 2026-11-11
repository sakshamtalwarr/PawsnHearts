import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Play,
  Film,
  Camera,
  FileSpreadsheet,
  FileCheck,
  Activity,
  Layers,
} from 'lucide-react';

export interface State {
  active: number;
}

export interface ViewerMediaItem {
  id?: string | number;
  url?: string;
  src?: string;
  alt?: string;
  title?: string;
  caption?: string;
  location?: string;
  media_type?: string;
  type?: string;
  sort_order?: number;
}

export interface ThumbnailImageViewerProps {
  title?: string;
  items?: (ViewerMediaItem | string)[];
  images?: (ViewerMediaItem | string)[];
  state?: State;
  seeking?: boolean;
  loopDuration?: number;
  onSelect?: (index: number) => void;
  onZoom?: (url: string) => void;
  className?: string;
  aspectRatio?: string;
  showCaption?: boolean;
  showCategoryTabs?: boolean;
  autoPlayInterval?: number;
}

// Generates an instant high-res JPEG poster thumbnail for Cloudinary videos
export function getVideoPoster(url?: string): string {
  if (!url) return '';
  if (url.includes('cloudinary.com') && url.includes('/video/upload/')) {
    return url.replace(/\.(mp4|mov|webm|avi|m4v)(\?.*)?$/i, '.jpg$2');
  }
  return '';
}

// Fallback demo items when none are provided
const defaultDemoItems: ViewerMediaItem[] = [
  {
    id: 'demo-1',
    src: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=1200',
    title: 'Morning Sun',
    caption: 'Bengaluru Sanctuary, 07:15 AM',
    media_type: 'photo',
  },
  {
    id: 'demo-2',
    src: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=1200',
    title: 'Gentle Steps',
    caption: 'Rehabilitation Walk, Day 14',
    media_type: 'photo',
  },
  {
    id: 'demo-3',
    src: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=1200',
    title: 'Peaceful Rest',
    caption: 'Safe shelter & warm recovery',
    media_type: 'photo',
  },
  {
    id: 'demo-4',
    src: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=1200',
    title: 'Second Chance',
    caption: 'Adopted into a forever family',
    media_type: 'photo',
  },
];

export function ThumbnailImageViewer({
  title,
  items,
  images,
  state,
  seeking = false,
  loopDuration = 6,
  onSelect,
  onZoom,
  className = '',
  aspectRatio = 'aspect-[16/10] sm:aspect-[16/9]',
  showCaption = true,
  showCategoryTabs = true,
}: ThumbnailImageViewerProps) {
  // Normalize incoming items
  const rawList = items || images || defaultDemoItems;
  const normalizedItems: ViewerMediaItem[] = React.useMemo(() => {
    return rawList.map((item, idx) => {
      if (typeof item === 'string') {
        const isVid = item.endsWith('.mp4') || item.includes('/video/');
        return {
          id: `item-${idx}`,
          url: item,
          src: item,
          media_type: isVid ? 'video' : 'photo',
          caption: `Media ${idx + 1}`,
        };
      }
      const mediaUrl = item.url || item.src || '';
      const isVid = item.media_type === 'video' || item.type === 'video' || mediaUrl.endsWith('.mp4') || mediaUrl.includes('/video/');
      return {
        ...item,
        id: item.id || `item-${idx}`,
        url: mediaUrl,
        src: mediaUrl,
        media_type: isVid ? 'video' : item.media_type || item.type || 'photo',
        caption: item.caption || item.title || item.alt || '',
      };
    });
  }, [rawList]);

  const [internalActive, setInternalActive] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'photo' | 'video' | 'xray' | 'bill' | 'prescription'>('all');
  const activeThumbnailRef = useRef<HTMLButtonElement | null>(null);
  const stripScrollRef = useRef<HTMLDivElement | null>(null);

  // Category filtering
  const filteredList = React.useMemo(() => {
    if (selectedCategory === 'all') return normalizedItems;
    return normalizedItems.filter((item) => {
      if (selectedCategory === 'photo') return item.media_type === 'photo' || item.media_type === 'image';
      if (selectedCategory === 'video') return item.media_type === 'video';
      if (selectedCategory === 'xray') return item.media_type === 'xray';
      if (selectedCategory === 'prescription') return item.media_type === 'prescription';
      if (selectedCategory === 'bill') return item.media_type === 'bill';
      return true;
    });
  }, [normalizedItems, selectedCategory]);

  // Determine current active index (supporting controlled state like the user's demo timeline showcase)
  const controlledIndex = state?.active;
  const activeIndex =
    typeof controlledIndex === 'number'
      ? Math.max(0, Math.min(filteredList.length - 1, controlledIndex))
      : Math.max(0, Math.min(filteredList.length - 1, internalActive));

  const currentItem = filteredList[activeIndex] || normalizedItems[0];
  const isVideo = currentItem?.media_type === 'video';
  const currentUrl = currentItem?.url || currentItem?.src || '';

  // Handle active slide change
  const handleSelect = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(filteredList.length - 1, index));
      setInternalActive(clamped);
      if (onSelect) onSelect(clamped);
    },
    [filteredList.length, onSelect]
  );

  const handlePrev = useCallback(() => {
    handleSelect(activeIndex > 0 ? activeIndex - 1 : filteredList.length - 1);
  }, [activeIndex, filteredList.length, handleSelect]);

  const handleNext = useCallback(() => {
    handleSelect(activeIndex < filteredList.length - 1 ? activeIndex + 1 : 0);
  }, [activeIndex, filteredList.length, handleSelect]);

  // Center active thumbnail smoothly into view inside the strip only
  useEffect(() => {
    if (activeThumbnailRef.current && stripScrollRef.current) {
      const strip = stripScrollRef.current;
      const thumb = activeThumbnailRef.current;
      const targetLeft = thumb.offsetLeft - strip.offsetWidth / 2 + thumb.offsetWidth / 2;
      strip.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: seeking ? 'auto' : 'smooth',
      });
    }
  }, [activeIndex, seeking]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Counts by category
  const photoCount = normalizedItems.filter((m) => m.media_type === 'photo' || m.media_type === 'image').length;
  const videoCount = normalizedItems.filter((m) => m.media_type === 'video').length;
  const xrayCount = normalizedItems.filter((m) => m.media_type === 'xray').length;
  const billCount = normalizedItems.filter((m) => m.media_type === 'bill').length;
  const docCount = normalizedItems.filter((m) => m.media_type === 'prescription').length;
  const hasMultipleCategories = (photoCount > 0 && (videoCount > 0 || xrayCount > 0 || billCount > 0 || docCount > 0));

  return (
    <div className={`w-full shrink-0 flex flex-col bg-slate-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 font-sans ${className}`}>
      {/* Optional Top Header Bar */}
      {title && (
        <div className="shrink-0 px-4 py-3 sm:px-6 sm:py-3.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide font-display">{title}</h3>
          </div>
          <div className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/60 mr-20 sm:mr-24">
            <span className="text-pink-400 font-bold">{String(activeIndex + 1).padStart(2, '0')}</span> / {String(filteredList.length).padStart(2, '0')}
          </div>
        </div>
      )}

      {/* Main Staging Display - Hardened against flexbox squashing with explicit min-height */}
      <div className={`relative ${aspectRatio} w-full shrink-0 min-h-[300px] sm:min-h-[380px] md:min-h-[440px] bg-slate-950 overflow-hidden flex items-center justify-center select-none`}>
        {/* Ambient Blurred Background for Cinematic Aspect Fill */}
        {!isVideo && currentUrl && (
          <div
            key={`ambient-${currentUrl}`}
            className="absolute inset-0 bg-cover bg-center blur-3xl opacity-40 scale-125 transition-all duration-700 pointer-events-none"
            style={{ backgroundImage: `url(${currentUrl})` }}
          />
        )}

        {/* Video Player or Image Display */}
        {isVideo ? (
          <div className="relative z-10 w-full h-full flex items-center justify-center bg-black">
            <video
              key={currentUrl}
              src={currentUrl}
              poster={getVideoPoster(currentUrl)}
              controls
              playsInline
              preload="auto"
              className="w-full h-full object-contain"
            >
              <source src={currentUrl} type="video/mp4" />
              Your browser does not support HTML5 video playback.
            </video>
          </div>
        ) : (
          <div
            className="relative z-10 w-full h-full flex items-center justify-center cursor-zoom-in group"
            onClick={() => onZoom && onZoom(currentUrl)}
          >
            <img
              key={currentUrl}
              src={currentUrl}
              alt={currentItem?.caption || title || 'Gallery Image'}
              className="w-full h-full object-contain transition-all duration-500 group-hover:scale-[1.01]"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=1200';
              }}
            />
          </div>
        )}

        {/* Floating Top Left: Category Badge & Index Indicator */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-2 pointer-events-none">
          <span className="px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold border border-white/10 shadow-lg flex items-center gap-1.5">
            <span className="font-mono text-pink-300 font-black">
              {String(activeIndex + 1).padStart(2, '0')} / {String(filteredList.length).padStart(2, '0')}
            </span>
            <span className="border-l border-slate-700 pl-1.5 text-slate-200 uppercase tracking-wider text-[9px] sm:text-[10px]">
              {currentItem?.media_type === 'xray'
                ? '🩻 X-Ray'
                : currentItem?.media_type === 'bill'
                ? '🧾 Vet Bill'
                : currentItem?.media_type === 'prescription'
                ? '📋 Report'
                : isVideo
                ? '🎥 Video'
                : '📸 Photo'}
            </span>
          </span>
        </div>

        {/* Floating Top Right: Zoom Action Button */}
        {!isVideo && currentUrl && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
            <button
              type="button"
              onClick={() => onZoom && onZoom(currentUrl)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xl border border-white/10 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
              title="Zoom into photo"
            >
              <ZoomIn className="w-3.5 h-3.5 text-pink-300" />
              <span className="hidden sm:inline">Zoom</span>
            </button>
          </div>
        )}

        {/* Floating Bottom Left: Caption Tag */}
        {showCaption && currentItem?.caption && (
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 max-w-[70%] pointer-events-none">
            <div className="bg-slate-950/85 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-white/10 shadow-lg text-xs sm:text-sm font-medium truncate">
              {currentItem.caption}
            </div>
          </div>
        )}

        {/* Navigation Arrows: Previous & Next */}
        {filteredList.length > 1 && (
          <div className="absolute inset-y-0 inset-x-2 sm:inset-x-4 flex items-center justify-between z-30 pointer-events-none">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="pointer-events-auto w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-950/80 hover:bg-slate-900 text-white flex items-center justify-center transition-all shadow-2xl border border-white/15 active:scale-90 hover:scale-105 cursor-pointer backdrop-blur-sm"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="pointer-events-auto w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-950/80 hover:bg-slate-900 text-white flex items-center justify-center transition-all shadow-2xl border border-white/15 active:scale-90 hover:scale-105 cursor-pointer backdrop-blur-sm"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        )}
      </div>

      {/* Category Tabs (Shown if multiple media types exist) */}
      {showCategoryTabs && hasMultipleCategories && (
        <div className="shrink-0 bg-slate-900/90 border-t border-slate-800/80 px-3.5 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] font-bold font-display">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              handleSelect(0);
            }}
            className={`px-3 py-1 rounded-full transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-pink-600 text-white shadow-md'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            All ({normalizedItems.length})
          </button>
          {photoCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('photo');
                handleSelect(0);
              }}
              className={`px-3 py-1 rounded-full transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                selectedCategory === 'photo'
                  ? 'bg-pink-600 text-white shadow-md'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              📸 Photos ({photoCount})
            </button>
          )}
          {videoCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('video');
                handleSelect(0);
              }}
              className={`px-3 py-1 rounded-full transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                selectedCategory === 'video'
                  ? 'bg-pink-600 text-white shadow-md'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              🎥 Videos ({videoCount})
            </button>
          )}
          {xrayCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('xray');
                handleSelect(0);
              }}
              className={`px-3 py-1 rounded-full transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                selectedCategory === 'xray'
                  ? 'bg-pink-600 text-white shadow-md'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              🩻 X-Rays ({xrayCount})
            </button>
          )}
          {docCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('prescription');
                handleSelect(0);
              }}
              className={`px-3 py-1 rounded-full transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                selectedCategory === 'prescription'
                  ? 'bg-pink-600 text-white shadow-md'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              📋 Reports ({docCount})
            </button>
          )}
          {billCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('bill');
                handleSelect(0);
              }}
              className={`px-3 py-1 rounded-full transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                selectedCategory === 'bill'
                  ? 'bg-pink-600 text-white shadow-md'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              🧾 Bills ({billCount})
            </button>
          )}
        </div>
      )}

      {/* Docked Thumbnail Strip */}
      {filteredList.length > 1 && (
        <div
          ref={stripScrollRef}
          className="shrink-0 bg-slate-900 border-t border-slate-800/90 px-3 py-2.5 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none min-h-[72px] sm:min-h-[82px]"
        >
          {filteredList.map((item, idx) => {
            const isActive = activeIndex === idx;
            const itemIsVideo = item.media_type === 'video';
            const itemUrl = item.url || item.src || '';
            const poster = getVideoPoster(itemUrl);

            return (
              <button
                key={item.id || idx}
                ref={isActive ? activeThumbnailRef : null}
                type="button"
                onClick={() => handleSelect(idx)}
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer bg-slate-950 focus:outline-none ${
                  isActive
                    ? 'border-pink-500 scale-105 shadow-xl shadow-pink-500/40 ring-2 ring-pink-400/50 z-10'
                    : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
                }`}
                title={item.caption || `Slide ${idx + 1}`}
              >
                {itemIsVideo ? (
                  <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                    {poster ? (
                      <img
                        src={poster}
                        alt={item.caption || 'Video preview'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                        <Film className="w-5 h-5 text-pink-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-pink-600/90 text-white flex items-center justify-center shadow-md">
                        <Play className="w-3 h-3 fill-white ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-1 right-1 bg-black/85 rounded px-1 text-[8px] text-pink-300 font-bold uppercase tracking-wider">
                      VID
                    </span>
                  </div>
                ) : (
                  <img
                    src={itemUrl}
                    alt={item.caption || `Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200';
                    }}
                  />
                )}

                {/* Active Indicator Pip */}
                {isActive && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-pink-500 shadow-sm" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ThumbnailImageViewer;
