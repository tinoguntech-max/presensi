import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import RegisterFace from './pages/RegisterFace';
import Attendance from './pages/Attendance';
import Unauthorized from './pages/Unauthorized';
import Broadcast from './pages/Broadcast';

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-hero p-4 md:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Navbar />
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={user ? <Navigate to={user.role === 'STUDENT' ? '/attendance' : '/'} replace /> : <Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Admin & Teacher */}
      <Route path="/" element={
        <ProtectedRoute roles={['ADMIN', 'PRINCIPAL', 'TEACHER']}>
          <AppLayout><Dashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/register" element={
        <ProtectedRoute roles={['ADMIN', 'TEACHER']}>
          <AppLayout><RegisterFace /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Semua role yang login */}
      <Route path="/attendance" element={
        <ProtectedRoute>
          <AppLayout><Attendance /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Dashboard siswa */}
      <Route path="/my" element={
        <ProtectedRoute roles={['STUDENT']}>
          <AppLayout><StudentDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/broadcast" element={
        <ProtectedRoute roles={['ADMIN', 'TEACHER']}>
          <AppLayout><Broadcast /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={user ? (user.role === 'STUDENT' ? '/my' : '/') : '/login'} replace />} />
    </Routes>
  );
}
