import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Heart, Copy, Check, Smartphone, Sparkles, Send } from 'lucide-react';
import { SiteSettings } from '../types';
import { ledgerApi } from '../api/client';

interface DonationSectionProps {
  settings: SiteSettings | null;
  activeAnimalName: string | null;
  onClearAnimalContext: () => void;
}

export const DonationSection: React.FC<DonationSectionProps> = ({
  settings,
  activeAnimalName,
  onClearAnimalContext,
}) => {
  const [amount, setAmount] = useState<number | ''>(500);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Proof submission form state
  const [donorName, setDonorName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const upiId = settings?.upi_id || 'salesabshappypaws@oksbi';
  const payeeName = settings?.payee_name || 'PawsAndHearts';

  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount || ''}&cu=INR${
    activeAnimalName ? `&tn=${encodeURIComponent(`For ${activeAnimalName}`)}` : ''
  }`;

  // Generate QR Code dynamically on amount or animal changes
  useEffect(() => {
    QRCode.toDataURL(upiUrl, {
      width: 260,
      margin: 1.5,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [upiUrl]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenUpiApp = () => {
    if (!amount || amount <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }
    window.location.href = upiUrl;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Please provide a donation amount');
      return;
    }
    setIsSubmitting(true);
    try {
      await ledgerApi.create({
        donor_name: donorName.trim() || 'Anonymous Animal Lover',
        amount: Number(amount),
        entry_type: 'donation',
        payment_method: 'UPI',
        is_verified: false,
        notes: activeAnimalName
          ? `For ${activeAnimalName}: ${notes}`
          : notes || 'Direct UPI Donation',
      });
      setSubmitted(true);
    } catch (err: any) {
      alert(err.message || 'Failed to submit donation note.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="donate" className="py-20 px-4 max-w-5xl mx-auto relative z-10">
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-pink-100 text-pink-800 border border-pink-200 mb-3 font-display">
          <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
          Support Our Rescues
        </span>
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight font-display">
          Help Fund Vital Surgeries & Food 💖
        </h2>
        <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto mt-2 font-medium">
          Every contribution goes 100% towards emergency veterinary medicine, foster nutrition, and rescue surgeries. All donations are published to the public ledger.
        </p>
      </div>

      {/* Sponsoring specific animal banner */}
      {activeAnimalName && (
        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-bold flex items-center justify-between shadow-lg animate-bounce">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-200" />
            <span>
              You are sponsoring treatment for <span className="underline">{activeAnimalName}</span> ❤️
            </span>
          </div>
          <button
            onClick={onClearAnimalContext}
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full"
          >
            Clear
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white/95 rounded-3xl p-6 sm:p-10 shadow-xl border border-pink-200/80 shadow-pink-100/50">
        {/* Left Col: Amount Selection & Direct Pay */}
        <div className="md:col-span-7 flex flex-col justify-between">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select or Enter Amount (INR)
            </label>

            {/* Quick Chips */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[250, 500, 1000, 2500].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setAmount(chip)}
                  className={`py-2.5 px-2 rounded-2xl font-bold text-sm border transition-all ${
                    amount === chip
                      ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  ₹{chip}
                </button>
              ))}
            </div>

            {/* Custom Amount Input */}
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-xl text-slate-400">
                ₹
              </span>
              <input
                type="number"
                min="10"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Enter custom amount"
                className="w-full pl-9 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition-all"
              />
            </div>

            {/* UPI Info Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Official UPI ID
                </span>
                <span className="font-mono font-bold text-slate-800 text-sm sm:text-base">
                  {upiId}
                </span>
              </div>
              <button
                onClick={handleCopyUpi}
                className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Instant UPI Pay Button */}
          <button
            onClick={handleOpenUpiApp}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-extrabold text-base md:text-lg shadow-lg shadow-pink-500/25 hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 font-display"
          >
            <Smartphone className="w-5 h-5" /> Pay ₹{amount || 0} via Any UPI App (GPay/PhonePe/Paytm)
          </button>
        </div>

        {/* Right Col: Instant Dynamic QR */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-brand-50/50 rounded-2xl border border-brand-100 text-center">
          <span className="text-xs font-bold text-brand-700 mb-3 uppercase tracking-wider">
            Scan with any UPI Scanner
          </span>

          <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-100 mb-3">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Donation QR Code" className="w-48 h-48 rounded-xl object-contain" />
            ) : (
              <div className="w-48 h-48 bg-slate-100 rounded-xl animate-pulse" />
            )}
          </div>

          <p className="text-xs font-semibold text-slate-500">
            Amount: <span className="text-brand-600 font-bold">₹{amount || 0}</span> • Name: {payeeName}
          </p>
        </div>
      </div>

      {/* Confirmation / Ledger submission banner */}
      <div className="mt-8 bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-1">
          Made a donation? Let us add you to the Transparent Ledger!
        </h3>
        <p className="text-slate-600 text-xs mb-4">
          Fill in your details below so our volunteer admin can verify and publicly credit your help.
        </p>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-sm flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600" />
            Thank you! Your donation record has been logged and will appear on the ledger shortly.
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Your Name (or Anonymous)"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <input
              type="text"
              placeholder="Transaction Note or Ref (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Submitting...' : 'Record Donation'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
