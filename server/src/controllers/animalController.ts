import { Request, Response } from 'express';
import { query } from '../config/db';
import { apiCache, cacheKeys, invalidateCache } from '../utils/cache';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export const getAnimals = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, status, search, limit = 50, offset = 0 } = req.query;
    const cacheKey = cacheKeys.animalsList(`${category || 'all'}_${status || 'all'}_${search || ''}_${limit}_${offset}`);

    if (!search) {
      const cached = apiCache.get(cacheKey);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120');
        res.json(cached);
        return;
      }
    }

    let sql = `
      SELECT 
        a.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', m.id, 
              'media_type', m.media_type, 
              'url', m.url, 
              'caption', m.caption, 
              'sort_order', m.sort_order
            ) ORDER BY m.sort_order ASC
          ) FILTER (WHERE m.id IS NOT NULL), '[]'
        ) as media
      FROM animals a
      LEFT JOIN animal_media m ON a.id = m.animal_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (category && typeof category === 'string' && category !== 'all') {
      params.push(category);
      sql += ` AND a.category = $${params.length}`;
    }

    if (status && typeof status === 'string' && status !== 'all') {
      params.push(status);
      sql += ` AND a.status = $${params.length}`;
    }

    if (search && typeof search === 'string') {
      params.push(`%${search.toLowerCase()}%`);
      sql += ` AND (LOWER(a.name) LIKE $${params.length} OR LOWER(a.short_desc) LIKE $${params.length})`;
    }

    sql += ` GROUP BY a.id ORDER BY a.sort_order ASC, a.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);
    const payload = { animals: result.rows };
    if (!search) {
      apiCache.set(cacheKey, payload, 60);
    }
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120');
    res.json(payload);
  } catch (err: any) {
    console.error('getAnimals error:', err);
    res.status(500).json({ error: 'Failed to retrieve animals' });
  }
};

export const getAnimalBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const cacheKey = cacheKeys.animalDetail(slug);
    const cached = apiCache.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120');
      res.json(cached);
      return;
    }

    const sql = `
      SELECT 
        a.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', m.id, 
              'media_type', m.media_type, 
              'url', m.url, 
              'caption', m.caption, 
              'sort_order', m.sort_order
            ) ORDER BY m.sort_order ASC
          ) FILTER (WHERE m.id IS NOT NULL), '[]'
        ) as media,
        COALESCE((
          SELECT SUM(amount) FROM ledger_entries 
          WHERE animal_id = a.id AND entry_type = 'donation' AND is_verified = true
        ), 0) as verified_donations
      FROM animals a
      LEFT JOIN animal_media m ON a.id = m.animal_id
      WHERE a.slug = $1 OR a.id::text = $1
      GROUP BY a.id
    `;

    const result = await query(sql, [slug]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Animal rescue profile not found' });
      return;
    }

    const payload = { animal: result.rows[0] };
    apiCache.set(cacheKey, payload, 60);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120');
    res.json(payload);
  } catch (err: any) {
    console.error('getAnimalBySlug error:', err);
    res.status(500).json({ error: 'Failed to retrieve animal details' });
  }
};

