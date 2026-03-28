import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

function StatusBadge({ done, label, time }) {
  return (
    <div className={`flex-1 rounded-[24px] p-5 border ${done ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${done ? 'bg-emerald-100' : 'bg-slate-100'}`}>
          {done ? '✓' : '○'}
        </div>
        <div>
          <p className={`font-semibold text-sm ${done ? 'text-emerald-700' : 'text-slate-400'}`}>{label}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {done ? new Date(time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Belum presensi'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attendance/my')
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="rounded-[32px] border border-white/50 bg-white/55 p-6 shadow-soft backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">Selamat datang</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-800">{user?.full_name}</h2>
        <p className="text-sm text-slate-500 mt-1">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Status hari ini */}
      <div className="rounded-[32px] border border-white/50 bg-white/55 p-6 shadow-soft backdrop-blur-xl">
        <p className="text-sm font-semibold text-slate-700 mb-4">Status Presensi Hari Ini</p>
        {loading ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            Memuat...
          </div>
        ) : (
          <div className="flex gap-3">
            <StatusBadge done={!!data?.today?.checkin} label="Masuk" time={data?.today?.checkin?.created_at} />
            <StatusBadge done={!!data?.today?.checkout} label="Pulang" time={data?.today?.checkout?.created_at} />
          </div>
        )}
      </div>

      {/* Riwayat */}
      <div className="rounded-[32px] border border-white/50 bg-white/55 p-6 shadow-soft backdrop-blur-xl">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Riwayat Presensi</h3>
        {loading ? (
          <p className="text-sm text-slate-400">Memuat...</p>
        ) : data?.history?.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">Belum ada riwayat presensi.</p>
        ) : (
          <div className="overflow-x-auto rounded-3xl bg-white/70">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Waktu</th>
                  <th className="px-4 py-3">Tipe</th>
                  <th className="px-4 py-3">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {data.history.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.attendance_type === 'checkin' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                        {item.attendance_type === 'checkin' ? 'Masuk' : 'Pulang'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{Number(item.confidence_score ?? 0).toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
