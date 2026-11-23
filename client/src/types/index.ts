export type MediaType = 'image' | 'video' | 'xray' | 'prescription' | 'bill' | 'photo';

export type AnimalCategory =
  | 'treatment'
  | 'critical_care'
  | 'adoption'
  | 'foster'
  | 'senior'
  | 'special_needs'
  | 'puppy'
  | 'sanctuary'
  | 'sterilization'
  | string;

export interface CategoryOption {
  value: string;
  label: string;
  badgeLabel: string;
  badgeClass: string;
  isAdoptionType?: boolean;
}

export const ANIMAL_CATEGORIES: CategoryOption[] = [
  {
    value: 'treatment',
    label: 'Emergency Medical Treatment',
    badgeLabel: 'Medical Rescue',
    badgeClass: 'text-rose-700 bg-rose-50 border border-rose-200',
  },
  {
    value: 'critical_care',
    label: 'Critical ICU & Trauma Care',
    badgeLabel: 'Critical Care (ICU)',
    badgeClass: 'text-red-700 bg-red-50 border border-red-200',
  },
  {
    value: 'adoption',
    label: 'Adoption Case',
    badgeLabel: 'Adoption Case',
    badgeClass: 'text-amber-700 bg-amber-50 border border-amber-200',
    isAdoptionType: true,
  },
  {
    value: 'foster',
    label: 'Foster Care / Temporary Foster',
    badgeLabel: 'Foster Needed',
    badgeClass: 'text-sky-700 bg-sky-50 border border-sky-200',
    isAdoptionType: true,
  },
  {
    value: 'senior',
    label: 'Senior Dog Care & Hospice',
    badgeLabel: 'Senior Dog Care',
    badgeClass: 'text-violet-700 bg-violet-50 border border-violet-200',
  },
  {
    value: 'special_needs',
    label: 'Special Needs & Wheelchair Rescue',
    badgeLabel: 'Special Needs',
    badgeClass: 'text-purple-700 bg-purple-50 border border-purple-200',
  },
  {
    value: 'puppy',
    label: 'Puppy Rescue & Litter Care',
    badgeLabel: 'Puppy Rescue',
    badgeClass: 'text-orange-700 bg-orange-50 border border-orange-200',
    isAdoptionType: true,
  },
  {
    value: 'sanctuary',
    label: 'Permanent Sanctuary Care',
    badgeLabel: 'Sanctuary Dog',
    badgeClass: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
  },
  {
    value: 'sterilization',
    label: 'ABC & Sterilization Drive',
    badgeLabel: 'ABC / Sterilization',
    badgeClass: 'text-teal-700 bg-teal-50 border border-teal-200',
  },
];

export function getCategoryInfo(category?: string): CategoryOption {
  const match = ANIMAL_CATEGORIES.find((c) => c.value === category);
  if (match) return match;
  const raw = category || 'treatment';
  return {
    value: raw,
    label: raw.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    badgeLabel: raw.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    badgeClass: 'text-pink-700 bg-pink-50 border border-pink-200',
    isAdoptionType: raw === 'adoption' || raw === 'foster',
  };
}

export interface AnimalMedia {
  id?: string;
  media_type: MediaType;
  url: string;
  caption?: string;
  sort_order?: number;
}

export interface Animal {
  id: string;
  name: string;
  slug: string;
  category: AnimalCategory;
  status: 'available' | 'urgent' | 'in_treatment' | 'recovered' | 'adopted';
  tags: string[];
  short_desc?: string;
  full_story?: string;
  medical_details?: string;
  funds_needed: number | string;
  funds_raised: number | string;
  hero_image?: string;
  is_featured: boolean;
  sort_order: number;
  media: AnimalMedia[];
  created_at: string;
}

export interface LedgerEntry {
  id: string;
  donor_name: string;
  amount: number | string;
  entry_type: 'donation' | 'expense';
  payment_method: string;
  reference_id?: string;
  receipt_url?: string;
  is_verified: boolean;
  transaction_date: string;
  notes?: string;
  created_at: string;
  animal_id?: string;
  animal_name?: string;
  animal_slug?: string;
}

export interface Stats {
  page_views: number;
  total_raised: number;
  total_expenses: number;
  active_treatments: number;
  animals_adopted: number;
  animals_recovered: number;
  total_rescued: number;
}

export interface SiteSettings {
  upi_id: string;
  payee_name: string;
  contact_phone: string;
  contact_location: string;
  emergency_banner?: string;
  enable_donations?: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function formatMediaUrl(url?: string): string {
  if (!url) return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800';
  const cleanUrl = url.trim();
  if (cleanUrl.includes('drive.google.com')) {
    const match = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
    }
  }
  return cleanUrl;
}
