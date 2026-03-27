import React, { useEffect, useRef, useState } from "react";
import { Camera, X, AlertTriangle, CheckCircle, Info, Sparkles } from "lucide-react";
import { analyzeARImage } from "../../services/diagnosisService";

export default function ARView({ onStop }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    let active = true;

    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (active) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } else {
          mediaStream.getTracks().forEach((t) => t.stop());
        }
      } catch (err) {
        if (active) setError("Camera access denied or unavailable.");
      }
    }

    setupCamera();

    return () => {
      active = false;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Poll for frames
  useEffect(() => {
    if (!stream || isDetecting) return;

    let interval;
    const captureAndAnalyze = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        setIsDetecting(true);
        try {
          const res = await analyzeARImage(blob);
          setResult(res);
        } catch (err) {
          console.error(err);
        } finally {
          setIsDetecting(false);
        }
      }, "image/jpeg", 0.8);
    };

    interval = setInterval(captureAndAnalyze, 2500); // 2.5 seconds

    return () => clearInterval(interval);
  }, [stream, isDetecting]);

  useEffect(() => {
    // cleanup stream on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  const severityColor = {
    Low: "bg-emerald-500/90",
    Medium: "bg-amber-500/90",
    High: "bg-red-500/90",
  };

  return (
    <div className="relative w-full h-[70vh] bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center">
      {error ? (
        <div className="text-white text-center p-6 bg-black/50 rounded-xl backdrop-blur-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium">{error}</p>
          <button
            onClick={onStop}
            className="mt-6 px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Beta badge */}
          <div className="absolute top-4 left-4 z-50 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
            <Sparkles size={10} />
            BETA
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              if (stream) stream.getTracks().forEach((track) => track.stop());
              onStop();
            }}
            className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors z-50"
          >
            <X size={24} />
          </button>

          {/* Scanning Indicator (shown either when scanning, or always) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-20">
            <div className="w-64 h-64 border-2 border-emerald-400/50 rounded-2xl relative">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl -translate-x-1 -translate-y-1"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl translate-x-1 -translate-y-1"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl -translate-x-1 translate-y-1"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl translate-x-1 translate-y-1"></div>
              {/* Scanline animation */}
              <div className={`absolute bg-emerald-400/30 w-full h-1 ${isDetecting ? 'animate-pulse' : ''} top-1/2`}></div>
            </div>
            {!result && (
              <p className="text-white mt-8 font-medium tracking-wide bg-black/40 px-4 py-2 rounded-full text-sm backdrop-blur-sm shadow-md">
                Point camera at crop leaf...
              </p>
            )}
          </div>

          {/* Analysis overlay flag */}
          {isDetecting && !result && (
             <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-emerald-400 text-sm font-semibold shadow flex items-center gap-2 z-30">
               <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
               Analyzing frame...
             </div>
          )}

          {/* AR Overlay Result */}
          {result && (
            <div
              className={`absolute bottom-6 left-6 right-6 p-5 rounded-2xl shadow-2xl backdrop-blur-xl text-white ${
                severityColor[result.severity] || "bg-slate-800/90"
              } transition-all duration-300 transform translate-y-0 opacity-100 z-40 border border-white/20`}
            >
              <button
                onClick={() => setResult(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 hover:bg-black/40 transition-colors z-50 text-white"
                title="Dismiss result"
              >
                <X size={16} strokeWidth={3} />
              </button>
              <div className="flex justify-between items-start mb-3 mt-1">
                <div className="pr-6">
                  <h3 className="text-xl font-bold flex items-center gap-2 drop-shadow-md">
                    {result.severity === "High" ? (
                      <AlertTriangle size={22} className="text-white" />
                    ) : (
                      <CheckCircle size={22} className="text-white" />
                    )}
                    {result.disease}
                  </h3>
                  <p className="text-sm opacity-90 mt-1 font-medium drop-shadow-sm">
                    {result.explanation}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <div className="text-3xl font-black drop-shadow-md">
                    {(result.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs uppercase tracking-wider opacity-90 font-bold mt-1 drop-shadow-sm">
                    {result.severity || "Unknown"} Risk
                  </div>
                </div>
              </div>

              {result.immediateActions && result.immediateActions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/30">
                  <p className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2 drop-shadow-sm">
                    <Info size={16} /> Action Required
                  </p>
                  <ul className="text-sm space-y-2">
                    {result.immediateActions.slice(0, 3).map((action, i) => (
                      <li key={i} className="flex items-start gap-2 font-medium drop-shadow-sm">
                        <span className="mt-[2px] opacity-80 text-xs">▶</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
