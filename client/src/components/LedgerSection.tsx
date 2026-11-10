import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, CheckCircle2, Clock, FileText, ChevronLeft, ChevronRight, X } from 'lucide-react';
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
    <section id="ledger" className="py-20 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          100% Financial Transparency
        </span>
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
          Public Rescue Ledger
        </h2>
        <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto mt-2">
          Every single rupee received and every veterinary expense incurred is permanently recorded and visible to all.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Verified Donations
            </span>
            <div className="text-2xl font-black text-emerald-600">
              ₹{Number(summary?.total_verified_donations || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500/30" />
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pending Verification
            </span>
            <div className="text-2xl font-black text-amber-500">
              ₹{Number(summary?.total_pending_donations || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <Clock className="w-8 h-8 text-amber-500/30" />
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Medical & Food Expenses
            </span>
            <div className="text-2xl font-black text-rose-500">
              ₹{Number(summary?.total_expenses || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <FileText className="w-8 h-8 text-rose-500/30" />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-slate-50/50">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by donor, date, dog, or amount..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 bg-slate-200/60 p-1 rounded-xl text-xs font-bold">
            {(['all', 'donation', 'expense'] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setFilterType(type);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  filterType === type
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type === 'all' ? 'All Transactions' : `${type}s`}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Donor / Recipient</th>
                <th className="py-3.5 px-6">Purpose / Dog</th>
                <th className="py-3.5 px-6 text-right">Amount</th>
                <th className="py-3.5 px-6 text-center">Status</th>
                <th className="py-3.5 px-6 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
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
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span>{new Date(row.transaction_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        {isToday && (
                          <span className="ml-2 bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                            Today! ✨
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {row.donor_name}
                      </td>
                      <td className="py-4 px-6">
                        {row.animal_name ? (
                          <span className="text-brand-600 font-bold">
                            For {row.animal_name}
                          </span>
                        ) : (
                          <span className="text-slate-500">{row.notes || 'General Rescue Fund'}</span>
                        )}
                      </td>
                      <td
                        className={`py-4 px-6 text-right font-black whitespace-nowrap ${
                          isExpense ? 'text-rose-500' : 'text-emerald-600'
                        }`}
                      >
                        {isExpense ? '-' : '+'}₹{amtNum.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        {row.is_verified ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">
                            <Clock className="w-3.5 h-3.5" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {row.receipt_url ? (
                          <button
                            onClick={() => setActiveReceiptUrl(row.receipt_url!)}
                            className="p-1.5 hover:bg-slate-100 text-brand-500 rounded-lg transition-colors"
                            title="View receipt proof"
                          >
                            <FileText className="w-4 h-4" />
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
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">
              Showing page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox for Receipt Proof */}
      {activeReceiptUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setActiveReceiptUrl(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-white rounded-2xl overflow-hidden p-2">
            <button
              onClick={() => setActiveReceiptUrl(null)}
              className="absolute top-4 right-4 p-2 bg-slate-900/60 text-white rounded-full hover:bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activeReceiptUrl}
              alt="Medical invoice proof"
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </section>
  );
};
