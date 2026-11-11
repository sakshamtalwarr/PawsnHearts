import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Heart,
  QrCode,
  Copy,
  Check,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Send,
  UploadCloud,
  CheckCircle2,
  X,
  Building,
  Dog,
} from 'lucide-react';
import { ledgerApi, uploadApi } from '../api/client';
import { Animal } from '../types';

interface DonationSectionProps {
  upiId?: string;
  payeeName?: string;
  activeAnimalName?: string | null;
  onClearActiveAnimal?: () => void;
  animals?: Animal[];
}

export const DonationSection: React.FC<DonationSectionProps> = ({
  upiId = 'salesabshappypaws@oksbi',
  payeeName = 'PawsAndHearts',
  activeAnimalName,
  onClearActiveAnimal,
  animals = [],
}) => {
  const [amount, setAmount] = useState<number | string>(1000);
  const [donorName, setDonorName] = useState('');
  const [paymentApp, setPaymentApp] = useState('Google Pay');
  const [referenceId, setReferenceId] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lastSubmittedInfo, setLastSubmittedInfo] = useState<{
    amount: number;
    animal: string | null;
    app: string;
    donor: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'upi' | 'qr' | 'bank'>('upi');

  const presetAmounts = [250, 500, 1000, 2500, 5000];

  // Find linked animal object if any
  const matchedAnimal = animals.find(
    (a) => a.name.toLowerCase() === activeAnimalName?.toLowerCase()
  );

  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount || ''}&cu=INR${
    activeAnimalName ? `&tn=${encodeURIComponent(`For ${activeAnimalName}`)}` : ''
  }`;

  // Generate QR Code dynamically on amount or animal changes
  useEffect(() => {
    QRCode.toDataURL(upiUrl, {
      width: 240,
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
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }
    window.location.href = upiUrl;
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingReceipt(true);
    try {
      const res = await uploadApi.uploadSingle(file, 'donation_receipts');
      setReceiptUrl(res.file.url);
    } catch (err: any) {
      alert(err.message || 'Failed to upload receipt screenshot.');
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const handlePledgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      alert('Please provide a valid donation amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalDonor = donorName.trim() || 'Anonymous Animal Lover';
      const finalNotes = activeAnimalName
        ? `For ${activeAnimalName} (${paymentApp}): ${notes || 'Donation pledged'}`
        : `${paymentApp}: ${notes || 'Direct Donation'}`;

      await ledgerApi.submitPublic({
        animal_id: matchedAnimal?.id,
        donor_name: finalDonor,
        amount: numAmount,
        payment_method: paymentApp,
        reference_id: referenceId.trim() || undefined,
        receipt_url: receiptUrl || undefined,
        notes: finalNotes,
      });

      setLastSubmittedInfo({
        amount: numAmount,
        animal: activeAnimalName || null,
        app: paymentApp,
        donor: finalDonor,
      });
      setSubmitted(true);
    } catch (err: any) {
      alert(err.message || 'Failed to submit donation pledge.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="donate" className="py-12 sm:py-20 px-3.5 sm:px-4 max-w-5xl mx-auto relative z-10 w-full overflow-hidden">
      <div className="text-center mb-8 sm:mb-12">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-pink-100 text-pink-800 border border-pink-200 mb-2.5">
          <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
          Transparent Community Rescue
        </span>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight flex items-center justify-center gap-2">
          <span>Help Fund Vital Surgeries & Food</span>
          <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-pink-500 fill-pink-500 shrink-0 inline" />
        </h2>
        <p className="text-slate-600 text-xs sm:text-base max-w-xl mx-auto mt-2 font-normal px-2">
          Every contribution goes 100% towards emergency veterinary medicine, foster nutrition, and rescue surgeries. All donations are reviewed and published to the public ledger.
        </p>
      </div>

      {/* Sponsoring specific animal banner */}
      {activeAnimalName && (
        <div className="mb-6 sm:mb-8 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-bold flex items-center justify-between shadow-lg shadow-pink-500/25">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Dog className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[10px] sm:text-xs uppercase tracking-wider font-extrabold text-pink-100">
                Direct Case Sponsorship
              </div>
              <div className="text-sm sm:text-base font-semibold">
                Sponsoring surgery for <span className="underline decoration-wavy underline-offset-4">{activeAnimalName}</span>
              </div>
            </div>
          </div>
          {onClearActiveAnimal && (
            <button
              onClick={onClearActiveAnimal}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-semibold transition-colors shrink-0 ml-2"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* SUCCESS CONFIRMATION BANNER */}
      {submitted && lastSubmittedInfo ? (
        <div className="bg-white/95 rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-emerald-300 text-center max-w-xl mx-auto animate-fade-in mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-2">
            <span>Pledge Received! Thank You, {lastSubmittedInfo.donor}!</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
            We recorded your payment pledge of{' '}
            <span className="font-extrabold text-emerald-600 text-base sm:text-lg">
              ₹{lastSubmittedInfo.amount.toLocaleString('en-IN')}
            </span>{' '}
            via <span className="font-bold text-slate-800">{lastSubmittedInfo.app}</span>
            {lastSubmittedInfo.animal && (
              <>
                {' '}
                for <span className="font-bold text-pink-600">{lastSubmittedInfo.animal}</span>
              </>
            )}
            . Our volunteer team will verify the payment and reflect it on the live transparent public ledger!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-2.5">
            <button
              onClick={() => {
                setSubmitted(false);
                setNotes('');
                setReferenceId('');
                setReceiptUrl('');
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs font-display shadow-md transition-all"
            >
              Sponsor Another Dog
            </button>
            <a
              href="#ledger"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs font-display transition-all"
            >
              View Public Ledger
            </a>
          </div>
        </div>
      ) : (
        /* MAIN DONATION CARD */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start bg-white/95 rounded-3xl p-4 sm:p-8 md:p-10 shadow-xl border border-pink-200/80 shadow-pink-100/50">
          {/* Left Col: Amount Selection & Direct Pay */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 font-display">
                1. Select Donation Amount (INR)
              </label>

              {/* Preset buttons - Responsive 3-col on mobile, 5-col on desktop */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3.5">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all active:scale-95 ${
                      Number(amount) === preset
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25 scale-[1.02]'
                        : 'bg-pink-50/80 text-slate-700 hover:bg-pink-100 border border-pink-100'
                    }`}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>

              {/* Custom amount input */}
              <div className="relative mb-5">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base sm:text-lg">
                  ₹
                </span>
                <input
                  type="number"
                  min="10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Custom amount"
                  className="w-full pl-8 pr-4 py-2.5 sm:py-3 rounded-2xl border border-pink-200 bg-pink-50/40 focus:bg-white text-slate-900 font-bold text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                />
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="flex gap-1.5 p-1 bg-pink-50 rounded-2xl mb-5">
                <button
                  type="button"
                  onClick={() => setActiveTab('upi')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 font-display ${
                    activeTab === 'upi'
                      ? 'bg-white text-pink-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 shrink-0" />
                  <span>UPI Apps</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('qr')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 font-display ${
                    activeTab === 'qr'
                      ? 'bg-white text-pink-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 shrink-0" />
                  <span>Scan QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('bank')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 font-display ${
                    activeTab === 'bank'
                      ? 'bg-white text-pink-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building className="w-3.5 h-3.5 shrink-0" />
                  <span>Bank</span>
                </button>
              </div>

              {/* Tab Content: UPI */}
              {activeTab === 'upi' && (
                <div className="space-y-3.5">
                  <div className="p-3 sm:p-4 rounded-2xl bg-pink-50/70 border border-pink-100 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] sm:text-xs text-slate-500 font-medium">Official UPI VPA:</div>
                      <div className="text-xs sm:text-base font-bold text-slate-900 font-mono truncate">
                        {upiId}
                      </div>
                    </div>
                    <button
                      onClick={handleCopyUpi}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-pink-100 text-pink-700 text-xs font-bold flex items-center gap-1 border border-pink-200 transition-colors shadow-sm shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </>
                      )}
                    </button>
                  </div>

                  {/* Instant Mobile UPI Pay Button */}
                  <button
                    type="button"
                    onClick={handleOpenUpiApp}
                    className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-extrabold text-sm sm:text-base md:text-lg shadow-lg shadow-pink-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 font-display"
                  >
                    <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <span>Pay ₹{amount || 0} via UPI (GPay/PhonePe/Paytm)</span>
                  </button>
                </div>
              )}

              {/* Tab Content: QR */}
              {activeTab === 'qr' && (
                <div className="flex flex-col items-center p-3 sm:p-4 bg-pink-50/50 rounded-2xl border border-pink-100 text-center">
                  <div className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-md border border-pink-100 mb-2">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="Donation QR Code" className="w-40 h-40 sm:w-48 sm:h-48 mx-auto" />
                    ) : (
                      <div className="w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center text-xs text-slate-400">
                        Generating QR...
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-700">
                    Scan with Google Pay, PhonePe, Paytm, or BHIM
                  </p>
                  <p className="text-[11px] text-pink-600 font-semibold mt-0.5">
                    Preloaded with ₹{amount || 0} {activeAnimalName ? `for ${activeAnimalName}` : ''}
                  </p>
                </div>
              )}

              {/* Tab Content: Bank */}
              {activeTab === 'bank' && (
                <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100 space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Account Name:</span>
                    <span className="font-bold text-slate-900">{payeeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Bank:</span>
                    <span className="font-bold text-slate-900">State Bank of India (SBI)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Account Type:</span>
                    <span className="font-bold text-slate-900">Savings Account</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">UPI Handle:</span>
                    <span className="font-bold font-mono text-pink-700">{upiId}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>100% Non-Profit: Every rupee is recorded in our verified public ledger.</span>
            </div>
          </div>

          {/* Right Col: Notification & Pledge Form for Admin Review */}
          <div className="md:col-span-5 bg-pink-50/60 rounded-2xl p-4 sm:p-6 border border-pink-100 flex flex-col justify-between">
            <form onSubmit={handlePledgeSubmit} className="space-y-3.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Sparkles className="w-4 h-4 text-pink-500 shrink-0" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  Notify Team & Verify Donation
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                Made a payment? Send this quick note so our admin can verify and credit{' '}
                <span className="font-bold text-pink-700">{activeAnimalName || 'the rescue fund'}</span>.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Your Name</label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Anonymous Animal Lover"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-pink-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-pink-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">App Used</label>
                  <select
                    value={paymentApp}
                    onChange={(e) => setPaymentApp(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white rounded-xl border border-pink-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-pink-400 font-medium"
                  >
                    <option value="Google Pay">Google Pay</option>
                    <option value="PhonePe">PhonePe</option>
                    <option value="Paytm">Paytm</option>
                    <option value="BHIM UPI">BHIM UPI</option>
                    <option value="Bank IMPS/NEFT">Bank IMPS</option>
                    <option value="Cred">Cred</option>
                    <option value="Cash/Offline">Cash / Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    UTR / Ref # (Optional)
                  </label>
                  <input
                    type="text"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                    placeholder="e.g. 4128910238"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-pink-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-pink-400 font-mono"
                  />
                </div>
              </div>

              {/* Optional Screenshot Upload */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Screenshot Proof (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 px-3 py-2 bg-white hover:bg-pink-100/50 border border-pink-200 rounded-xl text-[11px] sm:text-xs font-semibold text-slate-600 cursor-pointer flex items-center justify-center gap-1.5 transition-colors">
                    <UploadCloud className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                    <span className="truncate">
                      {isUploadingReceipt
                        ? 'Uploading...'
                        : receiptUrl
                        ? 'Screenshot Attached'
                        : 'Upload Screenshot'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      className="hidden"
                    />
                  </label>
                  {receiptUrl && (
                    <button
                      type="button"
                      onClick={() => setReceiptUrl('')}
                      className="p-1.5 text-rose-500 hover:text-rose-700"
                      title="Remove screenshot"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Cheer Message</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    activeAnimalName
                      ? `Get well soon ${activeAnimalName}!`
                      : 'Love and blessings for the street pups!'
                  }
                  className="w-full px-3 py-2 bg-white rounded-xl border border-pink-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-pink-400 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-pink-600/20 active:scale-95 transition-all font-display"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Submitting Pledge...' : `Confirm ₹${amount || 0} Donation Pledge`}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
