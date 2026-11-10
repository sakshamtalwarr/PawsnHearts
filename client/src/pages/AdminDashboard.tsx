import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Dog,
  Receipt,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  UploadCloud,
  ExternalLink,
  ShieldAlert,
  Save,
  X,
  FileText,
  Video,
  Activity,
  ArrowUp,
  ArrowDown,
  Filter,
  Check,
  Smartphone,
  Eye,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Animal, AnimalMedia, LedgerEntry, Stats, SiteSettings, MediaType } from '../types';
import { animalsApi, ledgerApi, statsApi, uploadApi } from '../api/client';

export const AdminDashboard: React.FC = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'animals' | 'ledger' | 'settings'>('overview');
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'pending' | 'verified' | 'expense'>('all');

  // Data states
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    upi_id: 'salesabshappypaws@oksbi',
    payee_name: 'PawsAndHearts',
    contact_phone: '+91 7217739614',
    contact_location: 'BLR, India',
    emergency_banner: '',
  });

  // Animal Modal state
  const [isAnimalModalOpen, setIsAnimalModalOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Partial<Animal> | null>(null);

  // Ledger Modal state (for Adding Custom or Editing Existing)
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [editingLedgerEntry, setEditingLedgerEntry] = useState<Partial<LedgerEntry>>({
    donor_name: '',
    amount: '',
    entry_type: 'donation',
    payment_method: 'UPI',
    is_verified: true,
    transaction_date: new Date().toISOString().slice(0, 10),
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    }
  }, [user, authLoading, navigate]);

  const loadAllData = async () => {
    try {
      const [animRes, ledgRes, statsRes, setRes] = await Promise.all([
        animalsApi.getAll(),
        ledgerApi.getPublic(),
        statsApi.getStats(false),
        statsApi.getSettings(),
      ]);
      setAnimals(animRes.animals);
      setLedgerEntries(ledgRes.entries);
      setStats(statsRes.stats);
      setSiteSettings(setRes.settings);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  // Animal Management Handlers
  const handleOpenAddAnimal = () => {
    setEditingAnimal({
      name: '',
      category: 'adoption',
      status: 'available',
      tags: [],
      short_desc: '',
      full_story: '',
      medical_details: '',
      funds_needed: 0,
      funds_raised: 0,
      hero_image: '',
      media: [],
    });
    setIsAnimalModalOpen(true);
  };

  const handleSaveAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnimal?.name) return alert('Animal name is required');

    try {
      if (editingAnimal.id) {
        await animalsApi.update(editingAnimal.id, editingAnimal);
      } else {
        await animalsApi.create(editingAnimal);
      }
      setIsAnimalModalOpen(false);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to save animal profile');
    }
  };

  const handleDeleteAnimal = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await animalsApi.delete(id);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete animal');
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgressText('Uploading hero image...');
    try {
      const res = await uploadApi.uploadSingle(file, 'animals');
      setEditingAnimal((prev) => (prev ? { ...prev, hero_image: res.file.url } : null));
    } catch (err: any) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
      setUploadProgressText('');
    }
  };

  // MULTIPLE FILE UPLOAD: Photos, X-Rays, Medical Reports, Clinic Bills, Videos
  const handleBulkMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setUploading(true);
    setUploadProgressText(`Uploading ${fileList.length} files to Cloudinary...`);

    try {
      const res = await uploadApi.uploadMultiple(fileList, 'animals');

      // Auto-categorize each uploaded file based on filename / extension
      const newMediaItems: AnimalMedia[] = res.files.map((f, idx) => {
        const originalName = fileList[idx]?.name || '';
        const lower = originalName.toLowerCase();

        let type: MediaType = 'photo';
        if (lower.includes('xray') || lower.includes('x-ray') || lower.includes('scan')) {
          type = 'xray';
        } else if (lower.includes('bill') || lower.includes('receipt') || lower.includes('invoice')) {
          type = 'bill';
        } else if (lower.includes('presc') || lower.includes('report') || lower.includes('doctor') || lower.endsWith('.pdf')) {
          type = 'prescription';
        } else if (lower.endsWith('.mp4') || lower.endsWith('.mov') || lower.endsWith('.webm')) {
          type = 'video';
        }

        const cleanCaption = originalName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

        return {
          id: `new-${Date.now()}-${idx}`,
          media_type: type,
          url: f.url,
          caption: cleanCaption,
          sort_order: (editingAnimal?.media?.length || 0) + idx,
        };
      });

      setEditingAnimal((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          media: [...(prev.media || []), ...newMediaItems],
        };
      });
    } catch (err: any) {
      alert(err.message || 'Multiple file upload failed');
    } finally {
      setUploading(false);
      setUploadProgressText('');
      e.target.value = '';
    }
  };

  const handleUpdateMediaItem = (index: number, updates: Partial<AnimalMedia>) => {
    setEditingAnimal((prev) => {
      if (!prev || !prev.media) return prev;
      const updated = [...prev.media];
      updated[index] = { ...updated[index], ...updates };
      return { ...prev, media: updated };
    });
  };

  const handleRemoveMediaItem = (index: number) => {
    setEditingAnimal((prev) => {
      if (!prev || !prev.media) return prev;
      const updated = prev.media.filter((_, i) => i !== index);
      return { ...prev, media: updated };
    });
  };

  const handleMoveMediaItem = (index: number, direction: 'up' | 'down') => {
    setEditingAnimal((prev) => {
      if (!prev || !prev.media) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.media.length) return prev;

      const updated = [...prev.media];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return { ...prev, media: updated };
    });
  };

  // Ledger Handlers
  const handleToggleVerify = async (id: string) => {
    try {
      await ledgerApi.toggleVerify(id);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to update verification');
    }
  };

  const handleDeleteLedger = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this ledger record?')) return;
    try {
      await ledgerApi.delete(id);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete ledger entry');
    }
  };

  const handleOpenAddLedger = () => {
    setEditingLedgerEntry({
      donor_name: '',
      amount: '',
      entry_type: 'donation',
      payment_method: 'UPI',
      is_verified: true,
      transaction_date: new Date().toISOString().slice(0, 10),
      notes: '',
    });
    setIsLedgerModalOpen(true);
  };

  const handleOpenEditLedger = (entry: LedgerEntry) => {
    setEditingLedgerEntry({
      id: entry.id,
      donor_name: entry.donor_name,
      amount: entry.amount,
      entry_type: entry.entry_type,
      payment_method: entry.payment_method,
      reference_id: entry.reference_id,
      receipt_url: entry.receipt_url,
      is_verified: entry.is_verified,
      transaction_date: entry.transaction_date?.slice(0, 10),
      notes: entry.notes,
      animal_id: entry.animal_id,
    });
    setIsLedgerModalOpen(true);
  };

  const handleSaveLedgerEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLedgerEntry.amount) return alert('Amount is required');
    try {
      if (editingLedgerEntry.id) {
        await ledgerApi.update(editingLedgerEntry.id, editingLedgerEntry);
      } else {
        await ledgerApi.create(editingLedgerEntry);
      }
      setIsLedgerModalOpen(false);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to save ledger entry');
    }
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgressText('Uploading receipt proof...');
    try {
      const res = await uploadApi.uploadSingle(file, 'receipts');
      setEditingLedgerEntry((prev) => ({ ...prev, receipt_url: res.file.url }));
    } catch (err: any) {
      alert(err.message || 'Receipt upload failed');
    } finally {
      setUploading(false);
      setUploadProgressText('');
    }
  };

  // Settings Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await statsApi.updateSettings(siteSettings);
      alert('Settings saved successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    }
  };

  // Filter ledger entries
  const filteredLedgerEntries = ledgerEntries.filter((item) => {
    if (ledgerFilter === 'all') return true;
    if (ledgerFilter === 'pending') return !item.is_verified;
    if (ledgerFilter === 'verified') return item.is_verified && item.entry_type === 'donation';
    if (ledgerFilter === 'expense') return item.entry_type === 'expense';
    return true;
  });

  const pendingDonations = ledgerEntries.filter((l) => !l.is_verified && l.entry_type === 'donation');

  if (authLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-mono">Loading admin portal...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center justify-center font-black">
            🐾
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight font-display">Paws&Hearts Manager</h1>
            <p className="text-xs text-slate-400">Signed in as {user?.name || user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            target="_blank"
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors font-display"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Live Site
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all font-display ${
              activeTab === 'overview'
                ? 'bg-pink-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Overview
          </button>
          <button
            onClick={() => setActiveTab('animals')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all font-display ${
              activeTab === 'animals'
                ? 'bg-pink-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Dog className="w-4 h-4" /> Rescue Animals ({animals.length})
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all font-display relative ${
              activeTab === 'ledger'
                ? 'bg-pink-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Transparency Ledger</span>
            {pendingDonations.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 animate-pulse">
                {pendingDonations.length} Pending
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all font-display ${
              activeTab === 'settings'
                ? 'bg-pink-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" /> Site Settings
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs text-slate-400 font-bold uppercase">Total Verified Funds</span>
                <div className="text-2xl font-black text-emerald-400 mt-1 font-display">
                  ₹{(stats?.total_raised || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs text-slate-400 font-bold uppercase">Vet Clinic Expenses</span>
                <div className="text-2xl font-black text-rose-400 mt-1 font-display">
                  ₹{(stats?.total_expenses || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs text-slate-400 font-bold uppercase">Critical Treatments</span>
                <div className="text-2xl font-black text-amber-400 mt-1 font-display">
                  {stats?.active_treatments || 0}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs text-slate-400 font-bold uppercase">Adopted / Rehomed</span>
                <div className="text-2xl font-black text-pink-400 mt-1 font-display">
                  {stats?.animals_adopted || 0}
                </div>
              </div>
            </div>

            {/* Pending Verifications Banner */}
            {pendingDonations.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 animate-spin" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm font-display">
                      {pendingDonations.length} Pending Donor Payment Pledges Awaiting Verification
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Review incoming UPI app transfers, check UTR/screenshots, and approve them to credit the target dog.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('ledger');
                    setLedgerFilter('pending');
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl font-display transition-all"
                >
                  Review Pending Now →
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ANIMALS MANAGER */}
        {activeTab === 'animals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white font-display">Rescue Animals & Medical Cases</h2>
                <p className="text-xs text-slate-400">
                  Manage rescue cases (Tintin, etc.), upload bulk photos, surgery X-rays, medical records, and rehab videos.
                </p>
              </div>
              <button
                onClick={handleOpenAddAnimal}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-pink-600/20 transition-all font-display"
              >
                <Plus className="w-4 h-4" /> Add New Rescue Case
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {animals.map((a) => (
                <div
                  key={a.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative aspect-[16/9] w-full bg-slate-800">
                    <img
                      src={a.hero_image || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800'}
                      alt={a.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white">
                      {a.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {a.media && a.media.length > 0 && (
                      <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-pink-300">
                        📁 {a.media.length} Gallery Records
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base text-white font-display">{a.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {a.short_desc || a.full_story || 'No description.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-pink-400 font-display">
                        {a.category.toUpperCase()} • ₹{Number(a.funds_raised || 0).toLocaleString('en-IN')} / ₹{Number(a.funds_needed || 0).toLocaleString('en-IN')}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingAnimal(a);
                            setIsAnimalModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAnimal(a.id, a.name)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: LEDGER MANAGER */}
        {activeTab === 'ledger' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white font-display">Financial Transparency Ledger</h2>
                <p className="text-xs text-slate-400">
                  Approve donor pledges, edit records, or log custom clinic bills and cash donations.
                </p>
              </div>
              <button
                onClick={handleOpenAddLedger}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all font-display self-start"
              >
                <Plus className="w-4 h-4" /> Add Custom Transaction
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setLedgerFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  ledgerFilter === 'all'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                All Entries ({ledgerEntries.length})
              </button>
              <button
                onClick={() => setLedgerFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  ledgerFilter === 'pending'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Pending Approval ({pendingDonations.length})</span>
              </button>
              <button
                onClick={() => setLedgerFilter('verified')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  ledgerFilter === 'verified'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                Verified Donations
              </button>
              <button
                onClick={() => setLedgerFilter('expense')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  ledgerFilter === 'expense'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                Clinic Expenses
              </button>
            </div>

            {/* Ledger Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold text-[11px]">
                    <tr>
                      <th className="p-4">Date</th>
                      <th className="p-4">Donor / Recipient</th>
                      <th className="p-4">App / Method</th>
                      <th className="p-4">Dog / Purpose</th>
                      <th className="p-4 text-right">Amount</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredLedgerEntries.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500 font-semibold">
                          No transactions found in this view.
                        </td>
                      </tr>
                    ) : (
                      filteredLedgerEntries.map((row) => (
                        <tr
                          key={row.id}
                          className={`hover:bg-slate-800/50 transition-colors ${
                            !row.is_verified ? 'bg-amber-500/5' : ''
                          }`}
                        >
                          <td className="p-4 whitespace-nowrap">
                            {new Date(row.transaction_date).toLocaleDateString()}
                          </td>
                          <td className="p-4 font-bold text-white">
                            <div>{row.donor_name}</div>
                            {row.reference_id && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                Ref: {row.reference_id}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium text-[10px]">
                              {row.payment_method || 'UPI'}
                            </span>
                          </td>
                          <td className="p-4 text-slate-300">
                            {row.animal_name ? (
                              <span className="font-bold text-pink-400">For {row.animal_name}</span>
                            ) : null}
                            {row.notes && <div className="text-slate-400 text-[11px] truncate max-w-xs">{row.notes}</div>}
                          </td>
                          <td
                            className={`p-4 text-right font-black font-display text-sm ${
                              row.entry_type === 'expense' ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            ₹{Number(row.amount).toLocaleString('en-IN')}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleToggleVerify(row.id)}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 transition-all ${
                                row.is_verified
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                                  : 'bg-amber-400 text-slate-950 font-black shadow-md hover:bg-amber-300'
                              }`}
                            >
                              {row.is_verified ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                                </>
                              ) : (
                                <>
                                  <Check className="w-3.5 h-3.5" /> Approve Pledge
                                </>
                              )}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {row.receipt_url && (
                                <a
                                  href={row.receipt_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                                  title="View Receipt / Screenshot"
                                >
                                  <Eye className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                onClick={() => handleOpenEditLedger(row)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                                title="Edit Entry"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLedger(row.id)}
                                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 font-display">Site & Contact Settings</h2>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  UPI ID (VPA)
                </label>
                <input
                  type="text"
                  value={siteSettings.upi_id}
                  onChange={(e) => setSiteSettings({ ...siteSettings, upi_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Payee Account Name
                </label>
                <input
                  type="text"
                  value={siteSettings.payee_name}
                  onChange={(e) => setSiteSettings({ ...siteSettings, payee_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Helpline WhatsApp / Phone
                </label>
                <input
                  type="text"
                  value={siteSettings.contact_phone}
                  onChange={(e) => setSiteSettings({ ...siteSettings, contact_phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Location / City
                </label>
                <input
                  type="text"
                  value={siteSettings.contact_location}
                  onChange={(e) => setSiteSettings({ ...siteSettings, contact_location: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Emergency Broadcast Banner (Optional)
                </label>
                <input
                  type="text"
                  value={siteSettings.emergency_banner || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, emergency_banner: e.target.value })}
                  placeholder="e.g. Critical Surgery Fund for Tintin Ongoing Now!"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg transition-all font-display"
              >
                <Save className="w-4 h-4" /> Save Settings
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ANIMAL ADD / EDIT MODAL (WITH MULTI-FILE UPLOAD & CATEGORIZATION) */}
      {isAnimalModalOpen && editingAnimal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAnimalModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-4 font-display">
              {editingAnimal.id ? `Edit ${editingAnimal.name}` : 'Add New Rescue Case'}
            </h3>

            {uploading && (
              <div className="p-3 bg-pink-600/20 border border-pink-500/40 rounded-xl text-xs text-pink-300 font-bold mb-4 flex items-center gap-2 animate-pulse">
                <UploadCloud className="w-4 h-4 animate-bounce" />
                {uploadProgressText || 'Uploading to Cloudinary...'}
              </div>
            )}

            <form onSubmit={handleSaveAnimal} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Dog Name</label>
                  <input
                    type="text"
                    required
                    value={editingAnimal.name || ''}
                    onChange={(e) => setEditingAnimal({ ...editingAnimal, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Category</label>
                  <select
                    value={editingAnimal.category || 'adoption'}
                    onChange={(e) => setEditingAnimal({ ...editingAnimal, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                  >
                    <option value="treatment">Emergency Medical Treatment</option>
                    <option value="adoption">Adoption Case</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Status</label>
                  <select
                    value={editingAnimal.status || 'available'}
                    onChange={(e) => setEditingAnimal({ ...editingAnimal, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="in_treatment">In Treatment</option>
                    <option value="available">Available for Adoption</option>
                    <option value="recovered">Recovered (Success Story)</option>
                    <option value="adopted">Adopted (Success Story)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(editingAnimal.tags) ? editingAnimal.tags.join(', ') : ''}
                    onChange={(e) =>
                      setEditingAnimal({
                        ...editingAnimal,
                        tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                      })
                    }
                    placeholder="Orthopedic Surgery, Pelvic Fracture, Bengaluru Indie"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>
              </div>

              {/* Primary Cover Image */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Primary Profile Hero Image
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingAnimal.hero_image || ''}
                    onChange={(e) => setEditingAnimal({ ...editingAnimal, hero_image: e.target.value })}
                    placeholder="Image URL or upload"
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                  <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 text-pink-400">
                    <UploadCloud className="w-4 h-4" />
                    Cover Photo
                    <input type="file" accept="image/*" onChange={handleHeroImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* MULTI-FILE UPLOAD SECTION (X-RAYS, MEDICAL RECORDS, BILLS, VIDEOS, PHOTOS) */}
              <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-white flex items-center gap-1.5 font-display">
                      <Activity className="w-4 h-4 text-pink-400" />
                      Medical Records, X-Rays, Bills & Videos ({editingAnimal.media?.length || 0})
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Upload multiple files at once or one by one. Categorize each record for full transparency.
                    </p>
                  </div>

                  {/* Multi-File Upload Button */}
                  <label className="px-3.5 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-md transition-all font-display">
                    <UploadCloud className="w-4 h-4" />
                    Upload Multiple Files
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,application/pdf"
                      onChange={handleBulkMediaUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Media Item List */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {(!editingAnimal.media || editingAnimal.media.length === 0) ? (
                    <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-700 rounded-xl">
                      No additional files uploaded yet. Click "Upload Multiple Files" above to add X-rays, clinic bills, or recovery videos.
                    </div>
                  ) : (
                    editingAnimal.media.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 flex items-center gap-2.5 text-xs"
                      >
                        {/* Thumbnail */}
                        <div className="w-12 h-12 bg-slate-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                          {item.media_type === 'video' ? (
                            <Video className="w-6 h-6 text-pink-400" />
                          ) : (
                            <img src={item.url} alt="Media" className="w-full h-full object-cover" />
                          )}
                        </div>

                        {/* Category Dropdown */}
                        <select
                          value={item.media_type}
                          onChange={(e) =>
                            handleUpdateMediaItem(idx, { media_type: e.target.value as MediaType })
                          }
                          className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-bold"
                        >
                          <option value="photo">📸 Photo</option>
                          <option value="xray">🩻 X-Ray Scan</option>
                          <option value="prescription">📋 Doctor Report</option>
                          <option value="bill">🧾 Clinic Bill</option>
                          <option value="video">🎥 Recovery Video</option>
                        </select>

                        {/* Caption Input */}
                        <input
                          type="text"
                          value={item.caption || ''}
                          onChange={(e) => handleUpdateMediaItem(idx, { caption: e.target.value })}
                          placeholder="Caption (e.g. Pre-op X-ray)"
                          className="flex-1 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                        />

                        {/* Order Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveMediaItem(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveMediaItem(idx, 'down')}
                            disabled={idx === (editingAnimal.media?.length || 0) - 1}
                            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveMediaItem(idx)}
                            className="p-1 rounded text-rose-400 hover:bg-rose-500/20"
                            title="Delete File"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Short Description</label>
                <input
                  type="text"
                  value={editingAnimal.short_desc || ''}
                  onChange={(e) => setEditingAnimal({ ...editingAnimal, short_desc: e.target.value })}
                  placeholder="One-line summary for cards"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Full Rescue Story</label>
                <textarea
                  rows={3}
                  value={editingAnimal.full_story || ''}
                  onChange={(e) => setEditingAnimal({ ...editingAnimal, full_story: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Veterinary Medical Details</label>
                <textarea
                  rows={2}
                  value={editingAnimal.medical_details || ''}
                  onChange={(e) => setEditingAnimal({ ...editingAnimal, medical_details: e.target.value })}
                  placeholder="Diagnosis, surgery plan, clinic name, vet prescriptions..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Funds Needed (₹)</label>
                  <input
                    type="number"
                    value={editingAnimal.funds_needed ?? 0}
                    onChange={(e) =>
                      setEditingAnimal({ ...editingAnimal, funds_needed: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Funds Raised (₹)</label>
                  <input
                    type="number"
                    value={editingAnimal.funds_raised ?? 0}
                    onChange={(e) =>
                      setEditingAnimal({ ...editingAnimal, funds_raised: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAnimalModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl font-display shadow-md"
                >
                  Save Profile & Records
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEDGER ADD / EDIT MODAL */}
      {isLedgerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100">
            <button
              onClick={() => setIsLedgerModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-4 font-display">
              {editingLedgerEntry.id ? 'Edit Ledger Entry' : 'Add Custom Ledger Transaction'}
            </h3>

            <form onSubmit={handleSaveLedgerEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Entry Type</label>
                <select
                  value={editingLedgerEntry.entry_type}
                  onChange={(e) =>
                    setEditingLedgerEntry({ ...editingLedgerEntry, entry_type: e.target.value as any })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                >
                  <option value="donation">Donation (Incoming Funds)</option>
                  <option value="expense">Medical / Food Expense (Outgoing)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Donor / Clinic / Recipient Name
                </label>
                <input
                  type="text"
                  required
                  value={editingLedgerEntry.donor_name}
                  onChange={(e) =>
                    setEditingLedgerEntry({ ...editingLedgerEntry, donor_name: e.target.value })
                  }
                  placeholder="e.g. Ananya Deshmukh or Cessna Lifeline Vet Clinic"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingLedgerEntry.amount}
                    onChange={(e) =>
                      setEditingLedgerEntry({ ...editingLedgerEntry, amount: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={editingLedgerEntry.transaction_date || new Date().toISOString().slice(0, 10)}
                    onChange={(e) =>
                      setEditingLedgerEntry({ ...editingLedgerEntry, transaction_date: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Payment Method
                </label>
                <select
                  value={editingLedgerEntry.payment_method || 'UPI'}
                  onChange={(e) =>
                    setEditingLedgerEntry({ ...editingLedgerEntry, payment_method: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Bank IMPS">Bank IMPS / NEFT</option>
                  <option value="Cash">Cash / Offline</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Associated Rescue Dog (Optional)
                </label>
                <select
                  value={editingLedgerEntry.animal_id || ''}
                  onChange={(e) =>
                    setEditingLedgerEntry({ ...editingLedgerEntry, animal_id: e.target.value || undefined })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                >
                  <option value="">General Fund (Not linked to single dog)</option>
                  {animals.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Reference / UTR / Bill Number
                </label>
                <input
                  type="text"
                  value={editingLedgerEntry.reference_id || ''}
                  onChange={(e) =>
                    setEditingLedgerEntry({ ...editingLedgerEntry, reference_id: e.target.value })
                  }
                  placeholder="e.g. UTR #4128910238 or Bill #INV-204"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Bill / Receipt Proof</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingLedgerEntry.receipt_url || ''}
                    onChange={(e) =>
                      setEditingLedgerEntry({ ...editingLedgerEntry, receipt_url: e.target.value })
                    }
                    placeholder="Receipt URL or upload"
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                  <label className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer text-pink-400 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    Upload
                    <input type="file" accept="image/*,application/pdf" onChange={handleReceiptUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Notes / Purpose</label>
                <textarea
                  rows={2}
                  value={editingLedgerEntry.notes || ''}
                  onChange={(e) =>
                    setEditingLedgerEntry({ ...editingLedgerEntry, notes: e.target.value })
                  }
                  placeholder="Medical surgery cost, blood test panel, or donor message"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="verifyCheck"
                  checked={Boolean(editingLedgerEntry.is_verified)}
                  onChange={(e) =>
                    setEditingLedgerEntry({ ...editingLedgerEntry, is_verified: e.target.checked })
                  }
                  className="w-4 h-4 accent-pink-500 rounded"
                />
                <label htmlFor="verifyCheck" className="text-xs font-bold text-slate-300">
                  Mark as Verified immediately (credits target dog's funds)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLedgerModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl font-display"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
