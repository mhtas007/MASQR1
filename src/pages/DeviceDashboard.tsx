import { MonitorSmartphone, ExternalLink, QrCode } from "lucide-react";
import { useAppStore } from "../hooks/useAppStore";

export function DeviceDashboard() {
  const { records } = useAppStore();
  const today = new Date().toISOString().split("T")[0];
  const todayRecords = records.filter((r) => r.date === today);

  return (
    <div className="animate-in fade-in duration-700 max-w-6xl mx-auto mt-6 px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-full font-bold text-sm mb-6 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-ping"></span>
          MODEY KIOSK
        </div>
        <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
          سیستەمی سکانەری ئامێر
        </h2>
        <p className="text-xl text-gray-500 dark:text-gray-400 font-bold max-w-2xl mx-auto">
          بەخێربێیت بۆ ڕووکاری تایبەت بە ئامێری سکانەر. لێرەوە دەتوانیت کۆنترۆڵی
          شاشەکە بکەیت.
        </p>
      </div>

      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-10 md:p-12 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-white dark:border-gray-800 flex flex-col md:flex-row gap-12 items-center text-center md:text-right relative overflow-hidden">
        {/* Background glow for professional look */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="flex-1 flex flex-col items-center md:items-start relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/40 dark:to-gray-900 text-indigo-600 dark:text-indigo-400 rounded-[2rem] flex items-center justify-center mb-8 shadow-md border border-indigo-100/50 dark:border-indigo-800/50">
            <MonitorSmartphone className="w-12 h-12" />
          </div>

          <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
            شاشەی سکانەری باج
          </h3>
          <p className="text-gray-500 dark:text-gray-400 font-semibold mb-10 max-w-md text-center md:text-right text-lg leading-relaxed">
            بۆ دەستپێکردنی پرۆسەی سکانکردن و وەرگرتنی ئامادەبووان، تکایە
            کورتکراوەی شاشەی سکانەر بکەرەوە لە پەنجەرەیەکی گەورەدا بۆ دەرکەوتنی
            تەواو.
          </p>

          <button
            onClick={() =>
              window.open(
                "/kiosk",
                "_blank",
                "width=1024,height=768,fullscreen=yes",
              )
            }
            className="flex items-center gap-4 bg-gray-900 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-gray-900/20 dark:shadow-indigo-900/40 hover:shadow-2xl hover:-translate-y-1 w-full md:w-auto justify-center"
          >
            <ExternalLink className="w-6 h-6" />
            <span>کردنەوەی شاشەی پڕ (Fullscreen)</span>
          </button>
        </div>

        {/* Live Preview Iframe */}
        <div className="w-full md:w-1/2 flex flex-col items-center relative z-10">
          <div className="flex items-center justify-between w-full mb-4 px-2">
            <span className="text-sm font-bold text-gray-500 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse hidden md:block"></span>
              پێشبینینی ڕاستەوخۆ (Live Preview)
            </span>
            <QrCode className="w-5 h-5 text-gray-400" />
          </div>
          <div className="w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden border-8 border-gray-100 dark:border-gray-800 shadow-2xl bg-gray-50 dark:bg-gray-950 relative group">
            <iframe
              src="/kiosk"
              title="Kiosk Preview"
              className="w-[1280px] h-[960px] origin-top-left scale-[.35] lg:scale-[.30] xl:scale-[.38] border-none pointer-events-none"
              style={{
                transformOrigin: "top left",
                width: "300%",
                height: "300%",
              }}
            />
            <div className="absolute inset-0 bg-transparent group-hover:bg-gray-900/5 cursor-not-allowed transition-colors rounded-[2rem]"></div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white dark:bg-gray-900 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center gap-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50/50 dark:via-gray-800/30 to-transparent"></div>
        <div className="text-center relative z-10">
          <p className="text-sm font-extrabold text-gray-400 uppercase tracking-wider mb-2">
            ئامادەبووانی ئەمڕۆ
          </p>
          <p className="text-5xl font-black text-indigo-600 dark:text-indigo-400">
            {todayRecords.length}
          </p>
        </div>
        <div className="w-px h-16 bg-gray-200 dark:bg-gray-800 relative z-10"></div>
        <div className="text-center relative z-10">
          <p className="text-sm font-extrabold text-gray-400 uppercase tracking-wider mb-2">
            کاتی ئامێر
          </p>
          <p
            className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-mono tracking-tight bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl"
            dir="ltr"
          >
            {new Date().toLocaleTimeString("ku", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
