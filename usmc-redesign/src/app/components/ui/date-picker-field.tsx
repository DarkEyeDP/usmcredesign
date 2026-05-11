import { useEffect, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar } from './calendar';
import { ScrollArea } from './scroll-area';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseYmd(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  const d = new Date(year, month - 1, day);
  return isNaN(d.getTime()) ? null : d;
}

function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplay(value: string): string | null {
  const d = parseYmd(value);
  if (!d) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

interface DatePickerFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minYear?: number;
  maxYear?: number;
}

const currentYear = new Date().getFullYear();

export function DatePickerField({
  value,
  onChange,
  placeholder = 'Select date',
  minYear = 1980,
  maxYear = currentYear + 10,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'day' | 'month-year'>('day');
  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const parsed = parseYmd(value);
    return parsed ? new Date(parsed.getFullYear(), parsed.getMonth(), 1) : new Date(currentYear - 4, 0, 1);
  });
  const [pickerYear, setPickerYear] = useState<number>(viewMonth.getFullYear());
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = parseYmd(value) ?? undefined;
  const displayLabel = formatDisplay(value);
  const selectableYears = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  useEffect(() => {
    if (!open) setMode('day');
  }, [open]);

  useEffect(() => {
    if (selectedDate) {
      setViewMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
      setPickerYear(selectedDate.getFullYear());
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function changeMonth(offset: number) {
    setViewMonth((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() + offset, 1);
      setPickerYear(next.getFullYear());
      return next;
    });
  }

  function handleMonthPick(monthIndex: number) {
    const next = new Date(pickerYear, monthIndex, 1);
    setViewMonth(next);
    setMode('day');
  }

  function handleDaySelect(date: Date | undefined) {
    if (!date) return;
    onChange(toYmd(date));
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between border border-white/16 bg-black px-4 py-3 text-left font-mono text-sm transition-colors hover:border-white/30 focus:outline-none focus:border-red-500/50"
      >
        <span className={displayLabel ? 'text-white' : 'text-gray-600'}>{displayLabel ?? placeholder}</span>
        <CalendarDays className="h-4 w-4 flex-shrink-0 text-red-400" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-[300px] border border-white/12 bg-[#09090c] p-3 text-white shadow-2xl">
          {mode === 'day' ? (
            <>
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  className="flex h-8 w-8 items-center justify-center border border-white/12 bg-white/[0.03] text-white transition-colors hover:border-white/30 hover:bg-white/[0.08]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setMode('month-year')}
                  className="px-3 py-2 text-sm font-bold text-white transition-colors hover:text-red-300"
                >
                  {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </button>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  className="flex h-8 w-8 items-center justify-center border border-white/12 bg-white/[0.03] text-white transition-colors hover:border-white/30 hover:bg-white/[0.08]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <Calendar
                mode="single"
                month={viewMonth}
                onMonthChange={setViewMonth}
                selected={selectedDate}
                onSelect={handleDaySelect}
                className="p-0"
                classNames={{
                  caption: 'hidden',
                  nav: 'hidden',
                  months: 'flex flex-col gap-0',
                  month: 'flex flex-col gap-3',
                }}
              />
            </>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode('day')}
                  className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-gray-400 transition-colors hover:text-white"
                >
                  <ChevronLeft className="h-3 w-3" /> BACK
                </button>
                <div className="text-sm font-bold text-white">Choose Month for {pickerYear}</div>
                <div className="w-10" />
              </div>
              <div className="grid grid-cols-[84px_1fr] gap-3">
                <ScrollArea className="h-[260px] border border-white/10 bg-black/40">
                  <div className="pr-2">
                    {selectableYears.map((year) => (
                      <button
                        type="button"
                        key={year}
                        onClick={() => setPickerYear(year)}
                        className={`w-full border-b border-white/[0.06] px-3 py-2 text-left text-sm transition-colors last:border-b-0 ${
                          pickerYear === year
                            ? 'bg-red-950/40 text-white'
                            : 'text-gray-400 hover:bg-white/[0.05] hover:text-white'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
                <div className="grid grid-cols-3 gap-1.5">
                  {MONTH_LABELS.map((month, monthIndex) => (
                    <button
                      type="button"
                      key={month}
                      onClick={() => handleMonthPick(monthIndex)}
                      className={`border px-2 py-3 text-xs font-bold transition-colors ${
                        viewMonth.getMonth() === monthIndex && viewMonth.getFullYear() === pickerYear
                          ? 'border-red-600 bg-red-950/40 text-white'
                          : 'border-white/10 bg-white/[0.02] text-gray-400 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
