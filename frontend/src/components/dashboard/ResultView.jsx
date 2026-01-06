import { motion } from "framer-motion";

export default function ResultView({ result, onDone }) {
  if (!result) return null;

  const {
    disease = "Unknown",
    confidence = 0,
    explanation = "",
    immediateActions = [],
  } = result;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto"
    >
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Diagnosis Result
        </h2>

        <p className="text-red-600 font-semibold text-lg mb-4">
          {disease}
        </p>

        <div className="mb-6">
          <p className="text-sm text-slate-500">Confidence</p>
          <p className="font-semibold">
            {(confidence * 100).toFixed(1)}%
          </p>
        </div>

        {explanation && (
          <p className="text-slate-600 mb-6 leading-relaxed">
            {explanation}
          </p>
        )}

        {immediateActions.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">
              Recommended Actions
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              {immediateActions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onDone}
            className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
          >
            Done
          </button>
        </div>
      </div>
    </motion.div>
  );
}
