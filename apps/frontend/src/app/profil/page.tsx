'use client';

import React from 'react';
import PublicLayout from '@/components/PublicLayout';
import { Shield, Target, Users, BookOpen } from 'lucide-react';

export default function ProfilPage() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-emerald-800 bg-slate-950 py-24 text-white">
        <div className="absolute inset-0 bg-[url('/assets/img/gedung.webp')] bg-cover bg-center opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-emerald-950/70" />
        <div className="absolute inset-0 opacity-25">
          <div className="absolute -left-10 top-12 h-40 w-40 rounded-full bg-emerald-300 blur-3xl" />
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-cyan-300 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            Profil Pesantren
          </p>
          <h1 className="mt-6 text-4xl font-black uppercase tracking-tight text-white md:text-5xl lg:text-6xl">
            Mengenal Darussunnah Parung
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-emerald-50/90">
            Mengenal lebih dekat Pondok Pesantren Tahfidz Al-Qur&apos;an Darussunnah Parung, arah
            pembinaannya, dan nilai-nilai yang menjaga perjalanan pendidikan santri.
          </p>
        </div>
      </section>

      <section className="bg-[linear-gradient(to_bottom,_#ffffff,_#f8fafc)] py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-600">Visi</p>
              <h2 className="mt-3 text-3xl font-extrabold text-slate-900">Visi Kami</h2>
              <div className="relative mt-6 overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-b from-white to-emerald-50 p-8 shadow-sm group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Target size={120} />
                </div>
                <p className="text-xl text-emerald-900 font-medium leading-relaxed relative z-10 italic">
                  "Menjadi lembaga pendidikan Al-Qur'an terkemuka yang mencetak generasi huffazh yang beraqidah lurus, berakhlak mulia, dan kompeten dalam ilmu syar'i."
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-600">Misi</p>
              <h2 className="mt-3 mb-6 text-3xl font-extrabold text-slate-900">Misi Kami</h2>
              <ul className="space-y-4">
                {[
                  "Menyelenggarakan program tahfidz Al-Qur'an yang intensif dan mutqin.",
                  "Membekali santri dengan pemahaman dinul Islam sesuai manhaj salafus shalih.",
                  "Membentuk karakter santri yang mandiri, disiplin, dan berjiwa dakwah.",
                  "Mengembangkan potensi life skills dan kepemimpinan santri."
                ].map((misi, i) => (
                  <li key={i} className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-600">{i + 1}</div>
                    <p className="text-slate-600 font-medium">{misi}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-600">Core Values</p>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">Nilai Dasar</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Nilai-nilai ini menjadi fondasi pembiasaan santri dalam belajar, beribadah, dan
              menjalani kehidupan pondok setiap hari.
            </p>
            <div className="h-1.5 w-20 mx-auto rounded-full bg-emerald-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { title: "Ikhlas", desc: "Beramal semata-mata mengharap ridha Allah SWT.", icon: <Shield /> },
              { title: "Disiplin", desc: "Menghargai waktu dan taat pada aturan pesantren.", icon: <Target /> },
              { title: "Sabar", desc: "Teguh dalam menghadapi tantangan menuntut ilmu.", icon: <Users /> },
              { title: "Amanah", desc: "Bertanggung jawab atas setiap tugas dan hafalan.", icon: <BookOpen /> }
            ].map((v, i) => (
              <div key={i} className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-2 hover:shadow-md">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">{v.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{v.title}</h3>
                <p className="text-slate-500 text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
