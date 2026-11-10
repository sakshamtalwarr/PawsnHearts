export type MediaType = 'image' | 'video' | 'xray' | 'prescription' | 'bill' | 'photo';

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
  category: 'adoption' | 'treatment';
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
