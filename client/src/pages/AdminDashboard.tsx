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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Animal, LedgerEntry, Stats, SiteSettings } from '../types';
import { animalsApi, ledgerApi, statsApi, uploadApi } from '../api/client';

export const AdminDashboard: React.FC = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'animals' | 'ledger' | 'settings'>('overview');

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

  // Modal states
  const [isAnimalModalOpen, setIsAnimalModalOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Partial<Animal> | null>(null);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [newLedgerEntry, setNewLedgerEntry] = useState<Partial<LedgerEntry>>({
    donor_name: '',
    amount: '',
    entry_type: 'donation',
    payment_method: 'UPI',
    is_verified: true,
    transaction_date: new Date().toISOString().slice(0, 10),
  });

  const [uploading, setUploading] = useState(false);

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
    try {
      const res = await uploadApi.uploadSingle(file, 'animals');
      setEditingAnimal((prev) => (prev ? { ...prev, hero_image: res.file.url } : null));
    } catch (err: any) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
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

  const handleSaveLedgerEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLedgerEntry.amount) return alert('Amount is required');
    try {
      await ledgerApi.create(newLedgerEntry);
      setIsLedgerModalOpen(false);
      setNewLedgerEntry({
        donor_name: '',
        amount: '',
        entry_type: 'donation',
        payment_method: 'UPI',
        is_verified: true,
        transaction_date: new Date().toISOString().slice(0, 10),
      });
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to add ledger entry');
    }
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadApi.uploadSingle(file, 'receipts');
      setNewLedgerEntry((prev) => ({ ...prev, receipt_url: res.file.url }));
    } catch (err: any) {
      alert(err.message || 'Receipt upload failed');
    } finally {
      setUploading(false);
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

  if (authLoading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading admin portal...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-black">
            P
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">Paws&Hearts Manager</h1>
            <p className="text-xs text-slate-400">Signed in as {user?.name || user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            target="_blank"
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
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
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'animals', label: `Rescues & Animals (${animals.length})`, icon: Dog },
            { id: 'ledger', label: `Public Ledger (${ledgerEntries.length})`, icon: Receipt },
            { id: 'settings', label: 'Site Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Verified Raised
                </span>
                <div className="text-3xl font-black text-emerald-400 mt-1">
                  ₹{Number(stats?.total_raised || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Medical Expenses Paid
                </span>
                <div className="text-3xl font-black text-rose-400 mt-1">
                  ₹{Number(stats?.total_expenses || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Active Medical Rescues
                </span>
                <div className="text-3xl font-black text-amber-400 mt-1">
                  {stats?.active_treatments || 0}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Dogs Rehomed (Adopted)
                </span>
                <div className="text-3xl font-black text-indigo-400 mt-1">
                  {stats?.animals_adopted || 0}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Rescue Shortcuts */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white">Recent Urgent Rescues</h3>
                  <button
                    onClick={() => setActiveTab('animals')}
                    className="text-xs text-brand-400 font-bold hover:underline"
                  >
                    View All &rarr;
                  </button>
                </div>
                <div className="space-y-3">
                  {animals.slice(0, 4).map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={a.hero_image || '/herosection.jpg'}
                          alt={a.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-bold text-white text-sm">{a.name}</div>
                          <div className="text-xs text-slate-400 capitalize">
                            {a.category} • {a.status.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-brand-400">
                        ₹{Number(a.funds_raised || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Ledger Actions */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white">Pending Verification Ledger</h3>
                  <button
                    onClick={() => setActiveTab('ledger')}
                    className="text-xs text-brand-400 font-bold hover:underline"
                  >
                    Manage Ledger &rarr;
                  </button>
                </div>
                <div className="space-y-3">
                  {ledgerEntries.filter((l) => !l.is_verified).length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 italic">
                      All donations are verified! No pending receipts.
                    </div>
                  ) : (
                    ledgerEntries
                      .filter((l) => !l.is_verified)
                      .slice(0, 4)
                      .map((l) => (
                        <div
                          key={l.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-800"
                        >
                          <div>
                            <div className="font-bold text-white text-sm">{l.donor_name}</div>
                            <div className="text-xs text-amber-400">
                              ₹{Number(l.amount).toLocaleString('en-IN')} • {l.notes || 'Donation'}
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleVerify(l.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            Verify
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ANIMALS MANAGER */}
        {activeTab === 'animals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Rescue Animals & Medical Cases</h2>
                <p className="text-xs text-slate-400">
                  Add, update stories, medical reports, and photo/video records.
                </p>
              </div>
              <button
                onClick={handleOpenAddAnimal}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
              >
                <Plus className="w-4 h-4" /> Add New Rescue
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
                      src={a.hero_image || '/herosection.jpg'}
                      alt={a.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white">
                      {a.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base text-white">{a.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {a.short_desc || a.full_story || 'No description.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-400">
                        {a.category.toUpperCase()}
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Financial Transparency Ledger</h2>
                <p className="text-xs text-slate-400">
                  Track incoming UPI donations, clinic medical bills, and verify donor submissions.
                </p>
              </div>
              <button
                onClick={() => setIsLedgerModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
              >
                <Plus className="w-4 h-4" /> Add Transaction / Expense
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold text-[11px]">
                    <tr>
                      <th className="p-4">Date</th>
                      <th className="p-4">Donor / Recipient</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Dog / Note</th>
                      <th className="p-4 text-right">Amount</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {ledgerEntries.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-800/50">
                        <td className="p-4 whitespace-nowrap">
                          {new Date(row.transaction_date).toLocaleDateString()}
                        </td>
                        <td className="p-4 font-bold text-white">{row.donor_name}</td>
                        <td className="p-4 uppercase text-[10px] font-bold text-slate-400">
                          {row.entry_type}
                        </td>
                        <td className="p-4 text-slate-400">
                          {row.animal_name ? `For ${row.animal_name}` : row.notes || '-'}
                        </td>
                        <td
                          className={`p-4 text-right font-black ${
                            row.entry_type === 'expense' ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          ₹{Number(row.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleVerify(row.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              row.is_verified
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {row.is_verified ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> Verified
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" /> Pending
                              </>
                            )}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteLedger(row.id)}
                            className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Site & Contact Settings</h2>
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
                  Emergency Alert Banner (Appears at top of page)
                </label>
                <input
                  type="text"
                  value={siteSettings.emergency_banner || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, emergency_banner: e.target.value })}
                  placeholder="e.g. 🚨 Urgent surgery needed for Bruno tonight"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg transition-all"
              >
                <Save className="w-4 h-4" /> Save Settings
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ANIMAL ADD / EDIT MODAL */}
      {isAnimalModalOpen && editingAnimal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 my-8">
            <button
              onClick={() => setIsAnimalModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-4">
              {editingAnimal.id ? `Edit ${editingAnimal.name}` : 'Add New Rescue Animal'}
            </h3>

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
                    <option value="adoption">Adoption</option>
                    <option value="treatment">Medical Treatment</option>
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
                    <option value="available">Available</option>
                    <option value="urgent">Urgent</option>
                    <option value="in_treatment">In Treatment</option>
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
                    placeholder="Vaccinated, Friendly, Indie"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>
              </div>

              {/* Photo Upload to R2 / Local */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Primary Photo (Cloudflare R2 / Disk)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingAnimal.hero_image || ''}
                    onChange={(e) => setEditingAnimal({ ...editingAnimal, hero_image: e.target.value })}
                    placeholder="Image URL or upload below"
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                  <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 text-brand-400">
                    <UploadCloud className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Upload File'}
                    <input type="file" accept="image/*,video/*" onChange={handleHeroImageUpload} className="hidden" />
                  </label>
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
                <label className="block text-xs font-bold text-slate-400 mb-1">Medical Treatment Notes</label>
                <textarea
                  rows={2}
                  value={editingAnimal.medical_details || ''}
                  onChange={(e) => setEditingAnimal({ ...editingAnimal, medical_details: e.target.value })}
                  placeholder="Prescriptions, surgeries, clinic name..."
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
                  className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEDGER ADD MODAL */}
      {isLedgerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100">
            <button
              onClick={() => setIsLedgerModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-4">Add Ledger Transaction</h3>

            <form onSubmit={handleSaveLedgerEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Entry Type</label>
                <select
                  value={newLedgerEntry.entry_type}
                  onChange={(e) =>
                    setNewLedgerEntry({ ...newLedgerEntry, entry_type: e.target.value as any })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                >
                  <option value="donation">Donation (Incoming)</option>
                  <option value="expense">Medical / Food Expense (Outgoing)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Donor / Clinic Name
                </label>
                <input
                  type="text"
                  required
                  value={newLedgerEntry.donor_name}
                  onChange={(e) =>
                    setNewLedgerEntry({ ...newLedgerEntry, donor_name: e.target.value })
                  }
                  placeholder="e.g. Ananya Deshmukh or Crown Vet Clinic"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={newLedgerEntry.amount}
                  onChange={(e) =>
                    setNewLedgerEntry({ ...newLedgerEntry, amount: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Associated Rescue Dog (Optional)
                </label>
                <select
                  value={newLedgerEntry.animal_id || ''}
                  onChange={(e) =>
                    setNewLedgerEntry({ ...newLedgerEntry, animal_id: e.target.value || undefined })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                >
                  <option value="">General Fund (Not linked)</option>
                  {animals.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Bill / Receipt Proof</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLedgerEntry.receipt_url || ''}
                    onChange={(e) =>
                      setNewLedgerEntry({ ...newLedgerEntry, receipt_url: e.target.value })
                    }
                    placeholder="Receipt URL or upload"
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                  <label className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer text-brand-400 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    Upload
                    <input type="file" accept="image/*,application/pdf" onChange={handleReceiptUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="verifyCheck"
                  checked={Boolean(newLedgerEntry.is_verified)}
                  onChange={(e) =>
                    setNewLedgerEntry({ ...newLedgerEntry, is_verified: e.target.checked })
                  }
                  className="w-4 h-4 accent-brand-500 rounded"
                />
                <label htmlFor="verifyCheck" className="text-xs font-bold text-slate-300">
                  Mark as Verified immediately
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
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
