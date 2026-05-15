import type { DetectedTable } from '../maradminUtils';

export function TableBlock({ table }: { table: DetectedTable }) {
  return (
    <div className="space-y-2">
      {table.title && (
        <div className="text-[11px] font-bold tracking-[0.18em] text-red-500">
          {table.title}
        </div>
      )}
      <div className="overflow-x-auto overflow-y-visible border border-white/10 bg-black/40 md:overflow-visible">
        <table className="w-full border-collapse text-[13px] font-mono">
          {table.headers.length > 0 && (
            <thead>
              <tr className="border-b border-white/12 bg-white/[0.03]">
                {table.headers.map((h, hi) => (
                  <th
                    key={hi}
                    className={`sticky top-0 z-10 border-b border-white/12 bg-[#080808]/95 px-4 py-2 text-left text-[11px] font-bold tracking-[0.15em] text-gray-400 backdrop-blur-sm ${hi === 0 ? 'min-w-[160px]' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri} className="border-b border-white/6 hover:bg-white/[0.02] transition-colors">
                {row.map((cell, ci) => {
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
  );
}
