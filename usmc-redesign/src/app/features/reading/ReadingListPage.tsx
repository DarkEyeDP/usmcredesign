import { useCallback, useEffect, useDeferredValue, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { ArrowUpRight, Book, BookCopy, ChevronDown, ChevronLeft, ChevronRight, FileText, LayoutGrid, List, Search, ShoppingCart, Star, X } from 'lucide-react';
import { SEOHead } from '@/app/components/SEOHead';
import { readingShelves, type ReadingBook, type ReadingShelfId } from './readingListData';
import marineReadingHero from '@/app/assets/reading/marine-reading-hero.webp';

const allShelfId = 'all' as const;
const favShelfId = 'favorites' as const;
type ShelfFilter = ReadingShelfId | typeof allShelfId | typeof favShelfId;
type SortOrder = 'default' | 'title-az' | 'title-za' | 'author-az' | 'type';
type ViewMode = 'list' | 'grid';
type FlatBook = { book: ReadingBook; shelfLabel: string };

function applySortOrder(books: ReadingBook[], sort: SortOrder): ReadingBook[] {
  if (sort === 'default') return books;
  const s = [...books];
  if (sort === 'title-az') s.sort((a, b) => a.title.localeCompare(b.title));
  else if (sort === 'title-za') s.sort((a, b) => b.title.localeCompare(a.title));
  else if (sort === 'author-az') s.sort((a, b) => a.author.localeCompare(b.author));
  else if (sort === 'type') s.sort((a, b) => (a.kind === 'pdf' ? 1 : 0) - (b.kind === 'pdf' ? 1 : 0));
  return s;
}

// ─── Book detail modal ────────────────────────────────────────────────────────

interface BookDetailModalProps {
  book: ReadingBook;
  shelfLabel: string;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: (() => void) | null;
  onNext: (() => void) | null;
}

function BookDetailModal({ book, shelfLabel, index, total, onClose, onPrev, onNext }: BookDetailModalProps) {
  const isPdf = book.kind === 'pdf';
  const hasPurchaseLink = !isPdf && Boolean(book.href);
  const hasPdfLink = isPdf && Boolean(book.href);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  const corners = [
    'border-l border-t -left-px -top-px',
    'border-r border-t -right-px -top-px',
    'border-l border-b -left-px -bottom-px',
    'border-r border-b -right-px -bottom-px',
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <motion.div
        className="relative z-10 w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
        animate={{
          boxShadow: [
            '0 0 0px 0px rgba(255,255,255,0)',
            '0 0 24px 2px rgba(255,255,255,0.07)',
            '0 0 0px 0px rgba(255,255,255,0)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
      >
        {corners.map((cls, i) => (
          <motion.div
            key={i}
            className={`pointer-events-none absolute h-5 w-5 ${cls} border-white/50`}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: 0.12 + i * 0.06, ease: 'easeOut' }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative flex w-full flex-col overflow-hidden border border-white/12 bg-black"
          style={{ maxHeight: '85vh' }}
        >
          {book.cover && (
            <img src={book.cover} alt="" aria-hidden className="pointer-events-none absolute inset-0 z-0 h-full w-full scale-125 object-cover opacity-25 blur-3xl" />
          )}

          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 p-1 text-gray-600 transition-colors hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden sm:flex-row">
            {book.cover && (
              <div className="relative h-[260px] flex-shrink-0 overflow-hidden sm:hidden">
                {/* Blurred ambient fill — edge to edge */}
                <img src={book.cover} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-xl" />
                {/* Sharp cover with padding so it floats inside the blurred field */}
                <div className="relative z-10 flex h-full items-center justify-center px-12 py-5">
                  <img src={book.cover} alt={`${book.title} by ${book.author} — book cover`} className="h-full w-auto object-contain drop-shadow-2xl" />
                </div>
                <div className="absolute inset-x-0 bottom-0 z-20 h-16 bg-gradient-to-t from-black to-transparent" />
              </div>
            )}
            <div className="relative hidden w-[220px] flex-shrink-0 self-stretch overflow-hidden sm:block">
              <div className="relative z-20 flex h-full items-center py-5 pl-5 pr-3">
                {book.cover ? (
                  <img src={book.cover} alt={`${book.title} by ${book.author} — book cover`} className="max-h-full w-full object-contain drop-shadow-2xl" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 opacity-20">
                    <Book className="h-10 w-10 text-white" />
                    <span className="text-[8px] font-mono tracking-[0.25em] text-white">NO ART</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto p-6 pr-10">
              <div className="mb-2 text-[10px] font-mono tracking-[0.28em] text-red-400">{shelfLabel}</div>
              <h2 className="break-words text-xl font-black leading-tight tracking-normal text-white [overflow-wrap:anywhere]">{book.title}</h2>
              <p className="mt-2 text-[12px] font-mono tracking-[0.18em] text-gray-500">
                {book.author}
                {book.pages && <span className="text-gray-700"> | {book.pages.toLocaleString()} Pages</span>}
              </p>

              {book.badge === 'Priority read' && (
                <span className="mt-3 inline-flex w-fit border border-red-600/40 bg-red-950/30 px-2 py-0.5 text-[9px] font-bold tracking-[0.2em] text-red-400">
                  PRIORITY READ
                </span>
              )}

              <div className="my-4 h-px bg-white/8" />
              <p className="text-sm leading-relaxed text-gray-400">{book.description}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                {hasPurchaseLink && (
                  <a href={book.href} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-red-600/50 bg-red-950/30 px-4 py-2.5 text-[11px] font-bold tracking-[0.18em] text-red-400 transition-colors hover:border-red-500 hover:bg-red-950/50 hover:text-red-300">
                    <ShoppingCart className="h-4 w-4" />Purchase on Amazon<ArrowUpRight className="h-4 w-4" />
                  </a>
                )}
                {hasPdfLink && (
                  <a href={book.href} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-white/16 px-4 py-2.5 text-[11px] font-bold tracking-[0.18em] text-gray-200 transition-colors hover:border-red-500/40 hover:text-red-300">
                    <BookCopy className="h-4 w-4" />Open PDF<ArrowUpRight className="h-4 w-4" />
                  </a>
                )}
                {isPdf && !book.href && (
                  <span className="inline-flex items-center gap-2 border border-white/10 px-4 py-2.5 text-[11px] font-bold tracking-[0.18em] text-gray-600">
                    <BookCopy className="h-4 w-4" />PDF Coming Soon
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-shrink-0 items-center justify-between border-t border-white/10 px-6 py-3">
            <button onClick={onPrev ?? undefined} disabled={!onPrev}
              className="flex items-center gap-1 text-[12px] font-mono tracking-widest transition-colors disabled:text-gray-800 text-gray-500 hover:text-gray-300">
              <ChevronLeft className="w-3 h-3" /> PREV
            </button>
            <span className="text-[11px] font-mono text-gray-700">{index + 1} / {total}</span>
            <button onClick={onNext ?? undefined} disabled={!onNext}
              className="flex items-center gap-1 text-[12px] font-mono tracking-widest transition-colors disabled:text-gray-800 text-gray-500 hover:text-gray-300">
              NEXT <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ─── Grid card ────────────────────────────────────────────────────────────────

interface GridCardProps {
  book: ReadingBook;
  shelfLabel: string;
  isFavorite: boolean;
  onToggleFavorite: (title: string) => void;
  onSelect: () => void;
}

function BookGridCard({ book, shelfLabel, isFavorite, onToggleFavorite, onSelect }: GridCardProps) {
  return (
    <article onClick={onSelect} className="group cursor-pointer">
      <div className="relative aspect-[2/3] overflow-hidden border border-white/10 bg-black transition-all duration-300 group-hover:border-white/25 group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.7)]">
        {book.cover ? (
          <img
            src={book.cover}
            alt={`${book.title} by ${book.author} — book cover`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 opacity-15">
            <Book className="h-8 w-8 text-white" />
            <span className="text-[7px] font-mono tracking-[0.25em] text-white">NO ART</span>
          </div>
        )}

        {/* Hover gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Red accent bar sweeps in from left on hover */}
        <div className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-red-600 transition-transform duration-400 group-hover:scale-x-100" />

        {/* Favorite button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(book.title); }}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute right-2 top-2 z-10 rounded-sm bg-black/60 p-1.5 backdrop-blur-sm transition-all duration-200 hover:bg-black/90 ${isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        >
          <Star className={`h-3.5 w-3.5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white/80'}`} />
        </button>
      </div>

      <div className="pt-3">
        <div className="mb-1 text-[9px] font-mono tracking-[0.22em] text-red-400">{shelfLabel}</div>
        <h3 className="line-clamp-2 break-words text-[13px] font-black leading-snug tracking-normal text-white [overflow-wrap:anywhere]">{book.title}</h3>
        <p className="mt-1 truncate text-[11px] font-mono text-gray-600">{book.author}</p>
      </div>
    </article>
  );
}

// ─── List card ────────────────────────────────────────────────────────────────

function BookCard({ book, shelfLabel, isFavorite, onToggleFavorite, onSelect }: {
  book: ReadingBook;
  shelfLabel: string;
  isFavorite: boolean;
  onToggleFavorite: (title: string) => void;
  onSelect: () => void;
}) {
  const isPdf = book.kind === 'pdf';
  const hasPdf = isPdf;
  const hasPurchaseLink = !isPdf && Boolean(book.href);
  const description = book.description
    ?? (hasPdf
      ? 'Core doctrine and reference material for direct reading, download, and future site-hosted PDF access.'
      : `A ${shelfLabel.toLowerCase()} title selected to build perspective, judgment, and professional reading momentum.`);

  const coverEl = (
    <div className="relative h-[160px] w-[108px] flex-shrink-0 overflow-hidden border border-white/10 bg-black md:h-[120px] md:w-[84px]">
      {book.cover ? (
        <img src={book.cover} alt={`${book.title} by ${book.author} — book cover`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 opacity-20">
          <Book className="h-5 w-5 text-white" />
          <span className="text-[7px] font-mono tracking-[0.25em] text-white">NO ART</span>
        </div>
      )}
    </div>
  );

  const accessEl = (compact: boolean) => (
    <div className="flex flex-wrap gap-2">
      {hasPurchaseLink && (
        <a href={book.href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
          className={`inline-flex items-center gap-1.5 whitespace-nowrap border border-red-600/50 bg-red-950/30 text-red-400 transition-colors hover:border-red-500 hover:bg-red-950/50 hover:text-red-300 font-bold tracking-[0.18em] ${compact ? 'px-2.5 py-1.5 text-[10px]' : 'px-3 py-2 text-[11px]'}`}>
          <ShoppingCart className={compact ? 'h-3 w-3' : 'h-4 w-4'} /><span>Purchase</span><ArrowUpRight className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
        </a>
      )}
      {hasPdf && (
        book.href ? (
          <a href={book.href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap border border-white/16 text-gray-200 transition-colors hover:border-red-500/40 hover:text-red-300 font-bold tracking-[0.18em] ${compact ? 'px-2.5 py-1.5 text-[10px]' : 'px-3 py-2 text-[11px]'}`}>
            <BookCopy className={compact ? 'h-3 w-3' : 'h-4 w-4'} /><span>Open PDF</span><ArrowUpRight className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
          </a>
        ) : (
          <span className={`inline-flex items-center gap-1.5 whitespace-nowrap border border-white/10 text-gray-600 font-bold tracking-[0.18em] ${compact ? 'px-2.5 py-1.5 text-[10px]' : 'px-3 py-2 text-[11px]'}`}>
            <BookCopy className={compact ? 'h-3 w-3' : 'h-4 w-4'} /><span>PDF Coming Soon</span>
          </span>
        )
      )}
    </div>
  );

  return (
    <article
      onClick={onSelect}
      className="group cursor-pointer border-b border-white/10 bg-black/50 transition-colors hover:bg-white/[0.02]"
    >
      {/* ── Mobile layout ── */}
      <div className="md:hidden px-4 py-4">
        {/* Cover + metadata side by side */}
        <div className="flex gap-3">
          {coverEl}

          {/* Right of cover: category, format, access */}
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 py-0.5">
            {/* Category */}
            <div>
              <div className="mb-1.5 text-[10px] font-mono tracking-[0.22em] text-gray-600">CATEGORY</div>
              <span className="inline-flex whitespace-nowrap border border-white/16 bg-black/70 px-2 py-1 text-[10px] font-bold tracking-[0.2em] text-gray-200">
                {shelfLabel}
              </span>
            </div>

            {/* Format */}
            <div>
              <div className="mb-1.5 text-[10px] font-mono tracking-[0.22em] text-gray-600">FORMAT</div>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap border border-white/12 px-2 py-1 text-[10px] font-bold tracking-[0.2em] text-gray-300">
                {hasPdf ? <FileText className="h-3 w-3" /> : <Book className="h-3 w-3" />}
                {hasPdf ? 'PDF' : 'Hardcover Book'}
              </span>
            </div>

            {/* Access */}
            <div>
              <div className="mb-1.5 text-[10px] font-mono tracking-[0.22em] text-gray-600">ACCESS</div>
              {accessEl(true)}
            </div>
          </div>

          {/* Favorite */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(book.title); }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`flex-shrink-0 self-start p-1 transition-all duration-200 ${isFavorite ? 'text-red-500' : 'text-gray-700 opacity-0 group-hover:opacity-100 hover:text-red-400'}`}
          >
            <Star className={`h-4 w-4 ${isFavorite ? 'fill-red-500' : ''}`} />
          </button>
        </div>

        {/* Title, author, description full-width below */}
        <div className="mt-3">
          <h3 className="break-words text-[1rem] font-black leading-snug tracking-normal text-white [overflow-wrap:anywhere]">{book.title}</h3>
          <p className="mt-1.5 text-[12px] font-mono tracking-[0.18em] text-gray-500">
            {book.author}
            {book.pages && <span className="text-gray-700"> | {book.pages.toLocaleString()} Pages</span>}
          </p>
          {book.badge === 'Priority read' && (
            <span className="mt-2 inline-flex border border-red-600/40 bg-red-950/30 px-2 py-0.5 text-[9px] font-bold tracking-[0.2em] text-red-400">
              PRIORITY READ
            </span>
          )}
          <p className="mt-2 text-sm leading-relaxed text-gray-400">{description}</p>
        </div>
      </div>

      {/* ── Desktop layout ── */}
      <div className="hidden md:grid gap-3 px-5 py-4 md:grid-cols-[88px_minmax(0,2.7fr)_minmax(150px,0.72fr)_minmax(180px,0.82fr)_minmax(210px,0.9fr)_40px] md:items-start">
        <div className="flex justify-start">{coverEl}</div>

        <div className="min-w-0">
          <h3 className="break-words text-[1.02rem] font-black leading-snug tracking-normal text-white [overflow-wrap:anywhere]">{book.title}</h3>
          <p className="mt-2 text-[12px] font-mono tracking-[0.18em] text-gray-500">
            {book.author}
            {book.pages && <span className="text-gray-700"> | {book.pages.toLocaleString()} Pages</span>}
          </p>
          {book.badge === 'Priority read' && (
            <span className="mt-2 inline-flex border border-red-600/40 bg-red-950/30 px-2 py-0.5 text-[9px] font-bold tracking-[0.2em] text-red-400">
              PRIORITY READ
            </span>
          )}
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-400">{description}</p>
        </div>

        <div className="self-start pt-1">
          <div className="mb-3 text-[10px] font-mono tracking-[0.24em] text-gray-600">CATEGORY</div>
          <span className="inline-flex whitespace-nowrap border border-white/16 bg-black/70 px-2.5 py-1.5 text-[10px] font-bold tracking-[0.2em] text-gray-200">
            {shelfLabel}
          </span>
        </div>

        <div className="self-start pt-1">
          <div className="mb-3 text-[10px] font-mono tracking-[0.24em] text-gray-600">FORMAT</div>
          <div className="flex flex-wrap gap-2">
            {!hasPdf && (
              <span className="inline-flex items-center gap-2 whitespace-nowrap border border-white/12 px-2.5 py-1.5 text-[10px] font-bold tracking-[0.2em] text-gray-300">
                <Book className="h-3.5 w-3.5" />Hardcover Book
              </span>
            )}
            {hasPdf && (
              <span className="inline-flex items-center gap-2 whitespace-nowrap border border-white/12 px-2.5 py-1.5 text-[10px] font-bold tracking-[0.2em] text-gray-300">
                <FileText className="h-3.5 w-3.5" />PDF
              </span>
            )}
          </div>
        </div>

        <div className="self-start pt-1">
          <div className="mb-3 text-[10px] font-mono tracking-[0.24em] text-gray-600">ACCESS</div>
          {accessEl(false)}
        </div>

        <div className="flex items-start justify-end pt-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(book.title); }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`p-1.5 transition-all duration-200 ${isFavorite ? 'text-red-500 opacity-100' : 'text-gray-700 opacity-0 group-hover:opacity-100 hover:text-red-400'}`}
          >
            <Star className={`h-4 w-4 transition-all ${isFavorite ? 'fill-red-500' : ''}`} />
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ReadingListPage() {
  const navigate = useNavigate();
  const [activeShelf, setActiveShelf] = useState<ShelfFilter>(allShelfId);
  const [query, setQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const deferredQuery = useDeferredValue(query);
  const [selection, setSelection] = useState<{ index: number; list: FlatBook[] } | null>(null);

  // ── Favorites ──────────────────────────────────────────────────────────────
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('reading-favorites');
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
    } catch { return new Set(); }
  });

  const toggleFavorite = useCallback((title: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      localStorage.setItem('reading-favorites', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const shelves = readingShelves;

  const allFlatBooks = useMemo<FlatBook[]>(
    () => shelves.flatMap(shelf => shelf.books.map(book => ({ book, shelfLabel: shelf.label }))),
    [shelves],
  );

  const favoriteBooks = useMemo<FlatBook[]>(
    () => allFlatBooks.filter(fb => favorites.has(fb.book.title)),
    [allFlatBooks, favorites],
  );

  const filteredShelves = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    return shelves
      .filter((shelf) => activeShelf === allShelfId || activeShelf === favShelfId || shelf.id === activeShelf)
      .map((shelf) => ({
        ...shelf,
        books: applySortOrder(
          shelf.books.filter((book) => {
            if (!normalizedQuery) return true;
            const haystack = `${book.title} ${book.author} ${shelf.label}`.toLowerCase();
            return haystack.includes(normalizedQuery);
          }),
          sortOrder,
        ),
      }))
      .filter((shelf) => shelf.books.length > 0);
  }, [activeShelf, deferredQuery, shelves, sortOrder]);

  const flatBooks = useMemo<FlatBook[]>(
    () => filteredShelves.flatMap((shelf) => shelf.books.map((book) => ({ book, shelfLabel: shelf.label }))),
    [filteredShelves],
  );

  const totalTitles = useMemo(
    () => shelves.reduce((count, shelf) => count + shelf.books.length, 0),
    [shelves],
  );

  // ── Section scrollspy ──────────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const bookListRef = useRef<HTMLDivElement>(null);

  const scrollToList = useCallback(() => {
    if (!bookListRef.current) return;
    const top = bookListRef.current.getBoundingClientRect().top + window.scrollY - 176;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const OFFSET = 180;
    const tick = () => {
      let found: string | null = null;
      for (const [id, el] of sectionRefs.current) {
        if (el.getBoundingClientRect().top <= OFFSET) found = id;
      }
      setActiveSection(found);
    };
    window.addEventListener('scroll', tick, { passive: true });
    return () => window.removeEventListener('scroll', tick);
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      let found: string | null = null;
      for (const [id, el] of sectionRefs.current) {
        if (el.getBoundingClientRect().top <= 180) found = id;
      }
      setActiveSection(found);
    });
  }, [filteredShelves]);

  const activeShelfData = activeSection
    ? shelves.find(s => s.id === activeSection)
    : filteredShelves[0] ?? null;

  const activeSectionLabel = activeShelf === favShelfId
    ? 'FAVORITES'
    : (activeShelfData?.label ?? null);
  const activeSectionKicker = activeShelf === favShelfId
    ? 'SAVED'
    : (activeShelfData?.kicker ?? null);

  // ── Modal navigation ───────────────────────────────────────────────────────
  const selectedEntry = selection ? selection.list[selection.index] : null;
  const canPrev = selection && selection.index > 0;
  const canNext = selection && selection.index < selection.list.length - 1;
  const goPrev = () => setSelection((s) => s && s.index > 0 ? { ...s, index: s.index - 1 } : s);
  const goNext = () => setSelection((s) => s && s.index < s.list.length - 1 ? { ...s, index: s.index + 1 } : s);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const openBook = useCallback((book: ReadingBook, list: FlatBook[]) => {
    const idx = list.findIndex(fb => fb.book === book);
    if (idx !== -1) setSelection({ index: idx, list });
  }, []);

  const gridBackground = (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.05]"
      style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.45) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    />
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-black pb-5 md:pb-0">
      <SEOHead
        title="Commandant's Reading List 2026 (CMC Reading List) — Official USMC Books"
        description="The official 2026 Commandant of the Marine Corps Reading List — 71 books organized by category including Heritage, Leadership, Strategy, Innovation, and Foundation. Purchase links, free doctrine PDF downloads, and a personal favorites list for every active-duty Marine."
        keywords="Commandant's Reading List 2026, CMC Reading List 2026, USMC reading list 2026, Marine Corps reading list 2026, Commandant's Reading List, CMC Reading List, USMC reading list, Marine Corps reading list, Commandant of the Marine Corps books, Marine Corps books, USMC books, Marine Corps professional reading, Marine Corps leadership books, MCDP, Marine Corps doctrine, active duty Marine reading"
        path="/reading-list"
        ogImage="https://stay-marine.com/reading/covers/warfighting-mcdp-1.webp"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: "Commandant's Reading List 2026",
            alternateName: ["CMC Reading List 2026", 'CMC Reading List', 'USMC Reading List 2026', 'USMC Reading List', 'Marine Corps Reading List 2026', 'Marine Corps Reading List'],
            description: "The official 2026 Commandant of the Marine Corps Reading List — 71 books organized by Heritage, Leadership, Strategy, Innovation, and Foundation shelves.",
            url: 'https://stay-marine.com/reading-list',
            inLanguage: 'en-US',
            publisher: {
              '@type': 'Organization',
              name: 'Stay Marine',
              url: 'https://stay-marine.com',
            },
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://stay-marine.com/' },
                { '@type': 'ListItem', position: 2, name: "Commandant's Reading List", item: 'https://stay-marine.com/reading-list' },
              ],
            },
            mainEntity: {
              '@type': 'ItemList',
              name: "Commandant's Reading List 2026",
              numberOfItems: readingShelves.reduce((n, s) => n + s.books.length, 0),
              itemListElement: readingShelves.flatMap((shelf, si) =>
                shelf.books.map((book, bi) => ({
                  '@type': 'ListItem',
                  position: readingShelves.slice(0, si).reduce((n, s) => n + s.books.length, 0) + bi + 1,
                  item: {
                    '@type': 'Book',
                    name: book.title,
                    author: { '@type': 'Person', name: book.author },
                    ...(book.href && !book.href.startsWith('/') ? { url: book.href } : {}),
                    genre: shelf.label,
                    bookFormat: book.kind === 'pdf' ? 'https://schema.org/EBook' : 'https://schema.org/Paperback',
                  },
                }))
              ),
            },
          },
        ]}
      />

      {/* Hero */}
      <div className="relative overflow-hidden pt-20">
        <img src={marineReadingHero} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: 'center' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.80) 30%, rgba(0,0,0,0.28) 65%, rgba(0,0,0,0.12) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.40) 28%, transparent 55%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, transparent 30%)' }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 flex min-h-[340px] flex-col">
          <div className="absolute right-8 top-5 hidden border border-white/10 bg-black/50 px-5 py-4 text-right lg:block">
            <div className="text-xs font-black tracking-widest text-white">BUILD YOUR NEXT STACK</div>
            <div className="my-2 ml-auto h-0.5 w-8 bg-red-600" />
            <div className="text-[11px] tracking-[0.2em] text-gray-500">{totalTitles} TITLES</div>
            <div className="text-[11px] tracking-[0.2em] text-gray-500">BOOKS + PDFs</div>
          </div>

          <div className="flex flex-1 flex-col justify-center px-4 py-6 sm:px-8">
            <div className="mb-2 flex items-center gap-2 font-mono text-[12px] tracking-wider text-gray-600">
              <button onClick={() => navigate('/')} className="border-0 bg-transparent p-0 text-[12px] font-mono tracking-wider transition-colors hover:text-gray-400">HOME</button>
              <ChevronRight className="h-3 w-3" />
              <span className="text-red-500">READING LIST</span>
              <span className="border border-red-600/40 bg-red-950/30 px-1.5 py-0.5 text-[10px] font-bold tracking-[0.2em] text-red-400">2026</span>
            </div>
            <div className="flex min-w-0 items-start gap-4">
              <div className="mt-1 h-14 w-1 flex-shrink-0 bg-red-600 sm:h-20" />
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 min-w-0 max-w-full break-words text-[2rem] font-black leading-none tracking-normal text-white [overflow-wrap:anywhere] sm:text-[2.6rem] md:text-[3.6rem] lg:text-[4.8rem]"
              >
                COMMANDANT&apos;S<br />READING LIST
              </motion.h1>
            </div>
            <p className="mb-4 max-w-2xl text-[14px] leading-relaxed text-gray-400">
              The official Commandant&apos;s Reading List organized by category — with links to purchase your book or
              download doctrine PDFs, and a favorites list saved to your device.
            </p>
          </div>
        </div>
      </div>

      {/* Sticky controls bar */}
      <div className="sticky top-20 z-30 border-b border-white/10 bg-black/95 backdrop-blur-sm">
        {/* Tabs row */}
        <div className="flex items-center overflow-x-auto px-4 sm:px-8">
          <button
            onClick={() => { setActiveShelf(allShelfId); scrollToList(); }}
            className={`relative whitespace-nowrap px-5 py-3 text-[12px] font-bold tracking-widest transition-colors ${activeShelf === allShelfId ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
          >
            ALL SHELVES
            <span className={`ml-1.5 text-[11px] ${activeShelf === allShelfId ? 'text-gray-400' : 'text-gray-600'}`}>({totalTitles})</span>
            {activeShelf === allShelfId && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />}
          </button>

          {/* Favorites tab */}
          <button
            onClick={() => { setActiveShelf(favShelfId); scrollToList(); }}
            className={`relative flex items-center gap-1.5 whitespace-nowrap px-5 py-3 text-[12px] font-bold tracking-widest transition-colors ${activeShelf === favShelfId ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
          >
            <Star className={`h-3 w-3 ${activeShelf === favShelfId ? 'fill-red-500 text-red-500' : favorites.size > 0 ? 'fill-gray-600 text-gray-600' : ''}`} />
            FAVORITES
            <span className={`text-[11px] ${activeShelf === favShelfId ? 'text-gray-400' : 'text-gray-600'}`}>({favorites.size})</span>
            {activeShelf === favShelfId && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />}
          </button>

          {shelves.map((shelf) => (
            <button
              key={shelf.id}
              onClick={() => { setActiveShelf(shelf.id); scrollToList(); }}
              className={`relative whitespace-nowrap px-5 py-3 text-[12px] font-bold tracking-widest transition-colors ${activeShelf === shelf.id ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
            >
              {shelf.label}
              <span className={`ml-1.5 text-[11px] ${activeShelf === shelf.id ? 'text-gray-400' : 'text-gray-600'}`}>({shelf.books.length})</span>
              {activeShelf === shelf.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />}
            </button>
          ))}
        </div>

        {/* Search + sort + view toggle + section label */}
        <div className="flex flex-col gap-3 px-4 py-3 sm:px-8 lg:flex-row lg:items-center">
          <div className="relative w-full min-w-0 lg:max-w-md lg:flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, or shelf"
              className="w-full border border-white/12 bg-black px-11 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-red-500/70"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-600 transition-colors hover:text-white" aria-label="Clear search">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex w-full items-stretch gap-3 lg:w-auto lg:flex-shrink-0">
            <div className="relative min-w-0 flex-1 lg:w-56 lg:flex-none">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="w-full appearance-none border border-white/12 bg-black py-2.5 pl-4 pr-9 font-mono text-[12px] tracking-widest text-gray-400 outline-none transition-colors focus:border-red-500/70"
              >
                <option value="default">DEFAULT ORDER</option>
                <option value="title-az">TITLE A–Z</option>
                <option value="title-za">TITLE Z–A</option>
                <option value="author-az">AUTHOR A–Z</option>
                <option value="type">TYPE (BOOKS FIRST)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-600" />
            </div>

            {/* View toggle */}
            <div className="flex flex-shrink-0 items-center border border-white/12 bg-black p-1">
              <button
                onClick={() => setViewMode('list')}
                aria-label="List view"
                className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-gray-400'}`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-gray-400'}`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Active section label */}
          <div className="pointer-events-none hidden flex-1 items-center justify-center lg:flex">
            <AnimatePresence mode="wait">
              {activeSectionLabel && (
                <motion.div
                  key={activeSectionLabel}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="flex flex-col items-center gap-0.5"
                >
                  {activeSectionKicker && (
                    <span className="text-[10px] font-mono tracking-[0.24em] text-red-400">{activeSectionKicker}</span>
                  )}
                  <span className="text-2xl font-black leading-none tracking-tight text-white" style={{ fontFamily: 'var(--font-tactical)' }}>
                    {activeSectionLabel}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Book list / grid */}
      <div ref={bookListRef} className="relative px-4 py-8 sm:px-8">
        {gridBackground}

        {/* ── FAVORITES VIEW ── */}
        {activeShelf === favShelfId ? (
          <div className="relative">
            {favoriteBooks.length === 0 ? (
              <div className="border border-white/12 bg-black/70 px-6 py-16 text-center">
                <Star className="mx-auto mb-4 h-8 w-8 text-gray-800" />
                <p className="text-lg font-black tracking-wide text-white">No favorites yet.</p>
                <p className="mt-2 text-sm text-gray-500">Star any book to save it here. Your picks are stored locally.</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {favoriteBooks.map(({ book, shelfLabel }) => (
                  <BookGridCard
                    key={book.title}
                    book={book}
                    shelfLabel={shelfLabel}
                    isFavorite={favorites.has(book.title)}
                    onToggleFavorite={toggleFavorite}
                    onSelect={() => openBook(book, favoriteBooks)}
                  />
                ))}
              </div>
            ) : (
              <section className="border border-white/12 bg-black/70">
                <div className="flex flex-col gap-4 border-b border-white/10 bg-white/[0.04] px-6 py-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="text-[11px] font-mono tracking-[0.24em] text-red-400">SAVED</div>
                    <h2 className="mt-2 break-words text-2xl font-black leading-tight tracking-normal text-white [overflow-wrap:anywhere]">FAVORITES</h2>
                  </div>
                  <div className="text-[11px] font-mono tracking-[0.24em] text-gray-500">{favoriteBooks.length} TITLES</div>
                </div>
                <div className="border-t border-white/10">
                  {favoriteBooks.map(({ book, shelfLabel }) => (
                    <BookCard
                      key={book.title}
                      book={book}
                      shelfLabel={shelfLabel}
                      isFavorite={favorites.has(book.title)}
                      onToggleFavorite={toggleFavorite}
                      onSelect={() => openBook(book, favoriteBooks)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

        ) : viewMode === 'grid' ? (
          /* ── GRID VIEW ── */
          <div className="relative space-y-8">
            {filteredShelves.map((shelf) => (
              <section
                key={shelf.id}
                ref={(el) => { if (el) sectionRefs.current.set(shelf.id, el); else sectionRefs.current.delete(shelf.id); }}
                className="border border-white/12 bg-black/70"
              >
                <div className="flex flex-col gap-4 border-b border-white/10 bg-white/[0.04] px-6 py-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="text-[11px] font-mono tracking-[0.24em] text-red-400">{shelf.kicker}</div>
                    <h2 className="mt-2 break-words text-2xl font-black leading-tight tracking-normal text-white [overflow-wrap:anywhere]">{shelf.label}</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-400">{shelf.description}</p>
                  </div>
                  <div className="text-[11px] font-mono tracking-[0.24em] text-gray-500">{shelf.books.length} TITLES</div>
                </div>
                <div className="p-5 pt-6">
                  <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {shelf.books.map((book) => (
                      <BookGridCard
                        key={book.title}
                        book={book}
                        shelfLabel={shelf.label}
                        isFavorite={favorites.has(book.title)}
                        onToggleFavorite={toggleFavorite}
                        onSelect={() => openBook(book, flatBooks)}
                      />
                    ))}
                  </div>
                </div>
              </section>
            ))}

            {filteredShelves.length === 0 && (
              <section className="border border-white/12 bg-black/70 px-6 py-12 text-center">
                <p className="text-lg font-black tracking-wide text-white">No titles matched that search.</p>
                <p className="mt-2 text-sm text-gray-400">Try a broader keyword or jump back to all shelves.</p>
              </section>
            )}
          </div>

        ) : (
          /* ── LIST VIEW ── */
          <div className="relative space-y-8">
            {filteredShelves.map((shelf) => (
              <section
                key={shelf.id}
                ref={(el) => { if (el) sectionRefs.current.set(shelf.id, el); else sectionRefs.current.delete(shelf.id); }}
                className="border border-white/12 bg-black/70"
              >
                <div className="flex flex-col gap-4 border-b border-white/10 bg-white/[0.04] px-6 py-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="text-[11px] font-mono tracking-[0.24em] text-red-400">{shelf.kicker}</div>
                    <h2 className="mt-2 break-words text-2xl font-black leading-tight tracking-normal text-white [overflow-wrap:anywhere]">{shelf.label}</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-400">{shelf.description}</p>
                  </div>
                  <div className="text-[11px] font-mono tracking-[0.24em] text-gray-500">{shelf.books.length} TITLES</div>
                </div>
                <div className="border-t border-white/10">
                  {shelf.books.map((book) => (
                    <BookCard
                      key={book.title}
                      book={book}
                      shelfLabel={shelf.label}
                      isFavorite={favorites.has(book.title)}
                      onToggleFavorite={toggleFavorite}
                      onSelect={() => openBook(book, flatBooks)}
                    />
                  ))}
                </div>
              </section>
            ))}

            {filteredShelves.length === 0 && (
              <section className="border border-white/12 bg-black/70 px-6 py-12 text-center">
                <p className="text-lg font-black tracking-wide text-white">No titles matched that search.</p>
                <p className="mt-2 text-sm text-gray-400">Try a broader keyword or jump back to all shelves.</p>
              </section>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedEntry && selection && (
          <BookDetailModal
            key={selection.index}
            book={selectedEntry.book}
            shelfLabel={selectedEntry.shelfLabel}
            index={selection.index}
            total={selection.list.length}
            onClose={() => setSelection(null)}
            onPrev={canPrev ? goPrev : null}
            onNext={canNext ? goNext : null}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
