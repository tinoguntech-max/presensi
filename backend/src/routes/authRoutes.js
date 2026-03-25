import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password wajib diisi.' });
    }

    const [[user]] = await db.query(
      `SELECT u.id, u.username, u.full_name, u.role, u.password_hash, u.is_active, u.class_id,
              c.name AS class_name
       FROM users u
       LEFT JOIN classes c ON u.class_id = c.id
       WHERE u.username = ? LIMIT 1`,
      [username],
    );

    if (!user) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Akun tidak aktif.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' },
    );

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        class_id: user.class_id,
        class_name: user.class_name,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

export default router;
