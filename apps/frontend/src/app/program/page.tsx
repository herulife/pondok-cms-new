'use client';

import React, { useEffect, useState } from 'react';
import PublicLayout from '@/components/PublicLayout';
import { BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getPrograms, Program, resolveDisplayImageUrl } from '@/lib/api';

export default function ProgramPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    async function fetchPrograms() {
      try {
        const data = await getPrograms();
        if (!isActive) return;
        const sorted = [...data].sort((a, b) => {
          const orderA = a.order_index ?? 0;
          const orderB = b.order_index ?? 0;
          if (orderA !== orderB) return orderA - orderB;
          return a.title.localeCompare(b.title);
        });
        setPrograms(sorted);
      } catch (e) {
        console.error('Error fetching programs:', e);
      } finally {
        if (isActive) setIsLoading(false);
      }
    }
    fetchPrograms();
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-emerald-800 bg-slate-950 py-24 text-white">
        <div className="absolute inset-0 bg-[url('/assets/img/khalaqoh.jpg')] bg-cover bg-center opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-emerald-950/70" />
        <div className="absolute inset-0 opacity-25">
          <div className="absolute -left-10 top-12 h-40 w-40 rounded-full bg-emerald-300 blur-3xl" />
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-cyan-300 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            Program Pendidikan
          </p>
          <h1 className="mt-6 text-4xl font-black uppercase tracking-tight text-white md:text-5xl lg:text-6xl">
            Program Pendidikan
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-emerald-50/90">
            Kurikulum terpadu yang dirancang untuk menumbuhkan hafalan, adab, pemahaman ilmu, dan
            kesiapan santri menjalani amanah kehidupan.
          </p>
        </div>
      </section>

      <section className="bg-[linear-gradient(to_bottom,_#ffffff,_#f8fafc)] py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-600">
              Fokus Pembelajaran
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">Struktur Program Pondok</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Setiap program disusun untuk membantu santri bertumbuh secara seimbang dalam hafalan,
              adab, pembiasaan ibadah, dan kesiapan berdakwah.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[320px] bg-slate-50 rounded-[3rem] animate-pulse" />
              ))}
            </div>
          ) : programs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {programs.map((program) => {
                const imageUrl = resolveDisplayImageUrl(program.image_url);
                const description = program.excerpt || program.content || 'Program unggulan untuk membentuk karakter dan kompetensi santri.';
                return (
                  <div key={program.id} className="group relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                    <div className="relative h-56 bg-slate-50 overflow-hidden">
                      {imageUrl ? (
                        <img src={imageUrl} alt={program.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-emerald-300">
                          <BookOpen size={56} className="mb-3 opacity-60" />
                          <span className="font-black text-[10px] uppercase tracking-widest text-emerald-400">Program Pondok</span>
                        </div>
                      )}
                      <div className="absolute top-5 left-5 flex flex-wrap gap-2">
                        {program.category && (
                          <span className="px-3 py-1 rounded-full bg-white/90 text-emerald-700 text-[10px] font-black uppercase tracking-widest shadow-sm">
                            {program.category}
                          </span>
                        )}
                        {program.is_featured && (
                          <span className="px-3 py-1 rounded-full bg-amber-400/90 text-emerald-950 text-[10px] font-black uppercase tracking-widest shadow-sm">
                            Unggulan
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">
                        Program Pondok
                      </p>
                      <h2 className="mb-4 mt-3 text-2xl font-black uppercase tracking-tight text-slate-900">
                        {program.title}
                      </h2>
                      <p className="mb-8 text-lg leading-relaxed text-slate-600 line-clamp-3">{description}</p>
                      <Link href="/psb" className="inline-flex items-center gap-2 font-bold text-emerald-600 transition-all hover:gap-4">
                        Pelajari Lebih Lanjut <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-[3rem] py-24 text-center border-2 border-dashed border-slate-200">
              <BookOpen className="mx-auto text-slate-200 mb-6" size={48} />
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs mb-4">Program pondok belum tersedia</p>
              <Link href="/psb" className="inline-flex items-center gap-2 text-emerald-600 font-bold">
                Lihat Informasi PSB <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-600">Target Output</p>
          <h2 className="mt-3 mb-6 text-3xl font-extrabold text-slate-900">Target Lulusan</h2>
          <p className="mx-auto mb-10 max-w-2xl text-base leading-8 text-slate-600">
            Program pendidikan diarahkan agar santri memiliki keluaran yang jelas, baik dalam
            hafalan, karakter, maupun kesiapan berkontribusi di tengah masyarakat.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              "Hafizh 30 Juz Mutqin",
              "Mampu Berdakwah",
              "Berakhlak Karimah"
            ].map((target, i) => (
              <div key={i} className="rounded-3xl border border-emerald-100 bg-white p-6 text-lg font-bold text-emerald-800 shadow-sm">
                {target}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
