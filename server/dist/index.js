"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
dotenv_1.default.config();
// Auto-initialize Neon database if tables are missing (non-blocking)
async function ensureDbInitialized() {
    if (process.env.VERCEL)
        return; // Skip in serverless to ensure instant 0ms cold starts
    try {
        const res = await (0, db_1.query)("SELECT to_regclass('public.animals') as tbl_exists");
        if (!res.rows[0]?.tbl_exists) {
            console.log('🔄 Initializing database tables on first launch...');
            const schemaPath = path_1.default.join(__dirname, 'db/schema.sql');
            if (fs_1.default.existsSync(schemaPath)) {
                const sql = fs_1.default.readFileSync(schemaPath, 'utf8');
                await (0, db_1.query)(sql);
                console.log('✅ Database schema created automatically!');
            }
        }
    }
    catch (err) {
        // Resilient in-memory fallback handles any initial connection delay
    }
}
setTimeout(ensureDbInitialized, 1000);
// Route imports
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const animalRoutes_1 = __importDefault(require("./routes/animalRoutes"));
const ledgerRoutes_1 = __importDefault(require("./routes/ledgerRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const statsRoutes_1 = __importDefault(require("./routes/statsRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_URL,
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin)
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'production') {
            callback(null, true);
        }
        else {
            callback(null, true); // Permissive in dev
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Serve local uploads folder
const uploadsPath = path_1.default.join(__dirname, '../uploads');
app.use('/uploads', express_1.default.static(uploadsPath));
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/animals', animalRoutes_1.default);
app.use('/api/ledger', ledgerRoutes_1.default);
app.use('/api/upload', uploadRoutes_1.default);
app.use('/api/stats', statsRoutes_1.default);
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
        const isSocialBot = /facebookexternalhit|whatsapp|telegrambot|twitterbot|linkedinbot|discordbot|slackbot|applebot|pinterest|googlebot|bingbot/i.test(userAgent);
        const result = await (0, db_1.query)(`SELECT a.*, 
        COALESCE((
          SELECT SUM(amount) FROM ledger_entries 
          WHERE animal_id = a.id AND entry_type = 'donation' AND is_verified = true
        ), 0) as verified_donations
       FROM animals a 
       WHERE a.slug = $1 OR a.id::text = $1 LIMIT 1`, [slug]);
        if (result.rows.length === 0) {
            // General rescue fallback if specific slug not matched
            const host = req.get('host') || 'pawsnhearts.vercel.app';
            const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
            const baseUrl = `${protocol}://${host}`;
            if (isSocialBot) {
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Paws&Hearts | Bengaluru Street Dog Rescue & Medical Rehab</title>
  <meta property="og:title" content="Paws&Hearts | Bengaluru Street Dog Rescue" />
  <meta property="og:description" content="100% transparent street dog rescue in Bengaluru. Track every single rupee live." />
  <meta property="og:image" content="https://res.cloudinary.com/dp2kretaw/image/upload/v1794288260/pawsnhearts/animals/izkivbzbeocebllsifej.jpg" />
  <meta property="og:url" content="${baseUrl}" />
</head>
<body>
  <h2>Paws&Hearts Bengaluru Street Dog Rescue</h2>
  <p><a href="${baseUrl}">Visit Paws&Hearts</a></p>
</body>
</html>`);
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
        const description = `${animal.short_desc || animal.medical_details || animal.full_story?.slice(0, 200)} ${needed > 0 ? `| Goal: ₹${needed.toLocaleString('en-IN')} (₹${raised.toLocaleString('en-IN')} raised)` : ''}. 100% transparent street dog rescue in Bengaluru.`;
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
    }
    catch (err) {
        console.error('Social share error:', err);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Paws&Hearts | Bengaluru Street Dog Rescue & Medical Rehab</title>
  <meta property="og:title" content="Paws&Hearts | Bengaluru Street Dog Rescue" />
  <meta property="og:description" content="100% transparent street dog rescue in Bengaluru. Track every single rupee live." />
  <meta property="og:image" content="https://res.cloudinary.com/dp2kretaw/image/upload/v1794288260/pawsnhearts/animals/izkivbzbeocebllsifej.jpg" />
  <meta http-equiv="refresh" content="0;url=/" />
</head>
<body>
  <h2>Paws&Hearts Bengaluru Street Dog Rescue</h2>
  <p><a href="/">Visit Paws&Hearts</a></p>
</body>
</html>`);
    }
});
// Production: Serve React client build (standalone Render / VPS mode only, not Vercel multi-service)
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    const clientDist = path_1.default.join(__dirname, '../../client/dist');
    if (fs_1.default.existsSync(clientDist)) {
        app.use(express_1.default.static(clientDist));
        app.get('*', (req, res) => {
            res.sendFile(path_1.default.join(clientDist, 'index.html'));
        });
    }
}
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
    });
});
// Standalone runner (only listens when executed directly via `node dist/index.js`, not when imported by Vercel serverless)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🐾 Paws&Hearts server listening on port ${PORT}`);
        console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}
// CommonJS and ES Module export compatibility for Vercel
module.exports = app;
exports.default = app;
