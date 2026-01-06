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
      className="max-w-6xl mx-auto px-8 py-6 space-y-6"
      variants={shouldAnimate ? containerVariants : undefined}
      initial={shouldAnimate ? "hidden" : false}
      animate={shouldAnimate ? "visible" : false}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Detection History
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Review your previous crop analyses
          </p>
        </div>

        <p className="text-sm text-slate-500">
          {safeHistory.length} record{safeHistory.length !== 1 && "s"}
        </p>
      </div>

      {/* List */}
      <AnimatePresence>
        {safeHistory.map((item) => (
          <motion.div
            key={item.id}
            variants={shouldAnimate ? itemVariants : undefined}
            initial={shouldAnimate ? "hidden" : false}
            animate={shouldAnimate ? "visible" : false}
            exit="exit"
          >
            <div className="bg-white border border-slate-200 rounded-xl px-6 py-5 flex items-center justify-between transition hover:shadow-md hover:border-slate-300">
              {/* Left */}
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

              {/* Right */}
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Confidence
                  </p>
                  <p className="text-base font-semibold text-slate-700">
                    {Math.round(item.confidence * 100)}%
                  </p>
                </div>

                <button
                  onClick={() => onDelete?.(item.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 border border-red-200 rounded-lg transition hover:bg-red-50 hover:border-red-300"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Empty State */}
      {safeHistory.length === 0 && (
        <div className="text-center text-slate-500 text-sm py-20">
          No detection history yet.
          <p className="mt-1 text-xs text-slate-400">
            Your past crop scans will appear here.
          </p>
        </div>
      )}
    </motion.div>
  );
}
