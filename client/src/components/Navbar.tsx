import React, { useState, useEffect } from 'react';
import { Heart, ShieldCheck, Menu, X, Lock, Share2, Dog, Activity, Award, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShareModal } from './ShareModal';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isShareSiteOpen, setIsShareSiteOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 transition-all duration-300 ${
          mobileOpen
            ? 'rounded-3xl bg-white/95 shadow-2xl p-4'
            : 'h-14 sm:h-16 px-3.5 sm:px-5 rounded-full flex items-center justify-between'
        } ${
          scrolled && !mobileOpen
            ? 'glass-nav shadow-lg bg-white/90 border border-pink-200/80'
            : !mobileOpen
            ? 'glass-nav bg-white/85 border border-pink-200/60'
            : ''
        }`}
      >
        <div className="w-full flex items-center justify-between">
          {/* Animated Logo & Brand Name */}
          <a href="/#" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-pink-300 shadow-sm shrink-0 bg-pink-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <video
                autoPlay
                loop
                muted
                playsInline
                poster="/pet-love.png"
                className="w-full h-full object-cover"
              >
                <source src="/petloveanimation.mp4" type="video/mp4" />
                <img
                  src="/petloveanimation.gif"
                  alt="Paws&Hearts"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/pet-love.png';
                  }}
                />
              </video>
            </div>
            <span className="font-bold text-base sm:text-lg md:text-xl text-slate-900 tracking-tight flex items-center leading-none">
              Paws<span className="text-pink-600 font-extrabold">&</span>Hearts
            </span>
          </a>

          {/* Desktop Links (>= md) - Cleanly Aligned on Same Baseline & Height */}
          <div className="hidden md:flex items-center gap-1 lg:gap-1.5 shrink-0">
            <a
              href="/#adopt"
              className="h-9 px-2.5 lg:px-3 rounded-full text-xs lg:text-[13px] font-semibold text-slate-700 hover:text-pink-600 hover:bg-pink-50 transition-all inline-flex items-center justify-center whitespace-nowrap"
            >
              Adopt
            </a>
            <a
              href="/#treatment"
              className="h-9 px-2.5 lg:px-3 rounded-full text-xs lg:text-[13px] font-semibold text-slate-700 hover:text-pink-600 hover:bg-pink-50 transition-all inline-flex items-center justify-center whitespace-nowrap"
            >
              Medical Cases
            </a>
            <a
              href="/#gallery"
              className="h-9 px-2.5 lg:px-3 rounded-full text-xs lg:text-[13px] font-semibold text-slate-700 hover:text-pink-600 hover:bg-pink-50 transition-all inline-flex items-center justify-center whitespace-nowrap"
            >
              Gallery
            </a>
            <a
              href="/#success"
              className="h-9 px-2.5 lg:px-3 rounded-full text-xs lg:text-[13px] font-semibold text-slate-700 hover:text-pink-600 hover:bg-pink-50 transition-all inline-flex items-center justify-center whitespace-nowrap"
            >
              Success Stories
            </a>
            <a
              href="/#ledger"
              className="h-9 px-2.5 lg:px-3 rounded-full text-xs lg:text-[13px] font-semibold text-slate-700 hover:text-pink-600 hover:bg-pink-50 transition-all inline-flex items-center justify-center gap-1 whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Live Ledger</span>
            </a>

            <div className="h-4 w-[1px] bg-pink-200/80 mx-1" />

            <a
              href="/#donate"
              className="h-9 px-4 lg:px-5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-bold text-xs lg:text-sm shadow-md shadow-pink-500/20 hover:shadow-lg hover:shadow-pink-500/30 hover:scale-[1.02] active:scale-95 transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>Donate</span>
            </a>

            <button
              type="button"
              onClick={() => setIsShareSiteOpen(true)}
              className="h-9 px-3 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-semibold inline-flex items-center justify-center gap-1 border border-pink-200/80 transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
              title="Share Paws&Hearts"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            {user ? (
              <Link
                to="/admin"
                className="h-9 px-3 rounded-full bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 transition-all inline-flex items-center justify-center gap-1 whitespace-nowrap"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/admin/login"
                title="Admin Login"
                className="h-9 w-9 rounded-full text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-colors inline-flex items-center justify-center"
              >
                <Lock className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Mobile Right Controls (< md) - Perfectly Aligned */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsShareSiteOpen(true)}
              className="h-8 w-8 rounded-full bg-pink-50 text-pink-600 border border-pink-200 inline-flex items-center justify-center"
              title="Share"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <a
              href="/#donate"
              className="h-8 px-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold inline-flex items-center justify-center gap-1 shadow-sm"
            >
              <Heart className="w-3 h-3 fill-white" />
              <span>Donate</span>
            </a>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="h-8 w-8 text-slate-700 hover:text-pink-600 rounded-full hover:bg-pink-50 transition-colors inline-flex items-center justify-center ml-0.5"
              aria-label="Toggle Menu"
            >
              {mobileOpen ? <X className="w-5 h-5 text-pink-600" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Expandable Menu Drawer */}
        {mobileOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-pink-100 flex flex-col gap-1 text-sm font-semibold text-slate-700 animate-fade-in w-full">
            <a
              href="/#adopt"
              onClick={() => setMobileOpen(false)}
              className="px-3.5 py-2.5 rounded-xl hover:bg-pink-50 flex items-center gap-2.5 active:bg-pink-100"
            >
              <Dog className="w-4 h-4 text-pink-500" />
              Adopt a Dog
            </a>
            <a
              href="/#treatment"
              onClick={() => setMobileOpen(false)}
              className="px-3.5 py-2.5 rounded-xl hover:bg-pink-50 flex items-center gap-2.5 active:bg-pink-100"
            >
              <Activity className="w-4 h-4 text-rose-500" />
              Urgent Medical Cases
            </a>
            <a
              href="/#gallery"
              onClick={() => setMobileOpen(false)}
              className="px-3.5 py-2.5 rounded-xl hover:bg-pink-50 flex items-center gap-2.5 active:bg-pink-100"
            >
              <Camera className="w-4 h-4 text-pink-500" />
              Rescue Photo & Video Gallery
            </a>
            <a
              href="/#success"
              onClick={() => setMobileOpen(false)}
              className="px-3.5 py-2.5 rounded-xl hover:bg-pink-50 flex items-center gap-2.5 active:bg-pink-100"
            >
              <Award className="w-4 h-4 text-amber-500" />
              Success Stories
            </a>
            <a
              href="/#ledger"
              onClick={() => setMobileOpen(false)}
              className="px-3.5 py-2.5 rounded-xl hover:bg-pink-50 flex items-center gap-2.5 active:bg-pink-100"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Transparency Ledger
            </a>

            <div className="pt-2 mt-1 border-t border-pink-100 flex items-center justify-between px-2">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setIsShareSiteOpen(true);
                }}
                className="py-2 px-3 text-xs text-pink-600 font-semibold flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share Website
              </button>

              <Link
                to={user ? '/admin' : '/admin/login'}
                onClick={() => setMobileOpen(false)}
                className="py-2 px-3 text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                {user ? 'Admin Dashboard' : 'Admin Login'}
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Full Website Share Modal */}
      <ShareModal
        animal={null}
        isOpen={isShareSiteOpen}
        onClose={() => setIsShareSiteOpen(false)}
      />
    </>
  );
};
