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
      className="max-w-4xl mx-auto px-6"
    >
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Diagnosis Result
          </h2>
          <p className="mt-2 text-xl font-semibold text-red-600">
            {disease}
          </p>
        </div>

        {/* Confidence */}
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm text-slate-500 uppercase tracking-wide">
              Confidence
            </p>
            <p className="text-2xl font-bold text-slate-800">
              {(confidence * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Explanation */}
        {explanation && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <p className="text-slate-700 leading-relaxed">
              {explanation}
            </p>
          </div>
        )}

        {/* Actions */}
        {immediateActions.length > 0 && (
          <div>
            <h3 className="font-semibold text-slate-800 mb-3">
              Recommended Actions
            </h3>
            <ul className="space-y-2">
              {immediateActions.map((a, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-slate-700"
                >
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={onDone}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold transition hover:bg-emerald-700"
          >
            Done
          </button>
        </div>
      </div>
    </motion.div>
  );
}
