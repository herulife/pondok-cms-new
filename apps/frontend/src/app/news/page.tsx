'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, Newspaper, Search } from 'lucide-react';
import { getNews, News } from '@/lib/api';
import PublicLayout from '@/components/PublicLayout';
import { PublicEmptyState } from '@/components/PublicState';
import PublicSectionIntro from '@/components/PublicSectionIntro';

function formatPublishedDate(value: string) {
  if (!value) {
    return 'Baru saja';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Baru saja';
  }

  return parsed.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function NewsPortal() {
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchNews() {
      try {
        const data = await getNews();
        setNews(Array.isArray(data) ? data.slice(0, 12) : []);
      } catch (error) {
        console.error('Error fetching news:', error);
        setNews([]);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchNews();
  }, []);

  const filteredNews = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) {
      return news;
    }

    return news.filter((item) => {
      const title = item.title?.toLowerCase?.() || '';
      const excerpt = item.excerpt?.toLowerCase?.() || '';
      return title.includes(keyword) || excerpt.includes(keyword);
    });
  }, [news, searchTerm]);

  return (
    <PublicLayout>
      <section className="border-b border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <PublicSectionIntro
            eyebrow="Berita"
            title="Kabar Darussunnah"
            description="Halaman berita kami sederhanakan sementara agar akses tetap ringan dan stabil."
          />

          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Cari judul atau ringkasan berita..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-4 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-3xl bg-slate-100" />
            ))}
          </div>
        ) : filteredNews.length > 0 ? (
          <div className="space-y-4">
            {filteredNews.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">
                      <Calendar size={14} />
                      <span>{formatPublishedDate(item.created_at)}</span>
                    </div>
                    <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">
                      {item.title}
                    </h2>
                    <p className="mt-3 line-clamp-3 max-w-3xl text-sm leading-7 text-slate-600">
                      {item.excerpt || 'Klik untuk membaca berita selengkapnya.'}
                    </p>
                  </div>
                  <div className="shrink-0 text-sm font-bold text-emerald-700">
                    Baca detail
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <PublicEmptyState
            icon={Newspaper}
            title="Berita belum ditemukan"
            description="Coba gunakan kata kunci lain atau buka halaman ini lagi beberapa saat lagi."
            className="rounded-[2.5rem] py-20"
          />
        )}
      </section>
    </PublicLayout>
  );
}
