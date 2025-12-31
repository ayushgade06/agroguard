import { motion } from "framer-motion";

export default function ScanView({ image, onAnalyze, isAnalyzing }) {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="bg-white border rounded-xl p-6">
        <motion.img
          src={image}
          alt="Preview"
          className="rounded-lg w-full h-[400px] object-contain"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      <div className="bg-white border rounded-xl p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold mb-2">Ready to Analyze</h3>
          <p className="text-slate-600 text-sm">
            We will inspect the image for visible pest or disease symptoms.
          </p>
        </div>

        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="mt-6 bg-green-600 text-white py-3 rounded-lg font-bold
                     hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <div className="flex items-center justify-center gap-3">
              <motion.div
                className="w-3 h-3 bg-white rounded-full"
                animate={{ scale: [1, 1.6, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              />
              <span>Analyzing…</span>
            </div>
          ) : (
            "Analyze Crop"
          )}
        </button>
      </div>
    </div>
  );
}
