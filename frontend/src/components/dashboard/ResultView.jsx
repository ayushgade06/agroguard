import RiskBadge from "./RiskBadge";
import Button from "./Button";
import { motion } from "framer-motion";

export default function ResultView({ result }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.12,
          },
        },
      }}
      className="grid grid-cols-2 gap-8"
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white border rounded-xl p-6"
      >
        <h2 className="text-2xl font-bold mb-4">
          Diagnosis Result
        </h2>

        <p className="text-lg font-semibold text-red-700">
          {result.disease}
        </p>
        <p className="text-slate-600 mt-2">
          {result.explanation}
        </p>
      </motion.div>

      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white border rounded-xl p-6"
      >
        <h3 className="font-bold mb-3">
          Immediate Actions
        </h3>

        <ul className="list-disc list-inside space-y-2">
          {result.immediateActions.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}
