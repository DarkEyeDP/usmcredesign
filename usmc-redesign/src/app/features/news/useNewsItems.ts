import { useState, useEffect } from 'react';
import { fetchNewsFeed, fetchPressReleaseFeed } from './rssService';
import type { NewsItem } from './types';

const CACHE_KEY = 'usmc-news-cache';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface CacheShape {
  ts: number;
  newsItems: (Omit<NewsItem, 'pubDate'> & { pubDate: string })[];
  pressReleases: (Omit<NewsItem, 'pubDate'> & { pubDate: string })[];
}

function reviveDates(items: CacheShape['newsItems']): NewsItem[] {
  return items.map(item => ({ attachments: [], ...item, pubDate: new Date(item.pubDate) }));
}

function readCache(): { newsItems: NewsItem[]; pressReleases: NewsItem[] } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw) as CacheShape;
    if (Date.now() - cache.ts > CACHE_TTL) return null;
    return { newsItems: reviveDates(cache.newsItems), pressReleases: reviveDates(cache.pressReleases) };
  } catch {
    return null;
  }
}

function writeCache(newsItems: NewsItem[], pressReleases: NewsItem[]) {
  try {
    const cache: CacheShape = { ts: Date.now(), newsItems: newsItems as CacheShape['newsItems'], pressReleases: pressReleases as CacheShape['pressReleases'] };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // session storage unavailable — silently skip
  }
}

export interface UseNewsItemsResult {
  newsItems: NewsItem[];
  pressReleases: NewsItem[];
  loading: boolean;
  error: string | null;
}

export function useNewsItems(): UseNewsItemsResult {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [pressReleases, setPressReleases] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setNewsItems(cached.newsItems);
      setPressReleases(cached.pressReleases);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([fetchNewsFeed(), fetchPressReleaseFeed()])
      .then(([news, press]) => {
        if (cancelled) return;
        setNewsItems(news);
        setPressReleases(press);
        writeCache(news, press);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load news');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { newsItems, pressReleases, loading, error };
}
