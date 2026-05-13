import type { NewsItem } from './types';

const STORAGE_KEY = 'usmc-news-bookmarks';

type StoredItem = Omit<NewsItem, 'pubDate'> & { pubDate: string };
type BookmarkStore = Record<string, StoredItem>;

function readStore(): BookmarkStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Migrate old format (plain string array) to new record format
    if (Array.isArray(parsed)) return {};
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: BookmarkStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // storage unavailable — silently skip
  }
}

export function getBookmarkedIds(): Set<string> {
  return new Set(Object.keys(readStore()));
}

export function getBookmarkedItems(): NewsItem[] {
  const store = readStore();
  return Object.values(store).map(item => ({ ...item, pubDate: new Date(item.pubDate) }));
}

export function toggleBookmark(item: NewsItem): Set<string> {
  const store = readStore();
  if (store[item.id]) {
    delete store[item.id];
  } else {
    store[item.id] = { ...item, pubDate: item.pubDate.toISOString() };
  }
  writeStore(store);
  return new Set(Object.keys(store));
}

export function updateBookmarkedItem(item: NewsItem): void {
  const store = readStore();
  if (store[item.id]) {
    store[item.id] = { ...item, pubDate: item.pubDate.toISOString() };
    writeStore(store);
  }
}
