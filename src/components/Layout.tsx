import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  QrCode,
  LogOut,
  Menu,
  X,
  Hexagon,
  Power,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAppStore } from "../hooks/useAppStore";
import { store } from "../store";

function cx(...args: (string | undefined | null | false)[]) {
  return twMerge(clsx(...args));
}

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { users, activeUserId } = useAppStore();
  const activeUser = users.find((u) => u.id === activeUserId);

  if (!activeUser) return null;

  const adminLinks = [
    { to: "/", label: "داشبۆرد", icon: LayoutDashboard },
    { to: "/scanner", label: "سکانەر QR", icon: QrCode },
    { to: "/users", label: "بەکارهێنەران", icon: Users },
    { to: "/reports", label: "ڕاپۆرتەکان", icon: FileText },
    { to: "/settings", label: "ڕێکخستنەکان", icon: Settings },
    { to: "/portal", label: "پۆرتاڵی من (User)", icon: LogOut },
  ];

  const userLinks = [{ to: "/portal", label: "باجی من", icon: QrCode }];

  const kioskLinks = [
    { to: "/", label: "داشبۆردی ئامێر", icon: LayoutDashboard },
  ];

  const links =
    activeUser.role === "ADMIN"
      ? adminLinks
      : activeUser.role === "KIOSK"
        ? kioskLinks
        : userLinks;

  const sidebar = (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 transition-colors">
      <div className="flex items-center justify-between p-6">
        <h1 className="text-2xl font-black flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Hexagon className="w-8 h-8 fill-indigo-100 dark:fill-indigo-900/30" />
          MASQR
        </h1>
        <ThemeToggle />
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={cx(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold",
                isActive
                  ? "bg-indigo-600 shadow-md shadow-indigo-600/30 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100",
              )}
            >
              <Icon
                className={cx(
                  "w-5 h-5",
                  isActive ? "text-white" : "text-gray-400",
                )}
              />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-2 rounded-2xl border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-md">
              {activeUser.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                {activeUser.name}
              </p>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                {activeUser.role === "ADMIN"
                  ? "سوپەر ئەدمین"
                  : activeUser.category === "STUDENT"
                    ? "قوتابی"
                    : activeUser.category === "TEACHER"
                      ? "مامۆستا"
                      : "کارمەند"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              import("firebase/auth").then(({ signOut }) => {
                import("../lib/firebase").then(({ auth }) => {
                  signOut(auth);
                });
              });
            }}
            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
            title="چوونەدەرەوە"
          >
            <Power className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 print:overflow-visible print:h-auto">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 shrink-0 h-full z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none print:hidden">
        {sidebar}
      </aside>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 right-4 z-50 print:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
        >
          {mobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex print:hidden">
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-[80%] max-w-sm h-full shadow-2xl">
            {sidebar}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto w-full relative print:overflow-visible print:h-auto print:absolute print:inset-0">
        <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto min-h-full print:p-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
