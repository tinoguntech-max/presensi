import express from 'express';
import { db } from '../config/db.js';
import { findBestMatch } from '../utils/faceMatcher.js';

const router = express.Router();

router.post('/scan', async (req, res) => {
  try {
    const { face_descriptor, attendance_type } = req.body;
    const threshold = Number(process.env.FACE_MATCH_THRESHOLD || 0.5);

    if (!Array.isArray(face_descriptor) || !['checkin', 'checkout'].includes(attendance_type)) {
      return res.status(400).json({ message: 'Data presensi tidak valid.' });
    }

    const [students] = await db.query(
      `SELECT u.id, u.username, u.full_name, u.face_descriptor, c.name AS class_name
       FROM users u
       LEFT JOIN classes c ON u.class_id = c.id
       WHERE u.role = 'STUDENT' AND u.is_active = 1 AND u.face_descriptor IS NOT NULL`,
    );

    if (students.length === 0) {
      return res.status(404).json({ message: 'Belum ada data wajah siswa yang terdaftar.' });
    }

    const result = findBestMatch(face_descriptor, students, threshold);

    if (!result.matched) {
      return res.status(404).json({
        message: 'Wajah tidak dikenali.',
        confidence: result.confidence,
      });
    }

    // Cek apakah sudah presensi hari ini dengan tipe yang sama
    const [[existing]] = await db.query(
      `SELECT id, created_at FROM face_attendances
       WHERE student_id = ? AND attendance_type = ? AND DATE(created_at) = CURDATE()
       ORDER BY created_at DESC LIMIT 1`,
      [result.employee.id, attendance_type],
    );

    if (existing) {
      return res.status(409).json({
        message: `${result.employee.full_name} sudah melakukan ${attendance_type === 'checkin' ? 'presensi masuk' : 'presensi pulang'} hari ini.`,
        already_recorded: true,
        recorded_at: existing.created_at,
        student: {
          id: result.employee.id,
          username: result.employee.username,
          full_name: result.employee.full_name,
          class_name: result.employee.class_name,
        },
        confidence: result.confidence,
      });
    }

    await db.query(
      `INSERT INTO face_attendances (student_id, attendance_type, confidence_score) VALUES (?, ?, ?)`,
      [result.employee.id, attendance_type, result.confidence],
    );

    return res.json({
      message: `Presensi ${attendance_type === 'checkin' ? 'masuk' : 'pulang'} berhasil.`,
      student: {
        id: result.employee.id,
        username: result.employee.username,
        full_name: result.employee.full_name,
        class_name: result.employee.class_name,
      },
      confidence: result.confidence,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const { class_id, date } = req.query;
    const params = [];
    let where = '';

    if (class_id) {
      where += ` AND u.class_id = ?`;
      params.push(class_id);
    }
    if (date) {
      where += ` AND DATE(fa.created_at) = ?`;
      params.push(date);
    }

    const [rows] = await db.query(
      `SELECT fa.id, u.username, u.full_name, c.name AS class_name,
              fa.attendance_type, fa.confidence_score, fa.created_at
       FROM face_attendances fa
       JOIN users u ON fa.student_id = u.id
       LEFT JOIN classes c ON u.class_id = c.id
       WHERE 1=1 ${where}
       ORDER BY fa.created_at DESC
       LIMIT 100`,
      params,
    );
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

router.get('/stats', async (_req, res) => {
  try {
    const [[studentStats]] = await db.query(
      `SELECT COUNT(*) AS total_students FROM users WHERE role = 'STUDENT' AND is_active = 1`,
    );
    const [[attendanceStats]] = await db.query(`SELECT COUNT(*) AS total_attendances FROM face_attendances`);
    const [[todayStats]] = await db.query(
      `SELECT COUNT(*) AS total_today FROM face_attendances WHERE DATE(created_at) = CURDATE()`,
    );
    const [[faceStats]] = await db.query(
      `SELECT COUNT(*) AS total_registered FROM users WHERE role = 'STUDENT' AND is_active = 1 AND face_descriptor IS NOT NULL`,
    );

    return res.json({
      total_students: studentStats.total_students,
      total_attendances: attendanceStats.total_attendances,
      total_today: todayStats.total_today,
      total_registered: faceStats.total_registered,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

export default router;
