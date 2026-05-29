import type { FetchMethod, RSSMessage } from './maradminUtils';

const STORAGE_KEY = 'maradmin:state:v1';
const FEED_CACHE_MAX_AGE_MS = 15 * 60 * 1000;
export const MAX_FEED_MESSAGES = 500;
// Stop background archive loading above this threshold (~3.5 MB of MARADMIN state).
export const ARCHIVE_STORAGE_LIMIT_BYTES = 3.5 * 1024 * 1024;
const MAX_READ_NUMBERS = 2000;
const MAX_NEW_NUMBERS = 500;
const MAX_SAVED_NUMBERS = 500;
const MAX_RECENT_ARTICLES = 75;

export interface MARADMINUserState {
  readNumbers: string[];
  newNumbers: string[];
  savedNumbers: string[];
}

export interface CachedArticleEntry {
  text: string;
  method: FetchMethod;
  source: string | null;
  cachedAt: number;
}

export interface CustomView {
  id: string;
  name: string;
  keywords: string[];
  tags: string[];
  audiences: string[];
}

interface StoredFeedCache {
  cachedAt: number;
  messages: RSSMessage[];
  nextArchivePage?: number;
  archiveHasMore?: boolean;
}

interface StoredMARADMINState {
  feedCache?: StoredFeedCache;
  articles?: Record<string, CachedArticleEntry>;
  userState?: MARADMINUserState;
  customViews?: CustomView[];
}

