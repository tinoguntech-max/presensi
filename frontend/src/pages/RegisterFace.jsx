import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CameraCard from '../components/CameraCard';
import { api } from '../services/api';

export default function RegisterFace() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [descriptor, setDescriptor] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/students/classes').then((res) => setClasses(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedClass) { setStudents([]); setSelectedStudent(''); return; }
    api.get('/students', { params: { class_id: selectedClass } })
      .then((res) => { setStudents(res.data); setSelectedStudent(''); })
      .catch(console.error);
  }, [selectedClass]);

  const handleSubmit = async () => {
    if (!selectedStudent) { setMessage('Pilih siswa terlebih dahulu.'); return; }
    if (!descriptor) { setMessage('Silakan scan wajah dulu sebelum simpan.'); return; }

    try {
      setSubmitting(true);
      const res = await api.post('/students/register', {
        student_id: selectedStudent,
        face_descriptor: descriptor,
      });
      setMessage(res.data.message);
      setDescriptor(null);
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Registrasi gagal.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedStudentData = students.find((s) => String(s.id) === String(selectedStudent));

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <CameraCard onDescriptor={setDescriptor} />

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-white/50 bg-white/55 p-6 shadow-soft backdrop-blur-xl"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">Registrasi Wajah</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-800">Daftarkan wajah siswa</h2>
        <p className="mt-1 text-sm text-slate-500">Pilih kelas dan siswa, scan wajah, lalu simpan.</p>

        <div className="mt-6 grid gap-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 outline-none focus:border-emerald-300"
          >
            <option value="">-- Pilih Kelas --</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            disabled={!selectedClass}
            className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 outline-none focus:border-emerald-300 disabled:opacity-50"
          >
            <option value="">-- Pilih Siswa --</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name} {s.has_face ? '✓' : ''}
              </option>
            ))}
          </select>

          {selectedStudentData && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-slate-600">
              <p className="font-semibold text-emerald-700">{selectedStudentData.full_name}</p>
              <p>Kelas: {selectedStudentData.class_name}</p>
              <p>NIS: {selectedStudentData.username}</p>
              <p className={selectedStudentData.has_face ? 'text-emerald-600' : 'text-amber-600'}>
                {selectedStudentData.has_face ? '✓ Wajah sudah terdaftar' : '○ Belum ada data wajah'}
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !descriptor || !selectedStudent}
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 font-semibold text-white transition hover:scale-[1.01] disabled:opacity-60"
        >
          {submitting ? 'Menyimpan...' : 'Simpan Registrasi'}
        </button>

        {message && (
          <div className="mt-4 rounded-3xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-4 text-sm text-slate-600">
            {message}
          </div>
        )}
      </motion.section>
    </div>
  );
}
