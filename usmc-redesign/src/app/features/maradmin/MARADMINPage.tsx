import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { SEOHead } from '@/app/components/SEOHead';
import {
  createSearchIndex,
  extractExactMARADMINNumberQuery,
  msgToSearchDoc,
  normalizeMARADMINNumber,
  promoteExactMARADMINMatches,
} from './maradminSearch';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Filter, ChevronRight, Printer, Bookmark, Maximize2, Minimize2,
  ChevronLeft, ChevronDown, ChevronUp, Loader2, Mail, Phone, RefreshCw, Plus, X, Pencil, Share2,
} from 'lucide-react';
import { generateMARADMINPdf, maradminEmailBody } from './maradminPdf';
import {
  fetchRSSFeed, fetchArticleContent, parseMARADMINText,
  extractMARADMINSource, extractMARADMINNumber, fetchMARADMINArchivePage, tagsFromContent,
  decodeMessageNumber, buildMessagePath,
  type RSSMessage, type ContentSection,
} from './maradminUtils';
import {
  applyUserStateToMessages,
  clearMARADMINLocalState,
  getCachedArticle,
  getCachedArchiveCursor,
  getCachedFeed,
  getCustomViews,
  getMARADMINStorageSizeBytes,
  getMARADMINUserState,
  isCachedFeedFresh,
  mergeArchiveMessages,
  mergeFeedMessages,
  saveCachedArticle,
  deleteCachedArticle,
  saveCachedFeed,
  saveCustomViews,
  saveMARADMINUserState,
  ARCHIVE_STORAGE_LIMIT_BYTES,
  MAX_FEED_MESSAGES,
  type CustomView,
  type MARADMINUserState,
} from './maradminStorage';
import { AUDIENCES, audiencesOf, matchesCustomView, type Audience } from './maradminAudienceUtils';
import { parseHeaderPOCs, renderContactEmail } from './maradminContactUtils';
import { ContentDisplay } from './components/ContentDisplay';
import { ContentSkeleton } from './components/ContentSkeleton';
import { FetchFailed } from './components/FetchFailed';
import { CreateViewModal } from './components/CreateViewModal';
import { useContentMetrics } from '../metrics/useContentMetrics';
import { buildMARADMINMetricKey } from '../metrics/contentMetricKeys';

const tabs = ['ALL MESSAGES', 'UNREAD', 'SAVED'];
const FEED_POLL_INTERVAL_MS = 3 * 60 * 1000;

