import React, { useState } from "react";
import { useAppStore } from "../hooks/useAppStore";
import { store } from "../store";
import { Hexagon, Lock, Mail, User as UserIcon, Loader2 } from "lucide-react";
import { auth, db } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";

export function LoginPage() {
  const { users } = useAppStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize device ID footprint once
  React.useEffect(() => {
    let dev = localStorage.getItem("MASQR_DEVICE_ID");
    if (!dev) {
      dev = "mobi_" + Math.random().toString(36).substring(2, 15) + "_" + Date.now().toString(36);
      localStorage.setItem("MASQR_DEVICE_ID", dev);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      toast.error("تکایە سەرجەم خانەکان پڕبکەرەوە");
      return;
    }

    setLoading(true);
    try {
      const timeoutReq = (promise: Promise<any>, timeMsg: string) => {
        return Promise.race([
          promise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(timeMsg)), 10000),
          ),
        ]);
      };

      if (isLogin) {
        // 1. Check if user is a matched employee/teacher with preset email and password in Firestore
        const matchedUser = users.find(
          (u) =>
            u.email?.toLowerCase().trim() === email.toLowerCase().trim() &&
            u.password === password
        );

        if (matchedUser) {
          const currentDeviceId = localStorage.getItem("MASQR_DEVICE_ID") || "dev_" + Date.now();
          
          // Enforce SINGLE device access restriction
          if (matchedUser.deviceId && matchedUser.deviceId !== "" && matchedUser.deviceId !== currentDeviceId) {
            toast.error("ئەم هەژمارە تەنها لەسەر یەک مۆبایل کار دەکات و پێشتر لەسەر مۆبایلێکی تر چالاککراوە! تکایە پەیوەندی بە بەڕێوەبەر بکە.", {
              duration: 6000
            });
            setLoading(false);
            return;
          }

          // Lock on first login to this specific device ID
          if (!matchedUser.deviceId || matchedUser.deviceId === "") {
            await store.updateUserDevice(matchedUser.id, currentDeviceId);
            toast.success("ئەم مۆبایلە بە سەرکەوتوویی بەسترایەوە بەم هەژمارەوە.");
          }

          store.setActiveUser(matchedUser.id);
          toast.success("بە سەرکەوتوویی چوویتە پۆرتتاڵ");
          setLoading(false);
          return;
        }

        // Fallback to standard Firebase authentication
        await timeoutReq(
          signInWithEmailAndPassword(auth, email, password),
          "کێشە لە هێڵی ئینتەرنێت هەیە.",
        );
        toast.success("بە سەرکەوتوویی چوویتە ژوورەوە");
      } else {
        const userCredential = await timeoutReq(
          createUserWithEmailAndPassword(auth, email, password),
          "کێشە لە دروستکردنی هەژمار هەیە. کات تەواو بوو.",
        );

        // If users array is empty, this is the first user -> ADMIN
        const isFirstUser = users.length === 0;
        const role = isFirstUser ? "ADMIN" : "USER";

        await timeoutReq(
          setDoc(doc(db, "users", userCredential.user.uid), {
            name,
            role,
            category: "EMPLOYEE",
            department: isFirstUser ? "بەڕێوەبردن" : "گشتی",
          }),
          "تکایە داتابەیسی Firestore چالاک بکە لە Firebase Console بۆ ئەوەی داتاکە خەزن ببێت.",
        );

        toast.success("هەژمارەکەت بە سەرکەوتوویی دروستکرا");
      }
    } catch (error: any) {
      console.error(error);
      const msg =
        error?.message ||
        (typeof error === "string" ? error : "هەڵەیەک ڕوویدا");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative overflow-hidden"
      dir="rtl"
    >
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full"></div>
            <Hexagon className="w-16 h-16 text-indigo-600 fill-indigo-100 relative z-10" />
          </div>
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3 drop-shadow-sm">
          سیستەمی MASQR
        </h1>
        <p className="text-lg text-gray-500 font-bold max-w-sm mx-auto">
          سکانەری زیرەک و بەڕێوەبردنی ئامادەبوونی پرۆفیشناڵ
        </p>
      </div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-2xl border border-white relative z-10 animate-in zoom-in-95 duration-500">
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-8">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${isLogin ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            چوونەژوورەوە
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${!isLogin ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            خۆتۆمارکردن
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="text-sm font-black text-gray-700 block mb-2">
                ناوی تەواو
              </label>
              <div className="relative">
                <UserIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ناوت بنووسە"
                  className="w-full bg-gray-50 border-2 border-transparent hover:border-gray-200 focus:border-indigo-500 rounded-2xl pr-12 pl-5 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 text-gray-900 font-bold transition-all shadow-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-black text-gray-700 block mb-2">
              ئیمەیڵ
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                dir="ltr"
                className="w-full bg-gray-50 border-2 border-transparent hover:border-gray-200 focus:border-indigo-500 rounded-2xl pr-12 pl-5 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 text-gray-900 font-bold transition-all shadow-sm text-left"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-black text-gray-700 block mb-2">
              وشەی تێپەڕ
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full bg-gray-50 border-2 border-transparent hover:border-gray-200 focus:border-indigo-500 rounded-2xl pr-12 pl-5 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 text-gray-900 font-bold tracking-widest transition-all shadow-sm text-left"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-gray-900/20 hover:shadow-2xl hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:pointer-events-none mt-4"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : isLogin ? (
              "چوونەژوورەوە"
            ) : (
              "خۆتۆمارکردن"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
