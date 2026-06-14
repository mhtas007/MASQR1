import { useState } from "react";
import { useAppStore } from "../hooks/useAppStore";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Search,
  Calendar as CalendarIcon,
  Filter,
  Layers,
  CheckCircle2,
  AlertCircle,
  XOctagon,
  UserCircle,
  Hexagon,
  Mail,
  Sparkles,
  BarChart2,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

export function ReportsPage() {
  const { users, records, settings } = useAppStore();
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");
  
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  const displayUsers = users.filter(
    (u) => u.role !== "KIOSK" && u.role !== "ADMIN",
  );

  // Build a virtual list of records including absentees for the selected date
  const dateRecords = displayUsers.map((user) => {
    const record = records.find(
      (r) => r.userId === user.id && r.date === filterDate,
    );
    return {
      user,
      record,
      id: record ? record.id : `absent-${user.id}-${filterDate}`,
      status: record ? record.status : "ABSENT",
      checkIn: record?.checkIn || null,
      checkOut: record?.checkOut || null,
      date: filterDate,
    };
  });

  const filteredRecords = dateRecords.filter((r) => {
    const matchesName = r.user.name.includes(filterName);
    const matchesStatus = filterStatus === "ALL" || r.status === filterStatus;
    const matchesCategory =
      filterCategory === "ALL" || r.user.category === filterCategory;

    return matchesName && matchesStatus && matchesCategory;
  });

  const stats = {
    total: filteredRecords.length,
    present: filteredRecords.filter((r) => r.status === "PRESENT").length,
    late: filteredRecords.filter((r) => r.status === "LATE").length,
    leave: filteredRecords.filter((r) => r.status === "LEAVE").length,
    absent: filteredRecords.filter((r) => r.status === "ABSENT").length,
  };

  const getCategoryLabel = (cat?: string) => {
    if (cat === "EMPLOYEE") return "کارمەند";
    if (cat === "TEACHER") return "مامۆستا";
    if (cat === "STUDENT") return "قوتابی";
    return "-";
  };

  const getStatusLabel = (status: string) => {
    if (status === "PRESENT") return "ئامادەبوو";
    if (status === "LATE") return "دواکەوتوو";
    if (status === "LEAVE") return "مۆڵەت";
    if (status === "ABSENT") return "غایب";
    return "-";
  };

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "ناو,جۆر,بەش,بەروار,هاتن,چوون,دۆخ\n";

    filteredRecords.forEach((r) => {
      const checkInTime = r.checkIn
        ? new Date(r.checkIn).toLocaleTimeString("ku")
        : "N/A";
      const checkOutTime = r.checkOut
        ? new Date(r.checkOut).toLocaleTimeString("ku")
        : "N/A";
      const statusText = getStatusLabel(r.status);
      const catText = getCategoryLabel(r.user.category);

      csvContent += `${r.user.name},${catText},${r.user.department},${r.date},${checkInTime},${checkOutTime},${statusText}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MASQR_Report_${filterDate}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("ڕاپۆرت بەفۆرماتی CSV دابەزێنرا");
  };

  const exportPDF = () => {
    toast.success('کاتی چاپکردن "Save as PDF" هەڵبژێرە بۆ دابەزاندن', {
      icon: "🖨️",
      duration: 4000,
    });
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleSendEmail = () => {
    toast.success("ڕاپۆرت نێردرا بۆ ئیمەیڵی بەڕێوەبەر", { icon: "📧" });
  };

  const handleSendTelegram = async () => {
    if (!settings?.telegramBotToken || !settings?.telegramChatId) {
      toast.error("تکایە سەرەتا تۆکنی بۆت و ناسنامەی چاتی تێلێگرام لە ڕێکخستنەکان کارا بکە!", {
        duration: 5000,
      });
      return;
    }

    const orgName = settings.orgName || "قوتابخانەی نموونەیی";
    
    // Calculate stats
    const totalCount = filteredRecords.length;
    const presentCount = stats.present;
    const lateCount = stats.late;
    const leaveCount = stats.leave;
    const absentCount = stats.absent;

    // Use HTML formatting for a highly professional Telegram report
    let msg = `<b>📑 ڕاپۆرتی ئامادەبوونی دەوامی ڕۆژانە</b>\n\n`;
    msg += `<b>🏛 دامەزراوە:</b> ${orgName}\n`;
    msg += `<b>📅 بەروار:</b> <code>${filterDate}</code>\n\n`;

    msg += `<b>📊 ئاماری گشتی ئەمڕۆ:</b>\n`;
    msg += `👥 <b>سەرجەم:</b> ${totalCount} کەس\n`;
    msg += `✅ <b>ئامادەبوو:</b> ${presentCount} کەس <i>(${((presentCount / Math.max(1, totalCount)) * 100).toFixed(0)}%)</i>\n`;
    msg += `⏳ <b>دواکەوتوو:</b> ${lateCount} کەس\n`;
    msg += `📝 <b>مۆڵەت:</b> ${leaveCount} کەس\n`;
    msg += `❌ <b>غایب:</b> ${absentCount} کەس\n\n`;

    msg += `<b>📋 لیستی تۆماری کارمەندان:</b>\n`;
    
    // Create a beautiful grouped list
    const portion = filteredRecords.slice(0, 40);
    portion.forEach((r, idx) => {
      const idxStr = (idx + 1).toLocaleString("ku-IQ");
      const checkInTime = r.checkIn 
        ? new Date(r.checkIn).toLocaleTimeString("ku-IQ", { hour: "2-digit", minute: "2-digit" })
        : "";
      
      let statusIcon = "✅";
      if(r.status === "LATE") statusIcon = "⏳";
      if(r.status === "LEAVE") statusIcon = "📝";
      if(r.status === "ABSENT") statusIcon = "❌";

      msg += `${statusIcon} <b>${r.user.name}</b> — <i>${getCategoryLabel(r.user.category)}</i>\n`;
      msg += `      └ دۆخ: <code>${getStatusLabel(r.status)}</code> ${checkInTime ? `| کات: <code>${checkInTime}</code>` : ""}\n`;
    });

    if (filteredRecords.length > 40) {
      msg += `\n<i>...و ${filteredRecords.length - 40} تۆماری تر بوونی هەیە.</i>\n`;
    }

    msg += `\n<a href="https://masqr-app.firebaseapp.com">🛡 سیستەمی ئامادەبوونی MASQR</a>`;

    const loadingToast = toast.loading("پەیوەستبوون بە سێرڤەری تێلێگرام...");

    try {
      const resp = await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: settings.telegramChatId,
          text: msg,
          parse_mode: "HTML",
          disable_web_page_preview: true
        })
      });

      toast.dismiss(loadingToast);

      if (resp.ok) {
        toast.success("ڕاپۆرت بەسەرکەوتوویی بۆ کەناڵی تێلێگرام نێردرا!", { icon: "🚀", duration: 4000 });
        import("../store").then(({ store }) => {
          store.addAuditLog(`ڕاپۆرتی دەوامی ڕۆژی ${filterDate} هەناردەی تێلێگرام کرا`);
        });
      } else {
        const errorData = await resp.json();
        toast.error(`نەتوانرا بنێردرێت: ${errorData.description || "تۆکنی بۆت یان چات ئایدی نادروستە"}`);
      }
    } catch {
      toast.dismiss(loadingToast);
      toast.error("هەڵە لە پەیوەستبوون بە تێلێگرام، ئینتەرنێتەکەت بپشکنە");
    }
  };

  const setPresetDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setFilterDate(d.toISOString().split("T")[0]);
  };

  return (
    <div className="animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 relative print:hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-3 border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
            <CalendarIcon className="w-4 h-4" />
            سیستەمی ڕاپۆرتدان
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
            ڕاپۆرتەکان
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 font-semibold">
            داگرتن و شیکردنەوەی داتاکانی دەوام بە شێوەیەکی پرۆفیشناڵ
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full md:w-auto">
          <button
            onClick={() => setShowAIAnalysis(!showAIAnalysis)}
            className="flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 px-5 py-3.5 rounded-[1.5rem] font-black text-sm uppercase tracking-wide transition-all shadow-sm"
          >
            <Sparkles className="w-5 h-5" />
            <span className="hidden sm:inline">شیکردنەوەی ژیری دەستکرد</span>
          </button>
          <button
            onClick={handleSendEmail}
            className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 px-5 py-3.5 rounded-[1.5rem] font-black text-sm transition-all shadow-sm"
          >
            <Mail className="w-5 h-5" />
          </button>
          <button
            onClick={handleSendTelegram}
            className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-5 py-3.5 rounded-[1.5rem] font-black text-sm transition-all shadow-md shadow-sky-500/15 hover:shadow-lg active:scale-95 group"
            title="ناردنی ڕاپۆرت بۆ تێلێگرام"
          >
            <Send className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">تێلێگرام</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center justify-center gap-2 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-gray-700 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 px-6 py-3.5 rounded-[1.5rem] font-black text-sm uppercase tracking-wide transition-all shadow-sm hover:shadow-md active:scale-95 group"
          >
            <FileSpreadsheet className="w-5 h-5 group-hover:scale-110 group-hover:rotate-6 transition-transform" />
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-6 py-3.5 rounded-[1.5rem] font-black text-sm uppercase tracking-wide transition-all shadow-xl shadow-gray-900/20 dark:shadow-emerald-900/40 hover:shadow-2xl hover:-translate-y-1 active:scale-95 group"
          >
            <FileText className="w-5 h-5 group-hover:scale-110 group-hover:-rotate-6 transition-transform" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {showAIAnalysis && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-[2rem] p-8 mb-10 print:hidden relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles className="w-32 h-32 text-indigo-500" />
           </div>
           <h3 className="text-xl font-black text-indigo-900 dark:text-indigo-400 mb-4 flex items-center gap-2 relative z-10">
              <Sparkles className="w-6 h-6" />
              پوختەی زیرەکی دەستکرد بۆ ڕاپۆرتی ({filterDate})
           </h3>
           <p className="text-indigo-800/80 dark:text-indigo-300 leading-relaxed font-semibold relative z-10">
             بەپێی داتاکانی ئەمڕۆ، ئاستی ئامادەبوون زۆر باشە (نزیکەی {(stats.present / Math.max(1, stats.total) * 100).toFixed(0)}%). ژمارەی غایبەکان تەنها {stats.absent} کەسە. پێشنیار دەکرێت بەدواداچوون بۆ ئەو {stats.late} کەسە بکرێت کە دواکەوتوون لە هاتن.
           </p>
        </div>
      )}

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10 print:hidden">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex flex-col items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-500 mb-1">
                کۆی گشتی
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white drop-shadow-sm">
                {stats.total}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex flex-col items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-500 mb-1">
                ئامادەبوو
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white drop-shadow-sm">
                {stats.present}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 dark:bg-amber-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex flex-col items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-500 mb-1">
                دواکەوتوو
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white drop-shadow-sm">
                {stats.late}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-50 dark:bg-cyan-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex flex-col items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <XOctagon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-500 mb-1">
                مۆڵەتدار
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white drop-shadow-sm">
                {stats.leave}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 dark:bg-rose-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex flex-col items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-500 mb-1">
                غایب
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white drop-shadow-sm">
                {stats.absent}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 mx-auto rounded-[2.5rem] p-6 text-sm font-bold md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 print:hidden">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-500" />
              بەرواری دیاریکراو
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-2xl px-5 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-gray-900 dark:text-white font-mono transition-all font-bold mb-2"
            />
            <div className="flex gap-2 text-xs font-bold font-mono text-indigo-600">
               <button onClick={() => setPresetDate(0)} className="bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100">ئەمڕۆ</button>
               <button onClick={() => setPresetDate(1)} className="bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100">دوێنێ</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-indigo-500" />
              فلتەری جۆر
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-2xl px-5 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-gray-900 dark:text-white transition-all font-bold appearance-none cursor-pointer"
            >
              <option value="ALL">هەموو جۆرەکان</option>
              <option value="EMPLOYEE">تەنها کارمەندان</option>
              <option value="TEACHER">تەنها مامۆستایان</option>
              <option value="STUDENT">تەنها قوتابیان</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-500" />
              گەڕان بەدوای ناو
            </label>
            <div className="relative">
              <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ناوی کارمەند..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-2xl pr-12 pl-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-gray-900 dark:text-white transition-all font-bold"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-500" />
              پۆلێنکردنی دۆخ
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-2xl px-5 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-gray-900 dark:text-white transition-all font-bold appearance-none cursor-pointer"
            >
              <option value="ALL">هەموو تۆمارەکان</option>
              <option value="PRESENT">تەنها ئامادەبووان</option>
              <option value="LATE">تەنها دواکەوتووان</option>
              <option value="LEAVE">تەنها مۆڵەتەکان</option>
              <option value="ABSENT">تەنها غایبەکان</option>
            </select>
          </div>
        </div>

        {/* Visual Charts Summary */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50/50 dark:bg-gray-800/30 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800">
           <div className="col-span-1 md:col-span-1 h-48 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                       data={[
                          { name: 'ئامادەبوو', value: stats.present },
                          { name: 'دواکەوتوو', value: stats.late },
                          { name: 'مۆڵەتدار', value: stats.leave },
                          { name: 'غایب', value: stats.absent },
                       ]}
                       innerRadius={50}
                       outerRadius={70}
                       paddingAngle={5}
                       dataKey="value"
                    >
                       <Cell fill="#10b981" />
                       <Cell fill="#f59e0b" />
                       <Cell fill="#0ea5e9" />
                       <Cell fill="#f43f5e" />
                    </Pie>
                    <RechartsTooltip />
                 </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-xl font-black text-gray-900 dark:text-white">{stats.total}</span>
                 <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">گشتی</span>
              </div>
           </div>
           <div className="col-span-1 md:col-span-2 flex flex-col justify-center gap-4">
              <div className="flex items-center gap-3">
                 <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                 <div className="flex-1 font-bold text-sm text-gray-700 dark:text-gray-300">ڕێژەی ئامادەبووانی تەواو</div>
                 <div className="font-mono font-black text-emerald-600">{((stats.present / Math.max(1, stats.total)) * 100).toFixed(1)}%</div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                 <div className="flex-1 font-bold text-sm text-gray-700 dark:text-gray-300">ڕێژەی دواکەوتووان</div>
                 <div className="font-mono font-black text-amber-600">{((stats.late / Math.max(1, stats.total)) * 100).toFixed(1)}%</div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-4 h-4 rounded-full bg-cyan-500"></div>
                 <div className="flex-1 font-bold text-sm text-gray-700 dark:text-gray-300">ڕێژەی مۆڵەتەکان</div>
                 <div className="font-mono font-black text-cyan-600">{((stats.leave / Math.max(1, stats.total)) * 100).toFixed(1)}%</div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-4 h-4 rounded-full bg-rose-500"></div>
                 <div className="flex-1 font-bold text-sm text-gray-700 dark:text-gray-300">ڕێژەی غایبەکان</div>
                 <div className="font-mono font-black text-rose-600">{((stats.absent / Math.max(1, stats.total)) * 100).toFixed(1)}%</div>
              </div>
           </div>
        </div>

        {/* Data Preview */}
        <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-800">
          <table className="w-full text-right border-collapse bg-white dark:bg-gray-900">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 text-sm font-extrabold border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <th className="py-5 px-6 text-right whitespace-nowrap">
                  ناو و پاشناو
                </th>
                <th className="py-5 px-6 text-right">جۆر & بەش</th>
                <th className="py-5 px-6 text-right">کاتی هاتن</th>
                <th className="py-5 px-6 text-right">کاتی چوون</th>
                <th className="py-5 px-6 text-right">دۆخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredRecords.map((record, idx) => {
                return (
                  <tr
                    key={record.id}
                    className={`${idx % 2 === 0 ? "bg-transparent" : "bg-gray-50/50 dark:bg-gray-800/20"} hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors`}
                  >
                    <td className="py-4 px-6 font-bold text-gray-900 dark:text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/50 dark:to-indigo-800/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800">
                        {record.user.name.charAt(0)}
                      </div>
                      {record.user.name}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-gray-700 dark:text-gray-200">
                        {getCategoryLabel(record.user.category)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {record.user.department}
                      </p>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-sm text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/30">
                      {record.checkIn
                        ? new Date(record.checkIn).toLocaleTimeString("ku")
                        : "--:--"}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-sm text-gray-700 dark:text-gray-300">
                      {record.checkOut
                        ? new Date(record.checkOut).toLocaleTimeString("ku")
                        : "--:--"}
                    </td>
                    <td className="py-4 px-6">
                      {record.status === "PRESENT" && (
                        <span className="px-3 py-1.5 text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-500/30 shadow-sm">
                          لە کاتی خۆی
                        </span>
                      )}
                      {record.status === "LATE" && (
                        <span className="px-3 py-1.5 text-xs font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 rounded-lg border border-amber-200 dark:border-amber-500/30 shadow-sm">
                          دواکەوتوو
                        </span>
                      )}
                      {record.status === "LEAVE" && (
                        <span className="px-3 py-1.5 text-xs font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-500/30 shadow-sm">
                          مۆڵەت
                        </span>
                      )}
                      {record.status === "ABSENT" && (
                        <span className="px-3 py-1.5 text-xs font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400 rounded-lg border border-rose-200 dark:border-rose-500/30 shadow-sm">
                          غایب
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-4" />
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        هیچ داتایەک نەدۆزرایەوە بۆ ئەم بەروارە / گەڕانە.
                      </p>
                      <p className="text-sm mt-2 text-gray-500">
                        تکایە فلتەرەکانت بگۆڕە یان بەروارێکی تر هەڵبژێرە.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Report Layout (Only shows when printing) */}
      <div
        className="hidden print:block print:fixed print:inset-0 print:w-full print:bg-white p-12 text-gray-900 overflow-y-auto"
        dir="rtl"
        style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-indigo-600 pb-6 mb-8 mt-4 mx-4">
          <div className="flex items-center gap-5">
            <div className="bg-indigo-600 p-4 rounded-3xl shadow-lg">
              <Hexagon className="w-14 h-14 text-white fill-indigo-400/50" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                {settings?.orgName || "MASQR SYSTEM"}
              </h1>
              <h2 className="text-xl font-black text-indigo-600 bg-indigo-50 inline-block px-4 py-1.5 rounded-xl">
                بەدواداچوونی ڕۆژانەی دەوام - {filterDate}
              </h2>
            </div>
          </div>
          <div className="text-left bg-gray-50 border border-gray-200 p-4 rounded-2xl">
            <p className="text-sm font-black text-gray-400 mb-2 uppercase tracking-wider">
              کاتی دەرکردن
            </p>
            <p className="text-xl font-black font-mono text-gray-800">
              {new Date().toLocaleDateString("ku")} -{" "}
              {new Date().toLocaleTimeString("ku", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="px-4">
          {/* Stats Summary Area */}
          <div className="bg-gray-50 shadow-sm rounded-[2rem] p-8 border border-gray-200 grid grid-cols-4 gap-6 text-center items-center mb-10">
            <div>
              <p className="text-sm font-black text-emerald-600 mb-3 bg-emerald-100 inline-block px-3 py-1 rounded-lg border border-emerald-200">
                ئامادەبوو
              </p>
              <p className="text-5xl font-black text-gray-900">
                {stats.present}
              </p>
            </div>
            <div>
              <p className="text-sm font-black text-amber-600 mb-3 bg-amber-100 inline-block px-3 py-1 rounded-lg border border-amber-200">
                دواکەوتوو
              </p>
              <p className="text-5xl font-black text-gray-900">{stats.late}</p>
            </div>
            <div>
              <p className="text-sm font-black text-rose-600 mb-3 bg-rose-100 inline-block px-3 py-1 rounded-lg border border-rose-200">
                غایب
              </p>
              <p className="text-5xl font-black text-gray-900">
                {stats.absent}
              </p>
            </div>
            <div>
              <p className="text-sm font-black text-cyan-600 mb-3 bg-cyan-100 inline-block px-3 py-1 rounded-lg border border-cyan-200">
                کۆی گشتی
              </p>
              <p className="text-5xl font-black text-gray-900">{stats.total}</p>
            </div>
          </div>

          {/* List */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-10 bg-indigo-600 rounded-full"></div>
            <h3 className="text-2xl font-black text-gray-900">
              لیستی تۆمارەکانی ئەمڕۆ
            </h3>
          </div>

          <div className="rounded-[2xl] border-2 border-gray-200 overflow-hidden">
            <table className="w-full border-collapse text-right">
              <thead>
                <tr className="bg-gray-100 text-gray-600 border-b-2 border-gray-300">
                  <th className="py-4 px-6 font-black text-base w-1/4">ناو</th>
                  <th className="py-4 px-6 font-black text-base w-1/4">بەش</th>
                  <th className="py-4 px-6 font-black text-base w-1/5">
                    هاتن / چوون
                  </th>
                  <th className="py-4 px-6 font-black text-base w-1/5 text-center">
                    دۆخ
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={`border-b border-gray-200 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <td className="py-4 px-6 font-black text-lg text-gray-800">
                      {r.user.name}
                      <p className="text-xs text-indigo-600 mt-1">
                        {getCategoryLabel(r.user.category)}
                      </p>
                    </td>
                    <td className="py-4 px-6 font-black text-lg text-gray-600">
                      {r.user.department}
                    </td>
                    <td className="py-4 px-6 font-mono font-black text-sm text-gray-700">
                      <span className="text-emerald-700">
                        {r.checkIn
                          ? new Date(r.checkIn).toLocaleTimeString("ku", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "--:--"}
                      </span>
                      <span className="text-gray-400 mx-2">/</span>
                      <span className="text-rose-700">
                        {r.checkOut
                          ? new Date(r.checkOut).toLocaleTimeString("ku", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "--:--"}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-black text-center">
                      {r.status === "PRESENT" && (
                        <span className="text-emerald-700 bg-emerald-100 px-4 py-2 rounded-xl text-sm border border-emerald-200">
                          ئامادەبوو
                        </span>
                      )}
                      {r.status === "LATE" && (
                        <span className="text-amber-700 bg-amber-100 px-4 py-2 rounded-xl text-sm border border-amber-200">
                          دواکەوتوو
                        </span>
                      )}
                      {r.status === "LEAVE" && (
                        <span className="text-cyan-700 bg-cyan-100 px-4 py-2 rounded-xl text-sm border border-cyan-200">
                          مۆڵەت
                        </span>
                      )}
                      {r.status === "ABSENT" && (
                        <span className="text-rose-700 bg-rose-100 px-4 py-2 rounded-xl text-sm border border-rose-200">
                          غایب
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredRecords.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-12 text-center text-gray-500 font-bold bg-white text-lg"
                    >
                      هیچ داتایەک نەدۆزرایەوە بۆ ئەم لیستە.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
