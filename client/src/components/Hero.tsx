import React, { useState } from 'react';
import { Heart, Activity, CheckCircle2, ShieldCheck, ArrowRight, Sparkles, MapPin, Eye, Dog, AlertTriangle } from 'lucide-react';
import { Stats, SiteSettings, Animal, formatMediaUrl } from '../types';

interface HeroProps {
  stats: Stats | null;
  settings: SiteSettings | null;
  featuredAnimal?: Animal | null;
  onDonateForAnimal?: (animalName: string) => void;
  onSelectAnimal?: (animal: Animal) => void;
}

export const Hero: React.FC<HeroProps> = ({
  stats,
  settings,
  featuredAnimal,
  onDonateForAnimal,
  onSelectAnimal,
}) => {
  const [ballBounced, setBallBounced] = useState(false);

  const formattedRaised = stats?.total_raised !== undefined && stats?.total_raised !== null
    ? '₹' + Number(stats.total_raised).toLocaleString('en-IN')
    : '₹10,751';

  // Dynamically display the featured animal provided by parent
  const urgentDog = featuredAnimal || null;
  const neededNum = Number(urgentDog?.funds_needed || 0);
  const raisedNum = Number(urgentDog?.funds_raised || 0);
  const percent = neededNum > 0 ? Math.min(100, Math.round((raisedNum / neededNum) * 100)) : 0;
  const dogImg = urgentDog?.hero_image ? formatMediaUrl(urgentDog.hero_image) : '/chikoo.png';
  const dogName = urgentDog?.name || 'Street Rescues';

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-center items-center pt-24 sm:pt-28 pb-12 sm:pb-20 px-3.5 sm:px-6 overflow-hidden">
      {/* Background Soft Pattern and Ambient Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-24 -left-20 w-96 h-96 bg-pink-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-rose-200/35 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-100/40 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* Emergency Alert Banner */}
        {settings?.emergency_banner && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full shadow-lg shadow-rose-500/20 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
              <span>{settings.emergency_banner}</span>
            </div>
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12 sm:mb-16">
          {/* Left Column: Headline, Trust & CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-5">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md border border-pink-200 text-pink-700 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full shadow-sm">
              <Dog className="w-4 h-4 text-pink-500 shrink-0" />
              <span>Bengaluru Street Dog Rescue & Medical Rehab</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.15]">
              Giving Every Street Dog A Second Chance.{' '}
              <span className="text-pink-500 block font-handwriting text-4xl sm:text-6xl lg:text-7xl font-normal mt-1 rotate-[-1deg]">
                Every Rupee Transparent.
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
              We rescue injured, hit-and-run, and abandoned dogs in Bengaluru. From critical orthopedic surgery to warm foster rehabilitation, every rupee is publicly accounted on our live transparent ledger.
            </p>

            {/* Trust Proof Cluster: Avatar bubbles + Healed count */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
              <div className="flex -space-x-2">
                <span className="w-8 h-8 rounded-full bg-pink-100 border-2 border-white flex items-center justify-center text-pink-600 shadow-sm">
                  <Dog className="w-4 h-4" />
                </span>
                <span className="w-8 h-8 rounded-full bg-rose-100 border-2 border-white flex items-center justify-center text-rose-600 shadow-sm">
                  <Heart className="w-4 h-4 fill-rose-500" />
                </span>
                <span className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-emerald-600 shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-700">
                <span className="text-pink-600 font-bold">18+ Rescues</span> Treated & Rehomed with Care
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-2">
              <a
                href="#donate"
                onClick={() => onDonateForAnimal && urgentDog && onDonateForAnimal(urgentDog.name)}
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-pink-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-white shrink-0" />
                <span>{urgentDog ? `Sponsor ${urgentDog.name}` : 'Sponsor Emergency Care'}</span>
              </a>
              <a
                href="#adopt"
                className="px-6 py-3.5 rounded-full bg-white/95 hover:bg-white text-slate-800 font-bold text-sm sm:text-base shadow-sm border border-pink-200 active:scale-95 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <span>Meet Adoption Dogs</span>
                <ArrowRight className="w-4 h-4 text-pink-500 shrink-0" />
              </a>

              {/* Interactive bounce pill */}
              <button
                type="button"
                onClick={() => setBallBounced(true)}
                onAnimationEnd={() => setBallBounced(false)}
                title="Playful companion"
                className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold shadow-sm transition-all ${
                  ballBounced ? 'animate-bounce' : 'animate-bounce-subtle'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Play!</span>
              </button>
            </div>
          </div>

          {/* Right Column: LATEST / URGENT RESCUE SPOTLIGHT CARD */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div
              onClick={() => onSelectAnimal && urgentDog && onSelectAnimal(urgentDog)}
              className="group relative w-full max-w-md aspect-[4/5] sm:aspect-square bg-slate-900 rounded-[32px] sm:rounded-[40px] shadow-2xl border-4 border-white/90 shadow-pink-200/60 overflow-hidden cursor-pointer hover:scale-[1.01] transition-all flex flex-col justify-between"
            >
              {/* High-Resolution Photo of the Rescue Dog */}
              <img
                src={dogImg}
                alt={dogName}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/chikoo.png';
                }}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Seamless Dark Gradient Overlay for clean readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/20" />

              {/* Top Floating Badges */}
              <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between gap-2">
                <span className={`text-white text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 ${
                  urgentDog?.status === 'urgent' ? 'bg-rose-600 animate-pulse' : 'bg-pink-600'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  {urgentDog?.status === 'urgent' ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>URGENT CASE</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>FEATURED RESCUE</span>
                    </>
                  )}
                </span>

                <span className="bg-slate-950/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 border border-white/20">
                  <MapPin className="w-3.5 h-3.5 text-pink-400" />
                  <span>
                    {urgentDog?.tags?.find((t) => /park|blr|bengaluru|nagar|road/i.test(t)) || 'Bengaluru, IN'}
                  </span>
                </span>
              </div>

              {/* Bottom Spotlight Info Card */}
              <div className="relative z-10 p-4 sm:p-6 text-white space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                      <span>{dogName}</span>
                      <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                    </h3>
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-rose-500/30 text-rose-300 border border-rose-400/40 px-2.5 py-0.5 rounded-full">
                      {urgentDog?.tags?.[0] || (urgentDog?.category === 'treatment' ? 'Medical Care' : 'Adoption')}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 mt-1 leading-relaxed font-normal">
                    {urgentDog?.short_desc || 'Street dog rescued in Bengaluru undergoing medical care and rehabilitation.'}
                  </p>
                </div>

                {/* Live Funding Meter */}
                {neededNum > 0 && (
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span className="text-pink-200">
                        {urgentDog?.category === 'treatment' ? 'Medical Treatment Goal' : 'Care Goal'}
                      </span>
                      <span className="text-white font-bold">
                        ₹{raisedNum.toLocaleString('en-IN')} / ₹{neededNum.toLocaleString('en-IN')} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percent, 8)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons on Card */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDonateForAnimal && urgentDog) onDonateForAnimal(urgentDog.name);
                    }}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-pink-500/30 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Sponsor {dogName}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectAnimal && urgentDog) onSelectAnimal(urgentDog);
                    }}
                    className="px-3.5 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs flex items-center justify-center gap-1 transition-all border border-white/30"
                    title="View Story & Details"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Details</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Impact Ticker Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 text-slate-800 border border-pink-200/80 shadow-sm hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-pink-600 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Funds Raised</span>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 truncate">
              {formattedRaised}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">100% public verified</div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 text-slate-800 border border-pink-200/80 shadow-sm hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 uppercase tracking-wider mb-1">
              <Activity className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Emergency Cases</span>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
              {stats?.active_treatments || 1} Active
            </div>
            <div className="text-[10px] text-rose-600 font-semibold mt-0.5">
              {urgentDog ? `${dogName} Case` : 'Active Rescues'}
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 text-slate-800 border border-pink-200/80 shadow-sm hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Fully Healed</span>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
              {(stats?.animals_recovered || 3) + (stats?.animals_adopted || 2)} Dogs
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Chikoo, Snoopy, Snowy</div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 text-slate-800 border border-pink-200/80 shadow-sm hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-pink-600 uppercase tracking-wider mb-1">
              <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 shrink-0" />
              <span>Forever Homes</span>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
              {stats?.animals_adopted || 2} Rehomed
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Milo & Lilly adopted</div>
          </div>
        </div>
      </div>
    </div>
  );
};
