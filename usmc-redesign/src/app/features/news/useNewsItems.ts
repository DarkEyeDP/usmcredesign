import { useState, useEffect } from 'react';
import type { NewsItem } from './types';

const DATA_URL = '/data/news.json';

type StoredItem = Omit<NewsItem, 'pubDate'> & { pubDate: string };

interface NewsData {
  generatedAt: string;
  feedCount: number;
  itemCount: number;
  items: StoredItem[];
}

export interface UseNewsItemsResult {
  newsItems: NewsItem[];
  pressReleases: NewsItem[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

function revive(item: StoredItem): NewsItem {
  const pubDate = new Date(item.pubDate);
  return {
    attachments: [],
    ...item,
    pubDate: Number.isNaN(pubDate.getTime()) ? new Date() : pubDate,
  };
}

// Module-level cache — one fetch per session, shared across all hook instances.
let cached: { newsItems: NewsItem[]; pressReleases: NewsItem[] } | null = null;
let request: Promise<{ newsItems: NewsItem[]; pressReleases: NewsItem[] }> | null = null;

function getOrFetch(): Promise<{ newsItems: NewsItem[]; pressReleases: NewsItem[] }> {
  if (cached) return Promise.resolve(cached);
  if (request) return request;

  request = fetch(DATA_URL)
    .then(res => {
      if (!res.ok) throw new Error(`Failed to load news (HTTP ${res.status})`);
      return res.json() as Promise<NewsData>;
    })
    .then(data => {
      const all = (data.items ?? []).map(revive);
      const result = {
        newsItems: all.filter(i => i.source === 'news'),
        pressReleases: all.filter(i => i.source === 'press-release'),
      };
      cached = result;
      request = null;
      return result;
    })
    .catch(err => {
      request = null;
      throw err;
    });

  return request;
}

export function useNewsItems(): UseNewsItemsResult {
  const [state, setState] = useState<UseNewsItemsResult>({
    newsItems: cached?.newsItems ?? [],
    pressReleases: cached?.pressReleases ?? [],
    loading: !cached,
    refreshing: false,
    error: null,
  });

  useEffect(() => {
    if (cached) return;

    let cancelled = false;

    getOrFetch()
      .then(result => {
        if (cancelled) return;
        setState({
          newsItems: result.newsItems,
          pressReleases: result.pressReleases,
          loading: false,
          refreshing: false,
          error: null,
        });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setState(prev => ({
          ...prev,
          loading: false,
          refreshing: false,
          error: e instanceof Error ? e.message : 'Failed to load news',
        }));
      });

    return () => { cancelled = true; };
  }, []);

  return state;
}
