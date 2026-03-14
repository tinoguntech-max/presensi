import { motion } from 'framer-motion';

export default function StatCard({ title, value, note }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[28px] border border-white/50 bg-white/55 p-5 shadow-soft backdrop-blur-xl"
    >
      <p className="text-sm text-slate-500">{title}</p>
      <h3 className="mt-3 text-3xl font-bold text-slate-800">{value}</h3>
      <p className="mt-2 text-sm text-slate-400">{note}</p>
    </motion.div>
  );
}
