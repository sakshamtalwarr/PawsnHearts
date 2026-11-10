"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ledgerController_1 = require("../controllers/ledgerController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/', ledgerController_1.getPublicLedger);
router.post('/submit', ledgerController_1.createLedgerEntry); // Public donation proof submission (defaults to unverified)
// Admin protected routes
router.post('/', authMiddleware_1.requireAuth, ledgerController_1.createLedgerEntry);
router.put('/:id', authMiddleware_1.requireAuth, ledgerController_1.updateLedgerEntry);
router.patch('/:id/toggle-verify', authMiddleware_1.requireAuth, ledgerController_1.toggleVerification);
router.delete('/:id', authMiddleware_1.requireAuth, ledgerController_1.deleteLedgerEntry);
exports.default = router;
