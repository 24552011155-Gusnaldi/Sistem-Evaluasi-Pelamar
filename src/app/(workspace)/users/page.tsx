"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Plus, Search, ShieldCheck, UserRound } from "lucide-react";

type ManagedUser = {
  name: string;
  email: string;
  role: "Super Admin" | "HR Evaluator" | "Viewer";
  initials: string;
  status: string;
};

const initialUsers: ManagedUser[] = [
  { name: "Alya Putri", email: "alya.putri@seleva.id", role: "Super Admin", initials: "AP", status: "Aktif" },
  { name: "Bima Pratama", email: "bima.pratama@seleva.id", role: "HR Evaluator", initials: "BP", status: "Aktif" },
  { name: "Citra Maharani", email: "citra.maharani@seleva.id", role: "Viewer", initials: "CM", status: "Aktif" },
];

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ManagedUser["role"]>("HR Evaluator");
  const filteredUsers = useMemo(
    () => users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(query.trim().toLowerCase())),
    [query, users],
  );

  function addUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail) return;
    setUsers((current) => [...current, {
      name: trimmedName,
      email: trimmedEmail,
      role,
      initials: trimmedName.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join(""),
      status: "Aktif",
    }]);
    setName("");
    setEmail("");
    setRole("HR Evaluator");
    setShowForm(false);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Workspace</p><h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Manajemen User</h1><p className="mt-2 text-sm text-slate-500">Kelola akses dan role pengguna Seleva.</p></div><button className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white transition hover:bg-indigo-700 sm:self-auto" onClick={() => setShowForm((open) => !open)} type="button"><Plus size={17} />Tambah User</button></header>
      {showForm && <form className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_1fr_200px_auto] lg:items-end" onSubmit={addUser}>
        <label className="grid gap-1.5 text-xs font-semibold text-slate-600">Nama<input className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" onChange={(event) => setName(event.target.value)} required value={name} /></label>
        <label className="grid gap-1.5 text-xs font-semibold text-slate-600">Email<input className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
        <label className="grid gap-1.5 text-xs font-semibold text-slate-600">Role<select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" onChange={(event) => setRole(event.target.value as ManagedUser["role"])} value={role}><option>Super Admin</option><option>HR Evaluator</option><option>Viewer</option></select></label>
        <button className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-700" type="submit">Simpan User</button>
      </form>}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"><div><h2 className="font-bold text-slate-900">Daftar pengguna</h2><p className="mt-1 text-xs text-slate-400">{filteredUsers.length} pengguna terdaftar</p></div><label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-slate-400 sm:w-64"><Search size={16} /><input aria-label="Cari user" className="w-full min-w-0 border-0 bg-transparent text-sm text-slate-700 outline-none" onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau email" value={query} /></label></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-4">Pengguna</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Akses</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{filteredUsers.map((user) => <tr className="hover:bg-slate-50/70" key={user.email}><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">{user.initials}</span><span><strong className="block text-slate-800">{user.name}</strong><span className="mt-1 block text-xs text-slate-400">{user.email}</span></span></div></td><td className="px-5 py-4"><span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700"><ShieldCheck size={14} />{user.role}</span></td><td className="px-5 py-4"><span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><span className="size-2 rounded-full bg-emerald-500" />{user.status}</span></td><td className="px-5 py-4 text-xs text-slate-500">{user.role === "Viewer" ? "Lihat hasil" : "Kelola evaluasi"}</td></tr>)}</tbody>
          </table>
          {!filteredUsers.length && <p className="px-5 py-10 text-center text-sm text-slate-500">Tidak ada user yang cocok.</p>}
        </div>
        <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-400"><UserRound size={15} />Role tersedia: Super Admin, HR Evaluator, dan Viewer.</div>
      </section>
    </div>
  );
}
