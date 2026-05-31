import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Bookmark, CalendarDays, ChevronRight, ExternalLink, FileText, Newspaper, Radio } from 'lucide-react';
import { motion } from 'motion/react';
import { SEOHead } from '@/app/components/SEOHead';
import { SpearWatermark } from '@/app/components/tactical/SpearWatermark';
import { useNewsItems } from './useNewsItems';
import { fetchNewsArticleDetail } from './rssService';
import { getBookmarkedIds, getBookmarkedItems, toggleBookmark } from './newsBookmarkStorage';
import { getNewsArticlePath, matchesNewsArticleSlug } from './newsArticleUtils';
import type { NewsArticleDetail, NewsItem } from './types';

const DETAIL_CACHE_KEY = 'usmc-news-article-detail-cache:v3';
const DETAIL_CACHE_TTL = 6 * 60 * 60 * 1000;

type StoredDetail = Omit<NewsArticleDetail, 'pubDate'> & {
  pubDate: string | null;
  ts: number;
};

function readDetailCache(itemId: string): NewsArticleDetail | null {
  try {
    const raw = localStorage.getItem(DETAIL_CACHE_KEY);
    if (!raw) return null;
    const store = JSON.parse(raw) as Record<string, StoredDetail>;
    const cached = store[itemId];
    if (!cached || Date.now() - cached.ts > DETAIL_CACHE_TTL) return null;
    return {
      ...cached,
      pubDate: cached.pubDate ? new Date(cached.pubDate) : null,
    };
  } catch {
    return null;
  }
}

