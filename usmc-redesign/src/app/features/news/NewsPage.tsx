import { useState, useMemo, useEffect } from 'react';
import { ChevronRight, ExternalLink, Newspaper, Radio, FileText, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router';
import { SEOHead } from '@/app/components/SEOHead';
import { motion, AnimatePresence } from 'motion/react';
import { useNewsItems } from './useNewsItems';
import type { NewsItem, NewsAttachment } from './types';
import { SpearWatermark } from '@/app/components/tactical/SpearWatermark';
import { getBookmarkedIds, getBookmarkedItems, toggleBookmark, updateBookmarkedItem } from './newsBookmarkStorage';

type Filter = 'all' | 'news' | 'press-release' | 'saved';

function AttachmentList({ attachments, compact = false }: { attachments: NewsAttachment[]; compact?: boolean }) {
  if (attachments.length === 0) return null;
  return (
    <div className={`flex flex-col gap-1.5 ${compact ? '' : 'mt-4 pt-4 border-t border-white/10'}`}>
      {!compact && (
        <div className="text-[10px] font-mono tracking-[0.3em] text-gray-600 mb-1">ATTACHMENTS</div>
      )}
      {attachments.map((att, i) => (
        <a
          key={i}
          href={att.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="group/att flex items-center gap-2.5 border border-white/10 bg-white/[0.03] px-3 py-2 hover:border-red-500/40 hover:bg-red-900/10 transition-colors"
        >
          <div className="flex-shrink-0 w-7 h-7 border border-red-600/40 bg-red-900/20 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold tracking-wide text-white group-hover/att:text-red-400 transition-colors truncate">
              {att.label}
            </div>
            <div className="text-[10px] font-mono tracking-widest text-gray-600 uppercase">{att.type}</div>
          </div>
          <ExternalLink className="w-3 h-3 text-gray-600 group-hover/att:text-red-500 flex-shrink-0 transition-colors" />
        </a>
      ))}
    </div>
  );
}

function NoImagePlaceholder({ label }: { label?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: '#050508' }}>
      {/* Tactical grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      <SpearWatermark opacity={0.07} size="80%" />
      {/* Corner brackets */}
      <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-white/20" />
      <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-white/20" />
      <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-white/20" />
      <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-white/20" />
      {label && (
        <div className="absolute bottom-5 left-0 right-0 flex justify-center">
          <span className="text-[10px] font-mono tracking-[0.35em] text-white/20">{label}</span>
        </div>
      )}
    </div>
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

function SourceBadge({ source, filled = false }: { source: NewsItem['source']; filled?: boolean }) {
  if (source === 'news') {
    return filled ? (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider text-white bg-red-600 border border-red-500 px-2 py-0.5">
        <Newspaper className="w-2.5 h-2.5" /> NEWS
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider text-red-400 border border-red-500/50 bg-red-900/20 px-2 py-0.5">
        <Newspaper className="w-2.5 h-2.5" /> NEWS
      </span>
    );
  }
  return filled ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider text-white bg-blue-600 border border-blue-500 px-2 py-0.5">
      <Radio className="w-2.5 h-2.5" /> PRESS RELEASE
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider text-blue-400 border border-blue-500/50 bg-blue-900/20 px-2 py-0.5">
      <Radio className="w-2.5 h-2.5" /> PRESS RELEASE
    </span>
  );
}


interface CardProps {
  item: NewsItem;
  isBookmarked: boolean;
  onBookmark: (item: NewsItem) => void;
}

function FeaturedHero({ item, isBookmarked, onBookmark }: CardProps) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col md:flex-row overflow-hidden border border-white/12 bg-black hover:border-white/30 transition-colors mb-8"
    >
      {/* Image — right side on desktop, top on mobile */}
      <div className="md:order-2 md:w-[45%] flex-shrink-0 relative overflow-hidden" style={{ minHeight: '240px' }}>
        {item.imageUrl ? (
          <>
            <img
              src={item.imageUrl}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-transparent md:block hidden" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black md:hidden" />
          </>
        ) : (
          <NoImagePlaceholder label={item.source === 'press-release' ? 'PRESS RELEASE' : 'USMC NEWS'} />
        )}
      </div>

      {/* Text — left side on desktop */}
      <div className="md:order-1 flex-1 flex flex-col justify-center p-6 md:p-8">
        <div className="flex items-center gap-3 mb-3">
          <SourceBadge source={item.source} />
          {item.category && (
            <span className="text-[10px] font-mono tracking-[0.3em] text-gray-500">{item.category}</span>
          )}
        </div>
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-snug mb-3 group-hover:text-red-400 transition-colors">
          {item.title}
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4">{item.description}</p>
        <AttachmentList attachments={item.attachments} />
        <div className={`flex items-center gap-4 ${item.attachments.length > 0 ? 'mt-4' : ''}`}>
          <span className="text-[11px] font-mono text-gray-600">{formatDate(item.pubDate)}</span>
          <span className="text-[11px] font-bold text-red-500 tracking-widest flex items-center gap-1 group-hover:text-red-400 transition-colors">
            FULL STORY <ExternalLink className="w-3 h-3" />
          </span>
          <button
            type="button"
            onClick={e => { e.preventDefault(); e.stopPropagation(); onBookmark(item); }}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
            className={`ml-auto transition-colors ${isBookmarked ? 'text-red-500' : 'text-gray-700 hover:text-gray-500'}`}
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    </a>
  );
}

