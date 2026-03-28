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
      if (user.role === 'STUDENT') navigate('/my');
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
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[20px] overflow-hidden shadow-lg mb-4 bg-white p-1">
            <img src="/logo-kras.jpg" alt="Logo SMKN 1 Kras" className="w-full h-full object-contain" />
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

        
        </div>
      </div>
    </div>
  );
}
