import React, { useState, useEffect } from 'react';
import { Heart, ShieldCheck, Menu, X, Lock, Share2 } from 'lucide-react';
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
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl z-50 transition-all duration-300 rounded-full px-5 py-3 ${
        scrolled
          ? 'glass-nav shadow-lg bg-white/80'
          : 'glass-nav bg-white/60'
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Logo */}
        <a href="/#" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="Paws&Hearts"
            className="w-10 h-10 rounded-full object-cover border-2 border-white/80 shadow-md transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="font-script text-2xl md:text-3xl font-bold text-pink-500 tracking-wide">
            Paws&Hearts
          </span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1 font-bold text-slate-700 text-sm">
          <a
            href="/#adopt"
            className="px-3.5 py-1.5 rounded-full hover:bg-white hover:text-pink-600 transition-all"
          >
            Adopt
          </a>
          <a
            href="/#treatment"
            className="px-3.5 py-1.5 rounded-full hover:bg-white hover:text-pink-600 transition-all"
          >
            Medical Cases
          </a>
          <a
            href="/#success"
            className="px-3.5 py-1.5 rounded-full hover:bg-white hover:text-pink-600 transition-all"
          >
            Success Stories
          </a>
          <a
            href="/#ledger"
            className="px-3.5 py-1.5 rounded-full hover:bg-white hover:text-pink-600 transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Live Ledger
          </a>
          <a
            href="/#donate"
            className="ml-2 px-5 py-2 rounded-full bg-gradient-to-r from-pink-400 via-rose-500 to-amber-500 text-white shadow-md shadow-pink-500/20 hover:shadow-lg hover:shadow-pink-500/30 hover:scale-[1.02] transition-all flex items-center gap-1.5"
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
              className="ml-2 px-3 py-1.5 text-xs rounded-full bg-slate-800 text-white hover:bg-slate-900 transition-all flex items-center gap-1"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/admin/login"
              title="Admin Login"
              className="ml-1 p-2 text-slate-400 hover:text-brand-500 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          <a
            href="/#donate"
            className="px-3.5 py-1.5 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center gap-1"
          >
            <Heart className="w-3.5 h-3.5 fill-white" />
            Donate
          </a>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 text-slate-700 hover:text-brand-500 rounded-full"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-200/60 flex flex-col gap-2 font-bold text-slate-700">
          <a
            href="/#adopt"
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2 rounded-xl hover:bg-white"
          >
            Adopt a Dog
          </a>
          <a
            href="/#treatment"
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2 rounded-xl hover:bg-white"
          >
            Urgent Medical Cases
          </a>
          <a
            href="/#success"
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2 rounded-xl hover:bg-white"
          >
            Success Stories
          </a>
          <a
            href="/#ledger"
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2 rounded-xl hover:bg-white flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Transparency Ledger
          </a>
          <Link
            to="/admin"
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2 rounded-xl text-brand-500 flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Admin Portal
          </Link>
        </div>
      )}

      {/* Full Website Share Modal */}
      <ShareModal
        animal={null}
        isOpen={isShareSiteOpen}
        onClose={() => setIsShareSiteOpen(false)}
      />
    </nav>
  );
};
