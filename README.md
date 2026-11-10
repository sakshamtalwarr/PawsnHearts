# 🐾 Paws&Hearts Transparent Animal Rescue & Rehabilitation Platform

A production-grade, 100% transparent animal rescue and rehabilitation management platform built for street dogs in Bengaluru, India.

---

## 🌟 Key Highlights & Modernization
- **Backend**: Node.js & Express with TypeScript.
- **Frontend**: React 19 + Vite + Tailwind CSS + Lucide Icons + Confetti.
- **Database**: Serverless PostgreSQL on **Neon** with connection pooling.
- **Storage**: **Cloudflare R2** with zero egress fees (and automatic local disk fallback for dev).
- **Admin Authentication**: JWT + Bcrypt/Argon2 password hashing with secure cookie support.
- **Public Transparency Ledger**: Live financial ledger tracking incoming donations & clinic invoices with receipt lightbox.
- **Dynamic UPI Generator**: Generates instant QR codes matching custom amounts and launches mobile UPI apps (GPay, PhonePe, Paytm, BHIM) with one click.
- **One-Click Deploy**: Pre-configured `render.yaml` blueprint for instant Render hosting.

---

## 🛠️ Tech Stack & Architecture

```
PawsnHearts/
├── server/               # Express + TypeScript Backend
│   ├── src/
│   │   ├── config/       # Neon DB connection & AWS S3/R2 client
│   │   ├── controllers/  # Auth, Animals, Ledger, Upload, Stats
│   │   ├── middleware/   # JWT Auth & Multer upload handling
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Pluggable Cloudflare R2 / Local Storage
│   │   ├── db/           # schema.sql, migrate.ts, seed.ts
│   │   └── index.ts      # Server entry & static SPA serving
│   ├── package.json
│   └── tsconfig.json
├── client/               # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/   # Navbar, Hero, PetCard, PetModal, Donation, Ledger, Footer
│   │   ├── pages/        # HomePage, AdminLogin, AdminDashboard
│   │   ├── context/      # AuthContext
│   │   ├── api/          # Typed API client
│   │   └── types/        # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
├── render.yaml           # Render Infrastructure-as-Code Blueprint
└── .env.example          # Environment variables template
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js (v18+)
- Neon PostgreSQL Account ([neon.tech](https://neon.tech))
- Cloudflare R2 Account (Optional: local disk fallback works automatically!)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/PawsnHearts.git
cd PawsnHearts

# Install root, server, and client dependencies
npm run install:all
```

### 3. Environment Setup
Copy the sample environment file:
```bash
cp .env.example server/.env
```
Fill in your **Neon** database connection string:
```env
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-random-name.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your-32-char-random-jwt-secret-key
ADMIN_EMAIL=admin@pawsnhearts.org
ADMIN_PASSWORD=PawsRescue2026!
```

### 4. Database Migration & Seeding
Run the automated schema creation and initial data seed:
```bash
# 1. Create tables on Neon
npm run db:migrate

# 2. Seed initial admin account and sample rescue animals
npm run db:seed
```

### 5. Start Development Servers
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- Admin Portal: `http://localhost:5173/admin/login`

---

## 🔒 Admin Credentials (Default Seed)
- **URL**: `http://localhost:5173/admin/login`
- **Email**: `admin@pawsnhearts.org`
- **Password**: `PawsRescue2026!`
*(You can customize this in `server/.env` before running `npm run db:seed`, or update via the dashboard).*

---

## ☁️ Cloudflare R2 Storage Setup (Zero Egress Fees)
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) ➡️ **R2 Object Storage**.
2. Click **Create Bucket** and name it (e.g. `pawsnhearts-media`).
3. Under bucket **Settings** ➡️ **Public Access**, enable the `r2.dev` subdomain or connect a custom domain (e.g., `media.pawsnhearts.org`).
4. In **R2 Overview** ➡️ **Manage R2 API Tokens**, create a token with `Object Read & Write` permissions.
5. Copy the credentials into your `.env` or Render environment:
   ```env
   R2_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxx
   R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxx
   R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   R2_BUCKET_NAME=pawsnhearts-media
   R2_PUBLIC_URL=https://pub-xxxxxx.r2.dev
   ```

---

## 🌐 Deploying to Render

### Method 1: Using Render Blueprint (Recommended)
1. Push your repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), click **New +** ➡️ **Blueprint**.
3. Select this repository. Render will automatically read `render.yaml` and configure:
   - Build Command: `npm run install:all && npm run build`
   - Start Command: `npm start`
   - Health check: `/api/health`
4. In the environment prompts, supply your:
   - `DATABASE_URL` (from Neon)
   - `ADMIN_PASSWORD` (for dashboard access)
   - `R2_*` keys (for Cloudflare storage)
5. Click **Apply**. Render will build and deploy your fullstack app within 2 minutes!

### Method 2: Manual Web Service
1. Create a **Web Service** on Render with Node environment.
2. Build Command: `npm run install:all && npm run build`
3. Start Command: `npm start`
4. Set Environment Variables as shown in `.env.example`.

---

## 📄 License
MIT License. Built with love for street animals.
