import React, { useState } from 'react';
import { Heart, Activity, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Stats, SiteSettings } from '../types';

interface HeroProps {
  stats: Stats | null;
  settings: SiteSettings | null;
}

export const Hero: React.FC<HeroProps> = ({ stats, settings }) => {
  const [ballBounced, setBallBounced] = useState(false);

  const formattedRaised = stats?.total_raised
    ? '₹' + stats.total_raised.toLocaleString('en-IN')
    : '₹0';

  return (
    <div className="relative min-h-[85vh] sm:min-h-[92vh] flex flex-col justify-center items-center pt-24 sm:pt-28 pb-14 sm:pb-20 px-3.5 sm:px-4 overflow-hidden">
      {/* High-Resolution Crystal-Clear Backdrop with Seamless Gradient Transition */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center filter brightness-[0.88] saturate-[1.15] scale-100 transition-all duration-700"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=85&w=2400'), url('/herosection.jpg')`,
          }}
        />
        {/* Seamless multi-stop gradient fading directly into the site's baby pink palette */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/45 via-pink-900/15 to-[#fff0f5]" />
        {/* Soft bottom progressive blur transition for ultra-seamless blending */}
        <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-44 bg-gradient-to-t from-[#fff0f5] via-[#fff0f5]/85 to-transparent pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center text-white mt-2 sm:mt-4 w-full">
        {/* Emergency Alert Banner */}
        {settings?.emergency_banner && (
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-rose-600/90 backdrop-blur-md text-white text-[11px] sm:text-sm font-bold px-3.5 sm:px-4 py-1.5 rounded-full mb-4 sm:mb-6 shadow-lg animate-pulse max-w-full">
            <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
            <span className="truncate">{settings.emergency_banner}</span>
          </div>
        )}

        {/* Playful Floating Pet Mascot Pill */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/20 backdrop-blur-md border border-pink-200/40 text-white text-[11px] sm:text-sm font-semibold px-3.5 sm:px-4 py-1.5 rounded-full mb-3 sm:mb-4 shadow-sm hover:scale-105 transition-all">
          <span className="animate-wiggle-slow text-sm sm:text-base">🐶</span>
          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
          <span>100% Transparent Bengaluru Rescue</span>
        </div>

        {/* Emotional & Engaging Headline - Scaled specifically for mobile-first */}
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.12] mb-4 sm:mb-6 text-shadow-sm font-display px-1">
          Every Street Life Matters.{' '}
          <span className="text-pink-300 block font-handwriting text-4xl sm:text-6xl md:text-8xl font-normal mt-1 sm:mt-2 rotate-[-1deg]">
            Every Rupee Accounted.
          </span>
        </h1>

        <p className="text-sm sm:text-lg md:text-xl text-slate-100/95 max-w-2xl mx-auto mb-6 sm:mb-8 font-medium leading-relaxed font-sans px-2">
          We rescue injured, abandoned, and sick street dogs in Bengaluru, fund life-saving orthopedic surgeries, and find them loving forever homes.
        </p>

        {/* CTA Buttons - Mobile-first full-width stacking with effortless thumb targets */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-14 max-w-xs sm:max-w-none mx-auto relative px-2">
          <a
            href="#donate"
            className="w-full sm:w-auto px-7 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-display font-bold text-sm sm:text-base md:text-lg shadow-xl shadow-pink-500/25 hover:scale-105 hover:shadow-pink-500/35 transition-all flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-white shrink-0" />
            <span>Sponsor a Life</span>
          </a>
          <a
            href="#adopt"
            className="w-full sm:w-auto px-7 py-3.5 sm:py-4 rounded-full bg-white/95 hover:bg-white text-slate-900 font-display font-bold text-sm sm:text-base md:text-lg shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 border border-pink-100"
          >
            <span>Meet Dogs for Adoption</span>
            <ArrowRight className="w-4 h-4 text-pink-500 shrink-0" />
          </a>

          {/* Interactive Bouncing Tennis Ball */}
          <button
            onClick={() => setBallBounced(true)}
            onAnimationEnd={() => setBallBounced(false)}
            title="Throw the tennis ball to the dogs!"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/80 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer ${
              ballBounced ? 'animate-bounce' : 'animate-bounce-subtle'
            }`}
          >
            <span className="text-sm">🎾</span>
            <span>Fetch!</span>
          </button>
        </div>

        {/* Live Impact Counters Ticker - Grid 2x2 on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3.5 max-w-3xl mx-auto px-1">
          <div className="glass-card rounded-2xl p-3 sm:p-4 text-slate-800 border border-pink-200/60 shadow-sm">
            <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs font-bold text-pink-600 uppercase tracking-wider mb-0.5 font-display">
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 shrink-0" />
              <span>Funds Raised</span>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 font-display truncate">
              {formattedRaised}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-3 sm:p-4 text-slate-800 border border-pink-200/60 shadow-sm">
            <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs font-bold text-rose-600 uppercase tracking-wider mb-0.5 font-display">
              <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500 shrink-0" />
              <span>Medical Cases</span>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 font-display">
              {stats?.active_treatments || 0}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-3 sm:p-4 text-slate-800 border border-pink-200/60 shadow-sm">
            <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-wider mb-0.5 font-display">
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 shrink-0" />
              <span>Healed</span>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 font-display">
              {(stats?.animals_recovered || 0) + (stats?.animals_adopted || 0)}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-3 sm:p-4 text-slate-800 border border-pink-200/60 shadow-sm">
            <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs font-bold text-pink-600 uppercase tracking-wider mb-0.5 font-display">
              <span>❤️ Rehomed</span>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 font-display">
              {stats?.animals_adopted || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
