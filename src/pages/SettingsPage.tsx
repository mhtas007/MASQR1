import React, { useState, useEffect } from "react";
import { useAppStore } from "../hooks/useAppStore";
import { store } from "../store";
import {
  Settings,
  Save,
  School,
  Clock,
  Trash2,
  CalendarDays,
  Timer,
  Volume2,
  Download,
  Upload,
  Palette,
  ShieldAlert,
  Server
} from "lucide-react";
import toast from "react-hot-toast";

export function SettingsPage() {
  const { settings, users, records } = useAppStore();
  const [formData, setFormData] = useState({
    orgName: "",
    lateTime: "",
    weekendDays: ["Friday", "Saturday"],
    kioskTimeout: 10,
    enableSound: true,
    autoBackup: false,
    themeColor: "indigo"
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        ...formData,
        ...settings,
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await store.updateSettings(formData);
    toast.success("ڕێکخستنەکان پاشەکەوت کران بە سەرکەوتوویی");
  };

  const handleFactoryReset = () => {
    if (
      confirm(
        "دڵنیای لە سڕینەوەی هەموو داتاکانی سیستم؟ (کارمەندان، تۆمارەکان، ڕێکخستنەکان) ئەمە ناگەڕێتەوە!",
      )
    ) {
      const defaultUsers = store
        .getState()
        .users.filter((u) => u.role === "ADMIN" || u.role === "KIOSK");
      store.setState({ records: [], users: defaultUsers });
      toast.success("هەموو داتاکان سڕانەوە. تەنها فۆرماتی سەرەتایی ماوەتەوە.");
    }
  };

  const handleExportJSON = () => {
     const data = { users, records, settings: formData };
     const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(data))}`;
     const link = document.createElement("a");
     link.href = jsonString;
     link.download = `masqr_backup_${new Date().getTime()}.json`;
     link.click();
     toast.success("داتابەیس پاشەکەوت کرا", { icon: "📥" });
  };

  const handleMockImport = () => {
     toast.info("تکایە فایلی ماسکیو ئاڕ جەیسۆن هەڵبژێرە");
  };

  const toggleWeekendDay = (day: string) => {
    setFormData((prev) => {
      const days = prev.weekendDays || [];
      if (days.includes(day)) {
        return { ...prev, weekendDays: days.filter((d) => d !== day) };
      } else {
        return { ...prev, weekendDays: [...days, day] };
      }
    });
  };

  const daysOfWeek = [
    { id: "Sunday", label: "یەکشەممە" },
    { id: "Monday", label: "دووشەممە" },
    { id: "Tuesday", label: "سێشەممە" },
    { id: "Wednesday", label: "چوارشەممە" },
    { id: "Thursday", label: "پێنجشەممە" },
    { id: "Friday", label: "هەینی" },
    { id: "Saturday", label: "شەممە" },
  ];

  return (
    <div className="animate-in fade-in duration-700 pb-10 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 relative">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-3 border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
            <Settings className="w-4 h-4" />
            سیستەمی ڕێکخستن
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
            ڕێکخستنە گشتییەکان
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 font-semibold">
            تایبەتمەندکردنی ناوی ڕێکخراو و یاساکانی دەوام و پشوو
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800 relative z-10 mb-8">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Info Section */}
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 border-b-2 border-gray-100 dark:border-gray-800 pb-2 inline-block">
                  ناسنامەی ڕێکخراو
                </h3>

                <div className="space-y-4">
                  <label className="text-sm font-black text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <School className="w-5 h-5 text-indigo-500" />
                    ناوی ڕێکخراو / قوتابخانە
                  </label>
                  <input
                    type="text"
                    value={formData.orgName}
                    onChange={(e) =>
                      setFormData({ ...formData, orgName: e.target.value })
                    }
                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-indigo-500 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 text-gray-900 dark:text-white font-bold transition-all shadow-sm"
                    placeholder="نموونە: قوتابخانەی نموونەیی"
                  />
                  <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                    ئەم ناوە لەسەر باجی قوتابیان و پۆرتاڵی کارمەندان دەردەکەوێت.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 border-b-2 border-gray-100 dark:border-gray-800 pb-2 inline-block">
                  یاساکانی کات
                </h3>

                <div className="space-y-4 mb-6">
                  <label className="text-sm font-black text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-500" />
                    کاتی دواکەوتن (Late Time)
                  </label>
                  <input
                    type="time"
                    value={formData.lateTime}
                    onChange={(e) =>
                      setFormData({ ...formData, lateTime: e.target.value })
                    }
                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-indigo-500 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 text-gray-900 dark:text-white font-bold font-mono transition-all shadow-sm text-left"
                    dir="ltr"
                  />
                  <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                    ئەگەر کەسێک دوای ئەم کاتە بێت، ئەوا ڕاستەوخۆ وەک "دواکەوتوو"
                    هەژمار دەکرێت.
                  </p>
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="space-y-8 bg-gray-50/50 dark:bg-gray-800/30 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 border-b-2 border-gray-200 dark:border-gray-700 pb-2 inline-block">
                ڕێکخستنی پێشکەوتوو
              </h3>

              <div className="space-y-4 pt-4">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl transition-colors bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400`}
                    >
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-gray-700 dark:text-gray-300">
                        هاوکاتکردنی داتابەیس (Auto Sync)
                      </div>
                      <div className="text-xs text-gray-500 font-bold">
                        پاشەکەوتکردنی ئۆتۆماتیکی بۆ هەورەکان
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.autoBackup}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          autoBackup: e.target.checked,
                        })
                      }
                      className="sr-only"
                    />
                    <div
                      className={`block w-14 h-8 rounded-full transition-colors duration-300 ${formData.autoBackup ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-700"}`}
                    ></div>
                    <div
                      className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${formData.autoBackup ? "translate-x-6" : ""}`}
                    ></div>
                  </div>
                </label>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="text-sm font-black text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-indigo-500" />
                  ڕەنگی ڕووکاری سیستم
                </label>
                <div className="flex gap-3">
                   {['indigo', 'rose', 'emerald', 'cyan'].map(color => (
                      <button 
                         key={color} type="button" 
                         onClick={() => setFormData({...formData, themeColor: color})}
                         className={`w-10 h-10 rounded-full border-4 shadow-sm transition-transform hover:scale-110 ${formData.themeColor === color ? 'border-gray-900 dark:border-white' : 'border-transparent'}`}
                         style={{ backgroundColor: color === 'indigo' ? '#4f46e5' : color === 'rose' ? '#e11d48' : color === 'emerald' ? '#059669' : '#0891b2' }}
                      />
                   ))}
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <label className="text-sm font-black text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-indigo-500" />
                  ڕۆژانی پشوو (کۆتایی هەفتە)
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleWeekendDay(day.id)}
                      className={`px-3 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                        formData.weekendDays?.includes(day.id)
                          ? "bg-indigo-100 border-indigo-500 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
                          : "bg-white border-transparent text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 font-semibold">
                  ئەو ڕۆژانە دیاری بکە کە پشووی فەرمین.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="text-sm font-black text-gray-700 dark:text-gray-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="w-5 h-5 text-indigo-500" />
                    کاتی دەرچوون لە کیۆسک (چرکە)
                  </div>
                  <span className="font-mono text-indigo-600 font-black">
                    {formData.kioskTimeout}s
                  </span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="30"
                  step="1"
                  value={formData.kioskTimeout}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kioskTimeout: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600"
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl transition-colors ${formData.enableSound ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400" : "bg-gray-100 text-gray-400 dark:bg-gray-800"}`}
                    >
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-gray-700 dark:text-gray-300">
                        دەنگی ئاگادارکردنەوەی سکان
                      </div>
                      <div className="text-xs text-gray-500 font-bold">
                        بیکە کار بۆ لێدانی دەنگ لەگەڵ سکانکردن
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.enableSound}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          enableSound: e.target.checked,
                        })
                      }
                      className="sr-only"
                    />
                    <div
                      className={`block w-14 h-8 rounded-full transition-colors duration-300 ${formData.enableSound ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-700"}`}
                    ></div>
                    <div
                      className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${formData.enableSound ? "translate-x-6" : ""}`}
                    ></div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-gray-900 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-8 py-5 rounded-[1.5rem] font-black text-lg transition-all shadow-xl shadow-gray-900/20 dark:shadow-indigo-900/40 hover:shadow-2xl hover:-translate-y-1 active:scale-95"
            >
              <Save className="w-6 h-6" />
              پاشەکەوتکردنی گۆڕانکارییەکان
            </button>
          </div>
        </form>
      </div>

      {/* Database Setup Section (New Features) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-10">
         <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-[2.5rem] p-8 border border-emerald-100 dark:border-emerald-900/30 flex flex-col justify-between">
            <div>
               <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-2">
                 <Download className="w-5 h-5" />
                 پاشەکەوتکردنی داتابەیس 
               </h3>
               <p className="text-emerald-800/70 dark:text-emerald-200/50 font-bold text-sm mb-6">
                 زانیاری بەکارهێنەران و تۆمارەکان بە فایلی JSON دابەزێنە.
               </p>
            </div>
            <button
               onClick={handleExportJSON}
               className="bg-white dark:bg-emerald-950 border-2 border-emerald-200 dark:border-emerald-900 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white text-emerald-600 px-6 py-4 rounded-2xl font-black transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
            >
               دابەزاندنی فایل
            </button>
         </div>

         <div className="bg-cyan-50 dark:bg-cyan-900/10 rounded-[2.5rem] p-8 border border-cyan-100 dark:border-cyan-900/30 flex flex-col justify-between">
            <div>
               <h3 className="text-xl font-black text-cyan-600 dark:text-cyan-400 mb-2 flex items-center gap-2">
                 <Upload className="w-5 h-5" />
                 گەڕاندنەوەی داتابەیس (Import)
               </h3>
               <p className="text-cyan-800/70 dark:text-cyan-200/50 font-bold text-sm mb-6">
                 پاشەکەوتی پێشتر بەکاربهێنە بۆ گەڕاندنەوەی داتا سڕاوەکان.
               </p>
            </div>
            <button
               onClick={handleMockImport}
               className="bg-white dark:bg-cyan-950 border-2 border-cyan-200 dark:border-cyan-900 hover:border-cyan-500 hover:bg-cyan-500 hover:text-white text-cyan-600 px-6 py-4 rounded-2xl font-black transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
            >
               هەڵبژاردنی فایل
            </button>
         </div>
      </div>

      <div className="bg-rose-50 dark:bg-rose-900/10 rounded-[2.5rem] p-8 border border-rose-100 dark:border-rose-900/30 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden group mb-8">
        <div className="absolute right-0 top-0 w-32 h-32 bg-rose-500/10 dark:bg-rose-500/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none group-hover:scale-[2] transition-transform duration-700"></div>
        <div className="relative z-10">
          <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-2">
            <Trash2 className="w-6 h-6" />
            سڕینەوەی داتاکان بە یەکجاری
          </h3>
          <p className="text-rose-800/70 dark:text-rose-200/50 font-bold text-sm max-w-lg leading-relaxed">
            بەم کردارە هەموو کارمەندان و مامۆستایان، لەگەڵ تەواوی تۆمارەکانی
            دەوام دەسڕێنەوە بۆ هەمیشە و ناگەڕێنەوە.
          </p>
        </div>
        <button
          onClick={handleFactoryReset}
          className="shrink-0 relative z-10 bg-white dark:bg-rose-950 border-2 border-rose-200 dark:border-rose-900 hover:border-rose-600 hover:bg-rose-600 hover:text-white text-rose-600 px-6 py-4 rounded-2xl font-black transition-all shadow-sm active:scale-95 flex items-center gap-2"
        >
          <Trash2 className="w-5 h-5" />
          سڕینەوەی هەموو شتێک
        </button>
      </div>

      {/* Feature: System Audit Log */}
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 relative z-10 p-8">
         <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 border-b-2 border-gray-100 dark:border-gray-800 pb-2 inline-block">
            <ShieldAlert className="w-5 h-5 inline-block ml-2 text-indigo-500" />
            تۆماری چالاکییەکانی سیستم (Audit Log)
         </h3>
         <div className="space-y-3">
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-sm font-bold border border-gray-100 dark:border-gray-800">
               <span className="text-gray-700 dark:text-gray-300">چوونە ژوورەوەی ئەدمین سەرکەوتوو بوو</span>
               <span className="text-gray-400 font-mono">10:32 AM</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-sm font-bold border border-gray-100 dark:border-gray-800">
               <span className="text-gray-700 dark:text-gray-300">هەناردەکردنی داتابەیس کرێیەکی نوێ</span>
               <span className="text-gray-400 font-mono">یەکشەممە</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-sm font-bold border border-gray-100 dark:border-gray-800">
               <span className="text-gray-700 dark:text-gray-300">سکانەری کیۆسک کاراکرا</span>
               <span className="text-gray-400 font-mono">١/٥/٢٠٢٤</span>
            </div>
         </div>
      </div>
    </div>
  );
}
