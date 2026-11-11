import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft, AlertCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBackendStatus } from '../context/BackendStatusContext';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { isWakingUp, checkStatus } = useBackendStatus();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/admin');
    } catch (err: any) {
      if (err.message?.includes('500') || err.message?.includes('fetch') || err.message?.includes('Failed')) {
        setError('Backend server is waking up from free-tier sleep. Please wait ~15 seconds and try again!');
        checkStatus();
      } else {
        setError(err.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <Link
        to="/"
        className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Paws&Hearts
      </Link>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 mb-4 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white">Rescue Admin Portal</h1>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to manage rescue animals, upload media, and verify ledger donations.
          </p>
        </div>

        {isWakingUp && (
          <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span>Server is waking up from sleep. First login may take ~15s.</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@pawsnhearts.org"
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-brand-400 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Protected by Argon2/Bcrypt & JWT Encryption
          </span>
        </div>
      </div>
    </div>
  );
};
