import React, { useState } from 'react';
import { Heart, Activity, CheckCircle2, ShieldCheck, ArrowRight, Sparkles, Dog } from 'lucide-react';
import { Stats, SiteSettings } from '../types';

interface HeroProps {
  stats: Stats | null;
  settings: SiteSettings | null;
}

export const Hero: React.FC<HeroProps> = ({ stats, settings }) => {
  const [ballBounced, setBallBounced] = useState(false);

  const formattedRaised = stats?.total_raised
    ? '₹' + stats.total_raised.toLocaleString('en-IN')
    : '₹1,80,000';

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-center items-center pt-24 sm:pt-28 pb-12 sm:pb-20 px-3.5 sm:px-6 overflow-hidden">
      {/* Background Soft Pattern and Ambient Light */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-24 -left-20 w-96 h-96 bg-pink-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-rose-200/35 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-100/40 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* Emergency Alert Banner (if set) */}
        {settings?.emergency_banner && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full shadow-lg shadow-rose-500/20 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
              <span>{settings.emergency_banner}</span>
            </div>
          </div>
        )}

        {/* 2-Column Responsive Layout (Otail Style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12 sm:mb-16">
          {/* Left Column: Headline, Trust & CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-5">
            {/* Playful Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md border border-pink-200 text-pink-700 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full shadow-sm">
              <span className="text-base animate-wiggle-slow">🐾</span>
              <span>Bengaluru Street Dog Rescue & Medical Rehab</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] font-display">
              Giving Every Street Dog A Second Chance.{' '}
              <span className="text-pink-500 block font-handwriting text-4xl sm:text-6xl lg:text-7xl font-normal mt-1 rotate-[-1deg]">
                Every Rupee Transparent.
              </span>
            </h1>

            <p className="text-sm sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
              We rescue injured, hit-and-run, and abandoned dogs in Bengaluru. From critical orthopedic surgery to warm foster rehabilitation, every rupee is publicly accounted on our live transparent ledger.
            </p>

            {/* Trust Proof Cluster: Avatar bubbles + Healed count */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
              <div className="flex -space-x-2">
                <span className="w-8 h-8 rounded-full bg-amber-200 border-2 border-white flex items-center justify-center text-xs shadow-sm">
                  🐶
                </span>
                <span className="w-8 h-8 rounded-full bg-pink-200 border-2 border-white flex items-center justify-center text-xs shadow-sm">
                  🐕
                </span>
                <span className="w-8 h-8 rounded-full bg-emerald-200 border-2 border-white flex items-center justify-center text-xs shadow-sm">
                  🐩
                </span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-700 font-display">
                <span className="text-pink-600 font-extrabold">18+ Rescues</span> Treated & Rehomed with Love
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-2">
              <a
                href="#donate"
                className="px-7 py-4 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-display font-bold text-sm sm:text-base shadow-xl shadow-pink-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-white shrink-0" />
                <span>Sponsor TinTin's Surgery</span>
              </a>
              <a
                href="#adopt"
                className="px-6 py-4 rounded-full bg-white/95 hover:bg-white text-slate-800 font-display font-bold text-sm sm:text-base shadow-md border border-pink-200 active:scale-95 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <span>Meet Adoption Dogs</span>
                <ArrowRight className="w-4 h-4 text-pink-500 shrink-0" />
              </a>

              {/* Tennis ball bounce */}
              <button
                type="button"
                onClick={() => setBallBounced(true)}
                onAnimationEnd={() => setBallBounced(false)}
                title="Throw the ball!"
                className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition-all ${
                  ballBounced ? 'animate-bounce' : 'animate-bounce-subtle'
                }`}
              >
                <span>🎾</span>
                <span>Fetch!</span>
              </button>
            </div>
          </div>

          {/* Right Column: Animated Centerpiece & Floating Otail-Style Sticker Cards */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Outer Decorative Glow Card */}
            <div className="relative w-full max-w-md aspect-square bg-gradient-to-br from-pink-100 via-white to-pink-50 rounded-[36px] sm:rounded-[44px] p-4 sm:p-6 shadow-2xl border-4 border-white/80 shadow-pink-200/50 flex flex-col items-center justify-center overflow-hidden">
              {/* Animated Centerpiece Loop */}
              <div className="relative w-full h-full rounded-[28px] sm:rounded-[36px] overflow-hidden bg-pink-50/50 flex items-center justify-center">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="/pet-love.png"
                  className="w-full h-full object-contain filter drop-shadow-md"
                >
                  <source src="/petloveanimation.mp4" type="video/mp4" />
                  <img
                    src="/petloveanimation.gif"
                    alt="Happy Rescued Pets"
                    className="w-full h-full object-contain"
                  />
                </video>
              </div>

              {/* Floating Sticker: Top-Left */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-lg border border-pink-200 text-xs font-bold text-slate-800 flex items-center gap-1.5 font-display animate-bounce-subtle">
                <span className="text-sm">🦴</span>
                <span>100% Non-Profit</span>
              </div>

              {/* Floating Sticker: Top-Right */}
              <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3.5 py-1.5 rounded-2xl shadow-lg text-xs font-bold flex items-center gap-1.5 font-display">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Ledger</span>
              </div>

              {/* Floating Sticker: Bottom-Left (TinTin Spotlight) */}
              <a
                href="/pet/tintin"
                className="absolute bottom-4 left-4 bg-white/95 hover:bg-white backdrop-blur-md p-2.5 rounded-2xl shadow-xl border-2 border-rose-200 text-left flex items-center gap-2.5 hover:scale-105 transition-all max-w-[220px]"
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-rose-300">
                  <img
                    src="https://res.cloudinary.com/dp2kretaw/image/upload/v1794288260/pawsnhearts/animals/izkivbzbeocebllsifej.jpg"
                    alt="TinTin"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-black uppercase text-rose-600 tracking-wider font-display">
                    🚨 Urgent Surgery
                  </div>
                  <div className="text-xs font-black text-slate-900 font-display truncate">
                    Help TinTin Walk Again
                  </div>
                </div>
              </a>

              {/* Floating Sticker: Bottom-Right */}
              <div className="absolute bottom-4 right-4 bg-pink-600 text-white px-3 py-1.5 rounded-2xl shadow-lg text-[11px] font-black flex items-center gap-1 font-display">
                <Sparkles className="w-3 h-3 text-amber-200" />
                <span>BLR Rescue</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Impact Ticker Cards (Otail Rounded Card Aesthetics) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 text-slate-800 border border-pink-200/80 shadow-sm hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-1 text-[11px] font-bold text-pink-600 uppercase tracking-wider mb-1 font-display">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Funds Raised</span>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 font-display truncate">
              {formattedRaised}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">100% public verified</div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 text-slate-800 border border-pink-200/80 shadow-sm hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-1 font-display">
              <Activity className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Emergency Cases</span>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 font-display">
              {stats?.active_treatments || 1} Active
            </div>
            <div className="text-[10px] text-rose-600 font-semibold mt-0.5">TinTin Hip Surgery</div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 text-slate-800 border border-pink-200/80 shadow-sm hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1 font-display">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Fully Healed</span>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 font-display">
              {(stats?.animals_recovered || 3) + (stats?.animals_adopted || 2)} Dogs
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Chikoo, Snoopy, Snowy</div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 text-slate-800 border border-pink-200/80 shadow-sm hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-1 text-[11px] font-bold text-pink-600 uppercase tracking-wider mb-1 font-display">
              <Dog className="w-3.5 h-3.5 text-pink-500 shrink-0" />
              <span>Forever Homes</span>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 font-display">
              {stats?.animals_adopted || 2} Rehomed
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Milo & Lilly adopted</div>
          </div>
        </div>
      </div>
    </div>
  );
};
