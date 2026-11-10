"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.changePassword = exports.logout = exports.me = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const JWT_SECRET = process.env.JWT_SECRET || 'pawsnhearts-super-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d';
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const result = await (0, db_1.query)('SELECT id, email, password_hash, name, role FROM admin_users WHERE email = $1', [email.toLowerCase().trim()]);
        if (result.rows.length === 0) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const admin = result.rows[0];
        const isMatch = await bcryptjs_1.default.compare(password, admin.password_hash);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const payload = {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
        };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
        // Set HTTP-only secure cookie
        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.json({
            message: 'Login successful',
            token,
            user: payload,
        });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error during authentication' });
    }
};
exports.login = login;
const me = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const result = await (0, db_1.query)('SELECT id, email, name, role, created_at FROM admin_users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Admin account not found' });
            return;
        }
        res.json({ user: result.rows[0] });
    }
    catch (err) {
        console.error('Auth verification error:', err);
        res.status(500).json({ error: 'Failed to verify session' });
    }
};
exports.me = me;
const logout = (req, res) => {
    res.clearCookie('admin_token');
    res.json({ message: 'Logged out successfully' });
};
exports.logout = logout;
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword || newPassword.length < 6) {
            res.status(400).json({ error: 'Valid current password and new password (min 6 chars) required' });
            return;
        }
        const result = await (0, db_1.query)('SELECT password_hash FROM admin_users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(currentPassword, result.rows[0].password_hash);
        if (!isMatch) {
            res.status(400).json({ error: 'Incorrect current password' });
            return;
        }
        const newHash = await bcryptjs_1.default.hash(newPassword, 10);
        await (0, db_1.query)('UPDATE admin_users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
            newHash,
            req.user.id,
        ]);
        res.json({ message: 'Password updated successfully' });
    }
    catch (err) {
        console.error('Password change error:', err);
        res.status(500).json({ error: 'Failed to update password' });
    }
};
exports.changePassword = changePassword;
const updateProfile = async (req, res) => {
    try {
        const { email, name, currentPassword, newPassword } = req.body;
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        if (!currentPassword) {
            res.status(400).json({ error: 'Current password is required to save account changes' });
            return;
        }
        // 1. Verify current password
        const userRes = await (0, db_1.query)('SELECT id, email, password_hash, name, role FROM admin_users WHERE id = $1', [
            req.user.id,
        ]);
        if (userRes.rows.length === 0) {
            res.status(404).json({ error: 'Admin account not found' });
            return;
        }
        const currentAdmin = userRes.rows[0];
        const isMatch = await bcryptjs_1.default.compare(currentPassword, currentAdmin.password_hash);
        if (!isMatch) {
            res.status(400).json({ error: 'Incorrect current password' });
            return;
        }
        // 2. Validate email if changing
        const targetEmail = (email || currentAdmin.email).toLowerCase().trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
            res.status(400).json({ error: 'Please enter a valid email address' });
            return;
        }
        if (targetEmail !== currentAdmin.email.toLowerCase()) {
            const emailCheck = await (0, db_1.query)('SELECT id FROM admin_users WHERE email = $1 AND id != $2', [
                targetEmail,
                req.user.id,
            ]);
            if (emailCheck.rows.length > 0) {
                res.status(400).json({ error: 'This email is already registered by another admin' });
                return;
            }
        }
        // 3. Handle new password if provided
        let newHash = currentAdmin.password_hash;
        if (newPassword && newPassword.trim().length > 0) {
            if (newPassword.trim().length < 6) {
                res.status(400).json({ error: 'New password must be at least 6 characters long' });
                return;
            }
            newHash = await bcryptjs_1.default.hash(newPassword.trim(), 10);
        }
        const targetName = (name !== undefined ? name : currentAdmin.name).trim();
        // 4. Update in database
        await (0, db_1.query)(`UPDATE admin_users 
       SET email = $1, name = $2, password_hash = $3, updated_at = NOW() 
       WHERE id = $4`, [targetEmail, targetName, newHash, req.user.id]);
        const updatedUser = {
            id: req.user.id,
            email: targetEmail,
            name: targetName,
            role: currentAdmin.role,
        };
        const newToken = jsonwebtoken_1.default.sign(updatedUser, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
        res.cookie('admin_token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({
            message: 'Account details updated successfully!',
            user: updatedUser,
            token: newToken,
        });
    }
    catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Failed to update account details' });
    }
};
exports.updateProfile = updateProfile;
