"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { CircleHelp, Menu, Settings } from "lucide-react";
import Sidebar from "./Sidebar";

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function signOut() {
    setLogoutError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Sesi tidak dapat ditutup.");
      router.replace("/login");
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : "Terjadi kesalahan saat keluar.");
    }
  }

  return (
    <div className="flex min-h-screen min-w-0 bg-slate-50 text-slate-800">
      {mobileOpen && (
        <button
          aria-label="Tutup navigasi"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          type="button"
        />
      )}
      <Sidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={signOut} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button aria-label="Buka navigasi" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={() => setMobileOpen(true)} type="button"><Menu size={20} /></button>
            <div className="min-w-0"><p className="hidden text-xs text-slate-400 sm:block">Seleva / Workspace</p><p className="truncate text-sm font-bold text-slate-800">{pathname === "/dashboard" ? "Dashboard" : pathname === "/evaluasi" ? "Evaluasi CV" : pathname === "/ringkasan" ? "Ringkasan Hasil" : pathname === "/users" ? "Manajemen User" : pathname === "/pengaturan" ? "Pengaturan" : pathname === "/bantuan" ? "Bantuan" : "Workspace"}</p></div>
          </div>
          <div className="flex items-center gap-1 sm:gap-3"><Link aria-label="Pengaturan" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-700" href="/pengaturan"><Settings size={18} /></Link><Link aria-label="Bantuan" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-700" href="/bantuan"><CircleHelp size={18} /></Link><span className="hidden text-xs text-slate-500 sm:block">Talent Intelligence</span><span className="grid size-9 place-items-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">AD</span></div>
        </header>
        {logoutError && <p className="px-4 pt-3 text-sm text-rose-700 sm:px-7" role="alert">{logoutError}</p>}
        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
