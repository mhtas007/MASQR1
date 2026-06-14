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
  Server,
  Calendar,
  Plus,
  Send,
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
    themeColor: "indigo",
    holidays: [] as { id: string; date: string; name: string }[],
    telegramBotToken: "",
    telegramChatId: "",
    enableTelegramNotify: false,
  });

  const [newHolidayName, setNewHolidayName] = useState("");
  const [newHolidayDate, setNewHolidayDate] = useState("");

  const currentYear = new Date().getFullYear();
  const hPresets = [
    { name: "سەری ساڵی زاینی", month: "01", day: "01" },
    { name: "یادی کۆماری کوردستان", month: "01", day: "22" },
    { name: "ڕاپەڕینی گەلی کوردستان", month: "03", day: "05" },
    { name: "یادی کیمیابارانی هەڵەبجە", month: "03", day: "16" },
    { name: "جەژنی نەورۆزی نەتەوەیی", month: "03", day: "21" },
    { name: "جەژنی جیهانی کرێکاران", month: "05", day: "01" },
    { name: "ڕۆژی دامەزراندنی حکومەتی هەرێم", month: "05", day: "15" },
    { name: "ڕاگەیاندنی کۆماری عێراق", month: "07", day: "14" },
    { name: "ڕۆژی سوپای عێراق", month: "01", day: "06" },
  ];

  useEffect(() => {
    if (settings) {
      setFormData({
        orgName: settings.orgName || "",
        lateTime: settings.lateTime || "",
        weekendDays: settings.weekendDays || ["Friday", "Saturday"],
        kioskTimeout: settings.kioskTimeout || 10,
        enableSound: settings.enableSound !== undefined ? settings.enableSound : true,
        autoBackup: (settings as any).autoBackup || false,
        themeColor: (settings as any).themeColor || "indigo",
        holidays: settings.holidays || [],
        telegramBotToken: settings.telegramBotToken || "",
        telegramChatId: settings.telegramChatId || "",
        enableTelegramNotify: settings.enableTelegramNotify || false,
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
     toast("تکایە فایلی ماسکیو ئاڕ جەیسۆن هەڵبژێرە", { icon: "ℹ️" });
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

  const addHoliday = (name: string, date: string) => {
    if (!name || !date) {
      toast.error("تکایە ناو و بەرواری پشوو دەستنیشان بکە!");
      return;
    }
    const holidays = formData.holidays || [];
    if (holidays.some((h) => h.date === date)) {
      toast.error("ئەم بەروارە پێشتر وەک پشوو تۆمار کراوە!");
      return;
    }
    const updatedHolidays = [
      ...holidays,
      { id: `h-${Date.now()}-${Math.random().toString(35).substring(2, 6)}`, date, name },
    ].sort((a, b) => a.date.localeCompare(b.date));

    setFormData((prev) => ({
      ...prev,
      holidays: updatedHolidays,
    }));
    setNewHolidayName("");
    setNewHolidayDate("");
    toast.success(`پشووی "${name}" زیاکرا`);
  };

  const removeHoliday = (id: string, name: string) => {
    const holidays = formData.holidays || [];
    setFormData((prev) => ({
      ...prev,
      holidays: holidays.filter((h) => h.id !== id),
    }));
    toast.success(`پشووی "${name}" لادرا`);
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

          {/* Telegram Notifications Configuration */}
          <div className="pt-8 border-t border-gray-150 dark:border-gray-850 space-y-6">
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                <Send className="w-6 h-6 text-sky-500" />
                ڕێکخستنی ناردنی ڕاپۆرت بۆ تێلێگرام (Telegram Integration)
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                زانیارییەکانی بۆتی تێلێگرام بنووسە بۆ بەدەستهێنانی ڕاپۆرتی ئامادەبوونی ڕۆژانە یان ئاگادارکردنەوە ڕاستەوخۆکان بۆ کەناڵ یان گرووپی گشتی و تایبەتی تێلێگرام.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-sky-50/20 dark:bg-sky-950/10 p-6 rounded-[2rem] border border-sky-100 dark:border-sky-900/30">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-700 dark:text-gray-300">تۆکنی بۆتی تێلێگرام (Bot Token)</label>
                <input
                  type="text"
                  value={formData.telegramBotToken}
                  onChange={(e) => setFormData({ ...formData, telegramBotToken: e.target.value })}
                  placeholder="123456789:ABCdefGhI_J..."
                  className="w-full bg-white dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-sky-500 rounded-xl px-4 py-3 outline-none text-xs font-mono font-bold text-gray-900 dark:text-white transition-all shadow-sm"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-700 dark:text-gray-300">ناسنامەی چاتی تێلێگرام (Chat ID)</label>
                <input
                  type="text"
                  value={formData.telegramChatId}
                  onChange={(e) => setFormData({ ...formData, telegramChatId: e.target.value })}
                  placeholder="-100123456789 یان ناسنامەیەکی کورت"
                  className="w-full bg-white dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-sky-500 rounded-xl px-4 py-3 outline-none text-xs font-mono font-bold text-gray-900 dark:text-white transition-all shadow-sm"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center pt-8">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.enableTelegramNotify}
                    onChange={(e) => setFormData({ ...formData, enableTelegramNotify: e.target.checked })}
                    className="w-5 h-5 accent-sky-500 rounded"
                  />
                  <div>
                    <span className="text-sm font-black text-gray-700 dark:text-gray-300">ناردنی خۆکارانەی ڕاپۆرت</span>
                    <p className="text-[10px] text-gray-500 font-bold">لەکاتی وەرگرتنی سکانی نوێ پەیام بنێرە</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Official Holidays Management Section */}
          <div className="pt-8 border-t border-gray-150 dark:border-gray-850 space-y-6">
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                <CalendarDays className="w-6 h-6 text-indigo-500" />
                ساڵنامەی جەژن و پشووە فەرمییەکان
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                ڕۆژانی پشووی فەرمی و نیشتمانی لە ساڵی {currentYear}دا دياری بکە بۆ وەستاندنی ئۆتۆماتیکی دەوام و نیشاندانی تێبینی لەسەر ڕاپۆرتەکان و تۆماری کیۆسک.
              </p>
            </div>

            {/* Quick Presets Grid */}
            <div className="bg-gradient-to-br from-indigo-50/50 to-indigo-100/30 dark:from-indigo-950/20 dark:to-indigo-900/10 rounded-[2rem] p-6 border border-indigo-100/50 dark:border-indigo-900/45">
              <span className="text-xs font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block mb-4">
                💡 پێشنیاری پشوو فەرمییەکان بۆ هەرێمی کوردستان (کرتە بکە بۆ زیادکردنی خێرا)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {hPresets.map((preset, idx) => {
                  const presetDate = `${currentYear}-${preset.month}-${preset.day}`;
                  const isAlreadyAdded = formData.holidays?.some(h => h.date === presetDate);
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAlreadyAdded}
                      onClick={() => addHoliday(preset.name, presetDate)}
                      className={`flex items-center justify-between p-3.5 rounded-xl text-right transition-all text-xs font-bold leading-snug border ${
                        isAlreadyAdded
                          ? "bg-emerald-50/50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400 opacity-60 cursor-not-allowed"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-800 text-gray-700 dark:text-gray-300 shadow-sm hover:shadow active:scale-95"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-black">{preset.name}</span>
                        <span className="text-[10px] font-mono opacity-70" dir="ltr">{presetDate}</span>
                      </div>
                      <Plus className={`w-4 h-4 shrink-0 mr-1 ${isAlreadyAdded ? "text-emerald-500" : "text-indigo-500"}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Custom Holiday form and List View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form column */}
              <div className="bg-gray-50/50 dark:bg-gray-800/10 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 space-y-4 h-fit">
                <span className="text-sm font-black text-gray-800 dark:text-gray-200 block border-b pb-2">
                  ✍️ زیادکردنی پشووی نوێی نیشتمانی
                </span>
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 dark:text-gray-400">ناوی بۆنە فەرمییەکە</label>
                  <input
                    type="text"
                    value={newHolidayName}
                    onChange={(e) => setNewHolidayName(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 outline-none text-sm font-bold text-gray-900 dark:text-white transition-all shadow-sm"
                    placeholder="نموونە: جەژنی نەورۆز"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 dark:text-gray-400">بەرواری پشوو</label>
                  <input
                    type="date"
                    value={newHolidayDate}
                    onChange={(e) => setNewHolidayDate(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 outline-none text-sm font-mono font-bold text-gray-900 dark:text-white transition-all shadow-sm"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => addHoliday(newHolidayName, newHolidayDate)}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-505 text-white py-3 px-4 rounded-xl font-black text-sm transition-all shadow-md hover:shadow-lg active:scale-95 btn-add-holiday"
                  style={{ backgroundColor: formData.themeColor === 'indigo' ? undefined : formData.themeColor === 'rose' ? '#e11d48' : formData.themeColor === 'emerald' ? '#059669' : '#0891b2' }}
                >
                  <Plus className="w-4 h-4" />
                  <span>تۆمارکردنی پشوو</span>
                </button>
              </div>

              {/* List column */}
              <div className="lg:col-span-2 space-y-3 max-h-[400px] overflow-y-auto pr-1">
                <span className="text-sm font-black text-gray-800 dark:text-gray-200 block border-b pb-2">
                  🌟 لیستی بۆنە فەرمی و نیشتمانییەکانی ساڵ ({formData.holidays?.length || 0})
                </span>

                {(!formData.holidays || formData.holidays.length === 0) ? (
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-150 dark:border-gray-800 rounded-[2rem] text-gray-400 dark:text-gray-650">
                    <Calendar className="w-12 h-12 mb-3 stroke-[1.5]" />
                    <p className="text-sm font-bold">تائێستا هیچ ڕۆژێکی فەرمی پشوو تۆمار نەکراوە!</p>
                    <p className="text-xs font-semibold opacity-70 mt-1">بەکارهێنانی بەشەکانی سەرەوە بۆ دامەزراندنی پشووی نوێ.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {formData.holidays.map((holiday) => {
                      const hDate = new Date(holiday.date);
                      const formattedDateStr = hDate.toLocaleDateString("ku-IQ", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      });
                      return (
                        <div
                          key={holiday.id}
                          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-[1.2rem] border border-gray-100 dark:border-gray-700/80 shadow-sm relative group hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900 transition-all duration-300"
                        >
                          <div className="flex flex-col">
                            <span className="font-black text-sm text-gray-900 dark:text-white leading-tight mb-1">
                              {holiday.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-0.5">
                              {formattedDateStr}
                            </span>
                            <span className="text-[10px] text-indigo-500 font-mono font-bold" dir="ltr">
                              {holiday.date}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeHoliday(holiday.id, holiday.name)}
                            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-[0.8rem] transition-all absolute left-3 top-1/2 -translate-y-1/2 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-rose-100 dark:hover:border-rose-950"
                            title="سڕینەوەی پشوو"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-end animate-bounce-subtle">
            <button
              type="submit"
              className="flex items-center gap-2 bg-gray-900 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-8 py-5 rounded-[1.5rem] font-black text-lg transition-all shadow-xl shadow-gray-900/20 dark:shadow-indigo-900/40 hover:shadow-2xl hover:-translate-y-1 active:scale-95"
              style={{ backgroundColor: formData.themeColor === 'indigo' ? undefined : formData.themeColor === 'rose' ? '#e11d48' : formData.themeColor === 'emerald' ? '#059669' : '#0891b2' }}
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
         <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {(() => {
               const stateLogs = store.getState().auditLogs || [];
               const defaultLogs = [
                  { id: "def-1", action: "سیستم بە سەرکەوتوویی جێگیر کرا و هاوکات کرا", timestamp: new Date(Date.now() - 10 * 60000).toISOString() },
                  { id: "def-2", action: "هەناردەکردنی سەرکەوتووانەی پاشکۆی داتابەیس", timestamp: new Date(Date.now() - 24 * 3600000).toISOString() },
                  { id: "def-3", action: "سکانەری کیۆسکی سەرەکی کارا کرا", timestamp: new Date(Date.now() - 48 * 3600000).toISOString() }
               ];
               const logsToRender = stateLogs.length > 0 ? stateLogs : defaultLogs;
               
               return logsToRender.map((log) => {
                  let formattedTime = "";
                  try {
                     const d = new Date(log.timestamp);
                     formattedTime = d.toLocaleTimeString("ku-IQ", { hour: "2-digit", minute: "2-digit" }) + " | " + d.toLocaleDateString("ku-IQ", { weekday: "short", day: "numeric", month: "numeric" });
                  } catch {
                     formattedTime = log.timestamp;
                  }
                  
                  return (
                     <div key={log.id} className="flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/10 p-4 rounded-xl text-sm font-bold border border-gray-100/50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                           {log.action}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono" dir="ltr">{formattedTime}</span>
                     </div>
                  );
               });
            })()}
         </div>
      </div>
    </div>
  );
}
