import React, { useState, useEffect } from 'react';
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { LedgerEntry } from '../types';
import { ledgerApi } from '../api/client';

export const LedgerSection: React.FC = () => {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'donation' | 'expense'>('all');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeReceiptUrl, setActiveReceiptUrl] = useState<string | null>(null);

  const rowsPerPage = 8;

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await ledgerApi.getPublic(search);
      setEntries(res.entries);
      setSummary(res.summary);
    } catch (err) {
      console.error('Failed to load ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLedger();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredEntries = entries.filter((e) => {
    if (filterType === 'all') return true;
    return e.entry_type === filterType;
  });

  const totalPages = Math.ceil(filteredEntries.length / rowsPerPage) || 1;
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <section id="ledger" className="py-12 sm:py-20 px-3.5 sm:px-4 max-w-6xl mx-auto w-full overflow-hidden">
      <div className="text-center mb-8 sm:mb-12">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-pink-100 text-pink-800 border border-pink-200 mb-2.5 font-display">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          100% Financial Transparency
        </span>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display">
          Public Rescue Ledger 📜
        </h2>
        <p className="text-slate-600 text-xs sm:text-base max-w-xl mx-auto mt-2 font-medium px-2">
          Every rupee received from community donors and every clinic veterinary surgery bill is publicly listed.
        </p>
      </div>

      {/* Overview Cards - Mobile friendly */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-white/95 rounded-2xl p-4 sm:p-5 border border-pink-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider font-display">
              Verified Donations
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 font-display">
              ₹{Number(summary?.total_verified_donations || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-500/30 shrink-0" />
        </div>

        <div className="bg-white/95 rounded-2xl p-4 sm:p-5 border border-pink-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider font-display">
              Pending Verification
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-500 font-display">
              ₹{Number(summary?.total_pending_donations || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500/30 shrink-0" />
        </div>

        <div className="bg-white/95 rounded-2xl p-4 sm:p-5 border border-pink-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider font-display">
              Medical & Food Expenses
            </span>
            <div className="text-xl sm:text-2xl font-black text-rose-500 font-display">
              ₹{Number(summary?.total_expenses || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-rose-500/30 shrink-0" />
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white/95 rounded-3xl shadow-xl border border-pink-200/80 overflow-hidden">
        {/* Controls Bar */}
        <div className="p-3.5 sm:p-5 border-b border-pink-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-pink-50/30">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search donor, dog, date, or note..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-pink-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1 bg-pink-100/70 p-1 rounded-xl text-xs font-bold font-display overflow-x-auto shrink-0">
            {(['all', 'donation', 'expense'] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setFilterType(type);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all whitespace-nowrap ${
                  filterType === type
                    ? 'bg-white text-pink-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type === 'all' ? 'All' : `${type}s`}
              </button>
            ))}
          </div>
        </div>

        {/* 1. MOBILE CARDS VIEW (Visible on small screens < md) */}
        <div className="block md:hidden divide-y divide-pink-100">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 font-medium">
              Fetching ledger records...
            </div>
          ) : paginatedEntries.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-medium">
              No transactions match your search.
            </div>
          ) : (
            paginatedEntries.map((row) => {
              const isToday = row.transaction_date?.slice(0, 10) === todayStr;
              const isExpense = row.entry_type === 'expense';
              const amtNum = Number(row.amount);

              return (
                <div key={row.id} className="p-3.5 hover:bg-pink-50/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5 font-display">
                        <span>{row.donor_name}</span>
                        {isToday && (
                          <span className="bg-pink-100 text-pink-700 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                            Today ✨
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {new Date(row.transaction_date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`font-black font-display text-base ${
                          isExpense ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {isExpense ? '-' : '+'}₹{amtNum.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">
                        {row.payment_method || 'UPI'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-dashed border-pink-100 text-xs">
                    <div className="text-slate-600 truncate max-w-[65%]">
                      {row.animal_name ? (
                        <span className="font-bold text-pink-600">For {row.animal_name}</span>
                      ) : (
                        <span>{row.notes || 'General Rescue Fund'}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {row.is_verified ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-500" /> Pending
                        </span>
                      )}

                      {row.receipt_url && (
                        <button
                          onClick={() => setActiveReceiptUrl(row.receipt_url || null)}
                          className="p-1 rounded-md text-pink-600 hover:bg-pink-100"
                          title="View Receipt"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 2. DESKTOP TABLE VIEW (Visible on >= md screens) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider font-bold font-display">
              <tr>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Donor / Recipient</th>
                <th className="py-3.5 px-6">Purpose / Dog</th>
                <th className="py-3.5 px-6 text-right">Amount</th>
                <th className="py-3.5 px-6 text-center">Status</th>
                <th className="py-3.5 px-6 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-100/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Fetching secure ledger records...
                  </td>
                </tr>
              ) : paginatedEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No transactions found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedEntries.map((row) => {
                  const isToday = row.transaction_date?.slice(0, 10) === todayStr;
                  const isExpense = row.entry_type === 'expense';
                  const amtNum = Number(row.amount);

                  return (
                    <tr key={row.id} className="hover:bg-pink-50/40 transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap text-xs">
                        <span>
                          {new Date(row.transaction_date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        {isToday && (
                          <span className="ml-2 bg-pink-100 text-pink-700 text-[10px] font-black px-2 py-0.5 rounded-full font-display">
                            Today! ✨
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900 font-display">
                        {row.donor_name}
                      </td>
                      <td className="py-4 px-6 text-xs">
                        {row.animal_name ? (
                          <span className="text-pink-600 font-bold">For {row.animal_name}</span>
                        ) : (
                          <span className="text-slate-500">{row.notes || 'General Rescue Fund'}</span>
                        )}
                      </td>
                      <td
                        className={`py-4 px-6 text-right font-black whitespace-nowrap font-display ${
                          isExpense ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {isExpense ? '-' : '+'}₹{amtNum.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {row.is_verified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {row.receipt_url ? (
                          <button
                            onClick={() => setActiveReceiptUrl(row.receipt_url || null)}
                            className="p-1.5 rounded-lg text-pink-600 hover:bg-pink-100 transition-colors"
                            title="View receipt"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3.5 sm:p-4 border-t border-pink-100 flex items-center justify-between text-xs text-slate-600 bg-pink-50/20">
            <div>
              Page <span className="font-bold text-slate-900">{currentPage}</span> of {totalPages}
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 sm:px-3 sm:py-1 rounded-lg border border-pink-200 bg-white hover:bg-pink-50 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 font-bold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 sm:px-3 sm:py-1 rounded-lg border border-pink-200 bg-white hover:bg-pink-50 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 font-bold"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal for Receipt Proof */}
      {activeReceiptUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setActiveReceiptUrl(null)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-2xl p-4 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveReceiptUrl(null)}
              className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-sm font-bold text-slate-900 mb-3 font-display">Receipt / Payment Proof</h4>
            <img
              src={activeReceiptUrl}
              alt="Receipt"
              className="w-full max-h-[70vh] object-contain rounded-xl border border-slate-100"
            />
          </div>
        </div>
      )}
    </section>
  );
};
