import { Request, Response } from 'express';
import { query } from '../config/db';
import { apiCache, cacheKeys, invalidateCache } from '../utils/cache';

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const shouldIncrement = req.query.visit === 'true';

    // If not incrementing page views, check cache first
    if (!shouldIncrement) {
      const cached = apiCache.get(cacheKeys.stats);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120');
        res.json(cached);
        return;
      }
    }

    // Page view counter
    let views = 1250;
    try {
      if (shouldIncrement) {
        const viewRes = await query(`
          INSERT INTO analytics (id, page_views, last_updated)
          VALUES (1, 1, NOW())
          ON CONFLICT (id) DO UPDATE SET page_views = analytics.page_views + 1, last_updated = NOW()
          RETURNING page_views;
        `);
        views = Number(viewRes.rows[0]?.page_views || 1250);
      } else {
        const viewRes = await query('SELECT page_views FROM analytics WHERE id = 1');
        if (viewRes.rows.length > 0) {
          views = Number(viewRes.rows[0].page_views);
        }
      }
    } catch {
      // analytics fallback if table not yet initialized
    }

    // Counts
    const countsRes = await query(`
      SELECT
        COUNT(CASE WHEN category = 'treatment' AND status IN ('urgent', 'in_treatment') THEN 1 END) as active_treatments,
        COUNT(CASE WHEN status = 'adopted' THEN 1 END) as animals_adopted,
        COUNT(CASE WHEN status = 'recovered' THEN 1 END) as animals_recovered,
        COUNT(*) as total_rescued
      FROM animals
    `);

    // Financial totals
    const fundsRes = await query(`
      SELECT
        COALESCE(SUM(CASE WHEN entry_type = 'donation' AND is_verified = true THEN amount ELSE 0 END), 0) as total_raised,
        COALESCE(SUM(CASE WHEN entry_type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
      FROM ledger_entries
    `);

    const counts = countsRes.rows[0] || {};
    const funds = fundsRes.rows[0] || {};

    const payload = {
      stats: {
        page_views: views,
        total_raised: Number(funds.total_raised || 0),
        total_expenses: Number(funds.total_expenses || 0),
        active_treatments: Number(counts.active_treatments || 0),
        animals_adopted: Number(counts.animals_adopted || 0),
        animals_recovered: Number(counts.animals_recovered || 0),
        total_rescued: Number(counts.total_rescued || 0),
      },
    };

    apiCache.set(cacheKeys.stats, payload, 30);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120');
    res.json(payload);
  } catch (err: any) {
    console.error('getStats error:', err);
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
};

export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT key, value FROM site_settings');
    const settingsMap: Record<string, any> = {
      upi_id: 'salesabshappypaws@oksbi',
      payee_name: 'PawsAndHearts',
      contact_phone: '+91 7217739614',
      contact_location: 'BLR, India',
      emergency_banner: '',
      enable_donations: true,
    };

    result.rows.forEach((row: any) => {
      settingsMap[row.key] = row.value;
    });

    res.json({ settings: settingsMap });
  } catch (err: any) {
    console.error('getSettings error:', err);
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const updates = req.body;
    if (typeof updates !== 'object' || updates === null) {
      res.status(400).json({ error: 'Invalid settings payload' });
      return;
    }

    for (const [key, value] of Object.entries(updates)) {
      await query(
        `INSERT INTO site_settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, JSON.stringify(value)]
      );
    }

    invalidateCache.stats();

    res.json({ message: 'Settings updated successfully' });
  } catch (err: any) {
    console.error('updateSettings error:', err);
    res.status(500).json({ error: 'Failed to save settings' });
  }
};
