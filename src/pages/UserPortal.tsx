import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAppStore } from "../hooks/useAppStore";
import {
  Printer,
  Hexagon,
  UserCircle,
  Timer,
  Shield,
  AlertCircle,
  Calendar,
  Sparkles,
  Smartphone,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  ChevronLeft,
  Share,
  HelpCircle,
} from "lucide-react";

export function UserPortal() {
  const { users, records, activeUserId, settings } = useAppStore();
  const currentUser = users.find((u) => u.id === activeUserId);

  const themeColor = settings?.themeColor || "indigo";
  const getThemeColors = (color: string) => {
    switch (color) {
      case "rose":
        return {
          bgGrad: "from-rose-600 to-rose-800",
          border: "border-rose-100",
          text: "text-rose-600",
          solid: "#e11d48",
          light: "#fff1f2",
        };
      case "emerald":
        return {
          bgGrad: "from-emerald-600 to-emerald-800",
          border: "border-emerald-100",
          text: "text-emerald-600",
          solid: "#059669",
          light: "#ecfdf5",
        };
      case "cyan":
        return {
          bgGrad: "from-cyan-600 to-cyan-800",
          border: "border-cyan-100",
          text: "text-cyan-600",
          solid: "#0891b2",
          light: "#ecfeff",
        };
      default:
        return {
          bgGrad: "from-indigo-600 to-indigo-800",
          border: "border-indigo-100",
          text: "text-indigo-600",
          solid: "#4f46e5",
          light: "#f5f3ff",
        };
    }
  };
  const activeTheme = getThemeColors(themeColor);

  const [qrValue, setQrValue] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [isScreenMasked, setIsScreenMasked] = useState(false);
  const [showPwaGuide, setShowPwaGuide] = useState(false);

  // Rotate QR code precisely every 10 seconds to satisfy the scanner and user intent
  useEffect(() => {
    if (!currentUser) return;

    // Initial update
    setQrValue(
      JSON.stringify({
        masqr: true,
        userId: currentUser.id,
        timestamp: Date.now().toString(),
      })
    );
    setSecondsLeft(10);
    
    // Vibrate device to alert user the barcode is fully ready
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100]);
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Regenerate timestamped payload
          setQrValue(
            JSON.stringify({
              masqr: true,
              userId: currentUser.id,
              timestamp: Date.now().toString(),
            })
          );
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // Anti-Screenshot and Blur/Visibility Mask Protection to satisfy the screenshot-proofing
  useEffect(() => {
    const handleBlur = () => setIsScreenMasked(true);
    const handleFocus = () => setIsScreenMasked(false);
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        setIsScreenMasked(true);
      } else {
        setIsScreenMasked(false);
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    // Prevent key captures like PrintScreen
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        setIsScreenMasked(true);
        setTimeout(() => setIsScreenMasked(false), 2000);
      }
    };
    window.addEventListener("keyup", handleKeyDown);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("keyup", handleKeyDown);
    };
  }, []);

  // Compute live user stats from synchronized database records
  const userRecords = currentUser ? records.filter((r) => r.userId === currentUser.id) : [];
  const presentCount = userRecords.filter((r) => r.status === "PRESENT").length;
  const lateCount = userRecords.filter((r) => r.status === "LATE").length;
  const leaveCount = userRecords.filter((r) => r.status === "LEAVE").length;

  const totalWorkingDays = Array.from(new Set(records.map((r) => r.date))).length || 1;
  const absentCount = Math.max(0, totalWorkingDays - userRecords.length);

  // Dynamic Upcoming Holidays banner
  const getUpcomingHolidays = () => {
    if (!settings?.holidays || settings.holidays.length === 0) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return settings.holidays
      .map((h) => {
        const holidayDate = new Date(h.date);
        holidayDate.setHours(0, 0, 0, 0);
        const timeDiff = holidayDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return { ...h, daysLeft };
      })
      .filter((h) => h.daysLeft >= 0 && h.daysLeft <= 30) // Only look within 30 days
      .sort((a, b) => a.daysLeft - b.daysLeft);
  };
  const upcomingHolidays = getUpcomingHolidays();

  const handlePrint = () => {
    window.print();
  };

  const handleLogout = () => {
    // Clear manual active state
    store.setActiveUser(null);
    import("firebase/auth").then(({ signOut }) => {
      import("../lib/firebase").then(({ auth }) => {
        signOut(auth);
      });
    });
  };

  if (!currentUser) {
    return (
      <div className="text-center mt-20 font-bold p-6 bg-red-50 text-red-600 rounded-3xl max-w-sm mx-auto border border-red-100 shadow-sm" dir="rtl">
        بەکارهێنەر نەدۆزرایەوە یان داتا بارنەکراوە! تکایە دووبارە تاقیبکەرەوە.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto animate-in fade-in duration-500 pb-12 relative px-4" dir="rtl">
      {/* 1. Dynamic Notification of Upcoming Holidays (ڕۆژە پشووە نزیکبووەکان دێتە سەر شاشە) */}
      {upcomingHolidays.length > 0 && (
        <div className="mb-5 space-y-2.5 print:hidden">
          {upcomingHolidays.map((holiday) => (
            <div
              key={holiday.id}
              className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 px-5 py-4 rounded-3xl border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-3.5 shadow-sm hover:shadow transition-shadow animate-in slide-in-from-top-3 duration-300"
            >
              <div className="bg-indigo-600 text-white p-2 rounded-2xl shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm block leading-none text-gray-900 dark:text-white mb-1">
                  پشووی فەرمی نزیکبووەتەوە!
                </p>
                <p className="text-xs font-bold truncate text-gray-600 dark:text-gray-400">
                  بۆنە: {holiday.name} ({holiday.date})
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 shrink-0 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 font-extrabold text-[11px] px-3 py-1.5 rounded-xl">
                {holiday.daysLeft === 0 ? "ئەمڕۆیە!" : `ماوە: ${holiday.daysLeft} ڕۆژ`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Apple iOS PWA Mockup Action Header */}
      <div className="flex justify-between items-center mb-5 print:hidden">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-1">
            پۆرتاڵی من
          </h2>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500">
            ناسنامەی دیجیتاڵی ئامادەبوونی مۆبایل
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPwaGuide(true)}
            className="p-3 bg-white dark:bg-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400 border border-gray-100 dark:border-gray-700 shadow-sm transition-all"
            title="ڕێنمایی ئەپڵیکەیشن"
          >
            <Smartphone className="w-4.5 h-4.5" />
          </button>
          
          <button
            onClick={handleLogout}
            className="p-3 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 rounded-2xl hover:bg-rose-100 transition-all shadow-sm border border-rose-100/40 dark:border-rose-900/30"
            title="چوونەدەرەوە"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* 3. High Fidelity iOS Digital Card Container */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-[3rem] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-gray-100 dark:border-gray-800 text-center relative overflow-hidden print:hidden">
        {/* Anti-Screenshot Overlay (کە بارکود سکرین شوت دەکات سپی بێت شاشەکە) */}
        {isScreenMasked && (
          <div className="absolute inset-0 z-50 bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-8 transition-all duration-300">
            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mb-6 shadow-sm border border-rose-100 dark:border-rose-900/30">
              <Shield className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
              شاشەی سکورێت پینک
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold max-w-xs mx-auto leading-relaxed">
              شاشەکە سپی کراوەتەوە بۆ ڕێگریکردن لە کۆپیکردن، وێنەگرتن یان ناردنی ڤیدیۆی بارکۆدەکەت.
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-extrabold mt-6 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl">
              تکایە بگەڕێوە سەر ئەپەکە بۆ نیشاندانی بارکۆدەکە
            </p>
          </div>
        )}

        {/* Ambient Top Background blur */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/5 blur-[50px] rounded-full pointer-events-none -mr-16 -mt-16"></div>

        {/* Apple iOS Layout: Staff Avatar / Initial */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-3xl mx-auto mb-4 shadow-[0_8px_20px_rgba(0,0,0,0.05)] border border-indigo-100/50 dark:border-indigo-800/30 relative z-10 transition-transform hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${activeTheme.light}, #ffffff)`,
            color: activeTheme.solid,
          }}
        >
          {currentUser.name.charAt(0)}
        </div>

        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1.5 relative z-10">
          {currentUser.name}
        </h3>

        <div className="flex items-center justify-center gap-2 mb-6 relative z-10">
          <span
            className="px-3.5 py-1 text-[11px] font-black rounded-lg shadow-sm border border-transparent"
            style={{
              backgroundColor: currentUser.category === "TEACHER" ? "#fdf4ff" : "#f0fdfa",
              color: currentUser.category === "TEACHER" ? "#c026d3" : "#0d9488",
            }}
          >
            {currentUser.category === "TEACHER" ? "مامۆستا" : "کارمەند"}
          </span>
          <span className="text-xs font-black text-gray-400 dark:text-gray-500">
            {currentUser.department}
          </span>
        </div>

        {/* Screen Resident Barcode (بارکودەکەی لە ناو مۆبایل بێت نەک چاپ فیزیکی) */}
        <div className="bg-gray-50 dark:bg-gray-900/55 p-5 rounded-[2.5rem] inline-block shadow-inner border border-gray-100 dark:border-gray-800/60 relative z-10">
          <div className="bg-white p-4 rounded-[2rem] shadow-md border border-gray-100">
            <QRCodeSVG
              value={qrValue}
              size={220}
              level="H"
              includeMargin={false}
              className="rounded-2xl shrink-0 transition-transform duration-300"
            />
          </div>

          {/* 10-Second Countdown Loader */}
          <div className="mt-4 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-black">
              <Timer className="w-4 h-4 text-indigo-500 animate-spin" />
              <span>بارکۆدی داینامیکی پارێزراو • نوێبوونەوە لە: {secondsLeft} چرکە</span>
            </div>

            {/* Apple style progress bar */}
            <div className="w-[180px] h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-1000 rounded-full"
                style={{ width: `${secondsLeft * 10}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="mt-5 bg-gray-50 dark:bg-gray-900/40 px-5 py-3 rounded-2xl flex items-center justify-center gap-2 text-[11px] font-black text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
          <Info className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>ئەم کۆدە تەنها ١٥ چرکە کاردەکات بۆ بەرزترین ئاستی سکیوریتی.</span>
        </div>
      </div>

      {/* 4. Elegant Personal Stats Panel (زانیرەکانی کەسەکە لە ناو ئەو ئەپە بن چەند رۆژ هاتووە چەند رۆژ غایبە) */}
      <div className="mt-6 print:hidden">
        <h4 className="text-lg font-black text-gray-950 dark:text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          ئاماری ئامادەبوونی من لەم مانگەدا
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4.5 rounded-[2rem] border border-emerald-100/50 dark:border-emerald-900/30 flex items-center gap-3">
            <div className="bg-emerald-500 text-white p-2.5 rounded-2xl shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 block mb-0.5 uppercase tracking-tight">ئامادەبوو</span>
              <span className="text-xl font-black text-gray-900 dark:text-white">{presentCount} ڕۆژ</span>
            </div>
          </div>

          <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4.5 rounded-[2rem] border border-amber-100/50 dark:border-amber-900/30 flex items-center gap-3">
            <div className="bg-amber-500 text-white p-2.5 rounded-2xl shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 block mb-0.5 uppercase tracking-tight">دواکەوتوو</span>
              <span className="text-xl font-black text-gray-900 dark:text-white">{lateCount} ڕۆژ</span>
            </div>
          </div>

          <div className="bg-rose-50/50 dark:bg-rose-950/20 p-4.5 rounded-[2rem] border border-rose-100/50 dark:border-rose-900/30 flex items-center gap-3">
            <div className="bg-rose-500 text-white p-2.5 rounded-2xl shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 block mb-0.5 uppercase tracking-tight">غائیب</span>
              <span className="text-xl font-black text-gray-900 dark:text-white">{absentCount} ڕۆژ</span>
            </div>
          </div>

          <div className="bg-cyan-50/50 dark:bg-cyan-950/20 p-4.5 rounded-[2rem] border border-cyan-100/50 dark:border-cyan-900/30 flex items-center gap-3">
            <div className="bg-cyan-500 text-white p-2.5 rounded-2xl shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-black text-cyan-600 dark:text-cyan-400 block mb-0.5 uppercase tracking-tight">مۆڵەتدار</span>
              <span className="text-xl font-black text-gray-900 dark:text-white">{leaveCount} ڕۆژ</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Printable Backup Badge (Always ready as fallback) */}
      <div className="mt-8 text-center print:hidden">
        <button
          onClick={handlePrint}
          className="w-full py-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-[2rem] font-black text-sm flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 transition-all select-none hover:-translate-y-0.5 shadow-sm active:scale-95"
        >
          <Printer className="w-5 h-5 text-gray-500" />
          <span>چاپکردنی کارتی باجی فیزیکی</span>
        </button>
      </div>

      {/* 6. IOS Add to Home Screen (PWA) Guide (ئەد تو هوم سکرین دیزاین ڕاق و وەک ئەپڵی ئایفۆن) */}
      {showPwaGuide && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-t-[3rem] p-8 w-full max-w-md shadow-2xl relative animate-in slide-in-from-bottom duration-300 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setShowPwaGuide(false)}
              className="absolute top-6 left-6 p-2 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-rose-600 rounded-full transition-all"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2.5">
              <Smartphone className="w-6 h-6 text-indigo-500" />
              ئەپڵیکەیشنی ڕەسەنی ئایفۆن
            </h3>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-bold mb-6">
              بۆ جێگیرکردنی ئەپەکە لەسەر شاشەی مۆبایلەکەت هاوشێوەی ئەپلیکەیشنە فەرمیەکانی ئایفۆن بەبێ نیشاندانی تابی وێبگەڕ:
            </p>

            <div className="space-y-4 text-sm font-semibold text-gray-800 dark:text-gray-200">
              <div className="flex gap-4 p-4.5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl items-start">
                <span className="w-7 h-7 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded-lg flex items-center justify-center text-xs font-black">١</span>
                <div>
                  <p className="font-extrabold text-xs text-gray-400 uppercase tracking-tight block">بۆ بەکارهێنەرانی iPhone / Safari</p>
                  <p className="mt-1 leading-relaxed text-gray-800 dark:text-gray-100 font-bold">
                    کلیک لەسەر تیکەی <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded inline-flex items-center gap-1 font-semibold"><Share className="w-3.5 h-3.5 inline inline" /> Share</span> بکە لە خوارەوە کاتێک لە وێبگەڕی سەفاری دایت.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4.5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl items-start">
                <span className="w-7 h-7 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded-lg flex items-center justify-center text-xs font-black">٢</span>
                <div>
                  <p className="font-extrabold text-xs text-gray-400 uppercase tracking-tight block">زیادکردن بۆ سەر شاشە</p>
                  <p className="mt-1 leading-relaxed text-gray-800 dark:text-gray-100 font-bold">
                    بگەڕێ بۆ خوارەوە و دواتر بژاردەی <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">Add to Home Screen</span> دەرهێنە و کلیکی لێ بکە.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4.5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl items-start">
                <span className="w-7 h-7 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded-lg flex items-center justify-center text-xs font-black">٣</span>
                <div>
                  <p className="font-extrabold text-xs text-gray-400 uppercase tracking-tight block">ئامادەیە بۆ سەر شاشە</p>
                  <p className="mt-1 leading-relaxed text-gray-800 dark:text-gray-100 font-bold">
                    ئێستا ئەپەکە هەمیشە بە لۆگۆی تایبەتەوە لە تەنیشت ئەپەکانی ترت کار دەکات و بەبێ هێڵی ئینتەرنێتیش بەردەست دەبێت!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPwaGuide(false)}
              className="mt-6 w-full py-4.5 bg-gray-900 hover:bg-indigo-600 text-white font-extrabold text-base rounded-2xl transition-all shadow-md active:scale-95"
            >
              تێگەیشتم، زۆر سوپاس
            </button>
          </div>
        </div>
      )}

      {/* Printable PDF Badge (Invisible on screen unless printing) */}
      <div
        className="hidden print:block print:fixed print:inset-0 print:w-full print:h-full print:bg-white"
        dir="rtl"
      >
        <div
          className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[54mm] h-[86mm] bg-white border border-gray-300 rounded-[3mm] overflow-hidden flex flex-col relative print:border-gray-400"
          style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
        >
          {/* Top Corporate Header */}
          <div className={`h-[26mm] bg-gradient-to-br ${activeTheme.bgGrad} w-full flex flex-col items-center justify-center relative overflow-hidden shrink-0 text-white shadow-sm border-b border-black/10`}>
            <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, transparent 80%)" }}></div>
            <div className="absolute top-[-10mm] right-[-10mm] w-[30mm] h-[30mm] bg-white/10 rounded-full blur-[2px]"></div>
            <div className="absolute bottom-[-15mm] left-[-5mm] w-[40mm] h-[40mm] bg-black/20 rounded-full blur-[4px]"></div>
            
            <Hexagon className="w-8 h-8 fill-white/10 text-white relative z-10 drop-shadow-md mb-0.5" />
            <span className="text-[10px] font-black relative z-10 tracking-wide text-center px-2 leading-tight uppercase font-sans">
              {settings?.orgName || "MASQR SYSTEM"}
            </span>
            <span className="text-[7px] text-white/85 font-mono tracking-widest uppercase">
              SECURITY ACCESS PASS
            </span>
          </div>

          {/* Profile Avatar Overlay */}
          <div className="absolute top-[18mm] left-1/2 -translate-x-1/2 w-[16mm] h-[16mm] bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100 z-20">
            <UserCircle className="w-14 h-14" style={{ color: activeTheme.solid }} />
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col items-center justify-start pt-7 px-3 bg-white pb-2 relative">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>
            <div className="absolute top-1/2 left-6 right-6 text-center text-[12px] font-mono tracking-widest font-black text-gray-500/5 rotate-[-25deg] pointer-events-none uppercase">
              SECURE QR PASS
            </div>

            {/* Name */}
            <div className="text-center w-full mb-1">
              <span className="text-[6px] text-gray-400 font-bold block leading-none">ناو / FULL NAME</span>
              <h1 className="text-[12px] font-black text-gray-900 leading-tight mt-0.5">
                {currentUser.name}
              </h1>
            </div>

            {/* Department */}
            <div className="text-center w-full mb-2">
              <span className="text-[6px] text-gray-400 font-bold block leading-none">بەش / DEPARTMENT</span>
              <p className="text-[9px] font-black text-gray-600 mt-0.5 truncate max-w-full">
                {currentUser.department}
              </p>
            </div>

            {/* static QR pass code */}
            <div className="relative p-1 bg-white mb-auto border rounded-xl shadow-sm">
              <QRCodeSVG
                value={JSON.stringify({ masqr: true, userId: currentUser.id })}
                size={75}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Footer metadata */}
            <div className="w-full flex items-center justify-between px-1 mt-1">
              <div className="text-right">
                <span className="text-[6px] text-gray-400 font-bold block leading-none">CARD ID / ناسنامە</span>
                <span className="text-[8px] font-mono font-black text-gray-700">{currentUser.id}</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-50/80 px-1.5 py-0.5 rounded border border-gray-100">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: activeTheme.solid }}></div>
                <span className="text-[6px] font-sans font-black text-gray-500 text-center block">SECURE CONNECT</span>
              </div>
            </div>

            {/* Bottom Tag */}
            <div className="w-full mt-2">
              <div
                className="py-1 text-center text-[7.5px] font-black uppercase tracking-widest border rounded-md"
                style={{
                  color: currentUser.category === "TEACHER" ? "#c026d3" : "#0d9488",
                  borderColor: currentUser.category === "TEACHER" ? "#f5d0fe" : "#99f6e4",
                  backgroundColor: currentUser.category === "TEACHER" ? "#fdf4ff" : "#f0fdfa",
                }}
              >
                {currentUser.category === "TEACHER" ? "INSTRUCTOR PASS" : "STAFF ACCESS"}
              </div>
            </div>
          </div>

          <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: activeTheme.solid }}></div>
        </div>
      </div>
    </div>
  );
}
