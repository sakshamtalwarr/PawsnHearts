import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageCircle, ExternalLink, Heart } from 'lucide-react';
import { Animal } from '../types';

interface ShareModalProps {
  animal?: Animal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ animal, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = window.location.origin;
  const isPet = Boolean(animal);

  const shareUrl = isPet && animal
    ? `${origin}/pet/${animal.slug}`
    : `${origin}`;

  const shareTitle = isPet && animal
    ? `🐾 Help ${animal.name} - ${animal.category === 'treatment' ? 'Emergency Surgery Fund' : 'Adopt a Friend'}`
    : '🐾 Paws&Hearts - 100% Transparent Community Dog Rescue in Bengaluru';

  const shareText = isPet && animal
    ? `🐾 Help ${animal.name}! ${animal.short_desc || 'Fighting for recovery in Bengaluru.'} Please sponsor or share her rescue case: ${shareUrl}`
    : `🐾 Check out Paws&Hearts! 100% transparent street dog rescue in Bengaluru. Every rupee accounted on the live public ledger: ${shareUrl}`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // Ignored if cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-pink-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Share2 className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-slate-900 font-display">
            {isPet ? `Share ${animal?.name}'s Case 🐶` : 'Share Paws&Hearts 🐾'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xs mx-auto">
            {isPet
              ? `Every share puts ${animal?.name} in front of potential adopters and sponsors!`
              : 'Help Bengaluru street dogs by spreading transparency and compassion.'}
          </p>
        </div>

        {/* Channels */}
        <div className="space-y-3 mb-6">
          {/* WhatsApp Direct */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all font-display"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            Share to WhatsApp Status & Chats
          </a>

          {/* Native Mobile Share */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-pink-500/20 hover:scale-[1.02] transition-all font-display"
            >
              <Share2 className="w-5 h-5" />
              More Share Options (Instagram, Telegram, etc.)
            </button>
          )}

          {/* Twitter / X */}
          <a
            href={twitterUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Post on X (Twitter)
          </a>
        </div>

        {/* Copy Link Input */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent text-xs text-slate-600 outline-none px-2 font-mono truncate"
          />
          <button
            onClick={handleCopy}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-pink-100 hover:bg-pink-200 text-pink-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Link
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
