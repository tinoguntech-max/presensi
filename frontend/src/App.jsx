import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import RegisterFace from './pages/RegisterFace';
import Attendance from './pages/Attendance';

export default function App() {
  return (
    <div className="min-h-screen bg-hero p-4 md:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/register" element={<RegisterFace />} />
          <Route path="/attendance" element={<Attendance />} />
        </Routes>
      </div>
    </div>
  );
}
