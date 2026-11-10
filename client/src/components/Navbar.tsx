import React, { useState, useEffect } from 'react';
import { Heart, ShieldCheck, Menu, X, Lock, Share2, Dog, Activity, Award } from 'lucide-react';
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
        className={`fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 w-[94%] max-w-5xl z-50 transition-all duration-300 ${
          mobileOpen ? 'rounded-3xl bg-white/95 shadow-2xl p-4' : 'rounded-full px-4 sm:px-5 py-2.5 sm:py-3'
        } ${
          scrolled && !mobileOpen
            ? 'glass-nav shadow-lg bg-white/85'
            : !mobileOpen
            ? 'glass-nav bg-white/75'
            : ''
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Animated Logo */}
          <a href="/#" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-pink-300 shadow-sm shrink-0 bg-pink-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
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
            <span className="font-script text-xl sm:text-2xl md:text-3xl font-bold text-pink-500 tracking-wide">
              Paws&Hearts
            </span>
          </a>

          {/* Desktop Links (>= md) */}
          <div className="hidden md:flex items-center gap-1 font-bold text-slate-700 text-sm">
            <a
              href="/#adopt"
              className="px-3.5 py-1.5 rounded-full hover:bg-pink-50 hover:text-pink-600 transition-all font-display"
            >
              Adopt
            </a>
            <a
              href="/#treatment"
              className="px-3.5 py-1.5 rounded-full hover:bg-pink-50 hover:text-pink-600 transition-all font-display"
            >
              Medical Cases
            </a>
            <a
              href="/#success"
              className="px-3.5 py-1.5 rounded-full hover:bg-pink-50 hover:text-pink-600 transition-all font-display"
            >
              Success Stories
            </a>
            <a
              href="/#ledger"
              className="px-3.5 py-1.5 rounded-full hover:bg-pink-50 hover:text-pink-600 transition-all flex items-center gap-1.5 font-display"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Live Ledger
            </a>

            <a
              href="/#donate"
              className="ml-2 px-5 py-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow-md shadow-pink-500/20 hover:shadow-lg hover:shadow-pink-500/30 hover:scale-[1.02] transition-all flex items-center gap-1.5 font-display text-xs sm:text-sm"
            >
              <Heart className="w-4 h-4 fill-white" />
              Donate
            </a>

            <button
              type="button"
              onClick={() => setIsShareSiteOpen(true)}
              className="ml-1 px-3 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold flex items-center gap-1 border border-pink-200/80 transition-all font-display hover:scale-105"
              title="Share Paws&Hearts"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            {user ? (
              <Link
                to="/admin"
                className="ml-2 px-3 py-1.5 text-xs rounded-full bg-slate-800 text-white hover:bg-slate-900 transition-all flex items-center gap-1 font-display"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/admin/login"
                title="Admin Login"
                className="ml-1 p-2 text-slate-400 hover:text-pink-600 transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Mobile Right Controls (< md) */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsShareSiteOpen(true)}
              className="p-2 rounded-full bg-pink-50 text-pink-600 border border-pink-200"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <a
              href="/#donate"
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold flex items-center gap-1 font-display shadow-sm shadow-pink-500/25"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              Donate
            </a>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-slate-700 hover:text-pink-600 rounded-full hover:bg-pink-50 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileOpen ? <X className="w-5 h-5 text-pink-600" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Expandable Menu Drawer */}
        {mobileOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-pink-100 flex flex-col gap-1 text-sm font-bold text-slate-700 font-display animate-fade-in">
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
                className="py-2 px-3 text-xs text-pink-600 font-bold flex items-center gap-1.5"
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
