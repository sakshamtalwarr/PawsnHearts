import { Router } from 'express';
import {
  getPublicLedger,
  createLedgerEntry,
  updateLedgerEntry,
  toggleVerification,
  deleteLedgerEntry,
} from '../controllers/ledgerController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getPublicLedger);
router.post('/submit', createLedgerEntry); // Public donation proof submission (defaults to unverified)

// Admin protected routes
router.post('/', requireAuth, createLedgerEntry);
router.put('/:id', requireAuth, updateLedgerEntry);
router.patch('/:id/toggle-verify', requireAuth, toggleVerification);
router.delete('/:id', requireAuth, deleteLedgerEntry);

export default router;