export const createAnimal = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      slug: customSlug,
      category = 'adoption',
      status = 'available',
      tags = [],
      short_desc = '',
      full_story = '',
      medical_details = '',
      funds_needed = 0,
      funds_raised = 0,
      hero_image = '',
      is_featured = false,
      media = [],
    } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Animal name is required' });
      return;
    }

    const baseSlug = customSlug || slugify(name);
    let finalSlug = baseSlug;
    let count = 1;

    // Check slug collisions
    while (true) {
      const check = await query('SELECT id FROM animals WHERE slug = $1', [finalSlug]);
      if (check.rows.length === 0) break;
      finalSlug = `${baseSlug}-${count++}`;
    }

    const insertSql = `
      INSERT INTO animals (
        name, slug, category, status, tags, short_desc, full_story,
        medical_details, funds_needed, funds_raised, hero_image, is_featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const result = await query(insertSql, [
      name,
      finalSlug,
      category,
      status,
      Array.isArray(tags) ? tags : [],
      short_desc,
      full_story,
      medical_details,
      funds_needed,
      funds_raised,
      hero_image,
      Boolean(is_featured),
    ]);

    const newAnimal = result.rows[0];

    // Insert any media items if passed
    if (Array.isArray(media) && media.length > 0) {
      for (let i = 0; i < media.length; i++) {
        const item = media[i];
        if (item && item.url) {
          await query(
            `INSERT INTO animal_media (animal_id, media_type, url, caption, sort_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [newAnimal.id, item.media_type || 'image', item.url, item.caption || '', i]
          );
        }
      }
    }

    // Invalidate cache
    invalidateCache.animals();

    res.status(201).json({
      message: 'Animal profile created successfully',
      animal: newAnimal,
    });
  } catch (err: any) {
    console.error('createAnimal error:', err);
    res.status(500).json({ error: 'Failed to create animal profile' });
  }
};

export const updateAnimal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      category,
      status,
      tags,
      short_desc,
      full_story,
      medical_details,
      funds_needed,
      funds_raised,
      hero_image,
      is_featured,
      sort_order,
      media,
    } = req.body;

    const existing = await query('SELECT * FROM animals WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      res.status(404).json({ error: 'Animal not found' });
      return;
    }

    const cur = existing.rows[0];

    const updateSql = `
      UPDATE animals SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        category = COALESCE($3, category),
        status = COALESCE($4, status),
        tags = COALESCE($5, tags),
        short_desc = COALESCE($6, short_desc),
        full_story = COALESCE($7, full_story),
        medical_details = COALESCE($8, medical_details),
        funds_needed = COALESCE($9, funds_needed),
        funds_raised = COALESCE($10, funds_raised),
        hero_image = COALESCE($11, hero_image),
        is_featured = COALESCE($12, is_featured),
        sort_order = COALESCE($13, sort_order),
        updated_at = NOW()
      WHERE id = $14
      RETURNING *
    `;

    const result = await query(updateSql, [
      name ?? cur.name,
      slug ?? cur.slug,
      category ?? cur.category,
      status ?? cur.status,
      tags ?? cur.tags,
      short_desc ?? cur.short_desc,
      full_story ?? cur.full_story,
      medical_details ?? cur.medical_details,
      funds_needed ?? cur.funds_needed,
      funds_raised ?? cur.funds_raised,
      hero_image ?? cur.hero_image,
      is_featured !== undefined ? is_featured : cur.is_featured,
      sort_order ?? cur.sort_order,
      id,
    ]);

    // If media array is provided, replace animal media
    if (Array.isArray(media)) {
      await query('DELETE FROM animal_media WHERE animal_id = $1', [id]);
      for (let i = 0; i < media.length; i++) {
        const item = media[i];
        if (item && item.url) {
          await query(
            `INSERT INTO animal_media (animal_id, media_type, url, caption, sort_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [id, item.media_type || 'image', item.url, item.caption || '', i]
          );
        }
      }
    }

    // Invalidate cache
    invalidateCache.animals();

    res.json({
      message: 'Animal updated successfully',
      animal: result.rows[0],
    });
  } catch (err: any) {
    console.error('updateAnimal error:', err);
    res.status(500).json({ error: 'Failed to update animal' });
  }
};

export const deleteAnimal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM animals WHERE id = $1 RETURNING id, name', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Animal not found' });
      return;
    }

    // Invalidate cache
    invalidateCache.animals();

    res.json({ message: `Animal "${result.rows[0].name}" deleted successfully` });
  } catch (err: any) {
    console.error('deleteAnimal error:', err);
    res.status(500).json({ error: 'Failed to delete animal' });
  }
};
