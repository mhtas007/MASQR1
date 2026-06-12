import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAppStore } from "../hooks/useAppStore";
import { Printer, Hexagon, UserCircle } from "lucide-react";

export function UserPortal() {
  const { users, activeUserId, settings } = useAppStore();
  const currentUser = users.find((u) => u.id === activeUserId);

  const [qrValue, setQrValue] = useState("");

  // No more timeout/refresh. Just static ID.
  useEffect(() => {
    if (currentUser) {
      setQrValue(JSON.stringify({ masqr: true, userId: currentUser.id }));
    }
  }, [currentUser]);

  const handlePrint = () => {
    window.print();
  };

  if (!currentUser)
    return (
      <div className="text-center mt-20 font-bold">بەکارهێنەر نەدۆزرایەوە!</div>
    );

  return (
    <div
      className="max-w-md mx-auto animate-in fade-in duration-700 mt-6"
      dir="rtl"
    >
      {/* Action Buttons (Hidden on Print) */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          پۆرتاڵی من
        </h2>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <Printer className="w-5 h-5" />
          <span>چاپکردنی باج</span>
        </button>
      </div>

      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[3rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-gray-800 text-center relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none -mr-20 -mt-20"></div>

        <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/40 dark:to-gray-900 text-indigo-600 dark:text-indigo-400 rounded-[2rem] flex items-center justify-center font-black text-4xl mx-auto mb-6 shadow-md border border-indigo-100/50 dark:border-indigo-800/50 relative z-10">
          {currentUser.name.charAt(0)}
        </div>

        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 relative z-10">
          {currentUser.name}
        </h2>
        <div className="flex items-center justify-center gap-2 mb-8 relative z-10">
          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-black rounded-lg">
            {currentUser.category === "STUDENT"
              ? "قوتابی"
              : currentUser.category === "TEACHER"
                ? "مامۆستا"
                : "کارمەند"}
          </span>
          <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
            {currentUser.department}
          </span>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] inline-block shadow-xl mx-auto border border-gray-100 dark:border-gray-800 relative z-10 group">
          <QRCodeSVG
            value={qrValue}
            size={260}
            level="H"
            includeMargin={true}
            className="rounded-[1.5rem] transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <p className="mt-8 text-sm font-bold text-gray-400 dark:text-gray-500 max-w-xs mx-auto">
          ئەم باجە تایبەتە بە خۆت، تەنیا ئەمە بەکاربهێنە بۆ تۆمارکردنی
          ئامادەبوون لە شاشەی سکانەر.
        </p>
      </div>

      {/* Printable ID Card Layout */}
      {/* Invisible on screen, overrides the whole screen in print! */}
      <div
        className="hidden print:block print:fixed print:inset-0 print:w-full print:h-full print:bg-white"
        dir="rtl"
      >
        {/* Center the card precisely for cutting */}
        <div
          className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[54mm] h-[86mm] bg-white border border-gray-200 rounded-[3mm] overflow-hidden flex flex-col relative print:border-gray-300"
          style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
        >
          {/* Top Corporate Graphic */}
          <div className="h-[28mm] bg-gradient-to-b from-indigo-700 to-indigo-600 w-full flex flex-col items-center justify-center relative overflow-hidden shrink-0 text-white shadow-sm border-b border-indigo-800">
            <div className="absolute top-[-10mm] right-[-10mm] w-[30mm] h-[30mm] bg-white/20 rounded-full blur-[2px]"></div>
            <div className="absolute bottom-[-15mm] left-[-5mm] w-[40mm] h-[40mm] bg-black/15 rounded-full blur-[4px]"></div>
            <Hexagon className="w-10 h-10 fill-indigo-100/10 text-white relative z-10 drop-shadow-md mb-1.5" />
            <span className="text-[10px] font-black relative z-10 drop-shadow-sm text-center px-1 leading-tight">
              {settings?.orgName?.substring(0, 30) || "MASQR SYSTEM"}
            </span>
          </div>

          {/* Profile Avatar Overlay */}
          <div className="absolute top-[20mm] left-1/2 -translate-x-1/2 w-[16mm] h-[16mm] bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 z-20">
            <UserCircle className="w-14 h-14 text-indigo-200" />
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col items-center justify-start pt-8 px-2 bg-gray-50/50 pb-2">
            <h1 className="text-[13px] font-black text-gray-900 mb-0.5 text-center leading-tight tracking-tight">
              {currentUser.name}
            </h1>
            <p className="text-[10px] font-bold text-gray-500 mb-3 truncate max-w-full">
              {currentUser.department}
            </p>

            <div className="bg-white p-1 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-200 mb-auto relative">
              <QRCodeSVG
                value={qrValue}
                size={120}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="w-full flex justify-center mt-3">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-[10px] font-black rounded-lg border border-indigo-200 uppercase tracking-widest">
                {currentUser.category === "STUDENT"
                  ? "قوتابی • STUDENT"
                  : currentUser.category === "TEACHER"
                    ? "مامۆستا • TEACHER"
                    : "کارمەند • STAFF"}
              </span>
            </div>
          </div>

          {/* Bottom Footer Border */}
          <div className="h-2 w-full bg-gradient-to-r from-indigo-700 via-indigo-500 to-indigo-700 shrink-0"></div>
        </div>
      </div>
    </div>
  );
}
