import React, { useState } from "react";
import { useAppStore } from "../hooks/useAppStore";
import { store } from "../store";
import {
  Plus,
  Trash2,
  Search,
  Users,
  X,
  UserCircle,
  QrCode,
  Hexagon,
  Printer,
  FileText,
  Grid,
  List as ListIcon,
  Filter,
  Download,
  Key,
  Smartphone,
  RefreshCw,
  Shield
} from "lucide-react";
import toast from "react-hot-toast";
import { User, Role, UserCategory } from "../types";
import { QRCodeSVG } from "qrcode.react";

export function UsersPage() {
  const { users, records, settings } = useAppStore();
  const themeColor = settings?.themeColor || "indigo";
  const getThemeColors = (color: string) => {
    switch(color) {
      case "rose":
        return {
          bgGrad: "from-rose-600 to-rose-800",
          border: "border-rose-100",
          text: "text-rose-600",
          solid: "#e11d48",
          light: "#fff1f2"
        };
      case "emerald":
        return {
          bgGrad: "from-emerald-600 to-emerald-800",
          border: "border-emerald-100",
          text: "text-emerald-600",
          solid: "#059669",
          light: "#ecfdf5"
        };
      case "cyan":
        return {
          bgGrad: "from-cyan-600 to-cyan-800",
          border: "border-cyan-100",
          text: "text-cyan-600",
          solid: "#0891b2",
          light: "#ecfeff"
        };
      default:
        return {
          bgGrad: "from-indigo-600 to-indigo-800",
          border: "border-indigo-100",
          text: "text-indigo-600",
          solid: "#4f46e5",
          light: "#f5f3ff"
        };
    }
  };
  const activeTheme = getThemeColors(themeColor);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"LIST" | "GRID">("LIST");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "USER" as Role,
    category: "TEACHER" as UserCategory,
    department: "",
    email: "",
    password: "",
  });

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [printMode, setPrintMode] = useState<"BADGE" | "REPORT" | "ALL_BADGES">("BADGE");

  const displayUsers = users.filter(
    (u) => u.role !== "KIOSK" && u.role !== "ADMIN",
  );
  
  const filteredUsers = displayUsers.filter(
    (u) => 
      (categoryFilter === "ALL" || u.category === categoryFilter) &&
      (u.name.includes(search) || u.department?.includes(search))
  );

  const handleExportExcel = () => {
    toast.success("بە سەرکەوتوویی هەناردە کرا بە فایلی Excel", { icon: "📊" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.department)
      return toast.error("تکایە هەموو زانیاریەکان پڕبکەرەوە");

    // Auto-generate password if email is provided but password is empty
    let finalPassword = formData.password;
    if (formData.email && !finalPassword) {
      finalPassword = Math.random().toString(36).substring(2, 8);
    }

    const submissionData = {
      ...formData,
      email: formData.email ? formData.email.trim().toLowerCase() : "",
      password: finalPassword,
    };

    store.addUser(submissionData as any);
    toast.success(
      formData.email
        ? `بەکارهێنەر زیاد کرا! پاسۆردی خۆکار: ${finalPassword}`
        : "بەکارهێنەر زیاد کرا بە سەرکەوتوویی",
      { duration: 6000 }
    );
    setIsModalOpen(false);
    setFormData({
      name: "",
      role: "USER" as Role,
      category: "TEACHER" as UserCategory,
      department: "",
      email: "",
      password: "",
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`دڵنیای لە سڕینەوەی ${name}؟`)) {
      store.deleteUser(id);
      toast.success("بەکارهێنەر سڕایەوە");
      if (selectedUser?.id === id) {
        setSelectedUser(null);
      }
    }
  };

  const getCategoryLabel = (cat?: string) => {
    if (cat === "EMPLOYEE") return "کارمەند";
    if (cat === "TEACHER") return "مامۆستا";
    if (cat === "STUDENT") return "قوتابی";
    return "-";
  };

  const getCategoryColor = (cat?: string) => {
    if (cat === "EMPLOYEE")
      return "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400";
    if (cat === "TEACHER")
      return "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-400";
    return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";
  };

  const allDates = Array.from(new Set(records.map((r) => r.date)));
  const totalWorkingDays = allDates.length;

  const selectedUserRecords = selectedUser
    ? records.filter((r) => r.userId === selectedUser.id)
    : [];
  const selectedUserPresent = selectedUserRecords.filter(
    (r) => r.status === "PRESENT",
  ).length;
  const selectedUserLate = selectedUserRecords.filter(
    (r) => r.status === "LATE",
  ).length;
  const selectedUserLeave = selectedUserRecords.filter(
    (r) => r.status === "LEAVE",
  ).length;
  const selectedUserAbsent = Math.max(
    0,
    totalWorkingDays - selectedUserRecords.length,
  );

  const userRecords = [...selectedUserRecords]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const handlePrint = (mode: "BADGE" | "REPORT") => {
    setPrintMode(mode);
    if (mode === "REPORT") {
      toast.success('کاتی چاپکردن "Save as PDF" هەڵبژێرە بۆ دابەزاندن', {
        icon: "🖨️",
        duration: 4000,
      });
    }
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10 relative print:hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-3 border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
            <Users className="w-4 h-4" />
            بەڕێوەبردنی سیستم
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
            بەڕێوەبردنی بەکارهێنەران
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 font-semibold">
            بەڕێوەبردنی کارمەندان، مامۆستایان، و قوتابیان بە ئاسانی
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <button
            onClick={() => handleExportExcel()}
            className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-gray-700 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 border border-gray-200 dark:border-gray-700 px-5 py-4 rounded-2xl font-black transition-all shadow-sm shrink-0"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">ئێکسڵ</span>
          </button>
          
          <button
            onClick={() => {
              setPrintMode("ALL_BADGES");
              setTimeout(() => window.print(), 300);
            }}
            className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-400 border border-gray-200 dark:border-gray-700 px-5 py-4 rounded-2xl font-black transition-all shadow-sm shrink-0"
          >
            <Printer className="w-5 h-5" />
            <span className="hidden sm:inline">گشت باجەکان</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-gray-900/20 dark:shadow-indigo-500/30 hover:shadow-2xl hover:-translate-y-1 relative z-10 shrink-0"
          >
            <Plus className="w-6 h-6" />
            <span>کەسی نوێ</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden relative print:hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-1/2 md:w-1/3">
            <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="گەڕان بۆ ناو یان بەش/پۆل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl pr-12 pl-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-gray-900 dark:text-white font-bold transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto mr-auto">
            <div className="relative flex-1 sm:flex-none">
              <Filter className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl pr-10 pl-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-gray-900 dark:text-white font-bold transition-all shadow-sm appearance-none"
              >
                 <option value="ALL">گشتی</option>
                 <option value="EMPLOYEE">کارمەندان</option>
                 <option value="TEACHER">مامۆستایان</option>
                 <option value="STUDENT">قوتابیان</option>
              </select>
            </div>
            
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewMode("LIST")}
                className={`p-2 rounded-xl transition-all ${viewMode === "LIST" ? "bg-white dark:bg-gray-700 text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
              >
                <ListIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("GRID")}
                className={`p-2 rounded-xl transition-all ${viewMode === "GRID" ? "bg-white dark:bg-gray-700 text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
              >
                <Grid className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {viewMode === "LIST" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-sm font-black border-b-2 border-gray-100 dark:border-gray-800 uppercase tracking-widest">
                  <th className="py-5 px-6 text-right">ناو و پاشناو</th>
                  <th className="py-5 px-6 text-right">جۆری بەکارهێنەر</th>
                  <th className="py-5 px-6 text-right">بەش / پۆل</th>
                  <th className="py-5 px-6 text-right w-24">کردارەکان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredUsers.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={`cursor-pointer ${idx % 2 === 0 ? "bg-transparent" : "bg-gray-50/50 dark:bg-gray-800/20"} hover:bg-indigo-50/80 dark:hover:bg-indigo-900/30 transition-all duration-300 group`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[1rem] bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/60 dark:to-indigo-800/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-black text-lg border-2 border-white dark:border-gray-900 shadow-sm transition-all duration-500 transform group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-md">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-black text-gray-900 dark:text-white text-lg group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors block leading-tight">
                            {user.name}
                          </span>
                          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 drop-shadow-sm">
                            ID: {user.id.substring(0, 6)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <span
                        className={`px-4 py-1.5 text-xs font-black rounded-xl shadow-sm border border-transparent ${getCategoryColor(user.category)}`}
                      >
                        {getCategoryLabel(user.category)}
                      </span>
                    </td>
                    <td className="py-5 px-6 font-black text-gray-600 dark:text-gray-300">
                      {user.department}
                    </td>
                    <td className="py-5 px-6">
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="p-3 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-[1rem] transition-all duration-300 shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-rose-200 active:scale-95 group-hover:bg-rose-50 dark:group-hover:bg-rose-900/20 group-hover:text-rose-500 group-hover:border-rose-200 dark:group-hover:border-rose-800"
                          title="سڕینەوە"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-20 text-center text-gray-500 font-bold bg-gray-50/50 dark:bg-gray-900/50"
                    >
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Users className="w-12 h-12 text-gray-300 dark:text-gray-700" />
                        <p className="text-lg">
                          هیچ بەکارهێنەرێک نەدۆزرایەوە بەم داتایە!
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 bg-gray-50/30 dark:bg-gray-900">
            {filteredUsers.map(user => (
              <div 
                key={user.id} 
                onClick={() => setSelectedUser(user)}
                className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col items-center text-center relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 dark:from-indigo-900/50 dark:to-blue-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-3xl mb-4 border-4 border-white dark:border-gray-800 shadow-md z-10">
                  {user.name.charAt(0)}
                </div>
                
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1 z-10 leading-tight">
                  {user.name}
                </h3>
                
                <p className="text-gray-500 dark:text-gray-400 font-bold text-sm mb-4 z-10 w-full truncate">
                  {user.department || "-"}
                </p>
                
                <div className="mt-auto w-full flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4 z-10">
                  <span className={`px-3 py-1 text-[10px] sm:text-xs font-black rounded-lg ${getCategoryColor(user.category)}`}>
                    {getCategoryLabel(user.category)}
                  </span>
                  
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(user.id, user.name); }}
                    className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center gap-3 text-gray-500">
                <Users className="w-12 h-12 text-gray-300 dark:text-gray-700" />
                <p className="text-lg font-bold">هیچ بەکارهێنەرێک نەدۆزرایەوە بەم داتایە!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Printable ID Card Layout (Only shows when printing and mode is BADGE) */}
      {selectedUser && printMode === "BADGE" && (
        <div
          className="hidden print:block print:fixed print:inset-0 print:w-full print:h-full print:bg-white"
          dir="rtl"
        >
          {/* Center the card precisely for cutting */}
          <div
            className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[54mm] h-[86mm] bg-white border border-gray-300 rounded-[3mm] overflow-hidden flex flex-col relative print:border-gray-400"
            style={{
              printColorAdjust: "exact",
              WebkitPrintColorAdjust: "exact",
            }}
          >
            {/* Top Corporate Graphic */}
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

            {/* Profile Avatar Overlay with themed background border */}
            <div className="absolute top-[18mm] left-1/2 -translate-x-1/2 w-[16mm] h-[16mm] bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100 z-20">
              <UserCircle className="w-14 h-14" style={{ color: activeTheme.solid }} />
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col items-center justify-start pt-7 px-3 bg-white pb-2 relative">
              {/* Subtle background grid lines for a secure-card watermark feel */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>
              <div className="absolute top-1/2 left-6 right-6 text-center text-[12px] font-mono tracking-widest font-black text-gray-500/5 rotate-[-25deg] pointer-events-none uppercase">
                SECURE QR PASS
              </div>

              {/* User Identity Details */}
              <div className="text-center w-full mb-1">
                <span className="text-[6px] text-gray-400 font-bold tracking-tight block uppercase leading-none">ناو / FULL NAME</span>
                <h1 className="text-[12px] font-black text-gray-900 leading-tight tracking-tight mt-0.5">
                  {selectedUser.name}
                </h1>
              </div>

              <div className="text-center w-full mb-2">
                <span className="text-[6px] text-gray-400 font-bold tracking-tight block uppercase leading-none">بەش / DEPARTMENT</span>
                <p className="text-[9px] font-black text-gray-600 mt-0.5 truncate max-w-full">
                  {selectedUser.department}
                </p>
              </div>

              {/* QR Code enclosed in scan-target framework */}
              <div className="relative p-1 bg-white mb-auto">
                {/* Camera Target Brackets */}
                <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 rounded-tl-[1px]" style={{ borderColor: activeTheme.solid }}></span>
                <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 rounded-tr-[1px]" style={{ borderColor: activeTheme.solid }}></span>
                <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 rounded-bl-[1px]" style={{ borderColor: activeTheme.solid }}></span>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 rounded-br-[1px]" style={{ borderColor: activeTheme.solid }}></span>

                <div className="p-1 bg-gray-50/60 rounded-md">
                  <QRCodeSVG
                    value={JSON.stringify({
                      masqr: true,
                      userId: selectedUser.id,
                    })}
                    size={80}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>

              {/* Bottom Row Information */}
              <div className="w-full flex items-center justify-between px-1 mt-1">
                {/* Card ID Indicator */}
                <div className="text-right">
                  <span className="text-[6px] text-gray-400 font-bold block leading-none">CARD ID / ناسنامە</span>
                  <span className="text-[8px] font-mono font-black text-gray-700">{selectedUser.id}</span>
                </div>

                {/* Secure Seal SVG or micro badge */}
                <div className="flex items-center gap-1 bg-gray-50/80 px-1.5 py-0.5 rounded border border-gray-100">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: activeTheme.solid }}></div>
                  <span className="text-[6px] font-black text-gray-500 uppercase font-sans tracking-wide">SECURE CONNECT</span>
                </div>
              </div>

              {/* Category Status tag */}
              <div className="w-full mt-2">
                <div 
                  className="py-1 text-center text-[7.5px] font-black uppercase tracking-widest border rounded-md"
                  style={{ 
                    color: selectedUser.category === "TEACHER" ? "#c026d3" : selectedUser.category === "STUDENT" ? "#2563eb" : "#0d9488",
                    borderColor: selectedUser.category === "TEACHER" ? "#f5d0fe" : selectedUser.category === "STUDENT" ? "#bfdbfe" : "#99f6e4",
                    backgroundColor: selectedUser.category === "TEACHER" ? "#fdf4ff" : selectedUser.category === "STUDENT" ? "#eff6ff" : "#f0fdfa"
                  }}
                >
                  {selectedUser.category === "STUDENT"
                    ? "قوتابی • STUDENT PASS"
                    : selectedUser.category === "TEACHER"
                      ? "مامۆستا • INSTRUCTOR PASS"
                      : "کارمەند • STAFF ACCESS"}
                </div>
              </div>
            </div>

            {/* Bottom Color Indicator Bar */}
            <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: activeTheme.solid }}></div>
          </div>
        </div>
      )}

      {/* Mass Print Badges Layout (Only shows when printing and mode is ALL_BADGES) */}
      {printMode === "ALL_BADGES" && (
        <div className="hidden print:block print:w-full" dir="rtl">
          <div className="grid grid-cols-3 xl:grid-cols-4 gap-[4mm] content-start justify-items-center">
             {filteredUsers.map((user) => (
               <div
                 key={user.id}
                 className="w-[54mm] h-[86mm] bg-white border border-gray-300 rounded-[3mm] overflow-hidden flex flex-col relative"
                 style={{ pageBreakInside: "avoid", printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
               >
                 {/* Top Corporate Graphic */}
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

                 {/* Profile Avatar Overlay with themed background border */}
                 <div className="absolute top-[18mm] left-1/2 -translate-x-1/2 w-[16mm] h-[16mm] bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100 z-20">
                   <UserCircle className="w-14 h-14" style={{ color: activeTheme.solid }} />
                 </div>

                 {/* Content Area */}
                 <div className="flex-1 flex flex-col items-center justify-start pt-7 px-3 bg-white pb-2 relative">
                   {/* Subtle background grid lines for a secure-card watermark feel */}
                   <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>
                   <div className="absolute top-1/2 left-6 right-6 text-center text-[12px] font-mono tracking-widest font-black text-gray-500/5 rotate-[-25deg] pointer-events-none uppercase">
                     SECURE QR PASS
                   </div>

                   {/* User Identity Details */}
                   <div className="text-center w-full mb-1">
                     <span className="text-[6px] text-gray-400 font-bold tracking-tight block uppercase leading-none">ناو / FULL NAME</span>
                     <h1 className="text-[12px] font-black text-gray-900 leading-tight tracking-tight mt-0.5">
                       {user.name}
                     </h1>
                   </div>

                   <div className="text-center w-full mb-2">
                     <span className="text-[6px] text-gray-400 font-bold tracking-tight block uppercase leading-none">بەش / DEPARTMENT</span>
                     <p className="text-[9px] font-black text-gray-600 mt-0.5 truncate max-w-full">
                       {user.department}
                     </p>
                   </div>

                   {/* QR Code enclosed in scan-target framework */}
                   <div className="relative p-1 bg-white mb-auto">
                     {/* Camera Target Brackets */}
                     <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 rounded-tl-[1px]" style={{ borderColor: activeTheme.solid }}></span>
                     <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 rounded-tr-[1px]" style={{ borderColor: activeTheme.solid }}></span>
                     <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 rounded-bl-[1px]" style={{ borderColor: activeTheme.solid }}></span>
                     <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 rounded-br-[1px]" style={{ borderColor: activeTheme.solid }}></span>

                     <div className="p-1 bg-gray-50/60 rounded-md">
                       <QRCodeSVG
                         value={JSON.stringify({
                           masqr: true,
                           userId: user.id,
                         })}
                         size={80}
                         level="H"
                         includeMargin={false}
                       />
                     </div>
                   </div>

                   {/* Bottom Row Information */}
                   <div className="w-full flex items-center justify-between px-1 mt-1">
                     {/* Card ID Indicator */}
                     <div className="text-right">
                       <span className="text-[6px] text-gray-400 font-bold block leading-none">CARD ID / ناسنامە</span>
                       <span className="text-[8px] font-mono font-black text-gray-700">{user.id}</span>
                     </div>

                     {/* Secure Seal SVG or micro badge */}
                     <div className="flex items-center gap-1 bg-gray-50/80 px-1.5 py-0.5 rounded border border-gray-100">
                       <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: activeTheme.solid }}></div>
                       <span className="text-[6px] font-black text-gray-500 uppercase font-sans tracking-wide">SECURE CONNECT</span>
                     </div>
                   </div>

                   {/* Category Status tag */}
                   <div className="w-full mt-2">
                     <div 
                       className="py-1 text-center text-[7.5px] font-black uppercase tracking-widest border rounded-md"
                       style={{ 
                         color: user.category === "TEACHER" ? "#c026d3" : user.category === "STUDENT" ? "#2563eb" : "#0d9488",
                         borderColor: user.category === "TEACHER" ? "#f5d0fe" : user.category === "STUDENT" ? "#bfdbfe" : "#99f6e4",
                         backgroundColor: user.category === "TEACHER" ? "#fdf4ff" : user.category === "STUDENT" ? "#eff6ff" : "#f0fdfa"
                       }}
                     >
                       {user.category === "STUDENT"
                         ? "قوتابی • STUDENT PASS"
                         : user.category === "TEACHER"
                           ? "مامۆستا • INSTRUCTOR PASS"
                           : "کارمەند • STAFF ACCESS"}
                     </div>
                   </div>
                 </div>

                 {/* Bottom Color Indicator Bar */}
                 <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: activeTheme.solid }}></div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* Printable Report Layout (Only shows when printing and mode is REPORT) */}
      {selectedUser && printMode === "REPORT" && (
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
                  ڕاپۆرتی فەرمی دەوام -{" "}
                  {getCategoryLabel(selectedUser.category)}
                </h2>
              </div>
            </div>
            <div className="text-left bg-gray-50 border border-gray-200 p-4 rounded-2xl">
              <p className="text-sm font-black text-gray-400 mb-2 uppercase tracking-wider">
                بەرواری دەرکردن
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
            {/* User Info & Summary */}
            <div className="grid grid-cols-3 gap-6 mb-10">
              <div className="col-span-1 bg-gray-50 shadow-sm rounded-[2rem] p-8 border border-gray-200">
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                  زانیاری کەسی
                </p>
                <p className="text-3xl font-black text-indigo-700 mb-3">
                  {selectedUser.name}
                </p>
                <p className="text-xl font-black text-gray-600 border-t border-gray-200 pt-3">
                  {selectedUser.department}
                </p>
              </div>
              <div className="col-span-2 bg-gray-50 shadow-sm rounded-[2rem] p-8 border border-gray-200 grid grid-cols-4 gap-4 text-center items-center">
                <div>
                  <p className="text-sm font-black text-emerald-600 mb-3 bg-emerald-100 inline-block px-3 py-1 rounded-lg">
                    ئامادەبوو
                  </p>
                  <p className="text-5xl font-black text-gray-900">
                    {selectedUserPresent}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-black text-amber-600 mb-3 bg-amber-100 inline-block px-3 py-1 rounded-lg">
                    دواکەوتوو
                  </p>
                  <p className="text-5xl font-black text-gray-900">
                    {selectedUserLate}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-black text-rose-600 mb-3 bg-rose-100 inline-block px-3 py-1 rounded-lg">
                    غایب
                  </p>
                  <p className="text-5xl font-black text-gray-900">
                    {selectedUserAbsent}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-black text-cyan-600 mb-3 bg-cyan-100 inline-block px-3 py-1 rounded-lg">
                    مۆڵەت
                  </p>
                  <p className="text-5xl font-black text-gray-900">
                    {selectedUserLeave}
                  </p>
                </div>
              </div>
            </div>

            {/* Records Table */}
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-10 bg-indigo-600 rounded-full"></div>
                <h3 className="text-2xl font-black text-gray-900">
                  تۆماری دەوامی ڕۆژانە
                </h3>
              </div>

              <div className="rounded-[2xl] border-2 border-gray-200 overflow-hidden">
                <table className="w-full border-collapse text-right">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 border-b-2 border-gray-300">
                      <th className="py-4 px-6 font-black text-base w-1/4">
                        بەروار
                      </th>
                      <th className="py-4 px-6 font-black text-base w-1/4">
                        کاتی هاتن
                      </th>
                      <th className="py-4 px-6 font-black text-base w-1/4">
                        کاتی چوون
                      </th>
                      <th className="py-4 px-6 font-black text-base w-1/4 text-center">
                        دۆخ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...selectedUserRecords]
                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime(),
                      )
                      .map((r, idx) => (
                        <tr
                          key={r.id}
                          className={`border-b border-gray-200 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                        >
                          <td className="py-4 px-6 font-mono font-black text-lg text-gray-800">
                            {r.date}
                          </td>
                          <td className="py-4 px-6 font-mono font-black text-lg text-emerald-700">
                            {r.checkIn
                              ? new Date(r.checkIn).toLocaleTimeString("ku", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "تۆمار نەکراوە"}
                          </td>
                          <td className="py-4 px-6 font-mono font-black text-lg text-rose-700">
                            {r.checkOut
                              ? new Date(r.checkOut).toLocaleTimeString("ku", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "تۆمار نەکراوە"}
                          </td>
                          <td className="py-4 px-6 font-black text-center">
                            {r.status === "PRESENT" && (
                              <span className="text-emerald-700 bg-emerald-100 px-4 py-2 rounded-xl text-sm border border-emerald-200">
                                لە کاتی خۆی
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
                    {selectedUserRecords.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-12 text-center text-gray-500 font-bold bg-white text-lg"
                        >
                          هیچ تۆمارێکی دەوام بوونی نییە بۆ ئەم بەکارهێنەرە.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-200 print:hidden"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-4xl shadow-2xl relative animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-6 left-6 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-rose-100 hover:text-rose-600 transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left/Top Side: Profile & QR Card */}
            <div className={`w-full md:w-2/5 bg-gradient-to-br ${activeTheme.bgGrad} p-10 text-white flex flex-col items-center justify-center text-center relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-[60px] -ml-20 -mb-20 pointer-events-none"></div>

              <div className="w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center font-black text-5xl mb-6 shadow-2xl border-4 border-white/20 relative z-10 transition-transform hover:scale-105" style={{ color: activeTheme.solid }}>
                {selectedUser.name.charAt(0)}
              </div>

              <h3 className="text-3xl font-black mb-2 relative z-10 drop-shadow-sm">
                {selectedUser.name}
              </h3>
              <span className="px-4 py-1.5 bg-black/25 backdrop-blur-md rounded-xl text-xs font-black mb-8 uppercase tracking-widest relative z-10 shadow-inner border border-white/15 text-white">
                {getCategoryLabel(selectedUser.category)}
              </span>

              <div className="bg-white p-4 rounded-[2rem] shadow-2xl relative group mb-8 border border-white/10 transform transition-all hover:scale-105">
                <QRCodeSVG
                  value={JSON.stringify({
                    masqr: true,
                    userId: selectedUser.id,
                  })}
                  size={180}
                  level="H"
                  includeMargin={true}
                  className="rounded-[1.5rem]"
                />
                <div
                  className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-[2rem] backdrop-blur-sm cursor-pointer"
                  onClick={() => handlePrint("BADGE")}
                >
                  <QrCode className="w-12 h-12 drop-shadow-md mb-2" style={{ color: activeTheme.solid }} />
                  <span className="font-extrabold text-sm" style={{ color: activeTheme.solid }}>
                    چاپکردن
                  </span>
                </div>
              </div>

              <button
                onClick={() => handlePrint("BADGE")}
                className="w-full max-w-[200px] flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 px-6 py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95 z-10"
                style={{ color: activeTheme.solid }}
              >
                <Printer className="w-5 h-5 drop-shadow-sm" />
                <span>دابەزاندنی باج</span>
              </button>
            </div>

            {/* Right/Bottom Side: Data */}
            <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col bg-gray-50/50 dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h4 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                  <UserCircle className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-500" />
                  زانیاری و تۆماری دەوام
                </h4>
                <button
                  onClick={() => handlePrint("REPORT")}
                  className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 px-5 py-3 rounded-2xl font-bold transition-all shadow-sm border border-emerald-200 dark:border-emerald-500/30 w-full sm:w-auto"
                >
                  <FileText className="w-5 h-5" />
                  <span>ڕاپۆرتی PDF</span>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-[1.5rem] border border-gray-100 dark:border-gray-700 shadow-sm text-center transition-all hover:shadow-md">
                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mb-2 uppercase tracking-wider">
                    ئامادەبوو
                  </p>
                  <p className="font-black text-gray-900 dark:text-white text-2xl drop-shadow-sm">
                    {selectedUserPresent}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-[1.5rem] border border-gray-100 dark:border-gray-700 shadow-sm text-center transition-all hover:shadow-md">
                  <p className="text-xs font-black text-amber-600 dark:text-amber-400 mb-2 uppercase tracking-wider">
                    دواکەوتوو
                  </p>
                  <p className="font-black text-gray-900 dark:text-white text-2xl drop-shadow-sm">
                    {selectedUserLate}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-[1.5rem] border border-gray-100 dark:border-gray-700 shadow-sm text-center transition-all hover:shadow-md">
                  <p className="text-xs font-black text-rose-600 dark:text-rose-400 mb-2 uppercase tracking-wider">
                    غایب
                  </p>
                  <p className="font-black text-gray-900 dark:text-white text-2xl drop-shadow-sm">
                    {selectedUserAbsent}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-[1.5rem] border border-gray-100 dark:border-gray-700 shadow-sm text-center transition-all hover:shadow-md">
                  <p className="text-xs font-black text-cyan-600 dark:text-cyan-400 mb-2 uppercase tracking-wider">
                    مۆڵەت
                  </p>
                  <p className="font-black text-gray-900 dark:text-white text-2xl drop-shadow-sm">
                    {selectedUserLeave}
                  </p>
                </div>
              </div>

              {/* Employee Account Credentials & Device Session Controller */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm mb-8">
                <h5 className="font-black text-gray-900 dark:text-white mb-4 text-lg flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-500" />
                  بروانامەی چوونەژوورەوەی پۆرتتاڵ و ئامێر
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-2xl flex flex-col justify-center">
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-tight block mb-1">ئیمەیڵی چوونەژوورەوە</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200 select-all font-mono break-all">
                      {selectedUser.email || "بێ ئیمەیڵ / نەبەستراوە"}
                    </span>
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-tight block mt-3 mb-1">وشەی تێپەڕ (Password)</span>
                    <span className="font-mono font-bold text-gray-800 dark:text-gray-200 select-all tracking-wider">
                      {selectedUser.password || "بێ پاسۆرد / نەبەستراوە"}
                    </span>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-black text-gray-400 uppercase tracking-tight block mb-1">بارودۆخی قوفڵی ئامێر</span>
                      {selectedUser.deviceId ? (
                        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mt-1 font-black text-xs">
                          <Shield className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>تەنها لەسەر ١ مۆبایل چالاک کراوە</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mt-1 font-black text-xs">
                          <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>🔓 ئامادەیە بۆ بەستنەوەی مۆبایلی نوێ</span>
                        </div>
                      )}
                      
                      <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                        بۆ ڕێگریکردن لە تۆمارکردنی ئامادەبوونی یەکتر، هەر یوزەر تەنها دەتوانێت لەسەر یەک مۆبایل کار بکات.
                      </p>
                    </div>

                    {selectedUser.deviceId && (
                      <button
                        onClick={async () => {
                          if (confirm("دڵنیای لە سەرەتامانکردنەوەی قوفڵی ئامێری ئەم بەکارهێنەرە؟ بەم شێوەیە دەتوانێت هەژمارەکەی لەسەر مۆبایلێکی نوێ بکاتەوە.")) {
                            await store.resetDeviceLock(selectedUser.id);
                            // Refresh selection instance so UI reflects changes
                            const updated = store.getState().users.find(u => u.id === selectedUser.id);
                            if (updated) setSelectedUser(updated);
                            toast.success("قوفڵی ئامێر بە سەرکەوتوویی لاپەسند کرا");
                          }
                        }}
                        className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 text-xs font-black rounded-xl border border-rose-100 dark:border-rose-500/30 transition-all active:scale-95 shadow-sm"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>سەرەتامانکردنەوەی قوفڵی ئامێر</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
                <h5 className="font-black text-gray-900 dark:text-white mb-6 text-xl">
                  دواین تۆمارەکان
                </h5>
                {userRecords.length > 0 ? (
                  <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                    {userRecords.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/80 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 transition-colors hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20"
                      >
                        <span className="font-black font-mono text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                          {r.date}
                        </span>
                        <div className="flex items-center gap-2 text-sm font-bold">
                          {r.checkIn && (
                            <span className="text-emerald-700 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-500/30">
                              هاتن{" "}
                              {new Date(r.checkIn).toLocaleTimeString("ku", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                          {r.checkOut && (
                            <span className="text-rose-700 bg-rose-100 dark:bg-rose-500/20 dark:text-rose-400 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-500/30">
                              چوون{" "}
                              {new Date(r.checkOut).toLocaleTimeString("ku", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                          {!r.checkIn && !r.checkOut && (
                            <span className="text-gray-400 px-2 font-bold bg-gray-100 dark:bg-gray-800 py-1.5 rounded-lg">
                              تۆمار نەکراوە
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[2rem] bg-gray-50/50 dark:bg-gray-900/50">
                    <UserCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-bold text-lg">
                      هیچ تۆمارێکی دەوام بوونی نیە.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">
              زیادکردنی کەسی نوێ
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  ناوی تەواوەتی
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-indigo-500 rounded-2xl px-5 py-3 outline-none focus:ring-4 focus:ring-indigo-500/10 text-gray-900 dark:text-white font-bold transition-all"
                  placeholder="ناو و پاشناو بنووسە..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  جۆری بەشداربوو
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-indigo-500 rounded-2xl px-5 py-3 outline-none focus:ring-4 focus:ring-indigo-500/10 text-gray-900 dark:text-white font-bold transition-all appearance-none"
                >
                  <option value="TEACHER">مامۆستا</option>
                  <option value="EMPLOYEE">کارمەند</option>
                  <option value="STUDENT">قوتابی</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  بەش یان پۆل
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-indigo-500 rounded-2xl px-5 py-3 outline-none focus:ring-4 focus:ring-indigo-500/10 text-gray-900 dark:text-white font-bold transition-all"
                  placeholder="نموونە: بەشی کۆمپیوتەر یان پۆلی ١٢"
                />
              </div>

              {/* Password credentials creation for App login */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 block mb-1">حساب بۆ ئەم کەسە دروست بکە (ئارەزوومەندانە)</span>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    ئیمەیڵی چوونەژوورەوە
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-indigo-500 rounded-2xl px-5 py-2.5 outline-none focus:ring-4 focus:ring-indigo-500/10 text-gray-900 dark:text-white font-semibold transition-all text-left"
                    placeholder="email@example.com"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    وشەی تێپەڕ (Password)
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-indigo-500 rounded-2xl px-5 py-2.5 outline-none focus:ring-4 focus:ring-indigo-500/10 text-gray-900 dark:text-white font-semibold transition-all text-left"
                    placeholder="ئەگەر بەتاڵ بێت خۆکار دروست دەبێت"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-5 py-3.5 rounded-2xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  لابردن
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-3.5 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                >
                  پاشەکەوتکردن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
