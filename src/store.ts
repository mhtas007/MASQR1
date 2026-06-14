import {
  User,
  AttendanceRecord,
  AppState,
  Status,
  UserCategory,
  Role,
} from "./types";
import { db, auth, secondaryAuth } from "./lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import toast from "react-hot-toast";

const STORAGE_KEY = "MASQR_STATE";

const defaultSettings = {
  orgName: "قوتابخانەی نموونەیی",
  lateTime: "08:30",
  weekendDays: ["Friday", "Saturday"],
  kioskTimeout: 10,
  enableSound: true,
  holidays: [] as { id: string; date: string; name: string }[],
};

function getInitialState(): AppState {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        activeUserId: parsed.activeUserId || null,
        settings: { ...defaultSettings, ...(parsed.settings || {}) },
        auditLogs: parsed.auditLogs || [],
      };
    } catch {
      // fallback
    }
  }
  return {
    users: [],
    records: [],
    activeUserId: null,
    settings: defaultSettings,
    auditLogs: [],
  };
}

let state: AppState = getInitialState();
const listeners = new Set<() => void>();

let initialized = false;

export const store = {
  getState: () => state,

  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  initFirebase: () => {
    if (initialized) return;
    initialized = true;

    // Listeners for collections
    try {
      onSnapshot(
        collection(db, "users"),
        (snapshot) => {
          const users = snapshot.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as User,
          );
          store.setState({ users });
        },
        (error) => {
          console.error("Firestore Users Error:", error);
        },
      );
    } catch (e) {
      console.error("Could not set up user listeners:", e);
    }

    try {
      onSnapshot(
        collection(db, "records"),
        (snapshot) => {
          const records = snapshot.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as AttendanceRecord,
          );
          store.setState({ records });
        },
        (error) => {
          console.error("Firestore Records Error:", error);
        },
      );
    } catch (e) {
      console.error("Could not set up records listeners:", e);
    }

    try {
      onSnapshot(
        collection(db, "audit_logs"),
        (snapshot) => {
          const auditLogs = snapshot.docs
            .map((d) => ({ id: d.id, ...d.data() }) as any)
            .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
            .slice(0, 100);
          store.setState({ auditLogs });
        },
        (error) => {
          console.error("Firestore Audit Logs Error:", error);
        },
      );
    } catch (e) {
      console.error("Could not set up audit logs listeners:", e);
    }

    try {
      onSnapshot(
        doc(db, "settings", "global"),
        (snapshot) => {
          if (snapshot.exists()) {
            store.setState({
              settings: { ...defaultSettings, ...snapshot.data() } as any,
            });
          } else {
            // Create default settings if not exists
            setDoc(doc(db, "settings", "global"), defaultSettings).catch(
              console.error,
            );
          }
        },
        (error) => {
          console.error("Firestore Settings Error:", error);
        },
      );
    } catch(e) {
      console.error("Could not set up settings listeners", e);
    }

    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Set immediately so the UI transitions away from LoginPage
        store.setActiveUser(firebaseUser.uid);

        let userDoc: any = null;
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 4000)
          );
          userDoc = (await Promise.race([
            getDoc(userRef),
            timeoutPromise,
          ])) as any;
        } catch (err: any) {
          console.warn("Firestore GET failed or timed out. Falling back to local state.", err);
        }

        if (!userDoc || !userDoc.exists()) {
          console.log("No user doc found for auth user or Firestore offline. Creating fallback.");
          const newUserData: User = {
            id: firebaseUser.uid,
            name: firebaseUser.email?.split("@")[0] || "New User",
            role: "ADMIN",
            category: "EMPLOYEE",
            department: "بەڕێوەبردن",
          };
          
          store.setState({
            users: [...state.users.filter((u) => u.id !== firebaseUser.uid), newUserData],
          });
          
          try {
            const userRef = doc(db, "users", firebaseUser.uid);
            await setDoc(userRef, newUserData);
          } catch (e: any) {
            console.error("Failed to create user doc on Firestore:", e);
          }
        } else {
          const data = userDoc.data() as User;
          if (data.role !== "ADMIN") {
            try {
              const userRef = doc(db, "users", firebaseUser.uid);
              await setDoc(userRef, { role: "ADMIN" }, { merge: true });
              data.role = "ADMIN";
            } catch (e) {
              console.error("Could not upgrade user to ADMIN:", e);
            }
          }
          store.setState({
            users: [
              ...state.users.filter((u) => u.id !== firebaseUser.uid),
              { id: userDoc.id, ...data } as User,
            ],
          });
        }

        store.setActiveUser(firebaseUser.uid);

      } else {
        const storedStore = localStorage.getItem(STORAGE_KEY);
        if (storedStore) {
           try {
              const parsed = JSON.parse(storedStore);
              if (parsed.activeUserId) {
                 const currentUid = parsed.activeUserId;
                 // If the stored user is definitely an admin, we clear. 
                 // We don't have users loaded maybe, so we can't reliably check 'u.role'. 
                 // So we don't clear it automatically on null auth state right away, 
                 // only clear if we are explicitly logging out. 
              } else {
                 store.setActiveUser(null);
              }
           } catch { store.setActiveUser(null); }
        } else {
           store.setActiveUser(null);
        }
      }
    });
  },

  setActiveUser: (id: string | null) => {
    store.setState({ activeUserId: id });
  },

  setState: (newState: Partial<AppState>) => {
    state = { ...state, ...newState };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    listeners.forEach((l) => l());
  },

  addAuditLog: async (action: string) => {
    const newLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2,6)}`,
      action,
      timestamp: new Date().toISOString(),
    };
    const currentLogs = state.auditLogs || [];
    const updatedLogs = [newLog, ...currentLogs].slice(0, 50);

    store.setState({
      auditLogs: updatedLogs,
    });

    try {
      await setDoc(doc(db, "audit_logs", newLog.id), newLog);
    } catch (e) {
      console.error("Failed to add audit log to Firestore:", e);
    }
  },

  addUser: async (user: Omit<User, "id">) => {
    let newId = `u${Date.now()}`;
    
    // First, try to create the user in Firebase Auth if email and password are provided
    if (user.email && user.password) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          secondaryAuth,
          user.email.trim(),
          user.password
        );
        newId = userCredential.user.uid;
      } catch (authError: any) {
        console.error("Firebase Auth creation failed:", authError);
        // Continue creating as a normal local Firebase DB user if auth creation fails
        // For example if email is already in use, or password too weak. 
        if (authError.code === "auth/email-already-in-use") {
          toast.error("ئەم ئیمەیڵە پێشتر بەکارهاتووە لە سیستەمەکەدا", { icon: "❌" });
          throw authError; // We should not proceed to save to DB because it's a conflict
        }
      }
    }

    const newUser: User = { id: newId, ...user };

    // 1. Update local state immediately for instant feedback
    store.setState({
      users: [...state.users, newUser],
    });

    store.addAuditLog(`زیادکردنی کەسی نوێ: ${newUser.name} (${newUser.department || "گشتی"})`);

    // 2. Persist to Firestore asynchronously
    try {
      await setDoc(doc(db, "users", newId), newUser);
    } catch (e: any) {
      console.error("Failed to add user to Firestore:", e);
      if (e.code === "permission-denied" || e.message?.includes("Missing or insufficient permissions")) {
         toast.error("کێشە لە کۆدەکانی فایربەیس هەیە! تکایە ڕێساکانی Firestore بکە بە allow read, write: if true", { duration: 8000 });
      }
      // Revert the local addition because it failed online
      store.setState({
         users: state.users.filter(u => u.id !== newId)
      });
      throw e;
    }
  },

  resetDeviceLock: async (userId: string) => {
    const updatedUsers = state.users.map((u) => {
      if (u.id === userId) {
        return { ...u, deviceId: "" };
      }
      return u;
    });

    store.setState({ users: updatedUsers });
    store.addAuditLog(`سەرەتامانکردنەوەی قوفڵی ئامێری بەکارهێنەر: ${userId}`);

    try {
      await setDoc(doc(db, "users", userId), { deviceId: "" }, { merge: true });
    } catch (e) {
      console.error("Failed to reset device lock in Firestore:", e);
    }
  },

  updateUserDevice: async (userId: string, deviceId: string) => {
    const updatedUsers = state.users.map((u) => {
      if (u.id === userId) {
        return { ...u, deviceId };
      }
      return u;
    });

    store.setState({ users: updatedUsers });
    try {
      await setDoc(doc(db, "users", userId), { deviceId }, { merge: true });
    } catch (e) {
      console.error("Failed to save device footprint on Firestore:", e);
    }
  },

  deleteUser: async (id: string) => {
    const targetUser = state.users.find((u) => u.id === id);
    const userName = targetUser ? targetUser.name : id;

    // 1. Update local state immediately
    store.setState({
      users: state.users.filter((u) => u.id !== id),
    });

    store.addAuditLog(`سڕینەوەی بەکارهێنەر: ${userName}`);

    // 2. Delete from Firestore asynchronously
    try {
      await deleteDoc(doc(db, "users", id));
    } catch (e: any) {
      console.error("Failed to delete user from Firestore:", e);
      if (e.code === "permission-denied" || e.message?.includes("Missing or insufficient permissions")) {
         toast.error("تکایە دڵنیابە کە ڕێساکانی Firestore کراون بە allow read, write: if true", { duration: 8000 });
      }
      if (targetUser) {
        store.setState({ users: [...state.users, targetUser] });
      }
      throw e;
    }
  },

  updateSettings: async (settings: any) => {
    const oldSettings = state.settings;
    // 1. Update local state immediately
    store.setState({
      settings: { ...state.settings, ...settings },
    });

    store.addAuditLog(`نوێکردنەوەی ڕێکخستنەکانی سیتەم`);

    // 2. Save to Firestore asynchronously
    try {
      await setDoc(doc(db, "settings", "global"), settings, { merge: true });
    } catch (e: any) {
      console.error("Failed to update settings in Firestore:", e);
      if (e.code === "permission-denied" || e.message?.includes("Missing or insufficient permissions")) {
         toast.error("هەڵەی فایربەیس! ڕێساکانی داتابەیس ڕێگە بە خەزنکردنی ڕێکخستنەکان نادەن.", { duration: 6000 });
      }
      store.setState({ settings: oldSettings });
      throw e;
    }
  },

  handleScan: async (
    userId: string,
  ): Promise<{ success: boolean; message: string; user?: User }> => {
    const user = state.users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, message: "بەکارهێنەر نەدۆزرایەوە!" };
    }

    const todayDate = new Date().toISOString().split("T")[0];
    const existingRecord = state.records.find(
      (r) => r.userId === userId && r.date === todayDate,
    );

    const now = new Date();
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const currentDayName = dayNames[now.getDay()];

    if (state.settings?.weekendDays?.includes(currentDayName)) {
      return {
        success: false,
        message: "ئەمڕۆ پشووی کۆتایی هەفتەیە، ناتوانیت دەوام تۆمار بکەیت!",
        user,
      };
    }

    const todayDateStr = now.toISOString().split("T")[0];
    const matchedHoliday = state.settings?.holidays?.find(h => h.date === todayDateStr);
    if (matchedHoliday) {
      return {
        success: false,
        message: `ئەمڕۆ بەهۆی (${matchedHoliday.name}) پشووی فەرمییە، ناتوانیت دەوام تۆمار بکەیت!`,
        user,
      };
    }

    let isLate = false;
    const [lateH, lateM] = (state.settings?.lateTime || "08:30")
      .split(":")
      .map(Number);
    if (!isNaN(lateH) && !isNaN(lateM)) {
      isLate =
        now.getHours() > lateH ||
        (now.getHours() === lateH && now.getMinutes() > lateM);
    }

    if (existingRecord) {
      if (existingRecord.checkOut) {
        return {
          success: false,
          message: "ئەمڕۆ هەردوو هاتن و چوونت تۆمار کردووە!",
          user,
        };
      }

      const updatedRecord = { ...existingRecord, checkOut: now.toISOString() };

      // Update local state immediately
      store.setState({
        records: state.records.map((r) => r.id === existingRecord.id ? updatedRecord : r),
      });

      store.addAuditLog(`تۆمارکردنی چوونی دەرەوە: ${user.name} (${user.department})`);

      try {
        await setDoc(doc(db, "records", existingRecord.id), updatedRecord);
        
        // Auto Telegram Message
        if (state.settings?.enableTelegramNotify && state.settings.telegramBotToken && state.settings.telegramChatId) {
          const checkOutTime = new Date(now).toLocaleTimeString("ku-IQ", { hour: "2-digit", minute: "2-digit" });
          const msg = `📤 <b>چوونی دەرەوە تۆمارکرا</b>\n\n👤 کارمەند: <b>${user.name}</b>\n⏱ کات: <code>${checkOutTime}</code>\n🏢 بەش: ${user.department}`;
          fetch(`https://api.telegram.org/bot${state.settings.telegramBotToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: state.settings.telegramChatId, text: msg, parse_mode: "HTML" })
          }).catch(console.error);
        }
      } catch (e) {
        console.error("Failed to update record on Firestore:", e);
      }

      return {
        success: true,
        message: `خوات لەگەڵ ${user.name}، چوونت تۆمار کرا.`,
        user,
      };
    } else {
      const newId = `r${Date.now()}`;
      const newRecord: AttendanceRecord = {
        id: newId,
        userId,
        date: todayDate,
        checkIn: now.toISOString(),
        checkOut: null,
        status: isLate ? "LATE" : "PRESENT",
      };

      // Update local state immediately
      store.setState({
        records: [...state.records, newRecord],
      });

      store.addAuditLog(`تۆمارکردنی هاتنی دەوام: ${user.name} (${user.department}) - ${isLate ? "دواکەوتوو" : "ئامادەبوو"}`);

      try {
        await setDoc(doc(db, "records", newId), newRecord);

        // Auto Telegram Message
        if (state.settings?.enableTelegramNotify && state.settings.telegramBotToken && state.settings.telegramChatId) {
          const checkInTime = new Date(now).toLocaleTimeString("ku-IQ", { hour: "2-digit", minute: "2-digit" });
          const statusTxt = isLate ? "⏳ دواکەوتوو" : "✅ لەکاتی خۆی";
          const msg = `📥 <b>هاتنی دەوام تۆمارکرا</b>\n\n👤 کارمەند: <b>${user.name}</b>\n⏱ کات: <code>${checkInTime}</code>\n📊 دۆخ: ${statusTxt}\n🏢 بەش: ${user.department}`;
          fetch(`https://api.telegram.org/bot${state.settings.telegramBotToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: state.settings.telegramChatId, text: msg, parse_mode: "HTML" })
          }).catch(console.error);
        }
      } catch (e) {
        console.error("Failed to save record to Firestore:", e);
      }

      return {
        success: true,
        message: `بەخێربێیت ${user.name}، هاتنت تۆمار کرا.${isLate ? " تێبینی: دواکەوتوویت." : ""}`,
        user,
      };
    }
  },
};
