import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { employee_code, full_name, email, department, face_descriptor } = req.body;

    if (!employee_code || !full_name || !Array.isArray(face_descriptor)) {
      return res.status(400).json({ message: 'Kode karyawan, nama, dan face descriptor wajib diisi.' });
    }

    const [existing] = await db.query('SELECT id FROM employees WHERE employee_code = ?', [employee_code]);

    if (existing.length > 0) {
      await db.query(
        `UPDATE employees
         SET full_name = ?, email = ?, department = ?, face_descriptor = ?
         WHERE employee_code = ?`,
        [full_name, email || null, department || null, JSON.stringify(face_descriptor), employee_code],
      );

      return res.json({ message: 'Data wajah berhasil diperbarui.' });
    }

    await db.query(
      `INSERT INTO employees (employee_code, full_name, email, department, face_descriptor)
       VALUES (?, ?, ?, ?, ?)`,
      [employee_code, full_name, email || null, department || null, JSON.stringify(face_descriptor)],
    );

    return res.status(201).json({ message: 'Karyawan berhasil didaftarkan.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, employee_code, full_name, email, department, created_at
       FROM employees
       ORDER BY id DESC`,
    );
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

export default router;
