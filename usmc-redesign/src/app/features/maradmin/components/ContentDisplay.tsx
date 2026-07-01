import { Globe, ArrowSquareOut, Envelope, Phone } from '@phosphor-icons/react';
import type { ContentSection } from '../maradminUtils';
import { renderWithLinks, extractURLButtons } from '../maradminRenderUtils';
import { renderContactEmail, extractContacts } from '../maradminContactUtils';
import { SubSectionList, flattenSubSectionText } from './SubSectionList';
import { TableBlock } from './TableBlock';

export function ContentDisplay({ sections }: { sections: ContentSection[] }) {
  return (
    <div className="space-y-5 mb-8">
      {sections.map((section, i) => {
        const urlButtons = extractURLButtons(section.body);
        const bulletText = flattenSubSectionText(section.bullets ?? []).join(' ');
        const sectionText = [section.heading, section.body, bulletText].filter(Boolean).join(' ');
        const isPOC      = /\bpoc\b|point of contact|points of contact/i.test(sectionText);
        const contacts   = isPOC ? extractContacts(section.body + ' ' + bulletText) : [];
        const shouldRenderBody = Boolean(section.body) && !(isPOC && contacts.length > 0);
        const displayHeading = section.heading || (isPOC && contacts.length > 0 ? 'Points of Contact' : '');

        return (
          <div key={i} className="flex gap-3">
            <span className="text-sm text-gray-700 font-mono mt-0.5 flex-shrink-0">{i + 1}.</span>
            <div className="flex-1 min-w-0">
              {displayHeading && (
                <span className="text-[15px] font-bold text-white">{displayHeading}. </span>
              )}
              {shouldRenderBody && (
                <span className="text-[15px] text-gray-300 leading-relaxed">
                  {renderWithLinks(section.body)}
                </span>
              )}
              {section.tables && section.tables.length > 0 && (
                <div className="mt-3 space-y-4">
                  {section.tables.map((table, ti) => (
                    <TableBlock key={ti} table={table} />
                  ))}
                </div>
              )}
              {section.bullets && section.bullets.length > 0 && (
                <SubSectionList items={section.bullets} className="mt-2 ml-1 sm:ml-2" />
              )}
              {urlButtons.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {urlButtons.map((btn, bi) => (
                    <a key={bi} href={btn.url} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-600/40 text-red-500 text-[11px] font-bold tracking-widest hover:bg-red-900/10 transition-colors">
                      <Globe className="w-3 h-3" /> {btn.label} <ArrowSquareOut className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              )}
              {contacts.length > 0 && (
                <div className="mt-3 space-y-2">
                  {contacts.map((c, ci) => (
                    <div key={ci} className="border border-white/12 px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <div className="w-full flex items-baseline gap-2">
                        <span className="text-[13px] font-bold text-white">{c.name}</span>
                        {c.section && (
                          <span className="text-[10px] font-bold tracking-widest text-gray-500 border border-white/10 px-1.5 py-0.5">{c.section}</span>
                        )}
                      </div>
                      {c.email && (
                        <div className="inline-flex items-center gap-1.5 text-[12px] text-red-400 hover:text-red-300 transition-colors">
                          <Envelope className="w-3 h-3" /> {renderContactEmail(c.email)}
                        </div>
                      )}
                      {c.comm && (
                        <a href={`tel:${c.comm.replace(/\D/g, '')}`}
                           className="inline-flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-white transition-colors">
                          <Phone className="w-3 h-3" /> {c.comm}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
