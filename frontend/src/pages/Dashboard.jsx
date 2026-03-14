import { useEffect, useState } from 'react';
import { api } from '../services/api';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const [stats, setStats] = useState({ total_students: 0, total_attendances: 0, total_today: 0, total_registered: 0 });
  const [history, setHistory] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filterClass, setFilterClass] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, classesRes] = await Promise.all([
          api.get('/attendance/stats'),
          api.get('/students/classes'),
        ]);
        setStats(statsRes.data);
        setClasses(classesRes.data);
      } catch (error) {
        console.error(error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const params = filterClass ? { class_id: filterClass } : {};
        const res = await api.get('/attendance/history', { params });
        setHistory(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    loadHistory();
  }, [filterClass]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Siswa" value={stats.total_students} note="Siswa aktif terdaftar" />
        <StatCard title="Wajah Terdaftar" value={stats.total_registered} note="Siswa yang sudah scan wajah" />
        <StatCard title="Total Presensi" value={stats.total_attendances} note="Akumulasi seluruh riwayat" />
        <StatCard title="Presensi Hari Ini" value={stats.total_today} note="Jumlah scan wajah hari ini" />
      </section>

      <section className="rounded-[32px] border border-white/50 bg-white/55 p-6 shadow-soft backdrop-blur-xl">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Riwayat Presensi</h2>
            <p className="text-sm text-slate-500">100 data terbaru presensi siswa.</p>
          </div>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-2 text-sm outline-none focus:border-emerald-300"
          >
            <option value="">Semua Kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto rounded-3xl bg-white/70">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-4 py-4">Nama Siswa</th>
                <th className="px-4 py-4">Kelas</th>
                <th className="px-4 py-4">Tipe</th>
                <th className="px-4 py-4">Confidence</th>
                <th className="px-4 py-4">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                    Belum ada data presensi.
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-4 font-medium text-slate-700">{item.full_name}</td>
                    <td className="px-4 py-4 text-slate-500">{item.class_name || '-'}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        item.attendance_type === 'checkin'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.attendance_type === 'checkin' ? 'Masuk' : 'Pulang'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-500">{Number(item.confidence_score ?? 0).toFixed(4)}</td>
                    <td className="px-4 py-4 text-slate-500">{new Date(item.created_at).toLocaleString('id-ID')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