function formatCount(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

function getMARADMINMetricsKey(msg: RSSMessage | null): string | undefined {
  if (!msg) return undefined;
  return buildMARADMINMetricKey(msg.number || msg.id);
}

interface Props {
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

interface RefreshNotice {
  tone: 'success' | 'info' | 'error';
  message: string;
}

interface MessageFilterState {
  years: Set<string>;
  tags: Set<string>;
  audiences: Set<Audience>;
  query: string;
}

export function MARADMINPage({ isFullscreen = false, onToggleFullscreen }: Props) {
  const initialArchiveCursor = getCachedArchiveCursor();
  const navigate = useNavigate();
  const { messageNumber } = useParams();
  const [messages, setMessages]             = useState<RSSMessage[]>([]);
  const [listLoading, setListLoading]       = useState(true);
  const [selectedMsg, setSelectedMsg]       = useState<RSSMessage | null>(null);
  const [detailSections, setDetailSections] = useState<ContentSection[] | null>(null);
  const [detailHeaderPOCs, setDetailHeaderPOCs] = useState<Contact[]>([]);
  const [detailLoading, setDetailLoading]   = useState(false);
  const [detailRetryCount, setDetailRetryCount] = useState(0);
  const [feedRefreshing, setFeedRefreshing] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [refreshNotice, setRefreshNotice]   = useState<RefreshNotice | null>(null);
  const [activeTab, setActiveTab]           = useState('ALL MESSAGES');
  const [heldUnreadMessageId, setHeldUnreadMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery]       = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [navDirection, setNavDirection]     = useState<1 | -1>(1);
  const [filterOpen, setFilterOpen]         = useState(false);
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false);
  const [selectedYears, setSelectedYears]         = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags]           = useState<Set<string>>(new Set());
  const [selectedAudiences, setSelectedAudiences] = useState<Set<Audience>>(new Set());
  const [customViews, setCustomViews]             = useState<CustomView[]>(() => getCustomViews());
  const [creatingView, setCreatingView]           = useState(false);
  const [editingView, setEditingView]             = useState<CustomView | null>(null);
  const [mobileView, setMobileView]         = useState<'list' | 'detail'>('list');
  const [shareOpen, setShareOpen]           = useState(false);
  const [shareGenerating, setShareGenerating] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const { metrics: selectedMetrics } = useContentMetrics(getMARADMINMetricsKey(selectedMsg), {
    viewStoragePrefix: 'usmc-maradmin-viewed:',
  });
  const shareRef = useRef<HTMLDivElement>(null);
  const [archiveNextPage, setArchiveNextPage] = useState(initialArchiveCursor.nextPage);
  const [archiveHasMore, setArchiveHasMore] = useState(initialArchiveCursor.hasMore);
  const detailScrollRef = useRef<HTMLDivElement>(null);
  const pendingNavScrollRef = useRef(false);
  const sidebarScrollRef = useRef<HTMLDivElement>(null);
  const msgItemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const userStateRef = useRef<MARADMINUserState>(getMARADMINUserState());
  const messagesRef = useRef<RSSMessage[]>([]);
  const refreshPromiseRef = useRef<Promise<number> | null>(null);
  const pendingArchiveScrollNumberRef = useRef<string | null>(null);
  const searchIndexRef = useRef(createSearchIndex());
  const indexedIdsRef = useRef<Set<string>>(new Set());
  const archiveCursorRef = useRef({ nextPage: archiveNextPage, hasMore: archiveHasMore });
  const savedFiltersRef = useRef<{ years: Set<string>; tags: Set<string>; audiences: Set<Audience>; query: string } | null>(null);
  const [searchIndexVersion, setSearchIndexVersion] = useState(0);

  const routeNumber = decodeMessageNumber(messageNumber);

  const clearSelectedMessage = useCallback(() => {
    setSelectedMsg(null);
    setDetailSections(null);
    setDetailHeaderPOCs([]);
    setDetailLoading(false);
    setShareOpen(false);
  }, []);

  // Keep cursor ref in sync so the background prefetcher never sees stale values.
  useEffect(() => {
    archiveCursorRef.current = { nextPage: archiveNextPage, hasMore: archiveHasMore };
  }, [archiveNextPage, archiveHasMore]);

  const updateSearchIndex = useCallback((msg: RSSMessage, bodyText: string) => {
    const index = searchIndexRef.current;
    const indexed = indexedIdsRef.current;
    if (indexed.has(msg.id)) {
      index.replace(msgToSearchDoc(msg, bodyText));
    } else {
      index.add(msgToSearchDoc(msg, bodyText));
      indexed.add(msg.id);
    }
    setSearchIndexVersion(v => v + 1);
  }, []);

  // Debounce search query to avoid thrashing MiniSearch on every keystroke.
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(searchQuery), 150);
    return () => window.clearTimeout(id);
  }, [searchQuery]);

  // Detect mobile device on mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileDevice(
      window.innerWidth < 768 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
    );
  }, []);

  // Dev-only escape hatch for clean acceptance testing without clearing every localhost site.
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const devWindow = window as Window & { __resetMARADMINCache?: () => void };
    devWindow.__resetMARADMINCache = () => {
      clearMARADMINLocalState();
      window.location.reload();
    };

    return () => {
      delete devWindow.__resetMARADMINCache;
    };
  }, []);

  // Close share dropdown on outside click.
  useEffect(() => {
    if (!shareOpen) return;
    function handleClick(e: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [shareOpen]);

  // Index new messages as they arrive (subject + tags immediately; body if already cached).
  useEffect(() => {
    const index = searchIndexRef.current;
    const indexed = indexedIdsRef.current;
    for (const msg of messages) {
      if (indexed.has(msg.id)) continue;
      const cached = getCachedArticle(msg.number || msg.link);
      index.add(msgToSearchDoc(msg, cached?.text ?? ''));
      indexed.add(msg.id);
    }
  }, [messages]);

  // Background prefetcher: silently fetch uncached article bodies one at a time.
  useEffect(() => {
    let cancelled = false;
    let timeoutId: number;

    async function prefetchNext() {
      if (cancelled || document.hidden) return;

      const uncached = messagesRef.current.find(msg => !getCachedArticle(msg.number || msg.link));
      if (!uncached) return;

      try {
        const key = uncached.number || uncached.link;
        const { text, method } = await fetchArticleContent(uncached.link);
        if (cancelled) return;

        const source = text ? extractMARADMINSource(text) : null;
        saveCachedArticle(key, { text: text ?? '', method, source, cachedAt: Date.now() });

        if (text) {
          updateSearchIndex(uncached, text);

          const enrichedTags = tagsFromContent(uncached.subject, text);
          const tagsChanged = enrichedTags.length !== uncached.tags.length ||
            enrichedTags.some(t => !uncached.tags.includes(t));

          if (tagsChanged) {
            const cursor = archiveCursorRef.current;
            setMessages(prev => {
              const updated = prev.map(msg =>
                msg.id === uncached.id ? { ...msg, tags: enrichedTags } : msg,
              );
              if (updated.some((msg, i) => msg !== prev[i])) {
                saveCachedFeed(updated, { nextPage: cursor.nextPage, hasMore: cursor.hasMore });
              }
              return updated;
            });
          }
        }
      } catch {
        // Background fetch failures are silent — will retry next cycle.
      }

      if (!cancelled) timeoutId = window.setTimeout(prefetchNext, 2500);
    }

    timeoutId = window.setTimeout(prefetchNext, 5000);

    const handleVisibility = () => {
      if (!document.hidden && !cancelled) timeoutId = window.setTimeout(prefetchNext, 1000);
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function persistUserState(nextUserState: MARADMINUserState) {
    userStateRef.current = nextUserState;
    saveMARADMINUserState(nextUserState);
  }

  function updateMessageFlags(number: string, updater: (state: MARADMINUserState) => MARADMINUserState) {
    const nextUserState = updater(userStateRef.current);
    persistUserState(nextUserState);
    setMessages(prev => {
      const updated = applyUserStateToMessages(prev, nextUserState);
      messagesRef.current = updated;
      saveCachedFeed(updated, { nextPage: archiveNextPage, hasMore: archiveHasMore });
      return updated;
    });
    setSelectedMsg(prev => {
      if (!prev || prev.number !== number) return prev;
      return applyUserStateToMessages([prev], nextUserState)[0];
    });
  }

  function markMessageRead(number: string) {
    if (!number) return;
    if (userStateRef.current.readNumbers.includes(number)) return;

    updateMessageFlags(number, state => ({
      ...state,
      readNumbers: [...state.readNumbers, number],
      newNumbers: state.newNumbers.filter(value => value !== number),
    }));
  }

  function markAllUnreadRead() {
    const unreadNumbers = filteredMessages
      .filter(message => message.unread)
      .map(message => message.number);

    if (unreadNumbers.length === 0) return;

    setHeldUnreadMessageId(null);
    const unreadSet = new Set(unreadNumbers);
    const nextUserState = {
      ...userStateRef.current,
      readNumbers: [...userStateRef.current.readNumbers, ...unreadNumbers],
      newNumbers: userStateRef.current.newNumbers.filter(value => !unreadSet.has(value)),
    };

    persistUserState(nextUserState);
    setMessages(prev => {
      const updated = applyUserStateToMessages(prev, nextUserState);
      messagesRef.current = updated;
      saveCachedFeed(updated, { nextPage: archiveNextPage, hasMore: archiveHasMore });
      return updated;
    });
    setSelectedMsg(prev => {
      if (!prev || !unreadSet.has(prev.number)) return prev;
      return applyUserStateToMessages([prev], nextUserState)[0];
    });
  }

  function toggleSaved(number: string) {
    if (!number) return;
    updateMessageFlags(number, state => {
      const savedSet = new Set(state.savedNumbers);
      if (savedSet.has(number)) savedSet.delete(number);
      else savedSet.add(number);

      return {
        ...state,
        savedNumbers: [...savedSet],
      };
    });
  }

  function handlePrint() {
    window.print();
  }

  function handleRefreshFeed() {
    void refreshFeed(true)
      .then(newCount => {
        showRefreshNotice(
          newCount > 0 ? 'success' : 'info',
          newCount > 0
            ? `${newCount} new MARADMIN${newCount === 1 ? '' : 's'} fetched.`
            : 'No new MARADMINs found.',
        );
      })
      .catch(error => {
        console.error(error);
        showRefreshNotice('error', 'Refresh failed. Please try again.');
      });
  }

  async function handleShareEmail() {
    if (!selectedMsg || !detailSections) return;
    setShareGenerating(true);
    setShareOpen(false);
    try {
      const blob = await generateMARADMINPdf(selectedMsg, detailSections);
      const file = new File([blob], `MARADMIN-${selectedMsg.number}.pdf`, { type: 'application/pdf' });
      const subject = `MARADMIN ${selectedMsg.number} - ${selectedMsg.subject}`;
      const body = maradminEmailBody(selectedMsg, detailSections);

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: subject, text: body, files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailto, '_blank');
      }
    } finally {
      setShareGenerating(false);
    }
  }

  async function handleShareText() {
    if (!selectedMsg || !detailSections) return;
    setShareGenerating(true);
    setShareOpen(false);
    try {
      const blob = await generateMARADMINPdf(selectedMsg, detailSections);
      const file = new File([blob], `MARADMIN-${selectedMsg.number}.pdf`, { type: 'application/pdf' });
      const title = `MARADMIN ${selectedMsg.number}`;
      const text = `${selectedMsg.subject}\n\nView online: ${window.location.origin}/messages/${selectedMsg.number}`;
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title, text, files: [file] });
      } else if (navigator.share) {
        await navigator.share({ title, text });
      }
    } finally {
      setShareGenerating(false);
    }
  }

  function showRefreshNotice(tone: RefreshNotice['tone'], message: string) {
    setRefreshNotice({ tone, message });
  }

  const refreshFeed = useCallback(async (force = false) => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const cachedFeed = messagesRef.current.length > 0 ? messagesRef.current : (getCachedFeed() ?? []);

    if (!force && cachedFeed.length > 0 && isCachedFeedFresh()) return 0;

    refreshPromiseRef.current = (async () => {
      setFeedRefreshing(true);
      try {
        const msgs = await fetchRSSFeed();
        const mergedResult = mergeFeedMessages(cachedFeed, msgs, userStateRef.current);
        persistUserState(mergedResult.userState);
        messagesRef.current = mergedResult.messages;
        setMessages(mergedResult.messages);
        saveCachedFeed(mergedResult.messages, { nextPage: archiveNextPage, hasMore: archiveHasMore });
        return mergedResult.newMessageNumbers.length;
      } finally {
        setFeedRefreshing(false);
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, [archiveHasMore, archiveNextPage]);

  useEffect(() => {
    if (!refreshNotice) return;

    const timeoutId = window.setTimeout(() => {
      setRefreshNotice(null);
    }, 3200);

    return () => window.clearTimeout(timeoutId);
  }, [refreshNotice]);

  useEffect(() => {
    const cachedFeed = getCachedFeed();
    if (cachedFeed?.length) {
      const hydratedMessages = applyUserStateToMessages(cachedFeed, userStateRef.current);
      messagesRef.current = hydratedMessages;
      setMessages(hydratedMessages);
      setListLoading(false);
    }

    void refreshFeed()
      .catch(console.error)
      .finally(() => setListLoading(false));

    const intervalId = window.setInterval(() => {
      if (document.hidden) return;
      void refreshFeed(true).catch(console.error);
    }, FEED_POLL_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void refreshFeed(true).catch(console.error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshFeed]);

  useEffect(() => {
    if (messages.length === 0) return;

    const rawParam = messageNumber ?? '';
    const routeMatch = rawParam.startsWith('_id_')
      ? messages.find(msg => msg.id === decodeURIComponent(rawParam.slice(4)))
      : routeNumber
        ? messages.find(msg => msg.number === routeNumber)
        : null;

    const activeCustomView = customViews.find(v => v.id === activeTab) ?? null;
    const routeMatchAllowed = !routeMatch ||
      (activeTab !== 'SAVED' || routeMatch.saved) &&
      (!activeCustomView || matchesCustomView(routeMatch, activeCustomView));

    if (!routeMatchAllowed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (selectedMsg) clearSelectedMessage();
      return;
    }

    if (activeTab === 'UNREAD' && routeMatch) {
      // Preserve the selected unread item in the sidebar after it is marked read.
      // It will be released when the user moves to another message or leaves the tab.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHeldUnreadMessageId(prev => {
        if (routeMatch.unread) return routeMatch.id;
        return prev === routeMatch.id ? prev : null;
      });
    }

    if (routeMatch && routeMatch.id !== selectedMsg?.id) {
      setSelectedMsg(routeMatch);
      resetDetailScrollToTop();
      return;
    }

    if (!routeMatch) {
      if (!routeNumber && selectedMsg) return;
      const firstRoutableMessage = messages[0];
      if (firstRoutableMessage) {
        navigate(buildMessagePath(firstRoutableMessage), { replace: true });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, clearSelectedMessage, customViews, messageNumber, messages, navigate, routeNumber, selectedMsg?.id]);

  useEffect(() => {
    if (!selectedMsg?.link) return;
    markMessageRead(selectedMsg.number);
    const currentMessageId = selectedMsg.id;
    const cacheKey = selectedMsg.number || selectedMsg.link;
    const cachedArticle = getCachedArticle(cacheKey);

    if (cachedArticle) {
      const extractedNumber = cachedArticle.text ? extractMARADMINNumber(cachedArticle.text) : null;
      const enrichedTags = cachedArticle.text ? tagsFromContent(selectedMsg.subject, cachedArticle.text) : null;
      const currentTags = selectedMsg.tags;
      const currentNumberIsPlaceholder = !selectedMsg.number.includes('/');
      const numberNeedsUpdate = !!(extractedNumber && extractedNumber !== selectedMsg.number && currentNumberIsPlaceholder);
      const tagsNeedUpdate = enrichedTags && (
        enrichedTags.length !== currentTags.length ||
        enrichedTags.some(t => !currentTags.includes(t))
      );
      if (cachedArticle.source || tagsNeedUpdate || numberNeedsUpdate) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMessages(prev => {
          const updated = prev.map(msg => {
            if (msg.id !== currentMessageId) return msg;
            const patch: Partial<RSSMessage> = {};
            if (cachedArticle.source && msg.source !== cachedArticle.source) patch.source = cachedArticle.source;
            if (numberNeedsUpdate && extractedNumber) patch.number = extractedNumber;
            if (tagsNeedUpdate && enrichedTags) patch.tags = enrichedTags;
            return Object.keys(patch).length ? { ...msg, ...patch } : msg;
          });
          if (updated.some((msg, i) => msg !== prev[i])) {
            saveCachedFeed(updated, { nextPage: archiveNextPage, hasMore: archiveHasMore });
          }
          return updated;
        });
        setSelectedMsg(prev => {
          if (!prev || prev.id !== currentMessageId) return prev;
          const patch: Partial<RSSMessage> = {};
          if (cachedArticle.source && prev.source !== cachedArticle.source) patch.source = cachedArticle.source;
          if (numberNeedsUpdate && extractedNumber) patch.number = extractedNumber;
          if (tagsNeedUpdate && enrichedTags) patch.tags = enrichedTags;
          return Object.keys(patch).length ? { ...prev, ...patch } : prev;
        });
      }
      if (numberNeedsUpdate && extractedNumber) {
        markMessageRead(extractedNumber);
        navigate(buildMessagePath({ number: extractedNumber, id: currentMessageId }), { replace: true });
      }
      if (cachedArticle.text) updateSearchIndex(selectedMsg, cachedArticle.text);
      setDetailSections(cachedArticle.text ? parseMARADMINText(cachedArticle.text) : []);
      setDetailHeaderPOCs(cachedArticle.text ? parseHeaderPOCs(cachedArticle.text) : []);
      setDetailLoading(false);
      return;
    }

    setDetailSections(null);
    setDetailHeaderPOCs([]);
    setDetailLoading(true);
    const currentSubject = selectedMsg.subject;
    const currentTags = selectedMsg.tags;
    const currentMsg = selectedMsg;
    fetchArticleContent(selectedMsg.link).then(({ text, method }) => {
      const extractedSource = text ? extractMARADMINSource(text) : null;
      const extractedNumber = text ? extractMARADMINNumber(text) : null;
      const enrichedTags = text ? tagsFromContent(currentSubject, text) : null;
      const tagsNeedUpdate = enrichedTags && (
        enrichedTags.length !== currentTags.length ||
        enrichedTags.some(t => !currentTags.includes(t))
      );
      const currentNumberIsPlaceholder = !currentMsg.number.includes('/');
      const numberNeedsUpdate = !!(extractedNumber && extractedNumber !== currentMsg.number && currentNumberIsPlaceholder);
      if (extractedSource || tagsNeedUpdate || numberNeedsUpdate) {
        setMessages(prev => {
          const updated = prev.map(msg => {
            if (msg.id !== currentMessageId) return msg;
            const patch: Partial<RSSMessage> = {};
            if (extractedSource && msg.source !== extractedSource) patch.source = extractedSource;
            if (numberNeedsUpdate && extractedNumber) patch.number = extractedNumber;
            if (tagsNeedUpdate && enrichedTags) patch.tags = enrichedTags;
            return Object.keys(patch).length ? { ...msg, ...patch } : msg;
          });
          if (updated.some((msg, i) => msg !== prev[i])) {
            saveCachedFeed(updated, { nextPage: archiveNextPage, hasMore: archiveHasMore });
          }
          return updated;
        });
        setSelectedMsg(prev => {
          if (!prev || prev.id !== currentMessageId) return prev;
          const patch: Partial<RSSMessage> = {};
          if (extractedSource && prev.source !== extractedSource) patch.source = extractedSource;
          if (numberNeedsUpdate && extractedNumber) patch.number = extractedNumber;
          if (tagsNeedUpdate && enrichedTags) patch.tags = enrichedTags;
          return Object.keys(patch).length ? { ...prev, ...patch } : prev;
        });
      }
      if (numberNeedsUpdate && extractedNumber) {
        markMessageRead(extractedNumber);
        navigate(buildMessagePath({ number: extractedNumber, id: currentMessageId }), { replace: true });
      }
      if (text) saveCachedArticle(cacheKey, {
        text,
        method,
        source: extractedSource,
        cachedAt: Date.now(),
      });
      if (text) updateSearchIndex(currentMsg, text);
      setDetailSections(text ? parseMARADMINText(text) : []);
      setDetailHeaderPOCs(text ? parseHeaderPOCs(text) : []);
      setDetailLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archiveHasMore, archiveNextPage, selectedMsg?.id, detailRetryCount]);

  const loadOlderMessages = useCallback(async (silent = false) => {
    if (archiveLoading || !archiveHasMore) return 0;

    setArchiveLoading(true);
    try {
      const { messages: olderMessages, nextPage, hasMore } = await fetchMARADMINArchivePage(archiveNextPage);
      const existingNumbers = new Set(messagesRef.current.map(message => message.number));
      const uniqueOlderMessages = olderMessages.filter(message => !existingNumbers.has(message.number));
      const mergedMessages = mergeArchiveMessages(messagesRef.current, olderMessages, userStateRef.current);

      messagesRef.current = mergedMessages;
      if (!silent) pendingArchiveScrollNumberRef.current = uniqueOlderMessages[0]?.number ?? null;
      setMessages(mergedMessages);
      setArchiveNextPage(nextPage);
      setArchiveHasMore(hasMore);
      saveCachedFeed(mergedMessages, { nextPage, hasMore });

      return uniqueOlderMessages.length;
    } finally {
      setArchiveLoading(false);
    }
  }, [archiveHasMore, archiveLoading, archiveNextPage]);

  // Always points to the latest loadOlderMessages so the background effect avoids stale closures.
  const loadOlderMessagesRef = useRef(loadOlderMessages);
  useEffect(() => { loadOlderMessagesRef.current = loadOlderMessages; }, [loadOlderMessages]);

  // Background archive loader: silently pages through older messages while the user is on the page.
  useEffect(() => {
    let cancelled = false;
    let timeoutId: number;

    async function loadNextArchivePage() {
      if (cancelled || document.hidden) return;

      const cursor = archiveCursorRef.current;
      if (!cursor.hasMore) return;
      if (messagesRef.current.length >= MAX_FEED_MESSAGES) return;
      if (getMARADMINStorageSizeBytes() >= ARCHIVE_STORAGE_LIMIT_BYTES) return;

      await loadOlderMessagesRef.current(true);

      // Schedule next page only if there's still more to fetch.
      if (!cancelled && archiveCursorRef.current.hasMore) {
        timeoutId = window.setTimeout(loadNextArchivePage, 45_000);
      }
    }

    // Start after 20 s to let the feed refresh and article prefetch settle first.
    timeoutId = window.setTimeout(loadNextArchivePage, 20_000);

    const handleVisibility = () => {
      if (!document.hidden && !cancelled && archiveCursorRef.current.hasMore) {
        timeoutId = window.setTimeout(loadNextArchivePage, 10_000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const unreadCount = messages.filter(m => m.unread).length;

  const customViewUnreadCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const view of customViews) {
      counts.set(view.id, messages.filter(m => m.unread && matchesCustomView(m, view)).length);
    }
    return counts;
  }, [customViews, messages]);

  function createCustomView(view: Omit<CustomView, 'id'>) {
    const next = [...customViews, { ...view, name: view.name.toUpperCase(), id: `cv-${Date.now()}` }];
    setCustomViews(next);
    saveCustomViews(next);
    setActiveTab(next[next.length - 1].id);
    setCreatingView(false);
  }

  function updateCustomView(id: string, view: Omit<CustomView, 'id'>) {
    const next = customViews.map(v => v.id === id ? { id, ...view, name: view.name.toUpperCase() } : v);
    setCustomViews(next);
    saveCustomViews(next);
    setEditingView(null);
  }

  function deleteCustomView(id: string) {
    const next = customViews.filter(v => v.id !== id);
    setCustomViews(next);
    saveCustomViews(next);
    if (activeTab === id) { setActiveTab('ALL MESSAGES'); resetSidebarScroll(); }
  }

  function resetSidebarScroll() {
    const container = sidebarScrollRef.current;
    if (!container) return;
    container.scrollTop = 0;
  }

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    messages.forEach(m => {
      const yr = m.number.split('/')[1];
      if (yr) years.add(`20${yr}`);
    });
    return [...years].sort().reverse();
  }, [messages]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    messages.forEach(m => m.tags.forEach(t => tags.add(t)));
    return [...tags].sort();
  }, [messages]);

  const activeFilterCount = selectedYears.size + selectedTags.size + selectedAudiences.size;
  const exactMatchNumber = useMemo(
    () => extractExactMARADMINNumberQuery(debouncedQuery),
    [debouncedQuery],
  );

  const currentMessageFilters = useMemo<MessageFilterState>(() => ({
    years: selectedYears,
    tags: selectedTags,
    audiences: selectedAudiences,
    query: debouncedQuery,
  }), [debouncedQuery, selectedAudiences, selectedTags, selectedYears]);

  const filterMessagesForTab = useCallback((tab: string, filters: MessageFilterState = currentMessageFilters) => {
    const q = filters.query.trim();

    let base: RSSMessage[];
    if (q) {
      const results = searchIndexRef.current.search(q);
      const scoreById = new Map(results.map(r => [r.id as string, r.score]));
      // Also catch exact number matches (e.g. "214/26") that tokenization may miss.
      const qNorm = normalizeMARADMINNumber(q);
      const byNumber = q.length >= 3 ? new Set(
        messages.filter(m => normalizeMARADMINNumber(m.number).includes(qNorm)).map(m => m.id),
      ) : new Set<string>();
      base = messages
        .filter(m => scoreById.has(m.id) || byNumber.has(m.id))
        .sort((a, b) => (scoreById.get(b.id) ?? 0) - (scoreById.get(a.id) ?? 0));
      base = promoteExactMARADMINMatches(base, q);
    } else {
      base = messages;
    }

    const activeCustomView = customViews.find(v => v.id === tab) ?? null;

    return base.filter(m => {
      if (tab === 'UNREAD' && !m.unread && m.id !== heldUnreadMessageId) return false;
      if (tab === 'SAVED' && !m.saved) return false;
      if (activeCustomView && !matchesCustomView(m, activeCustomView)) return false;
      if (filters.years.size > 0 && !filters.years.has(`20${m.number.split('/')[1]}`)) return false;
      if (filters.tags.size > 0 && !m.tags.some(t => filters.tags.has(t))) return false;
      if (filters.audiences.size > 0 && !audiencesOf(m).some(a => filters.audiences.has(a))) return false;
      return true;
    });
  // searchIndexVersion forces recompute when the index gains new body text.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMessageFilters, customViews, heldUnreadMessageId, messages, searchIndexVersion]);

  const filteredMessages = useMemo(
    () => filterMessagesForTab(activeTab),
    [activeTab, filterMessagesForTab],
  );

  function syncSelectionForTab(visibleMessages: RSSMessage[]) {
    if (selectedMsg && visibleMessages.some(m => m.id === selectedMsg.id)) return;

    const nextMessage = visibleMessages[0] ?? null;
    if (!nextMessage) {
      clearSelectedMessage();
      return;
    }

    setNavDirection(1);
    navigate(buildMessagePath(nextMessage), { preventScrollReset: true });
    resetDetailScrollToTop();
  }

  function switchToCustomView(id: string) {
    const emptyFilters: MessageFilterState = {
      years: new Set(),
      tags: new Set(),
      audiences: new Set(),
      query: '',
    };
    const nextMessages = filterMessagesForTab(id, emptyFilters);

    setHeldUnreadMessageId(null);
    savedFiltersRef.current = {
      years: new Set(selectedYears),
      tags: new Set(selectedTags),
      audiences: new Set(selectedAudiences),
      query: searchQuery,
    };
    setActiveTab(id);
    setSelectedYears(emptyFilters.years);
    setSelectedTags(emptyFilters.tags);
    setSelectedAudiences(emptyFilters.audiences);
    setSearchQuery('');
    syncSelectionForTab(nextMessages);
    resetSidebarScroll();
  }

  function switchToStandardTab(tab: string) {
    const saved = savedFiltersRef.current;
    const nextFilters = saved
      ? {
        years: new Set(saved.years),
        tags: new Set(saved.tags),
        audiences: new Set(saved.audiences),
        query: saved.query,
      }
      : currentMessageFilters;
    const nextMessages = filterMessagesForTab(tab, nextFilters);

    if (tab !== 'UNREAD') setHeldUnreadMessageId(null);
    setActiveTab(tab);
    if (saved) {
      setSelectedYears(nextFilters.years);
      setSelectedTags(nextFilters.tags);
      setSelectedAudiences(nextFilters.audiences);
      setSearchQuery(nextFilters.query);
      savedFiltersRef.current = null;
    }
    syncSelectionForTab(nextMessages);
    resetSidebarScroll();
  }

  useEffect(() => {
    if (activeTab !== 'SAVED' || !selectedMsg?.id || selectedMsg.saved) return;

    const nextSavedMessage = filteredMessages[0] ?? null;
    if (!nextSavedMessage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      clearSelectedMessage();
      return;
    }

    setNavDirection(1);
    navigate(buildMessagePath(nextSavedMessage), { replace: true, preventScrollReset: true });
  }, [activeTab, clearSelectedMessage, filteredMessages, navigate, selectedMsg?.id, selectedMsg?.saved]);

  const filteredUnreadCount = filteredMessages.filter(m => m.unread).length;

  const scrollSidebarToMessage = useCallback((messageId: string, behavior: ScrollBehavior = 'smooth') => {
    const container = sidebarScrollRef.current;
    const item = msgItemRefs.current.get(messageId);
    if (!container || !item) return;

    const containerRect = container.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const target = container.scrollTop + itemRect.top - containerRect.top - (container.clientHeight - itemRect.height) / 2;

    const clampedTarget = Math.max(0, target);
    if (Math.abs(container.scrollTop - clampedTarget) < 4) return;
    container.scrollTo({ top: clampedTarget, behavior });
  }, []);

  useEffect(() => {
    const pendingNumber = pendingArchiveScrollNumberRef.current;
    if (!pendingNumber) return;

    const pendingMessage = messages.find(message => message.number === pendingNumber);
    if (!pendingMessage) return;

    scrollSidebarToMessage(pendingMessage.id, 'smooth');
    pendingArchiveScrollNumberRef.current = null;
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedMsg) return;
    scrollSidebarToMessage(selectedMsg.id, 'smooth');
  }, [selectedMsg?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const container = sidebarScrollRef.current;
    if (!container) return;
    container.scrollTop = 0;
  }, [searchQuery]);

  function toggleYear(yr: string) {
    setSelectedYears(prev => { const next = new Set(prev); if (next.has(yr)) next.delete(yr); else next.add(yr); return next; });
  }
  function toggleTag(tag: string) {
    setSelectedTags(prev => { const next = new Set(prev); if (next.has(tag)) next.delete(tag); else next.add(tag); return next; });
  }
  function toggleAudience(a: Audience) {
    setSelectedAudiences(prev => { const next = new Set(prev); if (next.has(a)) next.delete(a); else next.add(a); return next; });
  }
  function clearFilters() {
    setSelectedYears(new Set());
    setSelectedTags(new Set());
    setSelectedAudiences(new Set());
  }

  const currentIdx = selectedMsg ? filteredMessages.findIndex(m => m.id === selectedMsg.id) : -1;

  function resetDetailScrollToTop() {
    detailScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });

    if (typeof window === 'undefined' || window.innerWidth >= 768) return;

    const detailPanel = detailScrollRef.current?.closest('.print-maradmin-detail');
    const topOffset = isFullscreen ? 0 : 80;
    const targetTop = detailPanel instanceof HTMLElement
      ? window.scrollY + detailPanel.getBoundingClientRect().top - topOffset
      : 0;

    window.scrollTo({ top: Math.max(0, targetTop), behavior: 'auto' });
  }

  function selectMsg(msg: RSSMessage) {
    const newIdx = filteredMessages.findIndex(m => m.id === msg.id);
    setHeldUnreadMessageId(activeTab === 'UNREAD' && msg.unread ? msg.id : null);
    setNavDirection(newIdx >= currentIdx ? 1 : -1);
    navigate(buildMessagePath(msg));
    resetDetailScrollToTop();
    setMobileView('detail');
  }

  const goToPrev = () => {
    if (currentIdx > 0) {
      const targetMessage = filteredMessages[currentIdx - 1];
      pendingNavScrollRef.current = true;
      setHeldUnreadMessageId(activeTab === 'UNREAD' && targetMessage.unread ? targetMessage.id : null);
      setNavDirection(-1);
      navigate(buildMessagePath(targetMessage), { preventScrollReset: true });
    }
  };
  const goToNext = () => {
    if (currentIdx < filteredMessages.length - 1) {
      const targetMessage = filteredMessages[currentIdx + 1];
      pendingNavScrollRef.current = true;
      setHeldUnreadMessageId(activeTab === 'UNREAD' && targetMessage.unread ? targetMessage.id : null);
      setNavDirection(1);
      navigate(buildMessagePath(targetMessage), { preventScrollReset: true });
    }
  };

  return (
    <div className={`print-maradmin-root ${isFullscreen ? 'h-screen flex flex-col overflow-hidden' : 'min-h-screen pb-20 md:pb-0'} bg-black`}>
      <SEOHead
        title="MARADMIN Messages"
        description="Browse and search Marine Administrative Messages (MARADMINs). Full-text search, filter by audience, and read official USMC policy and administrative messages."
        path="/messages"
      />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      {!isFullscreen && (
      <div className={`print-hide relative overflow-hidden border-b border-white/12 pt-20 flex-shrink-0 hidden md:block`}>
        {/* Backgrounds — inset-0 covers full outer div (including pt-20 space) */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.97) 0%, rgba(5,5,10,0.93) 50%, rgba(10,3,3,0.9) 100%)',
          backgroundColor: '#060304',
        }} />
        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute top-0 left-0 w-96 h-48 opacity-[0.06]" style={{
          background: 'radial-gradient(ellipse at 0% 0%, rgba(220,38,38,1) 0%, transparent 70%)',
        }} />

        {/* Inner relative wrapper — flex column so content centers and tabs pin to bottom */}
        <div className="relative z-10 flex flex-col" style={{ minHeight: '176px' }}>

          {/* Decorative card — positioned relative to the inner wrapper, not the header */}
          <div className="absolute top-5 right-8 border border-white/10 bg-black/50 px-5 py-3 text-right hidden lg:block">
            <div className="text-[12px] font-black text-white tracking-widest">STAY INFORMED<span className="text-red-600">.</span></div>
            <div className="text-[12px] font-black text-white tracking-widest">KNOW YOUR ORDERS<span className="text-red-600">.</span></div>
            <div className="text-[12px] font-black text-white tracking-widest mb-2">MISSION READY<span className="text-red-600">.</span></div>
            <div className="w-6 h-px bg-red-600 ml-auto" />
          </div>

          {/* Hero content — flex-1 so it fills space above tabs; justify-center centers it */}
          <div className="flex-1 flex flex-col justify-center px-8 py-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[12px] text-gray-600 font-mono tracking-wider mb-2">
              <button onClick={() => navigate('/')} className="text-[12px] font-mono tracking-wider hover:text-gray-400 transition-colors bg-transparent p-0 border-0">HOME</button>
              <ChevronRight className="w-3 h-3" />
              <span className="text-red-500">MARADMINS</span>
            </div>

            {/* Heading + description */}
            <div className="flex items-start gap-4">
              <div className="mt-1 h-14 w-1 flex-shrink-0 bg-red-600 sm:h-20" />
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 14, mass: 0.85 }}
                className="page-hero-title mb-2"
              >
                MARADMIN<span className="text-red-600">.</span>
              </motion.h1>
            </div>
            <p className="text-[14px] text-gray-400 max-w-lg leading-relaxed">
              Official Marine Corps Administrative Messages — policy, guidance, and information
              from the Commandant affecting Marines and their families.
            </p>
          </div>

          {/* Tabs — flush at bottom of hero so the active underline sits on the border */}
          <div className="flex items-center -mb-px">
            <div className="flex items-center px-8 overflow-x-auto scrollbar-none flex-1 min-w-0">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => switchToStandardTab(tab)}
                  className={`relative px-5 py-3 text-[12px] font-bold tracking-widest transition-colors whitespace-nowrap ${
                    activeTab === tab ? 'text-white' : 'text-gray-600 hover:text-gray-400'
                  }`}
                >
                  {tab}
                  {tab === 'UNREAD' && unreadCount > 0 && (
                    <span className="ml-1.5 text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                  {activeTab === tab && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 z-10"
                      layoutId="maradminTab"
                    />
                  )}
                </button>
              ))}
              {customViews.map(view => {
                const isActive = activeTab === view.id;
                const unread = customViewUnreadCounts.get(view.id) ?? 0;
                return (
                  <div key={view.id} className="relative flex items-center group/cvtab">
                    <button
                      onClick={() => switchToCustomView(view.id)}
                      className={`relative px-4 py-3 text-[12px] font-bold tracking-widest transition-colors whitespace-nowrap ${
                        isActive ? 'text-white' : 'text-gray-600 hover:text-gray-400'
                      }`}
                    >
                      {view.name}
                      {unread > 0 && (
                        <span className="ml-1.5 text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                          {unread}
                        </span>
                      )}
                      {isActive && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 z-10"
                          layoutId="maradminTab"
                        />
                      )}
                    </button>
                  </div>
                );
              })}
              <button
                onClick={() => setCreatingView(true)}
                className="px-3 py-3 text-gray-700 hover:text-gray-400 transition-colors flex-shrink-0"
                aria-label="New custom view"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className={`hidden md:block flex-shrink-0 px-4 py-3 transition-colors ${isFullscreen ? 'text-red-500 hover:text-red-400' : 'text-gray-700 hover:text-gray-400'}`}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Tabs in fullscreen — shown when hero is hidden */}
      {isFullscreen && (
        <div className="border-b border-white/12 flex items-center flex-shrink-0">
          <div className="flex items-center px-8 overflow-x-auto scrollbar-none flex-1 min-w-0">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => switchToStandardTab(tab)}
                className={`relative px-5 py-3 text-[12px] font-bold tracking-widest transition-colors whitespace-nowrap ${
                  activeTab === tab ? 'text-white' : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                {tab}
                {tab === 'UNREAD' && unreadCount > 0 && (
                  <span className="ml-1.5 text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
                {activeTab === tab && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 z-10"
                    layoutId="maradminTab"
                  />
                )}
              </button>
            ))}
            {customViews.map(view => {
              const isActive = activeTab === view.id;
              const unread = customViewUnreadCounts.get(view.id) ?? 0;
              return (
                <div key={view.id} className="relative flex items-center group/cvtab">
                  <button
                    onClick={() => switchToCustomView(view.id)}
                    className={`relative px-4 py-3 text-[12px] font-bold tracking-widest transition-colors whitespace-nowrap ${
                      isActive ? 'text-white' : 'text-gray-600 hover:text-gray-400'
                    }`}
                  >
                    {view.name}
                    {unread > 0 && (
                      <span className="ml-1.5 text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                        {unread}
                      </span>
                    )}
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 z-10"
                        layoutId="maradminTab"
                      />
                    )}
                  </button>
                </div>
              );
            })}
            <button
              onClick={() => setCreatingView(true)}
              className="px-3 py-3 text-gray-700 hover:text-gray-400 transition-colors flex-shrink-0"
              aria-label="New custom view"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className={`hidden md:block flex-shrink-0 px-4 py-3 transition-colors ${isFullscreen ? 'text-red-500 hover:text-red-400' : 'text-gray-700 hover:text-gray-400'}`}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      )}

      {/* Mobile header offset — compensates for the fixed header when the hero is hidden */}
      {!isFullscreen && (
        <div className="md:hidden h-20" aria-hidden="true" />
      )}

      {/* ── MAIN GRID ────────────────────────────────────────────────────── */}
      <div className={`grid grid-cols-1 md:grid-cols-[380px_1fr] ${isFullscreen ? 'flex-1 min-h-0' : ''}`}>

        {/* ── LEFT SIDEBAR — message list ───────────────────────────────── */}
        <div className={`print-hide ${mobileView === 'detail' ? 'hidden md:flex' : 'flex'} md:flex flex-col ${isFullscreen ? '' : 'md:sticky md:self-start md:top-20 md:h-[calc(100vh-80px)]'} border-r border-white/12 bg-black/60 md:overflow-hidden`}>

          {/* Mobile sticky header — tabs + search pinned to top; desktop handled by the sticky panel */}
          <div className="sticky top-20 z-20 flex flex-col bg-black/95 backdrop-blur-sm md:contents">

          {/* Mobile-only tabs row */}
          <div className="md:hidden flex items-center overflow-x-auto scrollbar-none border-b border-white/12">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => switchToStandardTab(tab)}
                className={`relative flex-shrink-0 px-4 py-3 text-[12px] font-bold tracking-widest transition-colors whitespace-nowrap ${
                  activeTab === tab ? 'text-white' : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                {tab}
                {tab === 'UNREAD' && unreadCount > 0 && (
                  <span className="ml-1.5 text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
                {activeTab === tab && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 z-10"
                    layoutId="maradminTabSidebar"
                  />
                )}
              </button>
            ))}
            {customViews.map(view => {
              const isActive = activeTab === view.id;
              const unread = customViewUnreadCounts.get(view.id) ?? 0;
              return (
                <button
                  key={view.id}
                  onClick={() => switchToCustomView(view.id)}
                  className={`relative flex-shrink-0 px-4 py-3 text-[12px] font-bold tracking-widest transition-colors whitespace-nowrap ${
                    isActive ? 'text-white' : 'text-gray-600 hover:text-gray-400'
                  }`}
                >
                  {view.name}
                  {unread > 0 && (
                    <span className="ml-1.5 text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                      {unread}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 z-10"
                      layoutId="maradminTabSidebar"
                    />
                  )}
                </button>
              );
            })}
            <button
              onClick={() => setCreatingView(true)}
              className="flex-shrink-0 px-3 py-3 text-gray-700 hover:text-gray-400 transition-colors"
              aria-label="New custom view"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search + filter bar */}
          <div className="flex-shrink-0 border-b border-white/12">
            <div className="relative px-5 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                <input
                  type="text"
                  placeholder="Search by number, keyword, or subject..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border border-white/12 text-white pl-9 pr-3 py-2 text-[13px] font-mono placeholder:text-gray-700 focus:border-red-500/40 focus:outline-none"
                />
              </div>
              <AnimatePresence>
                {refreshNotice && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="print-hide absolute right-5 top-[calc(100%+0.4rem)] z-30 w-[min(22rem,calc(100%-2.5rem))]"
                  >
                    <div className={`border px-4 py-3 shadow-2xl backdrop-blur-sm ${
                      refreshNotice.tone === 'success'
                        ? 'border-green-600/40 bg-green-950/90 text-green-200'
                        : refreshNotice.tone === 'error'
                          ? 'border-red-600/40 bg-red-950/90 text-red-200'
                          : 'border-white/16 bg-black/90 text-gray-200'
                    }`}>
                      <div className="text-[11px] font-bold tracking-[0.2em]">
                        {refreshNotice.tone === 'success' ? 'FEED UPDATED' : refreshNotice.tone === 'error' ? 'REFRESH FAILED' : 'NO CHANGES'}
                      </div>
                      <div className="mt-1 text-[13px] leading-relaxed">
                        {refreshNotice.message}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative border-t border-white/8">
              <button
                onClick={() => setBulkActionsOpen(open => { if (open) setFilterOpen(false); return !open; })}
                className="absolute left-0 top-0 z-10 flex h-[34px] w-11 items-center justify-center border-r border-white/12 bg-black/95 text-gray-600 transition-colors hover:text-gray-300"
                aria-label={bulkActionsOpen ? 'Hide actions' : 'Show actions'}
                aria-expanded={bulkActionsOpen}
              >
                {bulkActionsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <AnimatePresence initial={false}>
                {bulkActionsOpen ? (
                  <motion.div
                    key="bulk-actions-open"
                    initial={{ height: 0, opacity: 0, y: -8 }}
                    animate={{ height: 34, opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="flex h-[34px] items-center gap-2 bg-white/[0.02] pl-14 pr-3">
                      <button
                        onClick={() => setFilterOpen(v => !v)}
                        className={`flex items-center gap-1 px-2.5 py-1 border text-[11px] font-bold tracking-widest transition-colors ${
                          filterOpen || activeFilterCount > 0
                            ? 'border-red-600/60 text-red-500 bg-red-950/20'
                            : 'border-white/16 text-gray-500 hover:border-white/40'
                        }`}
                      >
                        <Filter className="w-3 h-3" />
                        FILTER
                        {activeFilterCount > 0 && (
                          <span className="ml-0.5 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                            {activeFilterCount}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={handleRefreshFeed}
                        className={`flex items-center gap-1 px-2.5 py-1 border text-[11px] font-bold tracking-widest transition-colors ${
                          feedRefreshing
                            ? 'border-red-600/60 text-red-400 bg-red-950/20'
                            : 'border-white/16 text-gray-500 hover:border-white/40 hover:text-gray-300'
                        }`}
                        aria-label="Refresh MARADMIN feed"
                      >
                        <RefreshCw className={`w-3 h-3 ${feedRefreshing ? 'animate-spin' : ''}`} />
                        REFRESH
                      </button>
                      <button
                        onClick={markAllUnreadRead}
                        disabled={filteredUnreadCount === 0}
                        className={`ml-auto flex flex-shrink-0 items-center gap-1 whitespace-nowrap px-2.5 py-1 border text-[11px] font-bold tracking-widest transition-colors ${
                          filteredUnreadCount > 0
                            ? 'border-white/16 text-gray-500 hover:border-white/40 hover:text-red-400'
                            : 'border-white/[0.06] text-gray-800 cursor-not-allowed'
                        }`}
                        aria-label="Mark all unread MARADMINs as read"
                      >
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        MARK ALL READ
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="bulk-actions-closed"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 34, opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.16, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="flex h-[34px] items-center gap-2 pl-14 pr-5">
                      <span className="text-[10px] font-bold tracking-[0.22em] text-gray-700">
                        ACTIONS
                      </span>
                      {activeFilterCount > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest text-red-500">
                          <Filter className="w-2.5 h-2.5 flex-shrink-0 -translate-y-px" />
                          {activeFilterCount} FILTER{activeFilterCount !== 1 ? 'S' : ''} ACTIVE
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filter panel — below the action bar */}
            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeInOut' }}
                  className="max-h-[calc(100svh-18rem)] overflow-y-auto overscroll-contain border-t border-white/12 touch-pan-y [-webkit-overflow-scrolling:touch] md:max-h-none md:overflow-visible"
                >
                  <div className="px-5 py-4 pb-32 space-y-4 md:pb-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-500 tracking-[0.2em]">FILTERS</span>
                      {activeFilterCount > 0 && (
                        <button onClick={clearFilters} className="text-[11px] text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors">
                          CLEAR ALL
                        </button>
                      )}
                    </div>

                    {/* Audience */}
                    <div>
                      <div className="text-[10px] text-gray-600 font-bold tracking-[0.2em] mb-2">AUDIENCE</div>
                      <div className="flex flex-wrap gap-1.5">
                        {AUDIENCES.map(a => (
                          <button
                            key={a}
                            onClick={() => toggleAudience(a)}
                            className={`px-2.5 py-1 text-[11px] font-bold tracking-widest border transition-colors ${
                              selectedAudiences.has(a)
                                ? 'border-red-600/60 text-red-400 bg-red-950/30'
                                : 'border-white/16 text-gray-500 hover:border-white/30 hover:text-gray-300'
                            }`}
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Year */}
                    {availableYears.length > 0 && (
                      <div>
                        <div className="text-[10px] text-gray-600 font-bold tracking-[0.2em] mb-2">YEAR</div>
                        <div className="flex flex-wrap gap-1.5">
                          {availableYears.map(yr => (
                            <button
                              key={yr}
                              onClick={() => toggleYear(yr)}
                              className={`px-2.5 py-1 text-[11px] font-bold tracking-widest border transition-colors ${
                                selectedYears.has(yr)
                                  ? 'border-red-600/60 text-red-400 bg-red-950/30'
                                  : 'border-white/16 text-gray-500 hover:border-white/30 hover:text-gray-300'
                              }`}
                            >
                              {yr}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {availableTags.length > 0 && (
                      <div>
                        <div className="text-[10px] text-gray-600 font-bold tracking-[0.2em] mb-2">TAGS</div>
                        <div className="flex flex-wrap gap-1.5">
                          {availableTags.map(tag => (
                            <button
                              key={tag}
                              onClick={() => toggleTag(tag)}
                              className={`px-2.5 py-1 text-[11px] font-bold tracking-widest border transition-colors ${
                                selectedTags.has(tag)
                                  ? 'border-red-600/60 text-red-400 bg-red-950/30'
                                  : 'border-white/16 text-gray-500 hover:border-white/30 hover:text-gray-300'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </div>{/* end mobile sticky header wrapper */}

          {/* Message list — scrollable */}
          <div ref={sidebarScrollRef} className="flex-1 md:overflow-y-auto px-5 py-3 pb-16 md:pb-3">
            {listLoading ? (
              <div className="space-y-1 pt-1">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="px-3 py-3 border border-transparent">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-800 animate-pulse" />
                      <div className="h-2.5 bg-gray-800 rounded w-20 animate-pulse" />
                    </div>
                    <div className="pl-3.5 space-y-1.5">
                      <div className="h-2 bg-gray-800 rounded w-28 animate-pulse" />
                      <div className={`h-2 bg-gray-800 rounded animate-pulse ${i % 2 === 0 ? 'w-48' : 'w-40'}`} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredMessages.map((msg, index) => {
                  const isSelected = selectedMsg?.id === msg.id;
                  const isExactMatch = exactMatchNumber !== null && normalizeMARADMINNumber(msg.number) === exactMatchNumber;
                  const showMonthHeader = index === 0 || filteredMessages[index - 1].month !== msg.month;
                  const isFirstInMonth = showMonthHeader && index > 0;

                  return (
                    <div
                      key={msg.id}
                      className={isFirstInMonth ? 'pt-2' : ''}
                    >
                      <div>
                        {showMonthHeader && msg.month && (
                          <div className="flex items-center gap-2 mb-1 px-1 py-1.5 border-l-2 border-red-600 bg-red-950/20">
                            <span className="text-[11px] text-red-400 font-bold tracking-[0.2em] pl-2">{msg.month}</span>
                          </div>
                        )}
                        <motion.button
                          ref={el => { if (el) msgItemRefs.current.set(msg.id, el); else msgItemRefs.current.delete(msg.id); }}
                          onClick={() => selectMsg(msg)}
                          className={`group/msgitem w-full text-left px-3 py-3 border transition-colors ${
                            isSelected
                              ? 'border-red-600/40 bg-red-950/20'
                              : isExactMatch
                                ? 'border-red-500/70 bg-red-950/10 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.12)]'
                              : 'border-transparent hover:border-white/12 hover:bg-white/[0.02]'
                          }`}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full mt-0.5 flex-shrink-0 ${
                                msg.unread ? 'bg-red-500' : 'bg-gray-800'
                              }`} />
                              <span className={`text-[13px] font-bold tracking-wide ${
                                isSelected ? 'text-red-400' : msg.unread ? 'text-white' : 'text-gray-300'
                              }`}>
                                MARADMIN {msg.number}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isExactMatch && (
                                <span className="text-[10px] text-red-300 font-bold tracking-widest border border-red-500/40 bg-red-950/30 px-1.5 py-0.5">
                                  EXACT MATCH
                                </span>
                              )}
                              {msg.isNew && (
                                <span className="text-[10px] text-green-400 font-bold tracking-widest">NEW!</span>
                              )}
                              {msg.unread && !isSelected && (
                                <span className="text-[10px] text-red-400 font-bold tracking-widest">UNREAD</span>
                              )}
                              <button
                                onClick={e => { e.stopPropagation(); toggleSaved(msg.number); }}
                                className={`transition-all cursor-pointer ${
                                  msg.saved
                                    ? 'text-red-500 opacity-100'
                                    : 'text-gray-700 hover:text-gray-300 opacity-100 md:opacity-0 md:group-hover/msgitem:opacity-100'
                                }`}
                                aria-label={msg.saved ? 'Remove from saved' : 'Save message'}
                              >
                                <Bookmark className={`w-3 h-3 ${msg.saved ? 'fill-current' : ''}`} />
                              </button>
                              {isSelected && <ChevronRight className="w-3 h-3 text-red-500 flex-shrink-0" />}
                            </div>
                          </div>
                          <div className="pl-3.5">
                            <div className="text-[11px] text-gray-600 font-mono mb-0.5">
                              {msg.displayDate} · {msg.source}
                            </div>
                            <div className="text-[12px] text-gray-400 leading-snug line-clamp-2">{msg.subject}</div>
                          </div>
                        </motion.button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar footer — fixed above mobile nav bar, normal flow on desktop */}
          <div className={`${mobileView === 'detail' ? 'hidden' : ''} md:flex flex-shrink-0 fixed bottom-[72px] left-0 right-0 z-40 bg-black/95 backdrop-blur-sm md:static md:bottom-auto md:left-auto md:right-auto md:z-auto md:bg-transparent md:backdrop-blur-none px-5 py-3 border-t border-white/12 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              {customViews.find(v => v.id === activeTab) && (
                <>
                  <button
                    onClick={() => setEditingView(customViews.find(v => v.id === activeTab)!)}
                    className="flex items-center gap-1 text-[11px] font-mono text-gray-600 hover:text-gray-300 transition-colors"
                  >
                    <Pencil className="w-2.5 h-2.5" /> EDIT
                  </button>
                  <button
                    onClick={() => deleteCustomView(activeTab)}
                    className="flex items-center gap-1 text-[11px] font-mono text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <X className="w-2.5 h-2.5" /> DELETE
                  </button>
                </>
              )}
              <span className="text-[11px] text-gray-700 font-mono">
                {listLoading ? 'LOADING…' : activeFilterCount > 0 ? `${filteredMessages.length} OF ${messages.length} MARADMINS FETCHED` : `${messages.length} MARADMINS FETCHED`}
              </span>
            </div>
            <button
              onClick={() => {
                void loadOlderMessages()
                  .then(loadedCount => {
                    showRefreshNotice(
                      loadedCount > 0 ? 'success' : 'info',
                      loadedCount > 0
                        ? `${loadedCount} older MARADMIN${loadedCount === 1 ? '' : 's'} loaded.`
                        : archiveHasMore
                          ? 'No additional MARADMINs were found on that archive page.'
                          : 'No more archived MARADMINs are available to load.',
                    );
                  })
                  .catch(error => {
                    console.error(error);
                    showRefreshNotice('error', 'Loading older MARADMINs failed. Please try again.');
                  });
              }}
              disabled={archiveLoading || !archiveHasMore}
              className={`flex items-center gap-1 text-[11px] font-mono transition-colors ${
                archiveLoading
                  ? 'text-red-400'
                  : archiveHasMore
                    ? 'text-gray-600 hover:text-gray-400'
                    : 'text-gray-800 cursor-not-allowed'
              }`}
            >
              {archiveLoading ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <ChevronRight className="w-2.5 h-2.5" />}
              {archiveHasMore ? 'LOAD OLDER' : 'ARCHIVE END'}
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN — message detail ────────────────────────────── */}
        <div className={`print-maradmin-detail ${mobileView === 'list' ? 'hidden md:flex' : `fixed inset-x-0 ${isFullscreen ? 'top-0 bottom-0' : 'top-20 bottom-[72px]'} z-30 flex overflow-hidden bg-black md:inset-auto md:z-auto md:bg-transparent`} md:flex flex-col ${isFullscreen ? 'md:relative' : 'md:sticky md:self-start md:top-20 md:h-[calc(100vh-80px)]'} md:overflow-hidden`}>

          {/* Sticky header wrapper — on mobile this sticks below the app header; on desktop it becomes
              display:contents so children flow directly into the fixed-height panel */}
          <div className="z-20 flex flex-shrink-0 flex-col bg-black/95 backdrop-blur-sm md:contents">

          {/* Mobile-only tabs row */}
          <div className="print-hide md:hidden flex items-center overflow-x-auto scrollbar-none border-b border-white/12">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => { switchToStandardTab(tab); setMobileView('list'); }}
                className={`relative flex-shrink-0 px-4 py-3 text-[12px] font-bold tracking-widest transition-colors whitespace-nowrap ${
                  activeTab === tab ? 'text-white' : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                {tab}
                {tab === 'UNREAD' && unreadCount > 0 && (
                  <span className="ml-1.5 text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
                {activeTab === tab && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 z-10"
                    layoutId="maradminTabMobile"
                  />
                )}
              </button>
            ))}
            {customViews.map(view => {
              const isActive = activeTab === view.id;
              const unread = customViewUnreadCounts.get(view.id) ?? 0;
              return (
                <button
                  key={view.id}
                  onClick={() => { switchToCustomView(view.id); setMobileView('list'); }}
                  className={`relative flex-shrink-0 px-4 py-3 text-[12px] font-bold tracking-widest transition-colors whitespace-nowrap ${
                    isActive ? 'text-white' : 'text-gray-600 hover:text-gray-400'
                  }`}
                >
                  {view.name}
                  {unread > 0 && (
                    <span className="ml-1.5 text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                      {unread}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 z-10"
                      layoutId="maradminTabMobile"
                    />
                  )}
                </button>
              );
            })}
            <button
              onClick={() => setCreatingView(true)}
              className="flex-shrink-0 px-3 py-3 text-gray-700 hover:text-gray-400 transition-colors"
              aria-label="New custom view"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>{/* end mobile tabs row */}

          {/* Detail top bar */}
          <div className="print-hide relative z-10 flex-shrink-0 border-b border-white/12 bg-black/90 px-4 py-3 backdrop-blur-sm md:flex md:items-center md:justify-between md:px-8">
            <div className="flex items-center justify-between gap-3 md:flex-shrink-0">
              <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={() => setMobileView('list')}
                className="md:hidden flex items-center gap-1 text-[12px] font-mono text-gray-500 hover:text-white transition-colors mr-2"
              >
                <ChevronLeft className="w-3 h-3" /> LIST
              </button>
              <button
                onClick={goToPrev} disabled={currentIdx <= 0}
                className="flex items-center gap-1 text-[12px] font-mono tracking-widest disabled:text-gray-800 text-gray-500 hover:text-gray-300 transition-colors"
              >
                <ChevronLeft className="w-3 h-3" /> PREV
              </button>
              <button
                onClick={goToNext} disabled={currentIdx >= filteredMessages.length - 1}
                className="flex items-center gap-1 text-[12px] font-mono tracking-widest disabled:text-gray-800 text-gray-500 hover:text-gray-300 transition-colors"
              >
                NEXT <ChevronRight className="w-3 h-3" />
              </button>
              </div>

              <div className="flex items-center gap-3 md:hidden">
                {/* Share button + dropdown */}
                <div ref={shareRef} className="relative flex items-center">
                  <button
                    onClick={() => setShareOpen(o => !o)}
                    disabled={!selectedMsg || !detailSections || shareGenerating}
                    className="text-gray-700 hover:text-gray-400 transition-colors disabled:opacity-30"
                    aria-label="Share message"
                  >
                    {shareGenerating
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Share2 className="w-4 h-4" />
                    }
                  </button>
                  <AnimatePresence>
                    {shareOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 top-7 z-50 w-44 bg-black border border-white/12 shadow-xl py-1"
                      >
                        <button
                          onClick={handleShareEmail}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-mono text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                          SHARE VIA EMAIL
                        </button>
                        {isMobileDevice && (
                          <button
                            onClick={handleShareText}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-mono text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                          >
                            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                            SHARE VIA TEXT
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  onClick={handlePrint}
                  className="text-gray-700 hover:text-gray-400 transition-colors"
                  aria-label="Print message"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => selectedMsg && toggleSaved(selectedMsg.number)}
                  className={`${selectedMsg?.saved ? 'text-red-500' : 'text-gray-700 hover:text-gray-400'} transition-colors`}
                  aria-label={selectedMsg?.saved ? 'Remove bookmark' : 'Save message'}
                >
                  <Bookmark className={`w-4 h-4 ${selectedMsg?.saved ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            <AnimatePresence mode="popLayout" custom={navDirection}>
              {selectedMsg && (
                  <motion.div
                    key={selectedMsg.id}
                    custom={navDirection}
                    initial={(dir: number) => ({ opacity: 0, x: dir > 0 ? -20 : 20 })}
                    animate={{ opacity: 1, x: 0 }}
                    exit={(dir: number) => ({ opacity: 0, x: dir > 0 ? 20 : -20 })}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center md:pointer-events-none md:absolute md:left-1/2 md:top-1/2 md:mt-0 md:max-w-[min(56vw,860px)] md:-translate-x-1/2 md:-translate-y-1/2 md:flex-nowrap md:overflow-hidden md:whitespace-nowrap"
                  >
                    {selectedMsg.unread && (
                      <div className="flex items-center gap-1.5 md:flex-shrink-0">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-[10px] text-red-500 font-bold tracking-widest">UNREAD</span>
                      </div>
                    )}
                    {selectedMsg.isNew && (
                      <span className="text-[10px] text-green-400 font-bold tracking-widest md:flex-shrink-0">NEW!</span>
                    )}
                    <span className="text-[12px] text-red-500 font-bold tracking-widest md:flex-shrink-0">
                      MARADMIN {selectedMsg.number}
                    </span>
                    <span className="h-3.5 w-px self-center bg-white/18 rounded-full md:flex-shrink-0" aria-hidden="true" />
                    <span className="text-[12px] text-gray-500 font-mono md:flex-shrink-0">
                      {selectedMsg.displayDate}
                    </span>
                    <span className="h-3.5 w-px self-center bg-white/18 rounded-full md:flex-shrink-0" aria-hidden="true" />
                    <span className="text-[12px] text-gray-500 font-mono md:truncate">
                      {selectedMsg.source}
                    </span>
                    {selectedMetrics && selectedMetrics.views > 0 && (
                      <>
                        <span className="h-3.5 w-px self-center bg-white/18 rounded-full md:flex-shrink-0" aria-hidden="true" />
                        <span className="text-[12px] text-gray-500 font-mono md:flex-shrink-0">
                          VIEWED BY {formatCount(selectedMetrics.views)}
                        </span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            <div className="hidden md:flex md:flex-shrink-0 md:items-center md:gap-3">
              {/* Share button + dropdown */}
              <div ref={shareRef} className="relative flex items-center">
                <button
                  onClick={() => setShareOpen(o => !o)}
                  disabled={!selectedMsg || !detailSections || shareGenerating}
                  className="text-gray-700 hover:text-gray-400 transition-colors disabled:opacity-30"
                  aria-label="Share message"
                >
                  {shareGenerating
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Share2 className="w-4 h-4" />
                  }
                </button>
                <AnimatePresence>
                  {shareOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-7 z-50 w-44 bg-black border border-white/12 shadow-xl py-1"
                    >
                      <button
                        onClick={handleShareEmail}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-mono text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                        SHARE VIA EMAIL
                      </button>
                      {isMobileDevice && (
                        <button
                          onClick={handleShareText}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-mono text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                          SHARE VIA TEXT
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={handlePrint}
                className="text-gray-700 hover:text-gray-400 transition-colors"
                aria-label="Print message"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={() => selectedMsg && toggleSaved(selectedMsg.number)}
                className={`${selectedMsg?.saved ? 'text-red-500' : 'text-gray-700 hover:text-gray-400'} transition-colors`}
                aria-label={selectedMsg?.saved ? 'Remove bookmark' : 'Save message'}
              >
                <Bookmark className={`w-4 h-4 ${selectedMsg?.saved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
          </div>{/* end sticky header wrapper */}

          {/* Detail body */}
          <div ref={detailScrollRef} className="print-maradmin-body flex-1 overflow-y-auto overflow-x-hidden relative">
            {/* Subtle background texture */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }} />

            <AnimatePresence mode="popLayout" custom={navDirection}>
            <motion.div
              key={selectedMsg?.id ?? 'empty'}
              custom={navDirection}
              initial={(dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 })}
              animate={{ opacity: 1, x: 0 }}
              exit={(dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 })}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              onAnimationStart={() => {
                if (pendingNavScrollRef.current) {
                  pendingNavScrollRef.current = false;
                  resetDetailScrollToTop();
                }
              }}
              className="print-maradmin-content relative px-8 py-7"
            >
              {!selectedMsg ? (
                <div className="flex items-center justify-center h-64 text-gray-800 font-mono text-sm tracking-widest">
                  SELECT A MESSAGE
                </div>
              ) : (
                <>
                  <h2 className="text-[clamp(1.6rem,3vw,2.4rem)] font-black text-white tracking-tight leading-tight mb-7 uppercase">
                    {selectedMsg.subject}
                  </h2>

                  {detailLoading ? (
                    <ContentSkeleton />
                  ) : detailSections && detailSections.length > 0 ? (
                    <>
                      <ContentDisplay sections={detailSections} />
                      {/* Header POC cards — shown only when no dedicated POC paragraph already rendered them */}
                      {detailHeaderPOCs.length > 0 && !detailSections.some(s => /\bpoc\b|point of contact|points of contact/i.test(`${s.heading} ${s.body}`)) && (
                        <div className="mt-6 pt-6 border-t border-white/12">
                          <div className="text-[11px] font-bold tracking-[0.2em] text-red-500 mb-3">POINTS OF CONTACT</div>
                          <div className="space-y-2">
                            {detailHeaderPOCs.map((c, ci) => (
                              <div key={ci} className="border border-white/12 px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                                <div className="w-full flex items-baseline gap-2">
                                  <span className="text-[13px] font-bold text-white">{c.name}</span>
                                  {c.section && (
                                    <span className="text-[10px] font-bold tracking-widest text-gray-500 border border-white/10 px-1.5 py-0.5">{c.section}</span>
                                  )}
                                </div>
                                {c.email && (
                                  <div className="inline-flex items-center gap-1.5 text-[12px] text-red-400 hover:text-red-300 transition-colors">
                                    <Mail className="w-3 h-3" /> {renderContactEmail(c.email)}
                                  </div>
                                )}
                                {c.comm && (
                                  <a href={`tel:${c.comm.replace(/\D/g,'')}`}
                                     className="inline-flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-white transition-colors">
                                    <Phone className="w-3 h-3" /> {c.comm}
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <FetchFailed url={selectedMsg.link} onRetry={() => {
                      const key = selectedMsg.number || selectedMsg.link;
                      deleteCachedArticle(key);
                      setDetailRetryCount(c => c + 1);
                    }} />
                  )}

                  {selectedMsg.tags.length > 0 && !detailLoading && (
                    <div className="mt-6 pt-6 border-t border-white/12">
                      <div className="text-[11px] text-gray-600 font-bold tracking-[0.2em] mb-3">TAGS</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedMsg.tags.map((tag, i) => (
                          <span key={i} className="px-3 py-1 border border-white/16 text-red-500 text-[11px] font-bold tracking-widest hover:border-white/40 cursor-pointer transition-colors">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
            </AnimatePresence>

          </div>
        </div>
      </div>


      {creatingView && (
        <CreateViewModal
          availableTags={availableTags}
          onSave={createCustomView}
          onCancel={() => setCreatingView(false)}
        />
      )}
      {editingView && (
        <CreateViewModal
          availableTags={availableTags}
          initialValues={editingView}
          onSave={view => updateCustomView(editingView.id, view)}
          onCancel={() => setEditingView(null)}
        />
      )}
    </div>
  );
}
