import { ChevronsLeftRight, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type UIEvent } from 'react';
import type { DetectedTable } from '../maradminUtils';

function getColumnWidth(header: string): number {
  const normalized = header.toLowerCase();

  if (normalized.includes('course') || normalized.includes('school')) return 360;
  if (normalized.includes('unit description')) return 320;
  if (normalized.includes('details')) return 640;
  if (normalized.includes('officer')) return 280;
  if (normalized.includes('position')) return 220;
  if (normalized.includes('tentative report')) return 220;
  if (normalized.includes('location') || normalized.includes('program')) return 220;
  if (normalized.includes('convening')) return 180;
  if (normalized.includes('name')) return 240;
  if (normalized.includes('note')) return 100;
  if (/(mcc|rank|grade|quota|pmos|amos|imos|mos|desig|sel|dor|lcn)\b/.test(normalized)) return 120;

  return 160;
}

const SEARCH_THRESHOLD = 15;

export function TableBlock({ table }: { table: DetectedTable }) {
  const stickyHeaderTrackRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [scrollHints, setScrollHints] = useState({
    canScrollLeft: false,
    canScrollRight: false,
    hasOverflow: false,
  });
  const [query, setQuery] = useState('');
  const showSearch = table.rows.length >= SEARCH_THRESHOLD;
  const normalizedQuery = query.trim().toLowerCase();
  const visibleRows = normalizedQuery
    ? table.rows.filter(row => row.some(cell => cell.toLowerCase().includes(normalizedQuery)))
    : table.rows;
  const searchPlaceholder = `Filter by ${table.headers.slice(0, 3).join(', ')}…`;
  const columnCount = Math.max(
    table.headers.length,
    ...table.rows.map((row) => row.length),
  );
  const columnWidths = Array.from({ length: columnCount }, (_, index) =>
    getColumnWidth(table.headers[index] ?? ''),
  );
  const tableWidth = columnWidths.reduce((total, width) => total + width, 0);
  const tableStyle: CSSProperties = {
    width: '100%',
    minWidth: `${tableWidth}px`,
  };

  const updateScrollHints = useCallback((element: HTMLDivElement) => {
    const maxScrollLeft = Math.max(0, element.scrollWidth - element.clientWidth);
    const nextHints = {
      canScrollLeft: element.scrollLeft > 1,
      canScrollRight: element.scrollLeft < maxScrollLeft - 1,
      hasOverflow: maxScrollLeft > 1,
    };

    setScrollHints(current =>
      current.canScrollLeft === nextHints.canScrollLeft &&
      current.canScrollRight === nextHints.canScrollRight &&
      current.hasOverflow === nextHints.hasOverflow
        ? current
        : nextHints,
    );
  }, []);

  const syncStickyHeader = (event: UIEvent<HTMLDivElement>) => {
    updateScrollHints(event.currentTarget);
    if (!stickyHeaderTrackRef.current) return;
    stickyHeaderTrackRef.current.style.transform = `translate3d(-${event.currentTarget.scrollLeft}px, 0, 0)`;
  };

  const renderColGroup = () => (
    <colgroup>
      {columnWidths.map((width, index) => (
        <col key={index} style={{ width: `${(width / tableWidth) * 100}%` }} />
      ))}
    </colgroup>
  );

  useEffect(() => {
    if (!stickyHeaderTrackRef.current) return;
    stickyHeaderTrackRef.current.style.transform = 'translate3d(0, 0, 0)';
  }, [table]);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    updateScrollHints(scrollArea);

    const resizeObserver = new ResizeObserver(() => updateScrollHints(scrollArea));
    resizeObserver.observe(scrollArea);

    return () => resizeObserver.disconnect();
  }, [table, tableWidth, updateScrollHints]);

  return (
    <div className="space-y-2">
      {table.title && (
        <div className="text-[11px] font-bold tracking-[0.18em] text-red-500">
          {table.title}
        </div>
      )}
      <div className="maradmin-table-shell relative border border-white/10 bg-black/40">
        <div className="maradmin-table-sticky-header sticky top-0 z-20 bg-[#080808]/95 backdrop-blur-sm">
          {showSearch && (
            <div className="flex items-center gap-2 border-b border-white/8 px-3 py-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-600" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full border border-white/12 bg-black py-1.5 pl-8 pr-8 font-mono text-[13px] text-white placeholder-gray-600 focus:border-red-500/50 focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-gray-600 transition-colors hover:text-gray-400"
                    aria-label="Clear filter"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <span className="flex-shrink-0 font-mono text-[11px] tabular-nums text-gray-600">
                {normalizedQuery ? `${visibleRows.length} / ${table.rows.length}` : `${table.rows.length} rows`}
              </span>
            </div>
          )}
          {table.headers.length > 0 && (
            <div className="pointer-events-none overflow-hidden border-b border-white/12">
              <div ref={stickyHeaderTrackRef} className="min-w-full will-change-transform">
                <table className="maradmin-data-table min-w-full table-fixed border-separate border-spacing-0 text-[13px] font-mono" style={tableStyle}>
                  {renderColGroup()}
                  <thead>
                    <tr>
                      {Array.from({ length: columnCount }, (_, hi) => (
                        <th
                          key={hi}
                          className="px-4 py-2 text-left text-[11px] font-bold tracking-[0.15em] text-gray-400"
                        >
                          {table.headers[hi] ?? ''}
                        </th>
                      ))}
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
          )}
        </div>
        {scrollHints.hasOverflow && scrollHints.canScrollLeft && (
          <div className="pointer-events-none absolute inset-y-0 left-0 z-30 w-8 bg-gradient-to-r from-black via-black/70 to-transparent md:hidden" />
        )}
        {scrollHints.hasOverflow && scrollHints.canScrollRight && (
          <div className="pointer-events-none absolute inset-y-0 right-0 z-30 w-8 bg-gradient-to-l from-black via-black/70 to-transparent md:hidden" />
        )}
        {scrollHints.hasOverflow && scrollHints.canScrollRight && !scrollHints.canScrollLeft && (
          <div className="pointer-events-none absolute right-2 top-2 z-40 flex h-5 w-8 items-center justify-center border border-white/10 bg-black/70 text-gray-400 md:hidden">
            <ChevronsLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
          </div>
        )}
        <div ref={scrollAreaRef} className="maradmin-table-scroll overflow-x-auto" onScroll={syncStickyHeader}>
          <table className="maradmin-data-table min-w-full table-fixed border-separate border-spacing-0 text-[13px] font-mono" style={tableStyle}>
            {renderColGroup()}
            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={columnCount} className="px-4 py-6 text-center font-mono text-[13px] text-gray-600">
                    No matches for &ldquo;{query}&rdquo;
                  </td>
                </tr>
              ) : (
                visibleRows.map((row, ri) => (
                  <tr key={ri} className="border-b border-white/6 hover:bg-white/[0.02] transition-colors">
                    {Array.from({ length: columnCount }, (_, ci) => row[ci] ?? '').map((cell, ci) => {
                      const trimmed = cell.trim();
                      const isExplicitDash = trimmed === '-';
                      const isEmptyValue   = trimmed === '';
                      return (
                        <td
                          key={ci}
                          className={`px-4 py-2 break-words ${ci === 0 ? 'whitespace-normal text-gray-200 font-bold' : `tabular-nums ${isExplicitDash ? 'text-gray-500 italic' : isEmptyValue ? 'text-gray-600' : 'text-gray-400'}`}`}
                        >
                          {ci === 0 ? cell : isExplicitDash || isEmptyValue ? '—' : cell}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
