'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  getNews,
  getAgendas,
  getGallery,
  getPublicSettingsMap,
  getPrograms,
  getVideos,
  News,
  Agenda,
  GalleryItem,
  Program,
  SettingsMap,
  Video,
  resolveDisplayImageUrl,
  formatGalleryAlbumTitle,
  getGallerySortTimestamp,
  getYouTubeThumbnailUrl,
} from '@/lib/api';
import PublicLayout from '@/components/PublicLayout';
import HomePageRenderer from '@/components/website-builder/HomePageRenderer';
import { PublicEmptyState, PublicGridSkeleton } from '@/components/PublicState';
import { parseWebsiteBuilderState } from '@/lib/website-builder';
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Building2,
  Calendar,
  Camera,
  ChevronRight,
  GraduationCap,
  Lightbulb,
  MapPin,
  Newspaper,
  PlayCircle,
  Users,
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

/* ═══════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════ */

type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  button_text: string;
  button_url: string;
};

type MaybeListResponse<T> = T[] | { data?: T[] | null } | null | undefined;

/* ═══════════════════════════════════════════════════════
   Static Data — Program Cards & Stats
   ═══════════════════════════════════════════════════════ */

const institutionHighlights = [
  { value: '2009', label: 'Tahun Berdiri', icon: <Calendar size={18} /> },
  { value: '6', label: 'Program Unggulan', icon: <BookOpen size={18} /> },
  { value: '3', label: 'Kurikulum Inti', icon: <GraduationCap size={18} /> },
  { value: '11', label: 'Fasilitas Utama', icon: <Building2 size={18} /> },
  { value: '9', label: 'Ekskul Pilihan', icon: <Users size={18} /> },
];

const programCards = [
  {
    title: "Tahfidzul Qur'an",
    desc: "Program menghafal Al-Qur'an dengan metode yang terstruktur dan efektif.",
    icon: <BookOpenCheck size={32} />,
  },
  {
    title: 'Kajian Kitab Kuning',
    desc: 'Pembelajaran kitab klasik untuk memperdalam ilmu agama Islam.',
    icon: <BookOpen size={32} />,
  },
  {
    title: 'Pendidikan Formal',
    desc: 'Kerjasama dengan sekolah formal untuk pendidikan berkualitas.',
    icon: <GraduationCap size={32} />,
  },
  {
    title: 'Pengembangan Diri',
    desc: 'Pengembangan bakat dan keterampilan santri untuk masa depan.',
    icon: <Lightbulb size={32} />,
  },
];

/* ═══════════════════════════════════════════════════════
   Hero Slide Helpers
   ═══════════════════════════════════════════════════════ */

const buildHeroSlideId = (overrides: Partial<HeroSlide> = {}, fallbackKey = 'slide') => {
  if (typeof overrides.id === 'string' && overrides.id.trim()) {
    return overrides.id;
  }

  const seed = [
    overrides.title,
    overrides.subtitle,
    overrides.image_url,
    overrides.button_text,
    overrides.button_url,
    fallbackKey,
  ]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join('|')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return seed || fallbackKey;
};

const createHeroSlide = (overrides: Partial<HeroSlide> = {}, fallbackKey?: string): HeroSlide => {
  const defaultTitle = 'Mencetak Generasi Penghafal Al-Quran yang Berakhlak Mulia';
  const defaultSubtitle =
    'Pendidikan berbasis nilai-nilai Islam untuk mencetak generasi yang siap menghadapi masa depan.';
  const defaultImageUrl = '/assets/img/gedung.webp';
  const defaultButtonText = 'Tentang Kami';
  const defaultButtonUrl = '/profil';

  return {
    id: overrides.id || buildHeroSlideId(overrides, fallbackKey),
    title: overrides.title ?? defaultTitle,
    subtitle: overrides.subtitle ?? defaultSubtitle,
    image_url: overrides.image_url ?? defaultImageUrl,
    button_text: overrides.button_text ?? defaultButtonText,
    button_url: overrides.button_url ?? defaultButtonUrl,
  };
};

const formatAgendaFullDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const formatNewsDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const defaultHeroSlides = [
  createHeroSlide(
    {
      title: 'Menghafal Al-Quran, Tumbuh dengan Adab',
      subtitle:
        'Lingkungan pesantren yang menata hafalan, ilmu, ibadah, dan kemandirian santri.',
      image_url: '/assets/img/gedung.webp',
      button_text: 'Daftar Santri Baru',
      button_url: '/psb',
    },
    'default-slide-1'
  ),
  createHeroSlide(
    {
      title: 'Tahfidz dan Kurikulum yang Seimbang',
      subtitle:
        'Target hafalan, diniyah, akademik, dan karakter berjalan dalam ritme pembinaan harian.',
      image_url: '/assets/img/gedung.webp',
      button_text: 'Lihat Program',
      button_url: '/program',
    },
    'default-slide-2'
  ),
  createHeroSlide(
    {
      title: 'Munaqosyah Qiyadah Santriwati',
      subtitle:
        'Ujian kepemimpinan dan hafalan untuk mencetak muslimah tangguh dan berdedikasi tinggi.',
      image_url: '/assets/img/gedung.webp',
      button_text: 'Lihat Galeri',
      button_url: '/galeri',
    },
    'default-slide-3'
  ),
  createHeroSlide(
    {
      title: 'Belajar, Beribadah, dan Mandiri',
      subtitle:
        'Fasilitas pondok mendukung kegiatan ibadah, belajar, olahraga, dan life skill santri.',
      image_url: '/assets/img/gedung.webp',
      button_text: 'Lihat Fasilitas',
      button_url: '/facilities',
    },
    'default-slide-3'
  ),
];

function parseHeroSlides(settings: SettingsMap): HeroSlide[] {
  const raw = settings.hero_slides;

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const slides = parsed
          .filter((item) => item && typeof item === 'object')
          .map((item, index) =>
            createHeroSlide(
              {
                id: typeof item.id === 'string' ? item.id : undefined,
                title: typeof item.title === 'string' ? item.title : undefined,
                subtitle: typeof item.subtitle === 'string' ? item.subtitle : undefined,
                image_url: typeof item.image_url === 'string' ? item.image_url : undefined,
                button_text: typeof item.button_text === 'string' ? item.button_text : undefined,
                button_url: typeof item.button_url === 'string' ? item.button_url : undefined,
              },
              `slide-${index + 1}`
            )
          )
          .filter((slide) => slide.title || slide.subtitle || slide.image_url);

        if (slides.length > 1) {
          return slides;
        }

        if (slides.length === 1) {
          const [primarySlide] = slides;
          const supplementalSlides = defaultHeroSlides.filter((slide) => slide.id !== primarySlide.id);
          return [primarySlide, ...supplementalSlides];
        }
      }
    } catch {
      // Fallback ke banner lama jika JSON slider belum valid.
    }
  }

  const legacySlide = createHeroSlide(
    {
      title: settings.banner_title || undefined,
      subtitle: settings.banner_subtitle || undefined,
      image_url: settings.banner_image_url || undefined,
      button_text: settings.banner_button_text || undefined,
      button_url: settings.banner_button_url || undefined,
    },
    'slide-1'
  );

  const supplementalSlides = defaultHeroSlides.filter((slide) => slide.id !== legacySlide.id);
  return [legacySlide, ...supplementalSlides];
}

function extractListItems<T>(payload: MaybeListResponse<T>): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === 'object' && Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
}

/* ═══════════════════════════════════════════════════════
   News Helpers
   ═══════════════════════════════════════════════════════ */

function getNewsImage(item: News): string {
  const url =
    typeof item.image_url === 'object' && item.image_url?.Valid
      ? item.image_url.String
      : typeof item.image_url === 'string'
        ? item.image_url
        : '';
  return resolveDisplayImageUrl(url) || '/assets/img/gedung.webp';
}

function getNewsCategoryName(item: News): string {
  if (typeof item.category_name === 'string') return item.category_name;
  if (
    item.category_name &&
    typeof item.category_name === 'object' &&
    'String' in (item.category_name as unknown as Record<string, unknown>)
  ) {
    const nullable = item.category_name as { String: string; Valid: boolean };
    return nullable.Valid ? nullable.String : '';
  }
  return '';
}

