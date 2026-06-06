import type { ContentSubSection } from '../maradminUtils';
import { renderWithLinks } from '../maradminRenderUtils';
import { TableBlock } from './TableBlock';

const SUB_BODY_STARTERS = new Set([
  'this', 'the', 'a', 'an', 'when', 'as', 'in', 'on', 'to', 'for', 'of',
  'all', 'marines', 'per', 'effective', 'it', 'each', 'any', 'iaw', 'upon',
  'reference', 'if', 'no', 'note', 'see', 'except', 'upon', 'within',
]);

function isSubHeading(body: string, item: ContentSubSection): boolean {
  if (!body) return false;
  if (!item.children?.length && !item.tables?.length) return false;
  const words = body.trim().split(/\s+/);
  if (words.length > 8) return false;
  if (/[.!?]\s/.test(body)) return false;
  return !SUB_BODY_STARTERS.has(words[0].toLowerCase());
}

// eslint-disable-next-line react-refresh/only-export-components
export function flattenSubSectionText(items: ContentSubSection[]): string[] {
  return items.flatMap(item => [
    item.body,
    ...flattenSubSectionText(item.children ?? []),
  ]).filter(Boolean);
}

// For hierarchical labels like "3.A.1.B.", return the last component "B." for compact display.
function mobileLabel(label: string): string {
  if (!/^\d+\./.test(label)) return label;
  const last = label.replace(/\.$/, '').split('.').pop() ?? '';
  return last + '.';
}

export function SubSectionList({ items, className = '' }: { items: ContentSubSection[]; className?: string }) {
  return (
    <ul className={`space-y-1.5 ${className}`.trim()}>
      {items.map((item, index) => (
        <li key={`${item.label}-${index}`} className="flex gap-2 text-[15px] text-gray-300 leading-relaxed">
          <span className="text-red-600 mt-0.5 flex-shrink-0 font-mono">
            <span className="hidden sm:inline">{item.label}</span>
            <span className="sm:hidden">{mobileLabel(item.label)}</span>
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            {item.body && (
              <span className={`block ${isSubHeading(item.body, item) ? 'font-bold text-white' : ''}`}>
                {renderWithLinks(item.body)}
              </span>
            )}
            {item.tables && item.tables.length > 0 && (
              <div className="space-y-4">
                {item.tables.map((table, ti) => (
                  <TableBlock key={ti} table={table} />
                ))}
              </div>
            )}
            {item.children && item.children.length > 0 && (
              <SubSectionList items={item.children} className="ml-2 sm:ml-3 pt-1" />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
