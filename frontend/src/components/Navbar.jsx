import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/register', label: 'Registrasi' },
  { to: '/attendance', label: 'Presensi' },
];

export default function Navbar() {
  return (
    <header className="sticky top-4 z-40 rounded-[28px] border border-white/50 bg-white/45 p-4 shadow-soft backdrop-blur-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">SMKN 1 Kras</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-800">Presensi Siswa</h1>
          <p className="text-sm text-slate-500">Sistem presensi wajah otomatis SMKN 1 Kras.</p>
        </div>

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
      </div>
    </header>
  );
}
