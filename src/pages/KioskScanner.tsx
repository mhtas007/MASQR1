import { Lock, Hexagon } from "lucide-react";
import { ScannerPage } from "./ScannerPage";
import toast from "react-hot-toast";
import { store } from "../store";

export function KioskScanner() {
  const handleExit = () => {
    const pin = window.prompt(
      "تکایە وشەی نهێنی بنووسە بۆ چوونەدەرەوە لە دۆخی ئامێر (نهێنی: 0000)",
    );
    if (pin === "0000") {
      import("firebase/auth").then(({ signOut }) => {
        import("../lib/firebase").then(({ auth }) => {
          signOut(auth);
        });
      });
      toast.success("لە دۆخی ئامێر دەرچوویت");
    } else if (pin !== null && pin !== "") {
      toast.error("وشەی نهێنی هەڵەیە!");
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden font-sans"
      dir="rtl"
    >
      {/* Subtle modern blur background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-200/40 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-200/20 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Hidden Exit Button for Kiosk */}
      <button
        onClick={handleExit}
        className="absolute top-8 left-8 w-16 h-16 opacity-0 hover:opacity-10 transition-opacity z-[100] flex items-center justify-center cursor-default hover:cursor-pointer"
        title="چوونەدەرەوە (Exit Kiosk)"
      >
        <Lock className="w-8 h-8 text-gray-900" />
      </button>

      <div className="absolute top-8 right-8 flex items-center gap-3 z-50 bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-gray-200 shadow-sm">
        <Hexagon className="w-10 h-10 text-indigo-600 fill-indigo-50" />
        <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
          MASQR
        </span>
      </div>

      <div className="w-full max-w-5xl z-10 flex flex-col items-center">
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight drop-shadow-sm">
            سیستەمی سکانەری باج
          </h1>
          <p className="text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-bold">
            تکایە باجەکەت یان شاشەی مۆبایلەکەت بخەرە پێش کامێراکە بۆ تۆمارکردنی
            ئامادەبوون.
          </p>
        </div>

        <ScannerPage isKiosk={true} />
      </div>
    </div>
  );
}
