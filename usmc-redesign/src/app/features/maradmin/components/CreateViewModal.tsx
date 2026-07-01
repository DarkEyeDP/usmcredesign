import { useState } from 'react';
import { X } from '@phosphor-icons/react';
import { AUDIENCES } from '../maradminAudienceUtils';
import type { CustomView } from '../maradminStorage';
import { ALL_MARADMIN_TAGS } from '../maradminUtils';

interface CreateViewModalProps {
  initialValues?: CustomView;
  onSave: (view: Omit<CustomView, 'id'>) => void;
  onCancel: () => void;
}

export function CreateViewModal({ initialValues, onSave, onCancel }: CreateViewModalProps) {
  const isEditing = !!initialValues;
  const [name, setName] = useState(initialValues?.name ?? '');
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState<string[]>(initialValues?.keywords ?? []);
  const [pickedTags, setPickedTags] = useState<Set<string>>(new Set(initialValues?.tags ?? []));
  const [pickedAudiences, setPickedAudiences] = useState<Set<string>>(new Set(initialValues?.audiences ?? []));

  function addKeyword() {
    const k = keywordInput.trim().toLowerCase();
    if (k && !keywords.includes(k)) setKeywords(prev => [...prev, k]);
    setKeywordInput('');
  }

  function toggleTag(tag: string) {
    setPickedTags(prev => { const n = new Set(prev); if (n.has(tag)) n.delete(tag); else n.add(tag); return n; });
  }

  function toggleAudience(a: string) {
    setPickedAudiences(prev => { const n = new Set(prev); if (n.has(a)) n.delete(a); else n.add(a); return n; });
  }

  const canSave = name.trim().length > 0 && (keywords.length > 0 || pickedTags.size > 0 || pickedAudiences.size > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="w-full max-w-md bg-[#080808] border border-white/16 p-6 space-y-5 overflow-y-auto max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-bold tracking-[0.2em] text-red-500">{isEditing ? 'EDIT CUSTOM VIEW' : 'NEW CUSTOM VIEW'}</div>
          <button onClick={onCancel} className="text-gray-600 hover:text-white transition-colors">
            <X weight="bold" className="w-4 h-4" />
          </button>
        </div>

        {/* Name */}
        <div>
          <div className="text-[10px] font-bold tracking-[0.2em] text-gray-600 mb-2">VIEW NAME</div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Enlisted Promotions"
            autoFocus
            className="w-full bg-transparent border border-white/16 text-white px-3 py-2 text-[13px] font-mono placeholder:text-gray-700 focus:border-red-500/40 focus:outline-none"
          />
        </div>

        {/* Keywords */}
        <div>
          <div className="text-[10px] font-bold tracking-[0.2em] text-gray-600 mb-1">KEYWORDS</div>
          <div className="text-[10px] text-gray-700 mb-2">Match any keyword against the MARADMIN subject</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={keywordInput}
              onChange={e => setKeywordInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
              placeholder="Type and press Enter…"
              className="flex-1 bg-transparent border border-white/16 text-white px-3 py-2 text-[13px] font-mono placeholder:text-gray-700 focus:border-red-500/40 focus:outline-none"
            />
            <button
              onClick={addKeyword}
              className="px-3 py-2 border border-white/16 text-gray-500 text-[11px] font-bold tracking-widest hover:border-white/40 hover:text-white transition-colors"
            >
              ADD
            </button>
          </div>
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {keywords.map(k => (
                <span key={k} className="flex items-center gap-1 px-2.5 py-1 bg-red-950/30 border border-red-600/40 text-red-400 text-[11px] font-bold">
                  {k}
                  <button onClick={() => setKeywords(prev => prev.filter(kw => kw !== k))} className="hover:text-white transition-colors">
                    <X weight="bold" className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
            <div className="text-[10px] font-bold tracking-[0.2em] text-gray-600 mb-1">TAGS <span className="text-gray-700 font-normal normal-case tracking-normal">(optional)</span></div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_MARADMIN_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 text-[11px] font-bold tracking-widest border transition-colors ${
                    pickedTags.has(tag)
                      ? 'border-red-600/60 text-red-400 bg-red-950/30'
                      : 'border-white/16 text-gray-500 hover:border-white/30 hover:text-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

        {/* Audience */}
        <div>
          <div className="text-[10px] font-bold tracking-[0.2em] text-gray-600 mb-1">AUDIENCE <span className="text-gray-700 font-normal normal-case tracking-normal">(optional)</span></div>
          <div className="flex flex-wrap gap-1.5">
            {AUDIENCES.map(a => (
              <button
                key={a}
                onClick={() => toggleAudience(a)}
                className={`px-2.5 py-1 text-[11px] font-bold tracking-widest border transition-colors ${
                  pickedAudiences.has(a)
                    ? 'border-red-600/60 text-red-400 bg-red-950/30'
                    : 'border-white/16 text-gray-500 hover:border-white/30 hover:text-gray-300'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-white/12">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-white/16 text-gray-500 text-[11px] font-bold tracking-widest hover:border-white/40 hover:text-white transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={() => canSave && onSave({ name: name.trim(), keywords, tags: [...pickedTags], audiences: [...pickedAudiences] })}
            disabled={!canSave}
            className="px-4 py-2 border border-red-600/60 text-red-500 text-[11px] font-bold tracking-widest hover:bg-red-900/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isEditing ? 'SAVE CHANGES' : 'SAVE VIEW'}
          </button>
        </div>
      </div>
    </div>
  );
}
