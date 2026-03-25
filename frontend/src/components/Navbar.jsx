import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePushNotification } from '../hooks/usePushNotification';

const ROLE_LABELS = { ADMIN: 'Admin', PRINCIPAL: 'Kepala Sekolah', STUDENT: 'Siswa', TEACHER: 'Guru' };
const ROLE_COLORS = {
  ADMIN: 'bg-emerald-100 text-emerald-700',
  PRINCIPAL: 'bg-blue-100 text-blue-700',
  STUDENT: 'bg-teal-100 text-teal-700',
  TEACHER: 'bg-green-100 text-green-700',
};

// Nav items per role
const NAV_BY_ROLE = {
  ADMIN: [
    { to: '/', label: 'Dashboard' },
    { to: '/register', label: 'Registrasi' },
    { to: '/attendance', label: 'Presensi' },
    { to: '/broadcast', label: 'Broadcast' },
  ],
  PRINCIPAL: [
    { to: '/', label: 'Dashboard' },
  ],
  STUDENT: [
    { to: '/attendance', label: 'Presensi' },
  ],
  TEACHER: [
    { to: '/', label: 'Dashboard' },
    { to: '/attendance', label: 'Presensi' },
    { to: '/broadcast', label: 'Broadcast' },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { supported, subscribed, loading: pushLoading, subscribe, unsubscribe, testPush } = usePushNotification();
  const navItems = NAV_BY_ROLE[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-4 z-40 rounded-[28px] border border-white/50 bg-white/45 p-4 shadow-soft backdrop-blur-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">SMKN 1 Kras</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-800">Presensi Siswa</h1>
          <p className="text-sm text-slate-500">Sistem presensi wajah otomatis SMKN 1 Kras.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                      : 'bg-white/70 text-slate-700 hover:bg-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User info + logout */}
          <div className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-700 leading-tight">{user?.full_name}</p>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${ROLE_COLORS[user?.role]}`}>
                {ROLE_LABELS[user?.role]}
              </span>
            </div>

            {/* Tombol notifikasi */}
            {supported && (
              <div className="flex gap-1">
                <button
                  onClick={subscribed ? unsubscribe : subscribe}
                  disabled={pushLoading}
                  title={subscribed ? 'Matikan notifikasi' : 'Aktifkan notifikasi'}
                  className={`rounded-full p-1.5 transition ${subscribed ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                >
                  <svg className="w-4 h-4" fill={subscribed ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                {subscribed && (
                  <button
                    onClick={testPush}
                    title="Test kirim notifikasi"
                    className="rounded-full p-1.5 bg-blue-50 text-blue-500 hover:bg-blue-100 transition text-xs font-bold"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            <button
              onClick={handleLogout}
              title="Keluar"
              className="rounded-full bg-red-50 hover:bg-red-100 text-red-500 p-1.5 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
