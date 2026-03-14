import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();

// Registrasi / update face descriptor siswa
router.post('/register', async (req, res) => {
  try {
    const { student_id, face_descriptor } = req.body;

    if (!student_id || !Array.isArray(face_descriptor)) {
      return res.status(400).json({ message: 'ID siswa dan face descriptor wajib diisi.' });
    }

    const [[student]] = await db.query(
      `SELECT id, username, full_name FROM users WHERE id = ? AND role = 'STUDENT' AND is_active = 1`,
      [student_id],
    );

    if (!student) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan.' });
    }

    await db.query(
      `UPDATE users SET face_descriptor = ? WHERE id = ?`,
      [JSON.stringify(face_descriptor), student_id],
    );

    return res.json({ message: `Wajah ${student.full_name} berhasil didaftarkan.` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// Ambil daftar siswa berdasarkan kelas (opsional)
router.get('/', async (req, res) => {
  try {
    const { class_id } = req.query;
    const params = [];
    let where = `WHERE u.role = 'STUDENT' AND u.is_active = 1`;

    if (class_id) {
      where += ` AND u.class_id = ?`;
      params.push(class_id);
    }

    const [rows] = await db.query(
      `SELECT u.id, u.username, u.full_name, u.class_id, c.name AS class_name,
              (u.face_descriptor IS NOT NULL) AS has_face
       FROM users u
       LEFT JOIN classes c ON u.class_id = c.id
       ${where}
       ORDER BY c.name, u.full_name`,
      params,
    );
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// Ambil daftar kelas
router.get('/classes', async (_req, res) => {
  try {
    const [rows] = await db.query(`SELECT id, code, name FROM classes ORDER BY name`);
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

export default router;
