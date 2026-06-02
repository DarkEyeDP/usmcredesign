import { useEffect, useMemo, useState } from 'react';
import {
  getContentMetrics,
  hasContentMetricsConfigured,
  recordContentRead,
  recordContentView,
  type ContentMetrics,
} from './contentMetricsService';

const READ_DELAY_MS = 8_000;
const READ_SCROLL_RATIO = 0.4;

interface ContentMetricsOptions {
  recordRead?: boolean;
  readDelayMs?: number;
  readScrollRatio?: number;
  viewStoragePrefix: string;
  readStoragePrefix?: string;
}

function getStorageKey(prefix: string, key: string): string {
  return `${prefix}${key}`;
}

function wasRecorded(prefix: string, key: string): boolean {
  try {
    return localStorage.getItem(getStorageKey(prefix, key)) === '1';
  } catch {
    return false;
  }
}

function markRecorded(prefix: string, key: string): void {
  try {
    localStorage.setItem(getStorageKey(prefix, key), '1');
  } catch {
    // Storage can be unavailable in private mode. The server still handles the write.
  }
}

function hasReadEnough(scrollRatio: number): boolean {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return true;
  return window.scrollY / scrollable >= scrollRatio;
}

export function useContentMetrics(key: string | undefined, options: ContentMetricsOptions) {
  const [metrics, setMetrics] = useState<ContentMetrics | null>(null);
  const enabled = useMemo(() => Boolean(key && hasContentMetricsConfigured()), [key]);

  useEffect(() => {
    if (!key || !enabled) {
      setMetrics(null);
      return;
    }

    let cancelled = false;

    getContentMetrics(key).then(nextMetrics => {
      if (!cancelled && nextMetrics) setMetrics(nextMetrics);
    });

    if (!wasRecorded(options.viewStoragePrefix, key)) {
      markRecorded(options.viewStoragePrefix, key);
      recordContentView(key).then(nextMetrics => {
        if (!cancelled && nextMetrics) setMetrics(nextMetrics);
      });
    }

    return () => {
      cancelled = true;
    };
  }, [enabled, key, options.viewStoragePrefix]);

  useEffect(() => {
    const readStoragePrefix = options.readStoragePrefix;
    if (!key || !enabled || !options.recordRead || !readStoragePrefix || wasRecorded(readStoragePrefix, key)) {
      return undefined;
    }

    let cancelled = false;
    let timeoutId: number | null = null;

    const recordRead = () => {
      if (cancelled || wasRecorded(readStoragePrefix, key)) return;
      markRecorded(readStoragePrefix, key);
      recordContentRead(key).then(nextMetrics => {
        if (!cancelled && nextMetrics) setMetrics(nextMetrics);
      });
    };

    const maybeRecordRead = () => {
      if (hasReadEnough(options.readScrollRatio ?? READ_SCROLL_RATIO)) recordRead();
    };

    timeoutId = window.setTimeout(maybeRecordRead, options.readDelayMs ?? READ_DELAY_MS);
    window.addEventListener('scroll', maybeRecordRead, { passive: true });

    return () => {
      cancelled = true;
      if (timeoutId != null) window.clearTimeout(timeoutId);
      window.removeEventListener('scroll', maybeRecordRead);
    };
  }, [enabled, key, options.readDelayMs, options.readScrollRatio, options.readStoragePrefix, options.recordRead]);

  return {
    metrics,
    enabled,
  };
}
