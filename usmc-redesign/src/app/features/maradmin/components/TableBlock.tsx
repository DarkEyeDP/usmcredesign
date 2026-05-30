import { useEffect, useRef, type CSSProperties, type UIEvent } from 'react';
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

export function TableBlock({ table }: { table: DetectedTable }) {
  const stickyHeaderTrackRef = useRef<HTMLDivElement>(null);
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

  const syncStickyHeader = (event: UIEvent<HTMLDivElement>) => {
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

  return (
    <div className="space-y-2">
      {table.title && (
        <div className="text-[11px] font-bold tracking-[0.18em] text-red-500">
          {table.title}
        </div>
      )}
      <div className="maradmin-table-shell relative border border-white/10 bg-black/40">
        {table.headers.length > 0 && (
          <div className="maradmin-table-sticky-header pointer-events-none sticky top-0 z-20 overflow-hidden border-b border-white/12 bg-[#080808]/95 backdrop-blur-sm">
            <div ref={stickyHeaderTrackRef} className="min-w-full will-change-transform">
              <table className="maradmin-data-table min-w-full table-fixed border-separate border-spacing-0 text-[13px] font-mono" style={tableStyle}>
                {renderColGroup()}
                <thead>
                  <tr>
                    {Array.from({ length: columnCount }, (_, hi) => (
                      <th
                        key={hi}
                        className="border-b border-white/12 px-4 py-2 text-left text-[11px] font-bold tracking-[0.15em] text-gray-400"
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
        <div className="maradmin-table-scroll overflow-x-auto" onScroll={syncStickyHeader}>
          <table className="maradmin-data-table min-w-full table-fixed border-separate border-spacing-0 text-[13px] font-mono" style={tableStyle}>
            {renderColGroup()}
            <tbody>
              {table.rows.map((row, ri) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
