import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { ScannerPage } from "./pages/ScannerPage";
import { UsersPage } from "./pages/UsersPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { UserPortal } from "./pages/UserPortal";
import { KioskScanner } from "./pages/KioskScanner";
import { LoginPage } from "./pages/LoginPage";
import { DeviceDashboard } from "./pages/DeviceDashboard";
import { useAppStore } from "./hooks/useAppStore";
import { store } from "./store";

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    store.initFirebase();
    // A small delay to allow Firebase Auth to check state
    // and snapshots to load before rendering the restricted router
    const timer = setTimeout(() => setIsInitializing(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const { activeUserId, users } = useAppStore();
  const activeUser = users.find((u) => u.id === activeUserId);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!activeUserId) {
    return <LoginPage />;
  }

  // If we have an activeUserId but the user document hasn't synced yet, show loading
  if (activeUserId && !activeUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 gap-6">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold text-center px-4 max-w-md">
          لە بارکردنی داتاکاندایە...
          <br />
          <span className="text-sm font-normal opacity-70 mt-4 block bg-yellow-50 dark:bg-yellow-900/40 p-4 rounded-xl text-yellow-800 dark:text-yellow-200">
            ⚠️ ئەگەر بارکردنەکە زۆری خایاند، واتە <b>Firestore Database</b>{" "}
            چالاک نەکراوە لە پرۆژەی Firebaseەکەت.
            <br />
            <br />
            تکایە بڕۆ بۆ بنکەدراوەی Firebase، بەشی <b>Firestore Database</b>،
            کورتەی <b>Create Database</b> لێبدە. دواتر بڕۆ بەشی <b>Rules</b> و
            بیپەستە بۆ ئەمە:
            <br />
            <br />
            <code
              className="bg-black/10 dark:bg-black/30 px-2 py-1.5 rounded block text-left"
              dir="ltr"
            >
              allow read, write: if true;
            </code>
          </span>
        </p>
        <button
          onClick={() => {
            store.setActiveUser(null);
            import("firebase/auth").then(({ signOut }) => {
              import("./lib/firebase").then(({ auth }) => {
                signOut(auth);
              });
            });
          }}
          className="px-6 py-2.5 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 rounded-xl font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
        >
          چوونەدەرەوە
        </button>
      </div>
    );
  }

  return (
    <Router>
      <Toaster
        position="top-center"
        toastOptions={{
          className:
            "dark:bg-gray-800 dark:text-white font-bold text-sm shadow-xl",
          style: {
            direction: "rtl",
            fontFamily: "inherit",
          },
        }}
      />
      <Routes>
        <Route path="/kiosk" element={<KioskScanner />} />

        <Route path="/" element={<Layout />}>
          {activeUser.role === "ADMIN" ? (
            <>
              <Route index element={<Dashboard />} />
              <Route path="scanner" element={<ScannerPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="portal" element={<UserPortal />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : activeUser.role === "KIOSK" ? (
            <>
              <Route index element={<DeviceDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              {/* Normal User only sees portal */}
              <Route index element={<Navigate to="/portal" replace />} />
              <Route path="portal" element={<UserPortal />} />
              <Route path="*" element={<Navigate to="/portal" replace />} />
            </>
          )}
        </Route>
      </Routes>
    </Router>
  );
}
