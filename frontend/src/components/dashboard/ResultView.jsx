import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const LANG_MAP = {
  "en-IN": "en",
  "hi-IN": "hi",
  "mr-IN": "mr",
};

export default function ResultView({ result, onDone }) {
  if (!result) return null;

  const {
    disease = "Unknown",
    confidence = 0,
    explanation = "",
    immediateActions = [],
  } = result;
  const displayConfidence = Math.min(Math.max(confidence, 0), 1);

  const [selectedLanguage, setSelectedLanguage] = useState("en-IN");

  const [translatedDisease, setTranslatedDisease] = useState(disease);
  const [translatedActions, setTranslatedActions] = useState(immediateActions);

  const [translating, setTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Cache
  const translationCache = useRef({
    disease: {},
    actions: {},
  });

  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

  async function translateText(text, targetLang) {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(
        text
      )}`
    );
    const data = await res.json();
    return data[0].map(item => item[0]).join("");
  }

  useEffect(() => {
    const targetLang = LANG_MAP[selectedLanguage];

    // English → no translation
    if (targetLang === "en") {
      setTranslatedDisease(disease);
      setTranslatedActions(immediateActions);
      return;
    }

    async function runTranslation() {
      setTranslating(true);

      try {
        // ---- Disease ----
        if (translationCache.current.disease[targetLang]) {
          setTranslatedDisease(
            translationCache.current.disease[targetLang]
          );
        } else {
          const translated = await translateText(disease, targetLang);
          translationCache.current.disease[targetLang] = translated;
          setTranslatedDisease(translated);
        }

        // ---- Actions ----
        if (translationCache.current.actions[targetLang]) {
          setTranslatedActions(
            translationCache.current.actions[targetLang]
          );
        } else {
          const translated = await Promise.all(
            immediateActions.map(a => translateText(a, targetLang))
          );
          translationCache.current.actions[targetLang] = translated;
          setTranslatedActions(translated);
        }
      } catch (err) {
        console.error("Translation failed", err);
        setTranslatedDisease(disease);
        setTranslatedActions(immediateActions);
      } finally {
        setTranslating(false);
      }
    }

    runTranslation();
  }, [selectedLanguage, disease, immediateActions]);

  function speakActions() {
    if (!window.speechSynthesis || translating) return;

    window.speechSynthesis.cancel();

    const text = translatedActions.join(". ");
    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage;
    utterance.rate = 0.9;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto px-4 md:px-6"
    >
      <div className="glass-panel rounded-3xl p-8 md:p-10 space-y-7">

        {/* Header */}
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-semibold">
            AI diagnosis
          </p>
          <h2 className="text-3xl font-black text-slate-900 mt-1">
            Diagnosis Result
          </h2>

          <p className="mt-3 text-2xl font-bold text-red-600">
            {translatedDisease}
          </p>

          {selectedLanguage !== "en-IN" && (
            <p className="text-xs text-slate-400 mt-1">
              Original: {disease}
            </p>
          )}
        </div>

        {/* Confidence */}
        <div>
          <p className="text-sm text-slate-500 uppercase tracking-wide">
            Confidence
          </p>
          <div className="h-3 rounded-full bg-slate-200 overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-green-400"
              style={{ width: `${(displayConfidence * 100).toFixed(1)}%` }}
            />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {(displayConfidence * 100).toFixed(1)}%
          </p>
        </div>

        {/* Explanation */}
        {explanation && (
          <div className="rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 p-6 shadow-inner">
            <p className="text-slate-700 leading-relaxed">
              {explanation}
            </p>
          </div>
        )}

        {/* Actions */}
        {translatedActions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">
                Recommended Actions
              </h3>

              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="border border-slate-200 rounded-md px-3 py-2 text-sm bg-white shadow-sm"
              >
                <option value="en-IN">English</option>
                <option value="hi-IN">हिंदी</option>
                <option value="mr-IN">मराठी</option>
              </select>
            </div>

            {translating ? (
              <p className="text-sm text-slate-500">
                Translating…
              </p>
            ) : (
              <ul className="space-y-2">
                {translatedActions.map((a, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-slate-800 bg-white/60 border border-slate-100 rounded-2xl px-4 py-3 shadow-sm"
                  >
                    <span className="mt-1 w-2 h-2 rounded-full bg-emerald-600" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            )}

            <button
              onClick={speakActions}
              disabled={translating}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 disabled:opacity-50"
            >
              🔊 {isSpeaking ? "Stop Reading" : "Read Aloud"}
            </button>

            <p className="mt-2 text-[11px] text-slate-400">
              Translated automatically
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-slate-200/70">
          <button
            onClick={() => {
              window.speechSynthesis.cancel();
              onDone();
            }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-white font-semibold transition hover:shadow-lg shadow-emerald-400/30"
          >
            Done
          </button>
        </div>
      </div>
    </motion.div>
  );
}