function createDefaultUserState(): MARADMINUserState {
  return {
    readNumbers: [],
    newNumbers: [],
    savedNumbers: [],
  };
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readState(): StoredMARADMINState {
  if (!canUseStorage()) return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as StoredMARADMINState;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeState(state: StoredMARADMINState) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota or serialization failures so the UI still works.
  }
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function keepMostRecent(values: string[], limit: number): string[] {
  return unique(values).slice(-limit);
}

function normalizeUserState(userState: MARADMINUserState): MARADMINUserState {
  return {
    readNumbers: keepMostRecent(userState.readNumbers, MAX_READ_NUMBERS),
    newNumbers: keepMostRecent(userState.newNumbers, MAX_NEW_NUMBERS),
    savedNumbers: keepMostRecent(userState.savedNumbers, MAX_SAVED_NUMBERS),
  };
}

export function limitStoredFeedMessages(messages: RSSMessage[]): RSSMessage[] {
  return messages.slice(0, MAX_FEED_MESSAGES);
}

export function getCachedArchiveCursor(): { nextPage: number; hasMore: boolean } {
  const feedCache = readState().feedCache;
  return {
    nextPage: feedCache?.nextArchivePage ?? 2,
    hasMore: feedCache?.archiveHasMore ?? true,
  };
}

export function pruneArticleEntries(
  articles: Record<string, CachedArticleEntry>,
  savedNumbers: string[],
): Record<string, CachedArticleEntry> {
  const savedKeys = new Set(savedNumbers);
  const entries = Object.entries(articles);
  const savedEntries = entries.filter(([key]) => savedKeys.has(key));
  const recentEntries = entries
    .filter(([key]) => !savedKeys.has(key))
    .sort(([, a], [, b]) => b.cachedAt - a.cachedAt)
    .slice(0, MAX_RECENT_ARTICLES);

  return Object.fromEntries([...savedEntries, ...recentEntries]);
}

export function getMARADMINUserState(): MARADMINUserState {
  const state = readState().userState;
  if (!state) return createDefaultUserState();

  return {
    ...normalizeUserState({
      readNumbers: Array.isArray(state.readNumbers) ? state.readNumbers : [],
      newNumbers: Array.isArray(state.newNumbers) ? state.newNumbers : [],
      savedNumbers: Array.isArray(state.savedNumbers) ? state.savedNumbers : [],
    }),
  };
}

export function saveMARADMINUserState(userState: MARADMINUserState) {
  const state = readState();
  state.userState = normalizeUserState(userState);
  if (state.articles) {
    state.articles = pruneArticleEntries(state.articles, state.userState.savedNumbers);
  }
  writeState(state);
}

export function applyUserStateToMessages(messages: RSSMessage[], userState: MARADMINUserState): RSSMessage[] {
  const readSet = new Set(userState.readNumbers);
  const newSet = new Set(userState.newNumbers);
  const savedSet = new Set(userState.savedNumbers);

  return messages.map(message => ({
    ...message,
    unread: !readSet.has(message.number),
    isNew: newSet.has(message.number),
    saved: savedSet.has(message.number),
    archived: false,
  }));
}

export interface FeedMergeResult {
  messages: RSSMessage[];
  userState: MARADMINUserState;
  newMessageNumbers: string[];
}

export function mergeArchiveMessages(
  existingMessages: RSSMessage[],
  olderMessages: RSSMessage[],
  userState: MARADMINUserState,
): RSSMessage[] {
  const existingNumbers = new Set(existingMessages.map(message => message.number));
  const uniqueOlderMessages = olderMessages.filter(message => !existingNumbers.has(message.number));
  return applyUserStateToMessages([...existingMessages, ...uniqueOlderMessages], userState);
}

export function mergeFeedMessages(
  cachedMessages: RSSMessage[],
  freshMessages: RSSMessage[],
  userState: MARADMINUserState,
): FeedMergeResult {
  const cachedByNumber = new Map(cachedMessages.map(message => [message.number, message]));
  const freshNumbers = new Set(freshMessages.map(message => message.number));
  const detectedNewNumbers = cachedMessages.length > 0
    ? freshMessages
      .filter(message => !cachedByNumber.has(message.number) && !userState.readNumbers.includes(message.number))
      .map(message => message.number)
    : [];
  const nextUserState: MARADMINUserState = {
    ...userState,
    newNumbers: unique([
      ...userState.newNumbers.filter(number => freshNumbers.has(number) && !userState.readNumbers.includes(number)),
      ...detectedNewNumbers,
    ]),
  };

  const freshWithCachedMetadata = freshMessages.map(message => {
    const cachedMessage = cachedByNumber.get(message.number);
    if (!cachedMessage) return message;

    return {
      ...message,
      source: cachedMessage.source !== 'HQMC' ? cachedMessage.source : message.source,
    };
  });

  const preservedOlderMessages = cachedMessages.filter(message => !freshNumbers.has(message.number));
  const merged = [...freshWithCachedMetadata, ...preservedOlderMessages];

  return {
    messages: applyUserStateToMessages(merged, nextUserState),
    userState: nextUserState,
    newMessageNumbers: detectedNewNumbers,
  };
}

export function getCachedFeed(): RSSMessage[] | null {
  const feedCache = readState().feedCache;
  if (!feedCache?.messages?.length) return null;

  return limitStoredFeedMessages(feedCache.messages);
}

export function isCachedFeedFresh(): boolean {
  const feedCache = readState().feedCache;
  if (!feedCache?.cachedAt) return false;

  return Date.now() - feedCache.cachedAt < FEED_CACHE_MAX_AGE_MS;
}

export function saveCachedFeed(messages: RSSMessage[], archiveCursor?: { nextPage: number; hasMore: boolean }) {
  const state = readState();
  const currentFeedCache = state.feedCache;
  state.feedCache = {
    cachedAt: Date.now(),
    messages: limitStoredFeedMessages(messages),
    nextArchivePage: archiveCursor?.nextPage ?? currentFeedCache?.nextArchivePage ?? 2,
    archiveHasMore: archiveCursor?.hasMore ?? currentFeedCache?.archiveHasMore ?? true,
  };
  writeState(state);
}

export function getCustomViews(): CustomView[] {
  return readState().customViews ?? [];
}

export function saveCustomViews(views: CustomView[]): void {
  const state = readState();
  state.customViews = views;
  writeState(state);
}

export function getCachedArticle(cacheKey: string): CachedArticleEntry | null {
  return readState().articles?.[cacheKey] ?? null;
}

export function saveCachedArticle(cacheKey: string, article: CachedArticleEntry) {
  const state = readState();
  const nextArticles = {
    ...(state.articles ?? {}),
    [cacheKey]: article,
  };
  const savedNumbers = state.userState ? normalizeUserState(state.userState).savedNumbers : [];
  state.articles = pruneArticleEntries(nextArticles, savedNumbers);
  writeState(state);
}

export function deleteCachedArticle(cacheKey: string) {
  const state = readState();
  if (!state.articles?.[cacheKey]) return;
  const { [cacheKey]: _removed, ...rest } = state.articles;
  state.articles = rest;
  writeState(state);
}

export function clearMARADMINLocalState() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/** Approximate byte size of the stored MARADMIN state (raw JSON string length). */
export function getMARADMINStorageSizeBytes(): number {
  if (!canUseStorage()) return 0;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? raw.length : 0;
  } catch {
    return 0;
  }
}
