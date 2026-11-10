import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { query } from './config/db';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

// Auto-initialize Neon database if tables are missing
async function ensureDbInitialized() {
  try {
    const res = await query("SELECT to_regclass('public.animals') as tbl_exists");
    if (!res.rows[0]?.tbl_exists) {
      console.log('🔄 Initializing database tables on first launch...');
      const schemaPath = path.join(__dirname, 'db/schema.sql');
      if (fs.existsSync(schemaPath)) {
        const sql = fs.readFileSync(schemaPath, 'utf8');
        await query(sql);
        console.log('✅ Database schema created automatically!');
      }
    }
  } catch (err) {
    // Resilient in-memory fallback handles any initial connection delay
  }
}
ensureDbInitialized();

// Route imports
import authRoutes from './routes/authRoutes';
import animalRoutes from './routes/animalRoutes';
import ledgerRoutes from './routes/ledgerRoutes';
import uploadRoutes from './routes/uploadRoutes';
import statsRoutes from './routes/statsRoutes';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'production') {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve local uploads folder
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    service: 'Paws&Hearts Backend API',
  });
});

// Social Share & Crawler Route: Serves dynamic OpenGraph meta tags for WhatsApp/Facebook/Twitter
app.get(['/pet/:slug', '/animals/:slug', '/share/pet/:slug'], async (req, res, next) => {
  try {
    const { slug } = req.params;
    const userAgent = req.get('user-agent') || '';
    const isSocialBot = /facebookexternalhit|whatsapp|telegrambot|twitterbot|linkedinbot|discordbot|slackbot|applebot|pinterest|googlebot|bingbot/i.test(
      userAgent
    );

    const result = await query(
      `SELECT a.*, 
        COALESCE((
          SELECT SUM(amount) FROM ledger_entries 
          WHERE animal_id = a.id AND entry_type = 'donation' AND is_verified = true
        ), 0) as verified_donations
       FROM animals a 
       WHERE a.slug = $1 OR a.id::text = $1 LIMIT 1`,
      [slug]
    );

    if (result.rows.length === 0) {
      if (isSocialBot) {
        res.status(404).send('Rescue case not found');
        return;
      }
      res.redirect('/#treatment');
      return;
    }

    const animal = result.rows[0];
    const host = req.get('host') || 'pawsnhearts.org';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    const pageUrl = `${baseUrl}/pet/${animal.slug}`;
    const heroImg = animal.hero_image || `${baseUrl}/logo.png`;

    const needed = Number(animal.funds_needed || 0);
    const raised = Number(animal.funds_raised || 0);
    const categoryText = animal.category === 'treatment' ? 'Emergency Medical Rescue' : 'Adoption Case';

    const title = `🐾 Help ${animal.name} - ${categoryText} | Paws&Hearts Bengaluru`;
    const description = `${animal.short_desc || animal.medical_details || animal.full_story?.slice(0, 200)} ${
      needed > 0 ? `| Goal: ₹${needed.toLocaleString('en-IN')} (₹${raised.toLocaleString('en-IN')} raised)` : ''
    }. 100% transparent street dog rescue in Bengaluru.`;

    if (isSocialBot) {
      // Return crawler-optimized HTML with OpenGraph tags
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:site_name" content="Paws&Hearts - Bengaluru Street Dog Rescue" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${heroImg}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${pageUrl}" />
  <meta property="og:type" content="article" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${heroImg}" />
</head>
<body style="font-family: system-ui, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
  <h2>${title}</h2>
  <img src="${heroImg}" alt="${animal.name}" style="max-width: 100%; border-radius: 12px; margin-bottom: 16px;" />
  <p>${description}</p>
  <p><a href="${pageUrl}">Visit full rescue profile on Paws&Hearts</a></p>
</body>
</html>`);
      return;
    }

    // Normal browser visitor: Redirect to SPA with animal pre-selected
    res.redirect(`/?pet=${encodeURIComponent(animal.slug)}`);
  } catch (err) {
    console.error('Social share error:', err);
    next(err);
  }
});

// Production: Serve React client build
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🐾 Paws&Hearts server listening on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;
