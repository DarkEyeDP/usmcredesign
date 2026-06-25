import { useState, useEffect } from 'react';

// ── NumericInput ────────────────────────────────────────────────────────────────
export function NumericInput({
  value,
  onChange,
  min = 0,
  max,
  className,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  className: string;
}) {
  const [raw, setRaw] = useState(value > 0 ? String(value) : '');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setRaw(value > 0 ? String(value) : '');
    }
  }, [value, isFocused]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const stripped = e.target.value.replace(/[^0-9]/g, '');
    setRaw(stripped);
    let n = stripped === '' ? min : Number(stripped);
    if (n < min) n = min;
    if (max !== undefined && n > max) n = max;
    onChange(n);
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    setIsFocused(true);
    if (raw === '0' || raw === String(min)) setRaw('');
    else e.target.select();
  }

  function handleBlur() {
    setIsFocused(false);
    if (raw === '') setRaw(String(min));
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={raw}
      placeholder={String(min)}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={className}
    />
  );
}
