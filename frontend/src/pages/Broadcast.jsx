import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';

export default function Broadcast() {
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ title: '', body: '', class_id: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get('/students/classes').then((r) => setClasses(r.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/push/broadcast', {
        title: form.title,
        body: form.body,
        class_id: form.class_id || undefined,
      });
      setResult({ ok: true, message: res.data.message });
      setForm((p) => ({ ...p, title: '', body: '' }));
    } catch (err) {
      setResult({ ok: false, message: err?.response?.data?.message || 'Gagal mengirim.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto"
    >
      <div className="rounded-[32px] border border-white/50 bg-white/55 p-6 shadow-soft backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">Push Notification</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-800">Broadcast ke Siswa</h2>
        <p className="mt-1 text-sm text-slate-500">Kirim notifikasi langsung ke perangkat siswa.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tujuan</label>
            <select
              value={form.class_id}
              onChange={(e) => setForm((p) => ({ ...p, class_id: e.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 outline-none focus:border-emerald-400"
            >
              <option value="">Semua Siswa</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Judul</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Contoh: Pengumuman Penting"
              required
              className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pesan</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
              placeholder="Isi pesan notifikasi..."
              required
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 outline-none focus:border-emerald-400 resize-none"
            />
          </div>

          {result && (
            <div className={`rounded-2xl px-4 py-3 text-sm ${result.ok ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
              {result.ok ? '✓ ' : '✗ '}{result.message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01] disabled:opacity-60"
          >
            {loading ? 'Mengirim...' : '📢 Kirim Notifikasi'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