function NewsCard({ item, isBookmarked, onBookmark }: CardProps) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden border border-white/12 bg-black hover:border-white/30 transition-colors"
    >
      <div className="relative overflow-hidden flex-shrink-0" style={{ height: '140px' }}>
        {item.imageUrl ? (
          <>
            <img
              src={item.imageUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </>
        ) : (
          <NoImagePlaceholder />
        )}
        <div className="absolute top-2 left-3">
          <SourceBadge source={item.source} filled />
        </div>
        <button
          type="button"
          onClick={e => { e.preventDefault(); e.stopPropagation(); onBookmark(item); }}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
          className={`absolute top-2 right-2 p-1 transition-colors ${isBookmarked ? 'text-red-500' : 'text-white/30 hover:text-white/60'}`}
        >
          <Bookmark className="w-3.5 h-3.5 fill-current" />
        </button>
      </div>
      <div className="flex flex-col flex-1 p-4">
        <div className="text-[10px] font-mono text-gray-600 mb-2">{formatDate(item.pubDate)}</div>
        <h3 className="text-sm font-bold text-white tracking-wide leading-snug mb-2 group-hover:text-red-400 transition-colors line-clamp-3 flex-1">
          {item.title}
        </h3>
        {item.attachments.length > 0 && (
          <AttachmentList attachments={item.attachments} compact />
        )}
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/8">
          <p className="text-xs text-gray-600 leading-relaxed line-clamp-1 flex-1 mr-2">{item.description}</p>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-red-500 transition-colors flex-shrink-0" />
        </div>
      </div>
    </a>
  );
}

const FILTER_LABELS: Record<Filter, string> = {
  all: 'ALL',
  news: 'NEWS',
  'press-release': 'PRESS RELEASES',
  saved: 'SAVED',
};

