import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = {
  ADMIN: 'Administrator',
  PRINCIPAL: 'Kepala Sekolah',
  STUDENT: 'Siswa',
  TEACHER: 'Guru',
};

const ROLE_COLORS = {
  ADMIN: 'from-emerald-500 to-teal-500',
  PRINCIPAL: 'from-blue-500 to-indigo-500',
  STUDENT: 'from-teal-400 to-cyan-500',
  TEACHER: 'from-green-500 to-emerald-500',
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.username, form.password);
      // Redirect berdasarkan role
      if (user.role === 'STUDENT') navigate('/attendance');
      else navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">SMKN 1 Kras</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-800">Sistem Presensi</h1>
          <p className="mt-1 text-sm text-slate-500">Masuk untuk mengakses sistem presensi wajah</p>
        </div>

        {/* Card */}
        <div className="rounded-[32px] border border-white/50 bg-white/60 p-8 shadow-soft backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username / NIS</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                placeholder="Masukkan username"
                required
                className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Masukkan password"
                required
                className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>

            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01] disabled:opacity-60 mt-2"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          {/* Role info */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center mb-3">Akses berdasarkan peran</p>
            <div className="grid grid-cols-3 gap-2">
              {[['ADMIN', 'Dashboard & Registrasi'], ['PRINCIPAL', 'Laporan & Statistik'], ['STUDENT', 'Presensi Wajah']].map(([role, desc]) => (
                <div key={role} className="rounded-2xl bg-white/70 p-3 text-center">
                  <div className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold text-white bg-gradient-to-r ${ROLE_COLORS[role]} mb-1`}>
                    {ROLE_LABELS[role]}
                  </div>
                  <p className="text-xs text-slate-400 leading-tight">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
