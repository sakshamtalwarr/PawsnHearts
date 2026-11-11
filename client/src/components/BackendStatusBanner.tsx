import React, { useState, useEffect } from 'react';
import { useBackendStatus } from '../context/BackendStatusContext';
import { RefreshCw, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

export const BackendStatusBanner: React.FC = () => {
  const { isWakingUp, isOnline, checkStatus } = useBackendStatus();
  const [checking, setChecking] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [prevWakingUp, setPrevWakingUp] = useState(false);

  useEffect(() => {
    // Detect transition from waking up -> online
    if (prevWakingUp && !isWakingUp && isOnline) {
      setShowSuccessToast(true);
      const timer = setTimeout(() => setShowSuccessToast(false), 4000);
      return () => clearTimeout(timer);
    }
    setPrevWakingUp(isWakingUp);
  }, [isWakingUp, isOnline, prevWakingUp]);

  const handleManualCheck = async () => {
    setChecking(true);
    await checkStatus();
    setChecking(false);
  };

  // 1. Success Toast when server just woke up
  if (showSuccessToast) {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-bounce-subtle">
        <div className="flex items-center gap-2.5 bg-emerald-600 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full shadow-xl shadow-emerald-600/30 font-display">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>Backend server is awake! Live database synced.</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
        </div>
      </div>
    );
  }

  // If server is healthy and not waking up, or user dismissed, don't show banner
  if (!isWakingUp || dismissed) {
    return null;
  }

  // 2. Server Waking Up Banner
  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-xl animate-slide-down">
      <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white p-[2px] rounded-2xl shadow-2xl shadow-rose-500/25">
        <div className="bg-slate-950/95 backdrop-blur-md px-4 py-3 rounded-[14px] flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-white truncate">
                Backend waking up, please wait...
              </p>
              <p className="text-[11px] text-slate-300 font-medium truncate">
                Free-tier server is spinning up. Actions will sync automatically in ~20-30s.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleManualCheck}
              disabled={checking}
              className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 active:scale-95 text-white font-bold text-xs flex items-center gap-1 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{checking ? 'Checking...' : 'Check'}</span>
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Dismiss for now"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
