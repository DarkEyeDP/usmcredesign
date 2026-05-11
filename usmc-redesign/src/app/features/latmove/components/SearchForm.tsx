import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ChevronDown, Lock, X, Plus, PanelLeftClose } from 'lucide-react';
import { RANK_OPTIONS, CLEARANCE_OPTIONS, EDUCATION_OPTIONS, EDUCATION_HAS_DEGREE, DLPT_LANGUAGE_OPTIONS, DLPT_LEVELS } from '../types';
import type { LanguageEntry } from '../types';
import { CERT_LIBRARY, CERT_BY_ID, CERT_CATEGORIES } from '../db/cert-library';
import { DEGREE_FIELD_LIBRARY, DEGREE_FIELD_BY_ID, DEGREE_FIELD_CATEGORIES } from '../db/degree-field-library';
import { getMOSTitleById } from '../db/queries';

interface Props {
  gt: string; setGt: (v: string) => void;
  mm: string; setMm: (v: string) => void;
  el: string; setEl: (v: string) => void;
  cl: string; setCl: (v: string) => void;
  rank: string; setRank: (v: string) => void;
  pmos: string; setPmos: (v: string) => void;
  amos: string[]; setAmos: (v: string[]) => void;
  clearance: string; setClearance: (v: string) => void;
  hasNormalColorVision: boolean; setHasNormalColorVision: (v: boolean) => void;
  education: string; setEducation: (v: string) => void;
  degreeFields: string[]; setDegreeFields: (v: string[]) => void;
  certifications: string[]; setCertifications: (v: string[]) => void;
  languages: LanguageEntry[]; setLanguages: (v: LanguageEntry[]) => void;
  isLoggedIn: boolean;
  onSearch: () => void;
  onReset: () => void;
  onCollapse: () => void;
}

const SCORE_FIELDS = [
  { label: 'GT', key: 'gt' as const },
  { label: 'MM', key: 'mm' as const },
  { label: 'EL', key: 'el' as const },
  { label: 'CL', key: 'cl' as const },
] as const;


