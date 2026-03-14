import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import studentRoutes from './routes/studentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import { testConnection } from './config/db.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);
const origin = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin }));
app.use(express.json({ limit: '10mb' }));

app.get('/', (_req, res) => {
  res.json({ message: 'Face Attendance SMKN 1 Kras API is running.' });
});

app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Unexpected server error.' });
});

(async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
})();
