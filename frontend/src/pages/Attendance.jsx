import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CameraCard from '../components/CameraCard';
import { api } from '../services/api';

export default function Attendance() {
  const [descriptor, setDescriptor] = useState(null);
  const [attendanceType, setAttendanceType] = useState('checkin');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoSubmit, setAutoSubmit] = useState(true);

  useEffect(() => {
    if (descriptor && autoSubmit && !loading) {
      submitAttendance();
    }
  }, [descriptor]);

  const submitAttendance = async () => {
    if (!descriptor) {
      setResult({ message: 'Silakan scan wajah dulu.' });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/attendance/scan', {
        face_descriptor: descriptor,
        attendance_type: attendanceType,
      });
      setResult(response.data);
    } catch (error) {
      const errData = error?.response?.data;
      setResult({
        message: errData?.message || 'Presensi gagal.',
        confidence: errData?.confidence,
        already_recorded: errData?.already_recorded,
        recorded_at: errData?.recorded_at,
        student: errData?.student,
      });
    } finally {
      setLoading(false);
      setTimeout(() => { setDescriptor(null); setResult(null); }, 4000);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <CameraCard onDescriptor={setDescriptor} autoScan={true} />

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-white/50 bg-white/55 p-6 shadow-soft backdrop-blur-xl"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">Presensi</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-800">Auto Scan Presensi</h2>
        <p className="mt-1 text-sm text-slate-500">Pilih tipe presensi, wajah akan otomatis discan dan diproses.</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAttendanceType('checkin')}
            className={`rounded-2xl px-4 py-3 font-semibold transition ${
              attendanceType === 'checkin'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                : 'bg-white/80 text-slate-700 hover:bg-white'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => setAttendanceType('checkout')}
            className={`rounded-2xl px-4 py-3 font-semibold transition ${
              attendanceType === 'checkout'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                : 'bg-white/80 text-slate-700 hover:bg-white'
            }`}
          >
            Pulang
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSubmit}
              onChange={(e) => setAutoSubmit(e.target.checked)}
              className="w-4 h-4 accent-emerald-500"
            />
            <span className="text-sm text-slate-600">Auto-submit setelah scan</span>
          </label>
        </div>

        {!autoSubmit && (
          <button
            type="button"
            onClick={submitAttendance}
            disabled={loading || !descriptor}
            className="mt-4 w-full rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01] disabled:opacity-60"
          >
            {loading ? 'Memproses...' : 'Kirim Presensi Manual'}
          </button>
        )}

        <div className="mt-6 rounded-[28px] bg-white/80 p-5 min-h-[120px]">
          <p className="text-lg font-bold text-slate-800">Status Presensi</p>

          {loading && (
            <div className="mt-3 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600">Memproses presensi...</p>
            </div>
          )}

          {!loading && !result && (
            <p className="mt-2 text-slate-400 text-sm">Siap untuk scan wajah siswa.</p>
          )}

          {/* Sudah presensi hari ini */}
          {result?.already_recorded && (
            <div className="mt-3 bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-1 text-sm">
              <p className="font-semibold text-amber-700">⚠ Sudah Presensi Hari Ini</p>
              <p className="text-amber-600">{result.message}</p>
              {result.student && <p className="text-slate-500">Nama: {result.student.full_name}</p>}
              {result.student?.class_name && <p className="text-slate-500">Kelas: {result.student.class_name}</p>}
              {result.recorded_at && (
                <p className="text-slate-500">
                  Waktu: {new Date(result.recorded_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          )}

          {/* Presensi berhasil */}
          {result?.student && !result.already_recorded && (
            <div className="mt-3 bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-1 text-sm">
              <p className="font-semibold text-emerald-700">✓ Presensi Berhasil</p>
              <p className="text-slate-600">{result.message}</p>
              <p className="text-slate-500">Nama: {result.student.full_name}</p>
              {result.student.class_name && <p className="text-slate-500">Kelas: {result.student.class_name}</p>}
              <p className="text-slate-500">Confidence: {Number(result.confidence ?? 0).toFixed(4)}</p>
            </div>
          )}

          {/* Wajah tidak dikenali */}
          {!result?.student && !result?.already_recorded && result?.confidence !== undefined && (
            <div className="mt-3 bg-red-50 border border-red-200 p-4 rounded-2xl">
              <p className="text-sm font-semibold text-red-600">❌ Wajah Tidak Dikenali</p>
              <p className="text-sm text-red-500 mt-1">Confidence: {Number(result.confidence).toFixed(4)}</p>
            </div>
          )}
        </div>
      </motion.section>
    </div>
  );
}
