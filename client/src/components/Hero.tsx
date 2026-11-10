import React, { useState } from 'react';
import { Heart, Activity, CheckCircle2, Eye, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
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
    <div className="relative min-h-[92vh] flex flex-col justify-center items-center pt-28 pb-16 px-4 overflow-hidden">
      {/* Background Graphic & Glow */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center filter brightness-[0.84] saturate-[1.15] scale-105"
          style={{ backgroundImage: `url('/herosection.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/40 to-[#fff9ef]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center text-white mt-4">
        {/* Emergency Alert Banner */}
        {settings?.emergency_banner && (
          <div className="inline-flex items-center gap-2 bg-rose-600/90 backdrop-blur-md text-white text-xs md:text-sm font-bold px-4 py-1.5 rounded-full mb-6 shadow-lg animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            {settings.emergency_banner}
          </div>
        )}

        {/* Playful Floating Pet Mascot Pill */}
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/35 text-white text-xs md:text-sm font-semibold px-4 py-1.5 rounded-full mb-4 shadow-sm hover:scale-105 transition-all">
          <span className="animate-wiggle-slow text-base">🐶</span>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>100% Transparent Community Dog Rescue</span>
          <span className="text-amber-300 font-bold ml-1 font-display">Bengaluru</span>
        </div>

        {/* Emotional & Engaging Headline with Playful Fonts */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-shadow-sm font-display">
          Every Street Life Matters.{' '}
          <span className="text-amber-300 block font-handwriting text-5xl sm:text-7xl md:text-8xl font-normal mt-1 rotate-[-1deg]">
            Every Rupee Accounted.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-100/95 max-w-2xl mx-auto mb-8 font-medium leading-relaxed font-sans">
          We rescue injured, abandoned, and sick street dogs in Bengaluru, rehabilitate them through intensive veterinary surgery, and find them forever families.
        </p>

        {/* CTA Buttons + Playful Tennis Ball */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14 relative">
          <a
            href="#donate"
            className="px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 via-brand-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-display font-bold text-base md:text-lg shadow-xl shadow-brand-500/30 hover:scale-105 hover:shadow-brand-500/40 transition-all flex items-center gap-2"
          >
            <Heart className="w-5 h-5 fill-white" />
            Sponsor a Life
          </a>
          <a
            href="#adopt"
            className="px-8 py-4 rounded-full bg-white/95 hover:bg-white text-slate-900 font-display font-bold text-base md:text-lg shadow-lg hover:scale-105 transition-all flex items-center gap-2"
          >
            Meet Dogs for Adoption
            <ArrowRight className="w-4 h-4 text-brand-500" />
          </a>

          {/* Interactive Bouncing Tennis Ball for Playful Touch */}
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

        {/* Live Impact Counters Ticker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
          <div className="glass-card rounded-2xl p-4 text-slate-800 shadow-playful hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1 font-display">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Funds Raised
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              {formattedRaised}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 text-slate-800 shadow-playful hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1 font-display">
              <Activity className="w-3.5 h-3.5 text-rose-500" />
              Medical Cases
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              {stats?.active_treatments || 0} Active
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 text-slate-800 shadow-playful hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 font-display">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Adopted
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              {stats?.animals_adopted || 0}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 text-slate-800 shadow-playful hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 font-display">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              Supporters
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              {stats?.page_views ? stats.page_views.toLocaleString('en-IN') : '1,840+'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
