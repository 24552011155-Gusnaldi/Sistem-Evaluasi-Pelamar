"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BriefcaseBusiness, CircleHelp, FileUp, LayoutDashboard, LogOut, Settings, UsersRound, X } from "lucide-react";
import { useAppData } from "./AppProvider";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/evaluasi", label: "Evaluasi CV", icon: FileUp },
  { href: "/ringkasan", label: "Ringkasan Hasil", icon: BarChart3 },
  { href: "/users", label: "Manajemen User", icon: UsersRound },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function Sidebar({ isOpen, onClose, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const { applicants } = useAppData();

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
        <Link className="flex items-center gap-3" href="/dashboard" onClick={onClose}>
          <span className="grid size-10 place-items-center rounded-xl bg-indigo-600 text-lg font-extrabold text-white shadow-lg shadow-indigo-200">S</span>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">Seleva<span className="text-indigo-600">.</span></span>
        </Link>
        <button aria-label="Tutup navigasi" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden" onClick={onClose} type="button"><X size={18} /></button>
      </div>
      <div className="mx-4 mt-5 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
        <span className="grid size-9 place-items-center rounded-lg bg-indigo-100 text-indigo-600"><BriefcaseBusiness size={17} /></span>
        <span className="min-w-0"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Workspace</span><span className="block truncate text-sm font-semibold text-slate-700">People & Culture</span></span>
      </div>
      <nav aria-label="Navigasi utama" className="mt-7 flex-1 space-y-1 px-3">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Menu utama</p>
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
              href={href}
              key={href}
              onClick={onClose}
            >
              <Icon size={18} />
              <span>{label}</span>
              {href === "/ringkasan" && <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">{applicants.length}</span>}
            </Link>
          );
        })}
      </nav>
      <nav aria-label="Bantuan dan pengaturan" className="space-y-1 px-3">
        {[
          { href: "/pengaturan", label: "Pengaturan", icon: Settings },
          { href: "/bantuan", label: "Bantuan", icon: CircleHelp },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            aria-current={pathname === href ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${pathname === href ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
            href={href}
            key={href}
            onClick={onClose}
          >
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="m-4 rounded-2xl bg-slate-900 p-4 text-white">
        <p className="text-sm font-bold">Evaluasi lebih terarah</p>
        <p className="mt-1 text-xs leading-5 text-slate-300">Tinjau kecocokan kandidat dalam satu workspace.</p>
      </div>
      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">AD</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-800">Administrator</span><span className="block text-xs text-slate-400">Super Admin</span></span>
          <button aria-label="Keluar" className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600" onClick={onLogout} type="button"><LogOut size={17} /></button>
        </div>
      </div>
    </aside>
  );
}
