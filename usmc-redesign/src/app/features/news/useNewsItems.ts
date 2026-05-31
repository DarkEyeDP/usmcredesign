import { useState, useEffect } from 'react';
import { fetchNewsFeed, fetchPressReleaseFeed } from './rssService';
import type { NewsItem } from './types';

const CACHE_KEY = 'usmc-news-cache';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

type StoredNewsItem = Omit<NewsItem, 'pubDate'> & { pubDate: string };

interface CacheShape {
  ts: number;
  complete?: boolean;
  newsItems: StoredNewsItem[];
  pressReleases: StoredNewsItem[];
}

interface FeedData {
  newsItems: NewsItem[];
  pressReleases: NewsItem[];
}

interface CacheSnapshot extends FeedData {
  ts: number;
  isFresh: boolean;
}

interface FeedLoadResult extends FeedData {
  error: string | null;
}

let memoryCache: CacheSnapshot | null = null;
let feedRequest: Promise<FeedLoadResult> | null = null;

function hasAnyItems(data: FeedData): boolean {
  return data.newsItems.length > 0 || data.pressReleases.length > 0;
}

function reviveDates(items: StoredNewsItem[] | undefined): NewsItem[] {
  if (!Array.isArray(items)) return [];

  return items.map(item => {
    const pubDate = new Date(item.pubDate);
    return {
      attachments: [],
      ...item,
      pubDate: Number.isNaN(pubDate.getTime()) ? new Date() : pubDate,
    };
  });
}

function serializeItems(items: NewsItem[]): StoredNewsItem[] {
  return items.map(item => ({ ...item, pubDate: item.pubDate.toISOString() }));
}

function toSnapshot(cache: CacheShape): CacheSnapshot | null {
  const ts = typeof cache.ts === 'number' ? cache.ts : 0;
  const data = {
    newsItems: reviveDates(cache.newsItems),
    pressReleases: reviveDates(cache.pressReleases),
  };

  if (!ts || !hasAnyItems(data)) return null;

  return {
    ...data,
    ts,
    isFresh: cache.complete !== false && Date.now() - ts <= CACHE_TTL,
  };
}

function readCache(): CacheSnapshot | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return toSnapshot(JSON.parse(raw) as CacheShape);
  } catch {
    return null;
  }
}

function getCachedSnapshot(): CacheSnapshot | null {
  if (memoryCache) {
    return {
      ...memoryCache,
      isFresh: memoryCache.isFresh && Date.now() - memoryCache.ts <= CACHE_TTL,
    };
  }

  const cached = readCache();
  memoryCache = cached;
  return cached;
}

function writeCache(newsItems: NewsItem[], pressReleases: NewsItem[], complete: boolean) {
  const ts = Date.now();
  memoryCache = {
    ts,
    isFresh: complete,
    newsItems,
    pressReleases,
  };

  try {
    const cache: CacheShape = {
      ts,
      complete,
      newsItems: serializeItems(newsItems),
      pressReleases: serializeItems(pressReleases),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // session storage unavailable — silently skip
  }
}

async function fetchLatestFeeds(fallback?: FeedData): Promise<FeedLoadResult> {
  const [newsResult, pressResult] = await Promise.allSettled([fetchNewsFeed(), fetchPressReleaseFeed()]);
  const newsLoaded = newsResult.status === 'fulfilled';
  const pressLoaded = pressResult.status === 'fulfilled';
  const newsItems = newsLoaded ? newsResult.value : fallback?.newsItems ?? [];
  const pressReleases = pressLoaded ? pressResult.value : fallback?.pressReleases ?? [];
  const data = { newsItems, pressReleases };
  const complete = newsLoaded && pressLoaded;

  if (newsLoaded || pressLoaded) {
    writeCache(newsItems, pressReleases, complete);
  }

  if (!hasAnyItems(data)) {
    throw new Error('Failed to load Marine Corps news feeds');
  }

  return {
    ...data,
    error: complete ? null : 'Some Marine Corps news feeds could not be refreshed',
  };
}

function getFeedRequest(fallback?: FeedData): Promise<FeedLoadResult> {
  if (!feedRequest) {
    feedRequest = fetchLatestFeeds(fallback).finally(() => {
      feedRequest = null;
    });
  }

  return feedRequest;
}

export interface UseNewsItemsResult {
  newsItems: NewsItem[];
  pressReleases: NewsItem[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

export function useNewsItems(): UseNewsItemsResult {
  const [state, setState] = useState<UseNewsItemsResult>(() => {
    const cached = getCachedSnapshot();
    return {
      newsItems: cached?.newsItems ?? [],
      pressReleases: cached?.pressReleases ?? [],
      loading: !cached,
      refreshing: Boolean(cached && !cached.isFresh),
      error: null,
    };
  });

  useEffect(() => {
    const cached = getCachedSnapshot();
    if (cached) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({
        newsItems: cached.newsItems,
        pressReleases: cached.pressReleases,
        loading: false,
        refreshing: !cached.isFresh,
        error: null,
      });

      if (cached.isFresh) return;
    }

    let cancelled = false;
    if (!cached) {
      setState(prev => ({ ...prev, loading: true, refreshing: false, error: null }));
    }

    getFeedRequest(cached ?? undefined)
      .then(result => {
        if (cancelled) return;
        setState({
          newsItems: result.newsItems,
          pressReleases: result.pressReleases,
          loading: false,
          refreshing: false,
          error: hasAnyItems(result) ? null : result.error,
        });
      })
      .catch(err => {
        if (cancelled) return;
        const fallback = getCachedSnapshot();
        setState({
          newsItems: fallback?.newsItems ?? [],
          pressReleases: fallback?.pressReleases ?? [],
          loading: false,
          refreshing: false,
          error: fallback && hasAnyItems(fallback)
            ? null
            : err instanceof Error ? err.message : 'Failed to load news',
        });
      });

    return () => { cancelled = true; };
  }, []);

  return state;
}