/* ═══════════════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [news, setNews] = useState<News[]>([]);
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [settings, setSettings] = useState<SettingsMap>({});
  const [isLoading, setIsLoading] = useState(true);

  /* ─── Derived Data ───────────────────────────────── */

  const galleryAlbums = useMemo(() => {
    const grouped = new Map<string, GalleryItem[]>();

    for (const item of gallery) {
      const key = item.album_slug || item.album_name || `single-${item.id}`;
      const current = grouped.get(key) || [];
      current.push(item);
      grouped.set(key, current);
    }

    return Array.from(grouped.entries())
      .map(([key, items]) => {
        const sorted = [...items].sort((a, b) => Number(b.is_album_cover) - Number(a.is_album_cover));
        const cover = sorted[0];
        return {
          key,
          title: formatGalleryAlbumTitle(cover.album_name || cover.title),
          slug: cover.album_slug || String(cover.id),
          category: cover.category,
          eventDate: cover.event_date,
          photoCount: items.length,
          cover,
        };
      })
      .sort(
        (a, b) =>
          getGallerySortTimestamp(b.eventDate, b.cover.created_at) -
          getGallerySortTimestamp(a.eventDate, a.cover.created_at)
      )
      .slice(0, 4);
  }, [gallery]);

  const videoSeries = useMemo(() => {
    const grouped = new Map<string, Video[]>();

    for (const video of videos) {
      const key = video.series_slug || video.series_name || `single-${video.id}`;
      const current = grouped.get(key) || [];
      current.push(video);
      grouped.set(key, current);
    }

    return Array.from(grouped.entries())
      .map(([key, items]) => {
        const sorted = [...items].sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
        const lead = sorted[0];
        return {
          key,
          title: formatGalleryAlbumTitle(lead.series_name || lead.title),
          slug: lead.series_slug || String(lead.id),
          eventDate: lead.event_date,
          count: items.length,
          lead,
        };
      })
      .sort(
        (a, b) =>
          getGallerySortTimestamp(b.eventDate, b.lead.created_at) -
          getGallerySortTimestamp(a.eventDate, a.lead.created_at)
      )
      .slice(0, 3);
  }, [videos]);

  /* ─── Data Fetching ──────────────────────────────── */

  useEffect(() => {
    async function fetchAll() {
      try {
        const [newsData, agendasData, galleryData, videosData, programsData, settingsData] =
          await Promise.all([
            getNews(),
            getAgendas(),
            getGallery({ limit: 24, offset: 0 }),
            getVideos({ limit: 24, offset: 0 }),
            getPrograms(),
            getPublicSettingsMap(),
          ]);

        setNews(extractListItems(newsData).slice(0, 3));
        setAgendas(extractListItems(agendasData).slice(0, 3));
        setGallery(extractListItems(galleryData));
        setVideos(extractListItems(videosData));
        setPrograms(extractListItems(programsData));
        setSettings(settingsData || {});
      } catch (error) {
        console.error('Error fetching landing page data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAll();
  }, []);

  const heroSlides = useMemo(() => parseHeroSlides(settings), [settings]);
  const canSlideHero = heroSlides.length > 1;
  const builderState = useMemo(() => parseWebsiteBuilderState(settings), [settings]);

  /* ─── Website Builder Path ───────────────────────── */

  if (builderState.enabled) {
    return (
      <PublicLayout>
        <HomePageRenderer
          layout={builderState.homePublished}
          dataSources={{
            news,
            agendas,
            programs,
            galleryAlbums,
            videoSeries,
            settings,
            isLoading,
          }}
        />
      </PublicLayout>
    );
  }

  /* ─── Default Render — Classic Pesantren Layout ──── */

  return (
    <PublicLayout>
      {/* ═══════════════════════════════════════════════
          SECTION 1 — Hero Slider
          ═══════════════════════════════════════════════ */}
      <section className="relative">
        <Swiper
          modules={[Pagination, Autoplay, Navigation]}
          loop={canSlideHero}
          navigation={canSlideHero}
          allowTouchMove={canSlideHero}
          pagination={canSlideHero ? { clickable: true } : false}
          autoplay={
            canSlideHero
              ? { delay: 6500, disableOnInteraction: false, pauseOnMouseEnter: true }
              : false
          }
          speed={950}
          key={`hero-${heroSlides.length}`}
          className="hero-swiper"
        >
          {heroSlides.map((slide) => {
            const slideImage = resolveDisplayImageUrl(slide.image_url || '/assets/img/gedung.webp');
            return (
              <SwiperSlide key={slide.id}>
                <div className="relative min-h-[420px] sm:min-h-[480px] lg:min-h-[560px]">
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${slideImage}')` }}
                  />
                  {/* Brighter Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-emerald-950/20 to-transparent" />
                  
                  {/* Content */}
                  <div className="relative z-10 mx-auto flex min-h-[420px] max-w-6xl items-center px-6 sm:min-h-[480px] sm:px-8 lg:min-h-[560px] lg:px-10">
                    <div className="max-w-2xl py-16 lg:py-24 drop-shadow-lg">
                      <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15] drop-shadow-xl">
                        {slide.title}
                      </h1>
                      <p className="mt-5 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">
                        {slide.subtitle}
                      </p>
                      <Link
                        href={slide.button_url || '/profil'}
                        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-7 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-600 hover:shadow-lg"
                      >
                        {slide.button_text || 'Tentang Kami'} <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 2 — Sambutan Pimpinan + Berita Terbaru
          ═══════════════════════════════════════════════ */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* ── Left: Sambutan Pimpinan ── */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 lg:p-8">
              <div className="mb-5 flex items-center gap-2 text-emerald-700">
                <Users size={16} />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">
                  Sambutan Pimpinan
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Assalamu&apos;alaikum Warahmatullahi Wabarakatuh
              </h2>

              <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 line-clamp-4">
                {settings.welcome_speech_text ? (
                  settings.welcome_speech_text.split(/\n+/).map((p, idx) => <p key={idx}>{p.trim()}</p>)
                ) : (
                  <>
                    <p>
                      Selamat datang di website resmi Pondok Pesantren Tahfidz Al-Qur&apos;an
                      Darussunnah Parung. Kami berkomitmen untuk mencetak generasi yang berilmu,
                      berakhlak mulia, dan bertaqwa kepada Allah SWT.
                    </p>
                    <p>
                      Semoga website ini dapat menjadi jembatan informasi antara pesantren, wali
                      santri, dan masyarakat.
                    </p>
                  </>
                )}
              </div>

              <Link
                href="/sambutan"
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-600"
              >
                Selengkapnya <ArrowRight size={14} />
              </Link>

              {/* Pimpinan Card */}
              <div className="mt-6 flex items-center gap-4 border-t border-slate-100 pt-6">
                <Image
                  src={resolveDisplayImageUrl(settings.welcome_speech_image || '/assets/img/kepsek.png')}
                  alt={settings.welcome_speech_name || 'Pimpinan Pondok Pesantren'}
                  width={52}
                  height={52}
                  className="rounded-full border-2 border-emerald-100 object-cover h-[52px] w-[52px]"
                  unoptimized
                />
                <div>
                  <p className="text-sm font-bold text-slate-900">{settings.welcome_speech_name || 'Pimpinan Pondok Pesantren'}</p>
                  <p className="text-xs text-slate-500">{settings.welcome_speech_role || 'Darussunnah Parung'}</p>
                </div>
              </div>
            </div>

            {/* ── Right: Berita Terbaru ── */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 lg:p-8">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-700">
                  <BookOpen size={16} />
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">
                    Berita Terbaru
                  </span>
                </div>
                <Link
                  href="/news"
                  className="text-xs font-semibold text-emerald-700 transition-colors hover:text-emerald-600"
                >
                  Lihat Semua <span className="ml-0.5">→</span>
                </Link>
              </div>

              {isLoading ? (
                <PublicGridSkeleton count={3} />
              ) : news.length === 0 ? (
                <PublicEmptyState
                  icon={Newspaper}
                  title="Belum ada berita"
                  description="Berita terbaru akan ditampilkan di sini."
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {news.map((item) => {
                    const category = getNewsCategoryName(item);
                    return (
                      <Link
                        key={item.id}
                        href={`/news/${item.slug}`}
                        className="group flex gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={getNewsImage(item)}
                            alt={item.title}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          {category && (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                              {category}
                            </span>
                          )}
                          <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-800 transition-colors group-hover:text-emerald-700">
                            {item.title}
                          </p>
                          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                            <Calendar size={11} />
                            {formatNewsDate(item.created_at)}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 3 — Statistik Pesantren
          ═══════════════════════════════════════════════ */}
      <section className="border-t border-slate-100 bg-emerald-900 py-12">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {institutionHighlights.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-800/50 text-emerald-300">
                  {stat.icon}
                </div>
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-200/70">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 4 — Program Unggulan
          ═══════════════════════════════════════════════ */}
      <section className="border-b border-slate-100 bg-slate-50/80 py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-6 text-center sm:px-8 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
            Program Pendidikan
          </p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            Program Unggulan Kami
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {programCards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-slate-200 bg-white p-6 text-center transition-shadow duration-200 hover:shadow-md"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700">
                  {card.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{card.desc}</p>
              </div>
            ))}
          </div>

          <Link
            href="/program"
            className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-600"
          >
            Lihat Semua Program <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 5 — Video Pilihan
          ═══════════════════════════════════════════════ */}
      <section className="bg-slate-900 py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
                Video Pilihan
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                Melihat Keseharian Santri
              </h2>
            </div>
            <Link
              href="/videos"
              className="text-sm font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
            >
              Lihat Semua Video <span className="ml-0.5">→</span>
            </Link>
          </div>

          {isLoading ? (
            <PublicGridSkeleton count={3} />
          ) : videoSeries.length === 0 ? (
            <PublicEmptyState
              icon={PlayCircle}
              title="Belum ada video"
              description="Video profil akan ditampilkan di sini."
              className="border-slate-800 bg-slate-800 text-white"
              titleClassName="text-white"
              descriptionClassName="text-slate-400"
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videoSeries.map((series) => {
                const thumbnailUrl = getYouTubeThumbnailUrl(series.lead.url) || '/assets/img/gedung.webp';
                return (
                  <Link
                    key={series.key}
                    href={`/videos?series=${series.slug}`}
                    className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-800 transition-all hover:border-slate-700 hover:shadow-xl"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                      <Image
                        src={thumbnailUrl}
                        alt={series.title}
                        fill
                        unoptimized
                        className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110 group-hover:bg-emerald-600/90">
                          <PlayCircle size={24} className="ml-0.5" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="line-clamp-2 text-sm font-bold text-white transition-colors group-hover:text-emerald-400">
                        {series.title}
                      </h3>
                      <p className="mt-2 text-xs font-medium text-slate-400">
                        {series.count} video dalam seri ini
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 6 — Galeri Kegiatan
          ═══════════════════════════════════════════════ */}
      <section className="bg-emerald-900 py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
                Galeri Kegiatan
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                Momen Berharga di Pesantren
              </h2>
            </div>
            <Link
              href="/galeri"
              className="text-sm font-semibold text-emerald-200 transition-colors hover:text-white"
            >
              Lihat Semua <span className="ml-0.5">→</span>
            </Link>
          </div>

          {/* Gallery Grid */}
          {isLoading ? (
            <PublicGridSkeleton count={4} />
          ) : galleryAlbums.length === 0 ? (
            <PublicEmptyState
              icon={Camera}
              title="Belum ada galeri"
              description="Galeri kegiatan akan ditampilkan di sini."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {galleryAlbums.map((album, index) => (
                <Link
                  key={album.key}
                  href={`/galeri?album=${album.slug}`}
                  className={`group relative overflow-hidden rounded-xl ${
                    index === 0 ? 'sm:col-span-2 sm:row-span-2' : ''
                  }`}
                >
                  <div className={`relative ${index === 0 ? 'h-64 sm:h-full' : 'h-48'} w-full`}>
                    <Image
                      src={resolveDisplayImageUrl(album.cover.image_url) || '/assets/img/gedung.webp'}
                      alt={album.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="text-sm font-bold text-white">{album.title}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-white/70">
                        <Camera size={12} /> {album.photoCount} foto
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 7 — Agenda Mendatang
          ═══════════════════════════════════════════════ */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-6 text-center sm:px-8 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
            Agenda Kegiatan
          </p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            Jadwal Kegiatan Terbaru
          </h2>

          {isLoading ? (
            <div className="mt-10">
              <PublicGridSkeleton count={3} />
            </div>
          ) : agendas.length === 0 ? (
            <div className="mt-10">
              <PublicEmptyState
                icon={Calendar}
                title="Belum ada agenda"
                description="Jadwal kegiatan akan ditampilkan di sini."
              />
            </div>
          ) : (
            <div className="mx-auto mt-10 max-w-3xl divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
              {agendas.map((agenda) => (
                <div
                  key={agenda.id}
                  className="flex items-center gap-5 bg-white px-6 py-5 text-left transition-colors hover:bg-slate-50"
                >
                  {/* Date Badge */}
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <span className="text-lg font-bold leading-none">
                      {new Date(agenda.start_date).getDate()}
                    </span>
                    <span className="mt-0.5 text-[10px] font-semibold uppercase">
                      {new Date(agenda.start_date).toLocaleDateString('id-ID', { month: 'short' })}
                    </span>
                  </div>

                  {/* Agenda Info */}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800">{agenda.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {formatAgendaFullDate(agenda.start_date)}
                      </span>
                      {agenda.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} />
                          {agenda.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight size={18} className="shrink-0 text-slate-300" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 8 — CTA Pendaftaran
          ═══════════════════════════════════════════════ */}
      <section className="bg-emerald-900 py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-6 text-center sm:px-8 lg:px-10">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Siap Bergabung Bersama Darussunnah?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-emerald-100/80">
            Daftarkan putra Anda sebagai santri baru di Pondok Pesantren Tahfidz
            Al-Qur&apos;an Darussunnah Parung. Mulai perjalanan menghafal Al-Qur&apos;an
            bersama kami.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/psb"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-bold text-emerald-900 shadow-md transition-all hover:bg-emerald-50 hover:shadow-lg"
            >
              Daftar Sekarang <ArrowRight size={16} />
            </Link>
            <Link
              href="/kontak"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/50 hover:bg-white/10"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

// Invalidate cache for new DB slider again
