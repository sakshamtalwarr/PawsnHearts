import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'pawsnhearts-super-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const result = await query(
      'SELECT id, email, password_hash, name, role FROM admin_users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);

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

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

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
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

export const me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const result = await query(
      'SELECT id, email, name, role, created_at FROM admin_users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Admin account not found' });
      return;
    }

    res.json({ user: result.rows[0] });
  } catch (err: any) {
    console.error('Auth verification error:', err);
    res.status(500).json({ error: 'Failed to verify session' });
  }
};

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('admin_token');
  res.json({ message: 'Logged out successfully' });
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'Valid current password and new password (min 6 chars) required' });
      return;
    }

    const result = await query(
      'SELECT password_hash FROM admin_users WHERE id = $1',
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!isMatch) {
      res.status(400).json({ error: 'Incorrect current password' });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE admin_users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
      newHash,
      req.user!.id,
    ]);

    res.json({ message: 'Password updated successfully' });
  } catch (err: any) {
    console.error('Password change error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
};
