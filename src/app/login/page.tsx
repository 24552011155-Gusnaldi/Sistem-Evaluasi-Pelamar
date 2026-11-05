"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const result = await response.json() as { error?: unknown };
        setError(typeof result.error === "string" ? result.error : "Tidak dapat masuk ke workspace.");
        return;
      }
      router.replace("/dashboard");
    } catch {
      setError("Tidak dapat menghubungi layanan login. Coba lagi.");
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.1fr_.9fr]">
      <section className="relative flex min-h-64 flex-col justify-between overflow-hidden bg-slate-950 p-7 text-white sm:p-12 lg:min-h-screen lg:p-16">
        <div className="absolute -right-20 top-1/4 size-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-indigo-500 text-lg font-extrabold">S</span><span className="text-xl font-extrabold tracking-tight">Seleva<span className="text-indigo-300">.</span></span></div>
        <div className="relative my-12 max-w-xl">
          <span className="flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-indigo-300"><Sparkles size={14} /> TALENT INTELLIGENCE</span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">Rekrut dengan<br /><span className="text-indigo-300">lebih yakin.</span></h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">Kelola evaluasi kandidat dan temukan talenta terbaik untuk tim Anda.</p>
        </div>
        <p className="relative text-xs text-slate-400">© 2026 Seleva Talent Intelligence</p>
      </section>
      <section className="flex min-h-[65vh] items-center justify-center px-6 py-12 sm:px-12 lg:min-h-screen">
        <form className="w-full max-w-sm" onSubmit={handleSubmit}>
          <div className="mb-8"><span className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Selamat datang</span><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Masuk ke workspace</h2><p className="mt-2 text-sm text-slate-500">Masukkan kredensial administrator Anda.</p></div>
          <label className="mb-5 grid gap-2 text-sm font-semibold text-slate-700">Username<input autoComplete="username" className="h-12 rounded-xl border border-slate-200 px-4 font-normal outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" onChange={(event) => setUsername(event.target.value)} placeholder="Masukkan username" required value={username} /></label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">Password<input autoComplete="current-password" className="h-12 rounded-xl border border-slate-200 px-4 font-normal outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan password" required type="password" value={password} /></label>
          {error && <p className="mt-4 text-sm text-rose-600" role="alert">{error}</p>}
          <button className="mt-7 flex h-12 w-full items-center justify-between rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" type="submit"><span className="flex items-center gap-2"><ShieldCheck size={17} /> Masuk sebagai administrator</span><ArrowRight size={17} /></button>
        </form>
      </section>
    </main>
  );
}
