"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";

type AdminUIContextValue = {
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
};

const AdminUIContext = createContext<AdminUIContextValue | null>(null);

export function AdminUIProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

  const value = useMemo<AdminUIContextValue>(
    () => ({ sidebarOpen, openSidebar, closeSidebar, toggleSidebar }),
    [sidebarOpen, openSidebar, closeSidebar, toggleSidebar],
  );

  return (
    <AdminUIContext.Provider value={value}>{children}</AdminUIContext.Provider>
  );
}

export function useAdminUI(): AdminUIContextValue {
  const ctx = useContext(AdminUIContext);
  if (!ctx) {
    throw new Error("useAdminUI must be used within <AdminUIProvider>");
  }
  return ctx;
}
