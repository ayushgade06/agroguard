import Card from "./Card";
import RiskBadge from "./RiskBadge";
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
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

export default function HistoryView({ history, onSelect, onDelete }) {
  const shouldAnimate = history.length >= 1;

  return (
    <motion.div
      className="space-y-4"
      variants={shouldAnimate ? containerVariants : undefined}
      initial={shouldAnimate ? "hidden" : false}
      animate={shouldAnimate ? "visible" : false}
    >
      <AnimatePresence>
        {history.map((item) => (
          <motion.div
            key={item.id}
            variants={shouldAnimate ? itemVariants : undefined}
            initial={shouldAnimate ? "hidden" : false}
            animate={shouldAnimate ? "visible" : false}
            exit="exit"
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <Card>
              <div className="flex justify-between items-start">
                <div
                  className="cursor-pointer"
                  onClick={() => onSelect(item)}
                >
                  <h4 className="font-bold text-lg">
                    {item.diagnosis.disease}
                  </h4>

                  <RiskBadge severity={item.diagnosis.severity} />

                  <p className="text-sm text-slate-500 mt-1">
                    {item.date}
                  </p>
                </div>

                <button
                  onClick={() => onDelete(item.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete record"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
