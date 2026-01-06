import { Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function HistoryView({
  history = [],
  onSelect,
  onDelete,
}) {
  const safeHistory = Array.isArray(history) ? history : [];
  const shouldAnimate = safeHistory.length > 0;

  return (
    <motion.div
      className="max-w-5xl mx-auto px-6 py-6 space-y-5"
      variants={shouldAnimate ? containerVariants : undefined}
      initial={shouldAnimate ? "hidden" : false}
      animate={shouldAnimate ? "visible" : false}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">
          Detection History
        </h2>
        <p className="text-sm text-slate-500">
          {safeHistory.length} record{safeHistory.length !== 1 && "s"}
        </p>
      </div>

      <AnimatePresence>
        {safeHistory.map((item) => (
          <motion.div
            key={item.id}
            variants={shouldAnimate ? itemVariants : undefined}
            initial={shouldAnimate ? "hidden" : false}
            animate={shouldAnimate ? "visible" : false}
            exit="exit"
          >
            <div className="bg-white border border-slate-200 rounded-xl px-6 py-5 flex items-center justify-between hover:shadow-md transition">
              <div
                className="space-y-1 cursor-pointer"
                onClick={() => onSelect?.(item)}
              >
                <p className="font-semibold text-slate-800 text-lg">
                  {item.disease}
                </p>

                <p className="text-sm text-slate-500">
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        dateStyle: "medium",
                      })
                    : "—"}
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-slate-500">Confidence</p>
                  <p className="font-semibold text-slate-700">
                    {Math.round(item.confidence * 100)}%
                  </p>
                </div>

                <button
                  onClick={() => onDelete?.(item.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {safeHistory.length === 0 && (
        <div className="text-center text-slate-500 text-sm py-16">
          No detection history yet.
        </div>
      )}
    </motion.div>
  );
}
