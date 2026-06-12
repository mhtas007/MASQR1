import { useState, useRef } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useAppStore } from "../hooks/useAppStore";
import { store } from "../store";
import toast from "react-hot-toast";
import { playBeep } from "../utils/audio";
import { CheckCircle2, XCircle, QrCode, Maximize } from "lucide-react";
import { Link } from "react-router-dom";

interface ScannerPageProps {
  isKiosk?: boolean;
}

export function ScannerPage({ isKiosk = false }: ScannerPageProps) {
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    name?: string;
  } | null>(null);
  const cooldownRef = useRef(false);

  const handleDecode = async (text: string) => {
    // Prevent duplicate scans within short duration
    if (cooldownRef.current) return;

    // Attempt parse
    try {
      const data = JSON.parse(text);
      if (data && data.masqr === true && data.userId) {
        // Time validation for dynamic QR (prevent screenshots)
        // Ensure QR was generated within the last 15 seconds
        const qrTime = parseInt(data.timestamp, 10);
        const now = Date.now();
        if (now - qrTime > 15000) {
          playBeep(); // Still beep, but error
          toast.error("کۆدی QR بەسەرچووە! تکایە نوێی بکەرەوە.");
          cooldownRef.current = true;
          setTimeout(() => {
            cooldownRef.current = false;
          }, 3000);
          return;
        }

        playBeep();

        const result = await store.handleScan(data.userId);

        setScanResult({
          success: result.success,
          message: result.message,
          name: result.user?.name,
        });

        if (result.success) {
          toast.success(result.message, { duration: 4000 });
        } else {
          toast.error(result.message, { duration: 4000 });
        }
      } else {
        toast.error("کۆدی QR نەناسراوە!");
      }
    } catch (e) {
      toast.error("کۆدی QR نەناسراوە!");
    }

    const state = store.getState();
    const timeoutSeconds = state.settings?.kioskTimeout || 4;

    cooldownRef.current = true;
    setTimeout(() => {
      cooldownRef.current = false;
      setScanResult(null);
    }, timeoutSeconds * 1000);
  };

  return (
    <div
      className={`mx-auto animate-in fade-in zoom-in-95 duration-500 w-full ${isKiosk ? "max-w-xl" : "max-w-2xl"}`}
    >
      {!isKiosk && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 relative">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-3 border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
              <QrCode className="w-4 h-4" />
              سیستەمی سکانەر
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
              سکانەری باج
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-semibold">
              دیاریکردنی ئامادەبوون لە ڕێگەی سکانکردنی QR Code
            </p>
          </div>
          <button
            onClick={() =>
              window.open(
                "/kiosk",
                "_blank",
                "width=1024,height=768,fullscreen=yes",
              )
            }
            className="flex items-center gap-3 bg-gray-900 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-gray-900/20 dark:shadow-indigo-900/40 hover:shadow-2xl hover:-translate-y-1 relative z-10 w-full md:w-auto justify-center"
          >
            <Maximize className="w-6 h-6" />
            <span>شاشەی گەورە (Kiosk)</span>
          </button>
        </div>
      )}

      <div
        className={`${isKiosk ? "bg-white p-8 sm:p-10 shadow-2xl" : "bg-white dark:bg-gray-900 p-4 sm:p-8 shadow-xl dark:border-gray-800"} rounded-[3rem] border border-gray-100 relative overflow-hidden backdrop-blur-2xl transition-all duration-300`}
      >
        {scanResult && (
          <div
            className={`absolute inset-0 z-30 flex flex-col items-center justify-center backdrop-blur-xl animate-in fade-in duration-200 rounded-[3rem] ${isKiosk ? "bg-white/95" : "bg-white/95 dark:bg-gray-900/95"}`}
          >
            {scanResult.success ? (
              <CheckCircle2
                className={`text-emerald-500 mb-6 animate-in zoom-in-50 duration-300 ${isKiosk ? "w-32 h-32" : "w-24 h-24"}`}
              />
            ) : (
              <XCircle
                className={`text-rose-500 mb-6 animate-in zoom-in-50 duration-300 ${isKiosk ? "w-32 h-32" : "w-24 h-24"}`}
              />
            )}
            <h3
              className={`${isKiosk ? "text-4xl" : "text-3xl"} font-bold mb-4 ${scanResult.success ? "text-emerald-600" : "text-rose-600"} text-center px-4`}
            >
              {scanResult.name || "کۆدە نەناسراوە!"}
            </h3>
            <p
              className={`${isKiosk ? "text-xl text-gray-700" : "text-lg text-gray-600 dark:text-gray-300"} font-bold text-center px-4`}
            >
              {scanResult.message}
            </p>
          </div>
        )}

        <div
          className={`aspect-square w-full mx-auto overflow-hidden rounded-[2.5rem] border-[6px] border-dashed relative z-10 transition-all duration-300
          ${isKiosk ? "border-indigo-200 bg-gray-50 shadow-[0_0_50px_rgba(99,102,241,0.1)]" : "max-w-sm border-gray-200 dark:border-gray-700"}`}
        >
          <Scanner
            onScan={(result) => result && handleDecode(result[0].rawValue)}
            onError={(e) => console.log(e)}
            formats={["qr_code"]}
            styles={{
              container: {
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
              },
              video: { objectFit: "cover", width: "100%", height: "100%" },
            }}
          />
          <div className="absolute inset-0 pointer-events-none rounded-[2.5rem] z-20 border-[2px] border-white/5 box-border"></div>

          {/* Animated Scanning Line */}
          <div className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_20px_rgba(99,102,241,1)] animate-[scan_2s_ease-in-out_infinite] z-20 mix-blend-screen"></div>

          {/* Corner brackets for kiosk mode to make it look highly professional */}
          {isKiosk && (
            <>
              <div className="absolute top-6 left-6 w-12 h-12 border-t-[8px] border-l-[8px] border-indigo-500 pointer-events-none rounded-tl-xl z-30 opacity-90"></div>
              <div className="absolute top-6 right-6 w-12 h-12 border-t-[8px] border-r-[8px] border-indigo-500 pointer-events-none rounded-tr-xl z-30 opacity-90"></div>
              <div className="absolute bottom-6 left-6 w-12 h-12 border-b-[8px] border-l-[8px] border-indigo-500 pointer-events-none rounded-bl-xl z-30 opacity-90"></div>
              <div className="absolute bottom-6 right-6 w-12 h-12 border-b-[8px] border-r-[8px] border-indigo-500 pointer-events-none rounded-br-xl z-30 opacity-90"></div>
            </>
          )}
        </div>

        {!isKiosk && (
          <p className="text-center font-bold text-gray-500 dark:text-gray-400 mt-8 bg-gray-50 dark:bg-gray-800/50 py-3 px-6 rounded-full w-max mx-auto border border-gray-100 dark:border-gray-800/50">
            کامێراکەت ئامادەیە. تکایە باجەکەت یان شاشەی مۆبایلەکەت نزیک بکەرەوە.
          </p>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 5%; opacity: 0; }
          10%, 90% { opacity: 1; }
          50% { top: 95%; }
        }
      `}</style>
    </div>
  );
}
