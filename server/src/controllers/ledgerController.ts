import { Request, Response } from 'express';
import { query } from '../config/db';
import { apiCache, cacheKeys, invalidateCache } from '../utils/cache';

export const getPublicLedger = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;
    const cacheKey = cacheKeys.publicLedger(`${search || ''}_${limit}_${offset}`);

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
        l.id,
        l.donor_name,
        l.amount,
        l.entry_type,
        l.payment_method,
        l.reference_id,
        l.receipt_url,
        l.is_verified,
        l.transaction_date,
        l.notes,
        l.created_at,
        a.id as animal_id,
        a.name as animal_name,
        a.slug as animal_slug
      FROM ledger_entries l
      LEFT JOIN animals a ON l.animal_id = a.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search && typeof search === 'string') {
      params.push(`%${search.toLowerCase()}%`);
      sql += ` AND (
        LOWER(l.donor_name) LIKE $${params.length} 
        OR LOWER(COALESCE(l.notes, '')) LIKE $${params.length}
        OR LOWER(COALESCE(a.name, '')) LIKE $${params.length}
      )`;
    }

    sql += ` ORDER BY l.transaction_date DESC, l.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);

    // Also get financial totals
    const totalsResult = await query(`
      SELECT 
        COALESCE(SUM(CASE WHEN entry_type = 'donation' AND is_verified = true THEN amount ELSE 0 END), 0) as total_verified_donations,
        COALESCE(SUM(CASE WHEN entry_type = 'donation' AND is_verified = false THEN amount ELSE 0 END), 0) as total_pending_donations,
        COALESCE(SUM(CASE WHEN entry_type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
        COUNT(CASE WHEN entry_type = 'donation' AND is_verified = true THEN 1 END) as verified_count
      FROM ledger_entries
    `);

    const payload = {
      entries: result.rows,
      summary: totalsResult.rows[0],
    };

    if (!search) {
      apiCache.set(cacheKey, payload, 45);
    }

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120');
    res.json(payload);
  } catch (err: any) {
    console.error('getPublicLedger error:', err);
    res.status(500).json({ error: 'Failed to retrieve ledger entries' });
  }
};

export const createLedgerEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const isAdmin = Boolean((req as any).user);
    const {
      animal_id,
      donor_name = 'Anonymous',
      amount,
      entry_type = 'donation',
      payment_method = 'UPI',
      reference_id,
      receipt_url,
      is_verified = false,
      transaction_date = new Date().toISOString().slice(0, 10),
      notes,
    } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      res.status(400).json({ error: 'A valid amount is required' });
      return;
    }

    // Security: Non-admin public submissions are always unverified donations
    const verifiedStatus = isAdmin ? Boolean(is_verified) : false;
    const finalEntryType = isAdmin ? entry_type : 'donation';

    const sql = `
      INSERT INTO ledger_entries (
        animal_id, donor_name, amount, entry_type, payment_method,
        reference_id, receipt_url, is_verified, transaction_date, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await query(sql, [
      animal_id || null,
      donor_name.trim() || 'Anonymous',
      Number(amount),
      finalEntryType,
      payment_method,
      reference_id || null,
      receipt_url || null,
      verifiedStatus,
      transaction_date,
      notes || null,
    ]);

    // If animal_id is provided and verified, update animal's funds_raised
    if (animal_id && verifiedStatus && finalEntryType === 'donation') {
      await query(
        `UPDATE animals 
         SET funds_raised = funds_raised + $1 
         WHERE id = $2`,
        [Number(amount), animal_id]
      );
    }

    // Invalidate ledger and stats caches
    invalidateCache.ledger();

    res.status(201).json({
      message: verifiedStatus
        ? 'Ledger entry recorded and verified successfully'
        : 'Thank you! Your donation has been pledged and sent to admin for verification.',
      entry: result.rows[0],
    });
  } catch (err: any) {
    console.error('createLedgerEntry error:', err);
    res.status(500).json({ error: 'Failed to record ledger entry' });
  }
};

export const updateLedgerEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      animal_id,
      donor_name,
      amount,
      entry_type,
      payment_method,
      reference_id,
      receipt_url,
      is_verified,
      transaction_date,
      notes,
    } = req.body;

    const existing = await query('SELECT * FROM ledger_entries WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    const cur = existing.rows[0];

    const sql = `
      UPDATE ledger_entries SET
        animal_id = $1,
        donor_name = COALESCE($2, donor_name),
        amount = COALESCE($3, amount),
        entry_type = COALESCE($4, entry_type),
        payment_method = COALESCE($5, payment_method),
        reference_id = $6,
        receipt_url = $7,
        is_verified = COALESCE($8, is_verified),
        transaction_date = COALESCE($9, transaction_date),
        notes = $10
      WHERE id = $11
      RETURNING *
    `;

    const result = await query(sql, [
      animal_id !== undefined ? (animal_id || null) : cur.animal_id,
      donor_name,
      amount !== undefined ? Number(amount) : cur.amount,
      entry_type,
      payment_method,
      reference_id !== undefined ? reference_id : cur.reference_id,
      receipt_url !== undefined ? receipt_url : cur.receipt_url,
      is_verified !== undefined ? Boolean(is_verified) : cur.is_verified,
      transaction_date,
      notes !== undefined ? notes : cur.notes,
      id,
    ]);

    // Invalidate caches
    invalidateCache.ledger();

    res.json({
      message: 'Ledger entry updated',
      entry: result.rows[0],
    });
  } catch (err: any) {
    console.error('updateLedgerEntry error:', err);
    res.status(500).json({ error: 'Failed to update ledger entry' });
  }
};

export const toggleVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const check = await query('SELECT id, is_verified, amount, animal_id, entry_type FROM ledger_entries WHERE id = $1', [id]);

    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    const cur = check.rows[0];
    const newStatus = !cur.is_verified;

    const result = await query(
      'UPDATE ledger_entries SET is_verified = $1 WHERE id = $2 RETURNING *',
      [newStatus, id]
    );

    // Adjust animal funds_raised if linked
    if (cur.animal_id && cur.entry_type === 'donation') {
      const delta = newStatus ? Number(cur.amount) : -Number(cur.amount);
      await query(
        'UPDATE animals SET funds_raised = GREATEST(0, funds_raised + $1) WHERE id = $2',
        [delta, cur.animal_id]
      );
    }

    // Invalidate caches
    invalidateCache.ledger();

    res.json({
      message: `Entry status updated to ${newStatus ? 'Verified' : 'Pending'}`,
      entry: result.rows[0],
    });
  } catch (err: any) {
    console.error('toggleVerification error:', err);
    res.status(500).json({ error: 'Failed to update verification status' });
  }
};

export const deleteLedgerEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM ledger_entries WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    // Invalidate caches
    invalidateCache.ledger();

    res.json({ message: 'Ledger entry deleted successfully' });
  } catch (err: any) {
    console.error('deleteLedgerEntry error:', err);
    res.status(500).json({ error: 'Failed to delete ledger entry' });
  }
};
