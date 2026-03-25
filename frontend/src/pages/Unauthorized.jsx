import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-hero flex items-center justify-center p-4">
      <div className="text-center rounded-[32px] border border-white/50 bg-white/60 p-10 shadow-soft backdrop-blur-xl max-w-sm w-full">
        <p className="text-5xl mb-4">🚫</p>
        <h2 className="text-2xl font-bold text-slate-800">Akses Ditolak</h2>
        <p className="mt-2 text-sm text-slate-500">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        <button
          onClick={() => navigate(user?.role === 'STUDENT' ? '/attendance' : '/')}
          className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.01]"
        >
          Kembali
        </button>
      </div>
    </div>
  );
}