export function NewsPage() {
  const navigate = useNavigate();
  const { newsItems, pressReleases, loading, error } = useNewsItems();
  const [filter, setFilter] = useState<Filter>('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => getBookmarkedIds());
  const [savedItems, setSavedItems] = useState<NewsItem[]>(() => getBookmarkedItems());

  const allItems = useMemo(
    () => [...newsItems, ...pressReleases].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime()),
    [newsItems, pressReleases],
  );

  // When the live feed loads, refresh the stored data for any bookmarked articles
  // so they stay up-to-date (new image, updated description, etc.)
  useEffect(() => {
    if (allItems.length === 0) return;
    allItems.forEach(item => {
      if (bookmarkedIds.has(item.id)) updateBookmarkedItem(item);
    });
  }, [allItems]);

  function handleBookmark(item: NewsItem) {
    const nextIds = toggleBookmark(item);
    setBookmarkedIds(nextIds);
    setSavedItems(getBookmarkedItems());
  }

  const filtered = useMemo(() => {
    if (filter === 'all') return allItems;
    return allItems.filter(i => i.source === filter);
  }, [allItems, filter]);

  const featured = filtered[0] ?? null;
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-0">
      <SEOHead
        title="Marine Corps News"
        description="Latest Marine Corps news, official press releases, and USMC announcements. Stay current on Marine Corps operations, policy changes, and command updates."
        path="/news"
      />
      {/* Page header */}
      <div className="relative overflow-hidden border-b border-white/12 pt-20">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.96) 0%, rgba(5,5,10,0.92) 50%, rgba(8,5,12,0.88) 100%)', backgroundColor: '#050508' }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-red-900/30" />

        <div className="relative z-10 flex flex-col" style={{ minHeight: '176px' }}>
          <div className="hidden md:block absolute top-5 right-8 border border-white/10 bg-black/50 px-5 py-3 text-right">
            <div className="text-[12px] font-black text-white tracking-widest">STAY INFORMED<span className="text-red-600">.</span></div>
            <div className="text-[12px] font-black text-white tracking-widest mb-2">STAY READY<span className="text-red-600">.</span></div>
            <div className="w-6 h-px bg-red-600 ml-auto" />
          </div>

          <div className="flex-1 flex flex-col justify-center px-8 py-6">
            <div className="flex items-center gap-2 text-[12px] text-gray-600 font-mono tracking-wider mb-2">
              <button onClick={() => navigate('/')} className="text-[12px] font-mono tracking-wider hover:text-gray-400 transition-colors bg-transparent p-0 border-0">HOME</button>
              <ChevronRight className="w-3 h-3" />
              <span className="text-red-500">NEWS</span>
            </div>
            <h1 className="text-[clamp(2rem,8vw,4.75rem)] font-black text-white tracking-tighter leading-none mb-2">
              MARINE CORPS NEWS<span className="text-red-600">.</span>
            </h1>
            <p className="text-[14px] text-gray-400 max-w-xl leading-relaxed">
              Official news and press releases from Headquarters Marine Corps.
            </p>
          </div>

          {/* Tabs — flush at bottom so active underline sits on the hero border */}
          <div className="flex items-center px-8 -mb-px overflow-x-auto">
            {(Object.keys(FILTER_LABELS) as Filter[]).map(f => {
              const count = f === 'all' ? allItems.length
                : f === 'saved' ? savedItems.length
                : allItems.filter(i => i.source === f).length;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`relative px-5 py-3 text-[12px] font-bold tracking-widest transition-colors whitespace-nowrap flex-shrink-0 ${
                    filter === f ? 'text-white' : 'text-gray-600 hover:text-gray-400'
                  }`}
                >
                  {FILTER_LABELS[f]}
                  {!loading && (
                    <span className={`ml-1.5 text-[11px] ${filter === f ? 'text-gray-400' : 'text-gray-600'}`}>
                      ({count})
                    </span>
                  )}
                  {filter === f && (
                    <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" layoutId="newsTabLine" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">

        {error && (
          <div className="border border-red-500/30 bg-red-900/10 px-4 py-3 text-sm text-red-400 mb-6">
            Unable to load live news feed. Please try again later.
          </div>
        )}

        {loading ? (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row border border-white/8 animate-pulse" style={{ minHeight: '240px' }}>
              <div className="flex-1 p-8 space-y-3">
                <div className="h-3 w-20 bg-white/8 rounded" />
                <div className="h-6 w-3/4 bg-white/10 rounded" />
                <div className="h-4 w-full bg-white/8 rounded" />
                <div className="h-4 w-2/3 bg-white/6 rounded" />
              </div>
              <div className="md:w-[45%] bg-white/5" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border border-white/8 animate-pulse">
                  <div className="h-[140px] bg-white/5" />
                  <div className="p-4 space-y-2">
                    <div className="h-2 w-20 bg-white/8 rounded" />
                    <div className="h-4 bg-white/8 rounded" />
                    <div className="h-4 w-3/4 bg-white/6 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filter === 'saved' && savedItems.length === 0 ? (
          <div className="text-center py-16 text-gray-600 text-sm">
            No saved articles. Bookmark articles to find them here.
          </div>
        ) : filter !== 'saved' && filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-600 text-sm">No items found.</div>
        ) : filter === 'saved' ? (
          /* Saved tab — rendered from persistent storage, not the live feed */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {savedItems.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime()).map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.18 }}
                >
                  <NewsCard
                    item={item}
                    isBookmarked
                    onBookmark={handleBookmark}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <>
            {/* Full-width featured item */}
            {featured && (
              <FeaturedHero
                item={featured}
                isBookmarked={bookmarkedIds.has(featured.id)}
                onBookmark={handleBookmark}
              />
            )}

            {/* 3-column card grid */}
            {rest.length > 0 && (
              <>
                <div className="text-[11px] font-mono tracking-[0.3em] text-gray-600 mb-5">ALL STORIES</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {rest.map(item => (
                    <NewsCard
                      key={item.id}
                      item={item}
                      isBookmarked={bookmarkedIds.has(item.id)}
                      onBookmark={handleBookmark}
                    />
                  ))}
                </div>
              </>
            )}

            <a
              href="https://www.marines.mil/News/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-1 text-sm text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors"
            >
              VIEW ALL ON MARINES.MIL <ExternalLink className="w-3 h-3" />
            </a>
          </>
        )}
      </div>
    </div>
  );
}