export function SearchForm({
  gt, setGt, mm, setMm, el, setEl, cl, setCl,
  rank, setRank,
  pmos, setPmos, amos, setAmos,
  clearance, setClearance, hasNormalColorVision, setHasNormalColorVision,
  education, setEducation, degreeFields, setDegreeFields,
  certifications, setCertifications,
  languages, setLanguages,
  isLoggedIn, onSearch, onReset, onCollapse,
}: Props) {
  const values = { gt, mm, el, cl };
  const setters = { gt: setGt, mm: setMm, el: setEl, cl: setCl };
  const hasRequiredInputs = Boolean(rank) && SCORE_FIELDS.every(({ key }) => values[key].trim().length > 0);
  const missingScoreFields = SCORE_FIELDS.filter(({ key }) => values[key].trim().length === 0);
  const scoreExamples = { gt: '110', mm: '105', el: '100', cl: '108' };

  const [amosInput, setAmosInput] = useState('');
  const [degreeFieldInput, setDegreeFieldInput] = useState('');
  const [isDegreeFieldInputActive, setIsDegreeFieldInputActive] = useState(false);
  const [certInput, setCertInput] = useState('');
  const [isCertInputActive, setIsCertInputActive] = useState(false);
  const [langInput, setLangInput] = useState('');
  const [langL, setLangL] = useState('2');
  const [langR, setLangR] = useState('2');
  const [isLangInputActive, setIsLangInputActive] = useState(false);
  const [hasSubmitAttempt, setHasSubmitAttempt] = useState(false);
  const hasPendingLanguage = langInput.trim().length > 0;

  const filteredCertOptions = useMemo(() => {
    const query = certInput.trim().toLowerCase();
    return CERT_LIBRARY.filter(c =>
      !certifications.includes(c.id) &&
      (!query || c.label.toLowerCase().includes(query) || c.category.toLowerCase().includes(query))
    );
  }, [certInput, certifications]);

  const filteredDegreeFieldOptions = useMemo(() => {
    const query = degreeFieldInput.trim().toLowerCase();

    return DEGREE_FIELD_LIBRARY.filter(entry => {
      if (degreeFields.includes(entry.id)) return false;
      if (!query) return true;

      return (
        entry.label.toLowerCase().includes(query) ||
        entry.category.toLowerCase().includes(query) ||
        (entry.searchTerms ?? []).some(term => term.toLowerCase().includes(query))
      );
    });
  }, [degreeFieldInput, degreeFields]);

  const filteredDegreeFieldsByCategory = useMemo(() => {
    return DEGREE_FIELD_CATEGORIES
      .map(cat => ({ cat, entries: filteredDegreeFieldOptions.filter(entry => entry.category === cat) }))
      .filter(group => group.entries.length > 0);
  }, [filteredDegreeFieldOptions]);

  const filteredCertByCategory = useMemo(() => {
    return CERT_CATEGORIES
      .map(cat => ({ cat, entries: filteredCertOptions.filter(c => c.category === cat) }))
      .filter(g => g.entries.length > 0);
  }, [filteredCertOptions]);

  const filteredLanguageOptions = useMemo(() => {
    const query = langInput.trim().toLowerCase();

    return DLPT_LANGUAGE_OPTIONS.filter(option => {
      const alreadySelected = languages.some(
        entry => entry.language.toLowerCase() === option.toLowerCase()
      );

      if (alreadySelected) return false;
      if (!query) return true;

      return option.toLowerCase().includes(query);
    });
  }, [langInput, languages]);
  const amosDetails = useMemo(
    () => amos.map(code => ({ code, title: getMOSTitleById(code) })),
    [amos]
  );

  function handleAddAmos() {
    const val = amosInput.trim().toUpperCase().slice(0, 4);
    if (val && !amos.includes(val)) setAmos([...amos, val]);
    setAmosInput('');
  }
  function handleAmosKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); handleAddAmos(); }
  }

  function handleAddLanguage() {
    const lang = langInput.trim();
    if (!lang) return;
    const exists = languages.some(l => l.language.toLowerCase() === lang.toLowerCase());
    if (!exists) setLanguages([...languages, { language: lang, listening: langL, reading: langR }]);
    setLangInput('');
    setLangL('2');
    setLangR('2');
  }
  function handleLangKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); handleAddLanguage(); }
  }

  function handleSubmit() {
    setHasSubmitAttempt(true);
    if (!hasRequiredInputs) return;

    onSearch();
    if (window.matchMedia('(max-width: 767px)').matches) {
      onCollapse();
    }
  }

  function handleReset() {
    setHasSubmitAttempt(false);
    setAmosInput('');
    setCertInput('');
    setIsCertInputActive(false);
    setLangInput('');
    setLangL('2');
    setLangR('2');
    setIsLangInputActive(false);
    onReset();
  }

  return (
    <div className="border-r border-white/12 p-6">
      {/* Step header */}
      <div className="hidden md:flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-6 h-6 border border-white/35 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-red-500">1</span>
          </div>
          <span className="text-sm font-bold text-gray-400 tracking-widest truncate">
            {isLoggedIn ? 'YOUR INFORMATION' : 'ENTER YOUR INFO'}
          </span>
        </div>
        <button
          type="button"
          onClick={onCollapse}
          className="flex h-8 w-8 items-center justify-center border border-white/18 text-gray-500 transition-colors hover:border-white/40 hover:text-gray-200"
          aria-label="Collapse information panel"
        >
          <PanelLeftClose className="h-4 w-4 md:rotate-0 rotate-90" />
        </button>
      </div>

      {/* ASVAB score inputs */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[13px] text-gray-500 font-bold tracking-[0.2em]">ASVAB LINE SCORES</span>
          <span className="text-[10px] font-bold tracking-[0.18em] text-red-500/80">REQUIRED</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {SCORE_FIELDS.map(({ label, key }) => (
            <div
              key={label}
              className={`border text-center p-2 ${
                !values[key].trim()
                  ? 'border-red-500 bg-red-950/15'
                  : 'border-white/16'
              }`}
            >
              <div className="flex items-center justify-center gap-0.5 mb-1">
                <span className="text-xs text-gray-600 font-mono">{label}</span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={3}
                placeholder={scoreExamples[key]}
                value={values[key]}
                onChange={e => setters[key](e.target.value.replace(/\D/g, '').slice(0, 3))}
                className="w-full bg-transparent text-white text-lg font-black text-center placeholder-gray-800 focus:outline-none overflow-hidden"
              />
            </div>
          ))}
        </div>
        {hasSubmitAttempt && missingScoreFields.length > 0 && (
          <div className="mt-2 text-[11px] font-mono text-red-400">
            Missing required scores: {missingScoreFields.map(({ label }) => label).join(', ')}
          </div>
        )}
      </div>

      {/* Current rank */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[13px] text-gray-500 font-bold tracking-[0.2em]">CURRENT RANK</span>
          <span className="text-[10px] font-bold tracking-[0.18em] text-red-500/80">REQUIRED</span>
        </div>
        <div className="relative">
          <select
            value={rank}
            onChange={e => setRank(e.target.value)}
            className={`w-full bg-black border px-3 py-2.5 text-sm font-mono appearance-none focus:outline-none focus:border-red-500/50 pr-8 ${
              !rank ? 'border-red-500 bg-red-950/15' : 'border-white/16'
            } ${rank ? 'text-white' : 'text-gray-600'}`}
          >
            <option value="" disabled hidden>e.g. Corporal (E-4)</option>
            {RANK_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600 pointer-events-none" />
        </div>
        {hasSubmitAttempt && !rank && (
          <div className="mt-2 text-[11px] font-mono text-red-400">Current rank is required.</div>
        )}
      </div>

      {/* Current PMOS */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[13px] text-gray-500 font-bold tracking-[0.2em]">CURRENT PMOS</span>
        </div>
        <input
          type="text"
          inputMode="text"
          maxLength={4}
          placeholder="e.g. 0311"
          value={pmos}
          onChange={e => setPmos(e.target.value.toUpperCase().slice(0, 4))}
          className="w-full bg-black border border-white/16 text-white px-3 py-2.5 text-sm font-mono placeholder-gray-700 focus:outline-none focus:border-red-500/50"
        />
      </div>

      {/* Additional AMOSs */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[13px] text-gray-500 font-bold tracking-[0.2em]">ADDITIONAL MOS (AMOS)</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="text"
            maxLength={4}
            placeholder="e.g. 0369"
            value={amosInput}
            onChange={e => setAmosInput(e.target.value.toUpperCase().slice(0, 4))}
            onKeyDown={handleAmosKeyDown}
            className="flex-1 bg-black border border-white/16 text-white px-3 py-2.5 text-sm font-mono placeholder-gray-700 focus:outline-none focus:border-red-500/50"
          />
          <button
            type="button"
            onClick={handleAddAmos}
            disabled={!amosInput.trim() || amos.length >= 6}
            className="px-3 py-2.5 border border-white/16 text-gray-500 hover:text-white hover:border-white/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        {amos.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {amosDetails.map(({ code, title }) => (
              <span
                key={code}
                className="flex items-center gap-1 px-2 py-1 bg-red-900/15 border border-red-900/30 text-red-400 text-xs font-mono"
              >
                {title ? `${code} - ${title}` : code}
                <button
                  type="button"
                  onClick={() => setAmos(amos.filter(a => a !== code))}
                  className="text-red-600 hover:text-red-400 transition-colors"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Security clearance */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[13px] text-gray-500 font-bold tracking-[0.2em]">SECURITY CLEARANCE</span>
        </div>
        <div className="relative">
          <select
            value={clearance}
            onChange={e => setClearance(e.target.value)}
            className="w-full bg-black border border-white/16 text-white px-3 py-2.5 text-sm font-mono appearance-none focus:outline-none focus:border-red-500/50 pr-8"
          >
            {CLEARANCE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600 pointer-events-none" />
        </div>
      </div>

      {/* Color vision */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[13px] text-gray-500 font-bold tracking-[0.2em]">COLOR VISION</span>
        </div>
        <button
          type="button"
          onClick={() => setHasNormalColorVision(!hasNormalColorVision)}
          className={`flex w-full items-center justify-between gap-4 border px-3 py-2.5 text-left transition-colors ${
            hasNormalColorVision
              ? 'border-red-500/40 bg-red-900/10 text-white'
              : 'border-white/16 bg-black text-gray-500 hover:border-white/40'
          }`}
          aria-pressed={hasNormalColorVision}
        >
          <span className="text-sm font-mono leading-snug">Normal color vision / perception</span>
          <span className="flex shrink-0 flex-col items-center gap-1">
            <span className={`h-5 w-9 border p-0.5 transition-colors ${
              hasNormalColorVision ? 'border-red-500/50 bg-red-900/25' : 'border-white/16 bg-black'
            }`}>
              <span className={`block h-full w-3.5 bg-current transition-transform ${
                hasNormalColorVision ? 'translate-x-[14px] text-red-500' : 'translate-x-0 text-gray-700'
              }`} />
            </span>
            <span className={`text-[10px] font-bold tracking-widest ${
              hasNormalColorVision ? 'text-red-400' : 'text-gray-400'
            }`}>
              {hasNormalColorVision ? 'YES' : 'NO'}
            </span>
          </span>
        </button>
      </div>

      {/* Education level */}
      <div className="mb-5">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[13px] text-gray-500 font-bold tracking-[0.2em]">EDUCATION LEVEL</span>
        </div>
        <div className="relative mb-2">
          <select
            value={education}
            onChange={e => {
              setEducation(e.target.value);
              if (!EDUCATION_HAS_DEGREE.has(e.target.value)) {
                setDegreeFields([]);
                setDegreeFieldInput('');
              }
            }}
            className="w-full bg-black border border-white/16 text-white px-3 py-2.5 text-sm font-mono appearance-none focus:outline-none focus:border-red-500/50 pr-8"
          >
            {EDUCATION_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600 pointer-events-none" />
        </div>
        {EDUCATION_HAS_DEGREE.has(education) && (
          <>
            <div className="relative">
              <input
                type="text"
                placeholder="Search degree fields..."
                value={degreeFieldInput}
                onChange={e => setDegreeFieldInput(e.target.value)}
                onFocus={() => setIsDegreeFieldInputActive(true)}
                onBlur={() => window.setTimeout(() => setIsDegreeFieldInputActive(false), 120)}
                className="w-full bg-black border border-white/16 text-white px-3 py-2.5 text-sm font-mono placeholder-gray-700 focus:outline-none focus:border-red-500/50"
              />
              {isDegreeFieldInputActive && (
                <div className="absolute left-0 top-full z-10 mt-1 w-full border border-white/16 bg-black shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  <div className="max-h-60 overflow-y-auto">
                    {filteredDegreeFieldsByCategory.length > 0 ? (
                      filteredDegreeFieldsByCategory.map(({ cat, entries }) => (
                        <div key={cat}>
                          <div className="sticky top-0 border-b border-white/8 bg-black/95 px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] text-gray-600">
                            {cat.toUpperCase()}
                          </div>
                          {entries.map(entry => (
                            <button
                              key={entry.id}
                              type="button"
                              onMouseDown={e => {
                                e.preventDefault();
                                setDegreeFields([...degreeFields, entry.id]);
                                setDegreeFieldInput('');
                              }}
                              className="block w-full border-b border-white/8 px-3 py-2 text-left text-sm font-mono text-gray-300 transition-colors hover:bg-white/5 hover:text-white last:border-b-0"
                            >
                              {entry.label}
                            </button>
                          ))}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm font-mono text-gray-600">No matching degree fields</div>
                    )}
                  </div>
                  <div className="border-t border-white/12 px-3 py-1 text-[10px] font-mono text-gray-600">
                    {filteredDegreeFieldOptions.length} field{filteredDegreeFieldOptions.length === 1 ? '' : 's'} available
                  </div>
                </div>
              )}
            </div>
            {degreeFields.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {degreeFields.map(id => (
                  <span key={id} className="flex items-center gap-1 border border-red-900/30 bg-red-900/15 px-2 py-1 text-xs font-mono text-red-400">
                    {DEGREE_FIELD_BY_ID[id]?.label ?? id}
                    <button
                      type="button"
                      onClick={() => setDegreeFields(degreeFields.filter(fieldId => fieldId !== id))}
                      className="text-red-600 transition-colors hover:text-red-400"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Certifications */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[13px] text-gray-500 font-bold tracking-[0.2em]">CERTIFICATIONS</span>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search certifications..."
            value={certInput}
            onChange={e => setCertInput(e.target.value)}
            onFocus={() => setIsCertInputActive(true)}
            onBlur={() => window.setTimeout(() => setIsCertInputActive(false), 120)}
            className="w-full bg-black border border-white/16 text-white px-3 py-2.5 text-sm font-mono placeholder-gray-700 focus:outline-none focus:border-red-500/50"
          />
          {isCertInputActive && (
            <div className="absolute left-0 top-full z-10 mt-1 w-full border border-white/16 bg-black shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <div className="max-h-60 overflow-y-auto">
                {filteredCertByCategory.length > 0 ? (
                  filteredCertByCategory.map(({ cat, entries }) => (
                    <div key={cat}>
                      <div className="sticky top-0 bg-black/95 px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] text-gray-600 border-b border-white/8">
                        {cat.toUpperCase()}
                      </div>
                      {entries.map(cert => (
                        <button
                          key={cert.id}
                          type="button"
                          onMouseDown={e => {
                            e.preventDefault();
                            setCertifications([...certifications, cert.id]);
                            setCertInput('');
                          }}
                          className="block w-full border-b border-white/8 px-3 py-2 text-left text-sm font-mono text-gray-300 transition-colors hover:bg-white/5 hover:text-white last:border-b-0"
                        >
                          {cert.label}
                        </button>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm font-mono text-gray-600">No matching certifications</div>
                )}
              </div>
              <div className="border-t border-white/12 px-3 py-1 text-[10px] font-mono text-gray-600">
                {filteredCertOptions.length} cert{filteredCertOptions.length === 1 ? '' : 's'} available
              </div>
            </div>
          )}
        </div>
        {certifications.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {certifications.map(id => (
              <span key={id} className="flex items-center gap-1 px-2 py-1 bg-red-900/15 border border-red-900/30 text-red-400 text-xs font-mono">
                {CERT_BY_ID[id]?.label ?? id}
                <button type="button" onClick={() => setCertifications(certifications.filter(c => c !== id))} className="text-red-600 hover:text-red-400 transition-colors">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Languages / DLPT */}
      <div className="mb-5">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[13px] text-gray-500 font-bold tracking-[0.2em]">LANGUAGES (DLPT)</span>
        </div>
        <div className="border border-white/14 bg-black/40 p-2.5 mb-2">
          <div className="grid grid-cols-[minmax(0,1fr)_3.25rem_3.25rem_auto] items-end gap-2 mb-2">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-xs text-gray-600 font-mono">LANGUAGE</span>
              <div className="relative flex-1 min-w-0">
              <input
                type="text"
                placeholder="Search or select a language"
                value={langInput}
                onChange={e => setLangInput(e.target.value)}
                onKeyDown={handleLangKeyDown}
                onFocus={() => setIsLangInputActive(true)}
                onBlur={() => window.setTimeout(() => setIsLangInputActive(false), 100)}
                className="h-[52px] w-full bg-black border border-white/16 px-3 py-2.5 text-sm font-mono text-white placeholder-gray-700 focus:outline-none focus:border-red-500/50"
              />
              {isLangInputActive && (
                <div className="absolute left-0 top-full z-10 mt-1 min-w-full w-max max-w-[min(32rem,calc(100vw-4rem))] border border-white/16 bg-black shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
                  <div className="max-h-48 overflow-y-auto">
                    {filteredLanguageOptions.length > 0 ? (
                      filteredLanguageOptions.map(option => (
                        <button
                          key={option}
                          type="button"
                          onMouseDown={e => {
                            e.preventDefault();
                            setLangInput(option);
                            setIsLangInputActive(false);
                          }}
                          className="block w-full border-b border-white/12 px-3 py-2 text-left text-sm font-mono text-white whitespace-normal break-words transition-colors hover:bg-white/5 last:border-b-0"
                        >
                          {option}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm font-mono text-gray-600">
                        No matching languages
                      </div>
                    )}
                  </div>
                  <div className="border-t border-white/12 px-3 py-1 text-[10px] font-mono text-gray-600">
                    {filteredLanguageOptions.length} option{filteredLanguageOptions.length === 1 ? '' : 's'} available
                  </div>
                </div>
              )}
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-600 font-mono">L</span>
              <select
                value={langL}
                onChange={e => setLangL(e.target.value)}
                className={`h-[52px] w-[3.25rem] appearance-none border border-white/16 bg-black px-0 text-center text-base leading-none font-mono focus:outline-none [text-align-last:center] ${
                  hasPendingLanguage ? 'text-white' : 'text-gray-700'
                }`}
              >
                {DLPT_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-600 font-mono">R</span>
              <select
                value={langR}
                onChange={e => setLangR(e.target.value)}
                className={`h-[52px] w-[3.25rem] appearance-none border border-white/16 bg-black px-0 text-center text-base leading-none font-mono focus:outline-none [text-align-last:center] ${
                  hasPendingLanguage ? 'text-white' : 'text-gray-700'
                }`}
              >
                {DLPT_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={handleAddLanguage}
                disabled={!langInput.trim()}
                className="h-[52px] px-3 border border-white/16 text-gray-500 hover:text-white hover:border-white/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
        {languages.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {languages.map(l => (
              <span key={l.language} className="flex items-center gap-1 px-2 py-1 bg-red-900/15 border border-red-900/30 text-red-400 text-xs font-mono">
                {l.language} L:{l.listening}/R:{l.reading}
                <button type="button" onClick={() => setLanguages(languages.filter(x => x.language !== l.language))} className="text-red-600 hover:text-red-400 transition-colors">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <motion.button
          className="py-3 bg-red-700 text-white text-sm font-black tracking-widest hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
        >
          {isLoggedIn ? 'UPDATE RESULTS' : 'FIND MY OPTIONS'}
          <ChevronRight className="w-3.5 h-3.5" />
        </motion.button>
        <button
          type="button"
          onClick={handleReset}
          className="border border-white/16 px-4 text-[12px] font-bold tracking-widest text-gray-500 transition-colors hover:border-white/40 hover:text-white"
        >
          RESET
        </button>
      </div>

      <div className="flex items-center gap-1.5 mt-3">
        <Lock className="w-3 h-3 text-gray-700" />
        <span className="text-xs text-gray-600">Your information is secure and will not be stored.</span>
      </div>
    </div>
  );
}
