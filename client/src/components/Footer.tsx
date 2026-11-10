import React from 'react';
import { Heart, Phone, MapPin, Lock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SiteSettings } from '../types';

interface FooterProps {
  settings: SiteSettings | null;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  const phone = settings?.contact_phone || '+91 7217739614';
  const location = settings?.contact_location || 'BLR, India';

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
        {/* Col 1 */}
        <div className="md:col-span-5">
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="Paws&Hearts" className="w-10 h-10 rounded-full object-cover" />
            <span className="font-script text-3xl font-bold text-brand-400">Paws&Hearts</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            A 100% transparent rescue initiative dedicated to rehabilitating and rehoming street dogs. Every life matters, and every rupee is publicly tracked.
          </p>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs text-slate-400 italic">
            *Note: We are a group of animal lovers running a personal volunteer rescue initiative to help dogs in need. We are not a registered NGO.
          </div>
        </div>

        {/* Col 2 */}
        <div className="md:col-span-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <a href="/#adopt" className="hover:text-brand-400 transition-colors">
                Adopt a Dog
              </a>
            </li>
            <li>
              <a href="/#treatment" className="hover:text-brand-400 transition-colors">
                Urgent Medical Cases
              </a>
            </li>
            <li>
              <a href="/#donate" className="hover:text-brand-400 transition-colors">
                Make a Donation
              </a>
            </li>
            <li>
              <a href="/#ledger" className="hover:text-brand-400 transition-colors flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Transparency Ledger
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3 */}
        <div className="md:col-span-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Emergency & Contact</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-400" />
              <span>{location}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-400" />
              <a href={`tel:${phone}`} className="hover:text-white font-semibold">
                {phone}
              </a>
            </li>
            <li className="pt-2">
              <a
                href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-600/30 transition-colors"
              >
                Chat on WhatsApp Helpline
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          &copy; {new Date().getFullYear()} Paws&Hearts Transparent Rescue. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <p>
            Developed with <Heart className="w-3.5 h-3.5 inline text-rose-500 fill-rose-500" /> by{' '}
            <a
              href="https://sakshamtalwar.netlify.app/"
              target="_blank"
              rel="noreferrer"
              className="text-brand-400 font-bold hover:underline"
            >
              Saksham Talwar
            </a>
          </p>
          <span className="text-slate-700">•</span>
          <Link
            to="/admin/login"
            className="text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
          >
            <Lock className="w-3 h-3" /> Admin
          </Link>
        </div>
      </div>
    </footer>
  );
};
