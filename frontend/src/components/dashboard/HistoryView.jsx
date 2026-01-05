import { Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* Animations */
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
      className="max-w-4xl mx-auto space-y-4"
      variants={shouldAnimate ? containerVariants : undefined}
      initial={shouldAnimate ? "hidden" : false}
      animate={shouldAnimate ? "visible" : false}
    >
      <AnimatePresence>
        {safeHistory.map((item) => (
          <motion.div
            key={item.id}
            variants={shouldAnimate ? itemVariants : undefined}
            initial={shouldAnimate ? "hidden" : false}
            animate={shouldAnimate ? "visible" : false}
            exit="exit"
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start gap-4">
                {/* LEFT: MAIN CONTENT */}
                <div
                  className="cursor-pointer"
                  onClick={() => onSelect?.(item)}
                >
                  <h4 className="font-bold text-lg text-slate-800">
                    {item.disease}
                  </h4>

                  <p className="text-sm text-slate-500 mt-1">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : "—"}
                  </p>
                </div>

                {/* RIGHT: DELETE BUTTON (ALWAYS VISIBLE) */}
                <button
                  onClick={() => {
                    if (onDelete) {
                      onDelete(item.id);
                    } else {
                      console.warn(
                        "Delete clicked but onDelete handler not provided"
                      );
                    }
                  }}
                  className="
                    inline-flex items-center gap-1.5
                    px-2.5 py-1.5
                    text-xs font-medium
                    text-red-600
                    border border-red-200
                    rounded-lg
                    hover:bg-red-50 hover:border-red-300
                    focus:outline-none focus:ring-2 focus:ring-red-200
                    transition
                  "
                  title="Delete record"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* EMPTY STATE */}
      {safeHistory.length === 0 && (
        <div className="text-center text-slate-500 text-sm py-10">
          No detection history yet.
        </div>
      )}
    </motion.div>
  );
}
