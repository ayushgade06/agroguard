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
  severityFilter = "All",
  setSeverityFilter,
}) {
  const safeHistory = Array.isArray(history) ? history : [];
  const computeSeverity = (confidence) => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.5) return "Medium";
    return "Low";
  };

  const filtered = safeHistory.filter((item) => {
    const sev = item.severity || computeSeverity(item.confidence || 0);
    if (severityFilter === "All") return true;
    return sev === severityFilter;
  });

  const displayHistory = filtered;
  const shouldAnimate = safeHistory.length > 0;

  return (
    <motion.div
      className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-6"
      variants={shouldAnimate ? containerVariants : undefined}
      initial={shouldAnimate ? "hidden" : false}
      animate={shouldAnimate ? "visible" : false}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Detection History
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Review your previous crop analyses
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["All", "High", "Medium", "Low"].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter?.(sev)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition ${
                severityFilter === sev
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <p className="text-sm text-slate-500">
          {displayHistory.length} record{displayHistory.length !== 1 && "s"}
        </p>
      </div>

      {/* List */}
      <AnimatePresence>
        {displayHistory.map((item) => {
          const severity = item.severity || computeSeverity(item.confidence || 0);
          return (
          <motion.div
            key={item.id}
            variants={shouldAnimate ? itemVariants : undefined}
            initial={shouldAnimate ? "hidden" : false}
            animate={shouldAnimate ? "visible" : false}
            exit="exit"
          >
            <div className="glass-panel rounded-2xl px-6 py-5 flex items-center justify-between transition hover:-translate-y-0.5 hover:shadow-xl">
              {/* Left */}
              <div
                className="space-y-1 cursor-pointer"
                onClick={() => onSelect?.(item)}
              >
                <p className="font-semibold text-slate-900 text-lg">
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
                    Severity
                  </p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      severity === "High"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : severity === "Medium"
                        ? "bg-orange-50 text-orange-700 border-orange-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {severity}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Confidence
                  </p>
                  <p className="text-base font-semibold text-emerald-700">
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
          );
        })}
      </AnimatePresence>

      {/* Empty State */}
      {displayHistory.length === 0 && (
        <div className="glass-panel rounded-2xl text-center text-slate-500 text-sm py-16">
          No detection history yet.
          <p className="mt-1 text-xs text-slate-400">
            Your past crop scans will appear here.
          </p>
        </div>
      )}
    </motion.div>
  );
}