function writeDetailCache(itemId: string, detail: NewsArticleDetail): void {
  try {
    const raw = localStorage.getItem(DETAIL_CACHE_KEY);
    const store = raw ? JSON.parse(raw) as Record<string, StoredDetail> : {};
    store[itemId] = {
      ...detail,
      pubDate: detail.pubDate ? detail.pubDate.toISOString() : null,
      ts: Date.now(),
    };
    localStorage.setItem(DETAIL_CACHE_KEY, JSON.stringify(store));
  } catch {
    // storage unavailable — silently skip
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function SourceBadge({ source }: { source: NewsItem['source'] }) {
  if (source === 'news') {
    return (
      <span className="inline-flex items-center gap-1.5 border border-red-500/50 bg-red-900/20 px-2.5 py-1 text-[11px] font-bold tracking-wider text-red-400">
        <Newspaper className="h-3 w-3" /> NEWS
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 border border-blue-500/50 bg-blue-900/20 px-2.5 py-1 text-[11px] font-bold tracking-wider text-blue-400">
      <Radio className="h-3 w-3" /> PRESS RELEASE
    </span>
  );
}

function NoImagePlaceholder({ source }: { source: NewsItem['source'] }) {
  return (
    <div className="relative min-h-[240px] overflow-hidden border-y border-white/10 bg-[#050508] md:min-h-[380px]">
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <SpearWatermark opacity={0.08} size="64%" />
      <div className="absolute inset-x-0 bottom-8 flex justify-center">
        <span className="text-[10px] font-mono tracking-[0.35em] text-white/20">
          {source === 'press-release' ? 'PRESS RELEASE' : 'USMC NEWS'}
        </span>
      </div>
    </div>
  );
}

function ArticleSkeleton() {
  return (
    <div className="space-y-4 py-4 animate-pulse">
      <div className="h-4 w-1/3 bg-white/8" />
      <div className="h-4 w-full bg-white/8" />
      <div className="h-4 w-11/12 bg-white/8" />
      <div className="h-4 w-4/5 bg-white/8" />
      <div className="h-4 w-full bg-white/8" />
    </div>
  );
}

function uniqueItems(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const key = item.id || item.link;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function NewsArticlePage() {
  const { articleSlug } = useParams();
  const { newsItems, pressReleases, loading, refreshing, error } = useNewsItems();
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => getBookmarkedIds());
  const [savedItems, setSavedItems] = useState<NewsItem[]>(() => getBookmarkedItems());
  const [detail, setDetail] = useState<NewsArticleDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const allItems = useMemo(
    () => uniqueItems([...newsItems, ...pressReleases, ...savedItems]).sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime()),
    [newsItems, pressReleases, savedItems],
  );

  const item = useMemo(
    () => allItems.find(candidate => matchesNewsArticleSlug(candidate, articleSlug)) ?? null,
    [allItems, articleSlug],
  );

  const relatedItems = useMemo(
    () => allItems.filter(candidate => candidate.id !== item?.id).slice(0, 4),
    [allItems, item?.id],
  );

  useEffect(() => {
    if (!item) return;

    let cancelled = false;

    Promise.resolve().then(async () => {
      if (cancelled) return;
      const cached = readDetailCache(item.id);
      setDetail(cached);
      setDetailLoading(!cached);
      setDetailError(null);

      try {
        const nextDetail = await fetchNewsArticleDetail(item);
        if (cancelled) return;
        setDetail(nextDetail);
        writeDetailCache(item.id, nextDetail);
      } catch (err) {
        if (cancelled) return;
        if (!cached) setDetailError(err instanceof Error ? err.message : 'Unable to load article');
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [item]);

  function handleBookmark() {
    if (!item) return;
    const nextIds = toggleBookmark(item);
    setBookmarkedIds(nextIds);
    setSavedItems(getBookmarkedItems());
  }

  if ((loading || refreshing) && !item) {
    return (
      <div className="min-h-screen bg-black px-6 pt-28 text-white md:px-8">
        <SEOHead title="Marine Corps News" description="Loading Marine Corps news article." path="/news" />
        <div className="mx-auto max-w-5xl">
          <ArticleSkeleton />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-black px-6 pt-28 text-white md:px-8">
        <SEOHead title="Article Not Found" description="Marine Corps news article not found." path="/news" />
        <div className="mx-auto max-w-3xl border border-white/12 px-6 py-8">
          <Link to="/news" className="mb-5 inline-flex items-center gap-2 text-sm font-bold tracking-widest text-red-500 hover:text-red-400">
            <ArrowLeft className="h-4 w-4" /> BACK TO NEWS
          </Link>
          <h1 className="mb-3 text-2xl font-black tracking-tight text-white">Article not found.</h1>
          <p className="text-sm leading-relaxed text-gray-500">
            {error ? 'The live news feed could not be loaded.' : 'This article is not in the current feed cache.'}
          </p>
        </div>
      </div>
    );
  }

  const publishedAt = detail?.pubDate ?? item.pubDate;
  const body = detail?.body.length
    ? detail.body
    : item.description
      ? [{ type: 'paragraph' as const, text: item.description }]
      : [];
  const imageUrl = detail?.imageUrl ?? item.imageUrl;
  const linkedAttachmentUrls = new Set(item.attachments.map(att => att.url));
  const detailLinks = (detail?.links ?? []).filter(link => !linkedAttachmentUrls.has(link.url));
  const isBookmarked = bookmarkedIds.has(item.id);
  const firstBodyText = body[0]?.type === 'paragraph' ? body[0].text.replace(/\s+/g, ' ').trim().toLowerCase() : '';
  const summaryText = item.description.replace(/\s+/g, ' ').trim().toLowerCase();
  const showSummary = Boolean(item.description && firstBodyText && !firstBodyText.startsWith(summaryText));

  return (
    <div className="min-h-screen bg-black pb-12 text-white">
      <SEOHead
        title={item.title}
        description={item.description}
        path={articleSlug ? `/news/${articleSlug}` : '/news'}
      />

      <header className="relative overflow-hidden border-b border-white/12 pt-20">
        <div className="absolute inset-0 bg-[#050508]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-7 md:px-8 md:py-9">
          <div className="mb-5 flex items-center gap-2 text-[12px] font-mono tracking-wider text-gray-600">
            <Link to="/" className="hover:text-gray-400">HOME</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/news" className="hover:text-gray-400">NEWS</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-red-500">ARTICLE</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 230, damping: 16, mass: 0.85 }}
            className="max-w-4xl"
          >
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <SourceBadge source={item.source} />
              {item.category && (
                <span className="text-[11px] font-mono tracking-[0.25em] text-gray-500">{item.category}</span>
              )}
            </div>
            <h1 className="break-words text-3xl font-black leading-tight tracking-normal text-white md:text-5xl">
              {item.title}<span className="text-red-600">.</span>
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-[12px] font-mono tracking-wider text-gray-500">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5 text-red-500" /> {formatDate(publishedAt).toUpperCase()}
              </span>
              {item.author && <span>{item.author.toUpperCase()}</span>}
            </div>
          </motion.div>
        </div>
      </header>

      {imageUrl ? (
        <div className="relative h-[260px] overflow-hidden border-b border-white/12 md:h-[440px]">
          <img src={imageUrl} alt="" className="h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
        </div>
      ) : (
        <NoImagePlaceholder source={item.source} />
      )}

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="min-w-0">
          {showSummary && (
            <p className="mb-8 border-l-2 border-red-600 pl-5 text-lg leading-8 text-gray-300">
              {item.description}
            </p>
          )}

          {detailLoading ? (
            <ArticleSkeleton />
          ) : detailError ? (
            <div className="mb-6 border border-red-500/30 bg-red-900/10 px-4 py-3 text-sm text-red-400">
              Unable to load the full article body. The summary and source link are still available.
            </div>
          ) : null}

          <div className="space-y-5">
            {body.map((block, index) => {
              if (block.type === 'heading') {
                return <h2 key={index} className="pt-3 text-xl font-black tracking-tight text-white">{block.text}</h2>;
              }
              if (block.type === 'quote') {
                return (
                  <blockquote key={index} className="border-l-2 border-red-600 pl-5 text-lg font-bold leading-8 text-gray-200">
                    {block.text}
                  </blockquote>
                );
              }
              return <p key={index} className="text-[15px] leading-8 text-gray-300">{block.text}</p>;
            })}
          </div>
        </article>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="border border-white/12 bg-white/[0.03] p-4">
            <div className="mb-3 text-[10px] font-mono tracking-[0.3em] text-gray-600">SOURCE</div>
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold tracking-widest text-red-500 transition-colors hover:text-red-400"
            >
              MARINES.MIL <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={handleBookmark}
              className={`mt-4 flex w-full items-center justify-center gap-2 border px-3 py-2 text-[12px] font-bold tracking-widest transition-colors ${
                isBookmarked
                  ? 'border-red-500/40 bg-red-900/20 text-red-400'
                  : 'border-white/12 text-gray-500 hover:border-white/30 hover:text-white'
              }`}
            >
              <Bookmark className="h-4 w-4 fill-current" />
              {isBookmarked ? 'SAVED' : 'SAVE'}
            </button>
          </div>

          {(item.attachments.length > 0 || detailLinks.length > 0) && (
            <div className="border border-white/12 bg-white/[0.03] p-4">
              <div className="mb-3 text-[10px] font-mono tracking-[0.3em] text-gray-600">ATTACHMENTS</div>
              <div className="space-y-2">
                {item.attachments.map((att, index) => (
                  <a
                    key={`${att.url}-${index}`}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 border border-white/10 bg-black px-3 py-2 text-xs font-bold tracking-wide text-white transition-colors hover:border-red-500/40 hover:text-red-400"
                  >
                    <FileText className="h-4 w-4 flex-shrink-0 text-red-500" />
                    <span className="min-w-0 flex-1 truncate">{att.label}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0 text-gray-600" />
                  </a>
                ))}
                {detailLinks.map((link, index) => (
                  <a
                    key={`${link.url}-${index}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 border border-white/10 bg-black px-3 py-2 text-xs font-bold tracking-wide text-white transition-colors hover:border-red-500/40 hover:text-red-400"
                  >
                    <FileText className="h-4 w-4 flex-shrink-0 text-red-500" />
                    <span className="min-w-0 flex-1 truncate">{link.label}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0 text-gray-600" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {relatedItems.length > 0 && (
            <div className="border border-white/12 bg-white/[0.03] p-4">
              <div className="mb-3 text-[10px] font-mono tracking-[0.3em] text-gray-600">RECENT</div>
              <div className="space-y-3">
                {relatedItems.map(related => (
                  <Link key={related.id} to={getNewsArticlePath(related)} className="group block border-b border-white/8 pb-3 last:border-b-0 last:pb-0">
                    <div className="mb-1 text-[10px] font-mono text-gray-600">{formatDate(related.pubDate).toUpperCase()}</div>
                    <div className="text-sm font-bold leading-snug text-gray-300 transition-colors group-hover:text-red-400">{related.title}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
