-- Paws&Hearts PostgreSQL Schema for Neon
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rescued Animals Table
CREATE TABLE IF NOT EXISTS animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'adoption', -- 'adoption' or 'treatment'
  status VARCHAR(50) NOT NULL DEFAULT 'available',   -- 'available', 'urgent', 'in_treatment', 'recovered', 'adopted'
  tags TEXT[] DEFAULT '{}',
  short_desc TEXT,
  full_story TEXT,
  medical_details TEXT,
  funds_needed NUMERIC(12,2) DEFAULT 0,
  funds_raised NUMERIC(12,2) DEFAULT 0,
  hero_image TEXT,
  is_featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Animal Gallery Media Table (Photos, Videos)
CREATE TABLE IF NOT EXISTS animal_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  media_type VARCHAR(20) NOT NULL DEFAULT 'image', -- 'image' or 'video'
  url TEXT NOT NULL,
  caption TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transparency Ledger Table (Donations & Vet Expenses)
CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,
  donor_name VARCHAR(255) DEFAULT 'Anonymous',
  amount NUMERIC(12,2) NOT NULL,
  entry_type VARCHAR(20) DEFAULT 'donation', -- 'donation' or 'expense'
  payment_method VARCHAR(50) DEFAULT 'UPI',
  reference_id VARCHAR(255),
  receipt_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  transaction_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Global Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visitor Analytics
CREATE TABLE IF NOT EXISTS analytics (
  id SERIAL PRIMARY KEY,
  page_views BIGINT DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_animals_category ON animals(category);
CREATE INDEX IF NOT EXISTS idx_animals_status ON animals(status);
CREATE INDEX IF NOT EXISTS idx_animals_slug ON animals(slug);
CREATE INDEX IF NOT EXISTS idx_ledger_verified ON ledger_entries(is_verified);
CREATE INDEX IF NOT EXISTS idx_ledger_date ON ledger_entries(transaction_date DESC);
