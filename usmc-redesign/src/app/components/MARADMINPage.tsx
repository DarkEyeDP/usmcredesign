import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Filter, ChevronRight, Printer, Bookmark, Maximize2, Minimize2,
  ChevronLeft, Bell, Loader2, Mail, Phone, Globe, RefreshCw,
} from 'lucide-react';
import {
  fetchRSSFeed, fetchArticleContent, parseMARADMINText,
  extractMARADMINSource, fetchMARADMINArchivePage, type RSSMessage, type ContentSection, type ContentSubSection, type DetectedTable, type FetchMethod,
} from './maradminUtils';
import { fixSpelledOutURLs } from './maradminLinkUtils';
import {
  applyUserStateToMessages,
  getCachedArticle,
  getCachedArchiveCursor,
  getCachedFeed,
  getMARADMINUserState,
  isCachedFeedFresh,
  mergeArchiveMessages,
  mergeFeedMessages,
  saveCachedArticle,
  saveCachedFeed,
  saveMARADMINUserState,
  type MARADMINUserState,
} from './maradminStorage';

const tabs = ['ALL MESSAGES', 'UNREAD', 'SAVED'];
const FEED_POLL_INTERVAL_MS = 3 * 60 * 1000;

interface Props {
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

interface RefreshNotice {
  tone: 'success' | 'info' | 'error';
  message: string;
}

export function MARADMINPage({ isFullscreen = false, onToggleFullscreen }: Props) {
  const initialArchiveCursor = getCachedArchiveCursor();
  const navigate = useNavigate();
  const { messageNumber } = useParams();
  const [messages, setMessages]             = useState<RSSMessage[]>([]);
  const [listLoading, setListLoading]       = useState(true);
  const [selectedMsg, setSelectedMsg]       = useState<RSSMessage | null>(null);
  const [detailSections, setDetailSections] = useState<ContentSection[] | null>(null);
  const [detailLoading, setDetailLoading]   = useState(false);
  const [feedRefreshing, setFeedRefreshing] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [fetchMethod, setFetchMethod]       = useState<FetchMethod>(null);
  const [refreshNotice, setRefreshNotice]   = useState<RefreshNotice | null>(null);
  const [activeTab, setActiveTab]           = useState('ALL MESSAGES');
  const [searchQuery, setSearchQuery]       = useState('');
  const [navDirection, setNavDirection]     = useState<1 | -1>(1);
  const [filterOpen, setFilterOpen]         = useState(false);
  const [selectedYears, setSelectedYears]   = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags]     = useState<Set<string>>(new Set());
  const [mobileView, setMobileView]         = useState<'list' | 'detail'>('list');
  const [archiveNextPage, setArchiveNextPage] = useState(initialArchiveCursor.nextPage);
  const [archiveHasMore, setArchiveHasMore] = useState(initialArchiveCursor.hasMore);
  const detailScrollRef = useRef<HTMLDivElement>(null);
  const sidebarScrollRef = useRef<HTMLDivElement>(null);
  const msgItemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const userStateRef = useRef<MARADMINUserState>(getMARADMINUserState());
  const messagesRef = useRef<RSSMessage[]>([]);
  const refreshPromiseRef = useRef<Promise<number> | null>(null);
  const pendingArchiveScrollNumberRef = useRef<string | null>(null);

  const routeNumber = decodeMessageNumber(messageNumber);

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
    if (userStateRef.current.readNumbers.includes(number)) return;

    updateMessageFlags(number, state => ({
      ...state,
      readNumbers: [...state.readNumbers, number],
      newNumbers: state.newNumbers.filter(value => value !== number),
    }));
  }

  function toggleSaved(number: string) {
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

    const routeMatch = routeNumber
      ? messages.find(msg => msg.number === routeNumber)
      : null;

    if (routeMatch && routeMatch.id !== selectedMsg?.id) {
      setSelectedMsg(routeMatch);
      detailScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    if (!routeMatch) {
      navigate(buildMessagePath(messages[0].number), { replace: true });
    }
  }, [messages, navigate, routeNumber, selectedMsg?.id]);

  useEffect(() => {
    const pendingNumber = pendingArchiveScrollNumberRef.current;
    if (!pendingNumber) return;

    const pendingMessage = messages.find(message => message.number === pendingNumber);
    if (!pendingMessage) return;

    const el = msgItemRefs.current.get(pendingMessage.id);
    const container = sidebarScrollRef.current;
    if (!el || !container) return;

    const target = el.offsetTop - container.clientHeight / 2 + el.offsetHeight / 2;
    container.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
    pendingArchiveScrollNumberRef.current = null;
  }, [messages]);

  useEffect(() => {
    if (!selectedMsg?.link) return;
    markMessageRead(selectedMsg.number);
    const currentMessageId = selectedMsg.id;
    const cacheKey = selectedMsg.number || selectedMsg.link;
    const cachedArticle = getCachedArticle(cacheKey);

    if (cachedArticle) {
      setFetchMethod(cachedArticle.method);
      if (cachedArticle.source) {
        setMessages(prev => {
          const updated = prev.map(msg =>
            msg.id === currentMessageId && msg.source !== cachedArticle.source ? { ...msg, source: cachedArticle.source } : msg,
          );
          saveCachedFeed(updated, { nextPage: archiveNextPage, hasMore: archiveHasMore });
          return updated;
        });
        setSelectedMsg(prev =>
          prev && prev.id === currentMessageId && prev.source !== cachedArticle.source ? { ...prev, source: cachedArticle.source } : prev,
        );
      }
      setDetailSections(cachedArticle.text ? parseMARADMINText(cachedArticle.text) : []);
      setDetailLoading(false);
      return;
    }

    setDetailSections(null);
    setFetchMethod(null);
    setDetailLoading(true);
    fetchArticleContent(selectedMsg.link).then(({ text, method }) => {
      setFetchMethod(method);
      const extractedSource = text ? extractMARADMINSource(text) : null;
      if (extractedSource) {
        setMessages(prev => {
          const updated = prev.map(msg =>
            msg.id === currentMessageId && msg.source !== extractedSource ? { ...msg, source: extractedSource } : msg,
          );
          saveCachedFeed(updated, { nextPage: archiveNextPage, hasMore: archiveHasMore });
          return updated;
        });
        setSelectedMsg(prev =>
          prev && prev.id === currentMessageId && prev.source !== extractedSource ? { ...prev, source: extractedSource } : prev,
        );
      }
      saveCachedArticle(cacheKey, {
        text,
        method,
        source: extractedSource,
        cachedAt: Date.now(),
      });
      setDetailSections(text ? parseMARADMINText(text) : []);
      setDetailLoading(false);
    });
  }, [archiveHasMore, archiveNextPage, selectedMsg?.id]);

  const loadOlderMessages = useCallback(async () => {
    if (archiveLoading || !archiveHasMore) return 0;

    setArchiveLoading(true);
    try {
      const { messages: olderMessages, nextPage, hasMore } = await fetchMARADMINArchivePage(archiveNextPage);
      const existingNumbers = new Set(messagesRef.current.map(message => message.number));
      const uniqueOlderMessages = olderMessages.filter(message => !existingNumbers.has(message.number));
      const mergedMessages = mergeArchiveMessages(messagesRef.current, olderMessages, userStateRef.current);

      messagesRef.current = mergedMessages;
      pendingArchiveScrollNumberRef.current = uniqueOlderMessages[0]?.number ?? null;
      setMessages(mergedMessages);
      setArchiveNextPage(nextPage);
      setArchiveHasMore(hasMore);
      saveCachedFeed(mergedMessages, { nextPage, hasMore });

      return uniqueOlderMessages.length;
    } finally {
      setArchiveLoading(false);
    }
  }, [archiveHasMore, archiveLoading, archiveNextPage]);

  const unreadCount = messages.filter(m => m.unread).length;

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

  const activeFilterCount = selectedYears.size + selectedTags.size;

  const filteredMessages = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return messages.filter(m => {
      if (activeTab === 'UNREAD' && !m.unread) return false;
      if (activeTab === 'SAVED' && !m.saved) return false;
      if (q && !m.subject.toLowerCase().includes(q) && !m.number.includes(q) && !m.tags.some(t => t.toLowerCase().includes(q))) return false;
      if (selectedYears.size > 0 && !selectedYears.has(`20${m.number.split('/')[1]}`)) return false;
      if (selectedTags.size > 0 && !m.tags.some(t => selectedTags.has(t))) return false;
      return true;
    });
  }, [activeTab, messages, searchQuery, selectedYears, selectedTags]);

  function toggleYear(yr: string) {
    setSelectedYears(prev => { const next = new Set(prev); next.has(yr) ? next.delete(yr) : next.add(yr); return next; });
  }
  function toggleTag(tag: string) {
    setSelectedTags(prev => { const next = new Set(prev); next.has(tag) ? next.delete(tag) : next.add(tag); return next; });
  }
  function clearFilters() {
    setSelectedYears(new Set());
    setSelectedTags(new Set());
  }

  useEffect(() => {
    if (!selectedMsg) return;
    const el = msgItemRefs.current.get(selectedMsg.id);
    const container = sidebarScrollRef.current;
    if (!el || !container) return;
    const elTop = el.offsetTop;
    const elHeight = el.offsetHeight;
    const target = elTop - container.clientHeight / 2 + elHeight / 2;
    container.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
  }, [selectedMsg?.id]);

  const currentIdx = selectedMsg ? messages.findIndex(m => m.id === selectedMsg.id) : -1;

  function selectMsg(msg: RSSMessage) {
    const newIdx = messages.findIndex(m => m.id === msg.id);
    setNavDirection(newIdx >= currentIdx ? 1 : -1);
    navigate(buildMessagePath(msg.number));
    detailScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    setMobileView('detail');
  }

  const goToPrev = () => {
    if (currentIdx > 0) {
      setNavDirection(-1);
      navigate(buildMessagePath(messages[currentIdx - 1].number));
      detailScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    }
  };
  const goToNext = () => {
    if (currentIdx < messages.length - 1) {
      setNavDirection(1);
      navigate(buildMessagePath(messages[currentIdx + 1].number));
      detailScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  return (
    <div className={`print-maradmin-root ${isFullscreen ? 'h-screen flex flex-col overflow-hidden' : 'min-h-screen pb-20 md:pb-0'} bg-black`}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      {!isFullscreen && (
      <div className="print-hide relative overflow-hidden border-b border-white/12 pt-20 flex-shrink-0">
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
            <h1 className="text-[clamp(2.75rem,5vw,4.75rem)] font-black text-white tracking-tighter leading-none mb-2">
              MARADMIN<span className="text-red-600">.</span>
            </h1>
            <p className="text-[14px] text-gray-400 max-w-lg leading-relaxed">
              Official Marine Corps Administrative Messages — policy, guidance, and information
              from the Commandant affecting Marines and their families.
            </p>
          </div>

          {/* Tabs — flush at bottom of hero so the active underline sits on the border */}
          <div className="flex items-center px-8 -mb-px">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
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
          </div>
        </div>
      </div>
      )}

      {/* Tabs in fullscreen — shown when hero is hidden */}
      {isFullscreen && (
        <div className="border-b border-white/12 flex items-center px-8 flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
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
        </div>
      )}

      {/* ── MAIN GRID ────────────────────────────────────────────────────── */}
      <div className={`grid grid-cols-1 md:grid-cols-[380px_1fr] ${isFullscreen ? 'flex-1 min-h-0' : ''}`}>

        {/* ── LEFT SIDEBAR — message list ───────────────────────────────── */}
        <div className={`print-hide ${mobileView === 'detail' ? 'hidden md:flex' : 'flex'} md:flex flex-col ${isFullscreen ? '' : 'sticky self-start top-20 h-[calc(100vh-80px)]'} border-r border-white/12 bg-black/60 overflow-hidden`}>

          {/* Search + filter bar */}
          <div className="flex-shrink-0 border-b border-white/12">
            <div className="relative flex gap-2 px-5 py-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                <input
                  type="text"
                  placeholder="Search by number, keyword, or subject..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border border-white/12 text-white pl-9 pr-3 py-2 text-[13px] font-mono placeholder:text-gray-700 focus:border-red-500/40 focus:outline-none"
                />
              </div>
              <button
                onClick={() => setFilterOpen(v => !v)}
                className={`flex items-center gap-1 px-3 py-2 border text-[11px] font-bold tracking-widest transition-colors ${
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
                onClick={() => {
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
                }}
                className={`flex items-center gap-1 px-3 py-2 border text-[11px] font-bold tracking-widest transition-colors ${
                  feedRefreshing
                    ? 'border-red-600/60 text-red-400 bg-red-950/20'
                    : 'border-white/16 text-gray-500 hover:border-white/40 hover:text-gray-300'
                }`}
                aria-label="Refresh MARADMIN feed"
              >
                <RefreshCw className={`w-3 h-3 ${feedRefreshing ? 'animate-spin' : ''}`} />
                REFRESH
              </button>

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

            {/* Filter panel */}
            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeInOut' }}
                  className="overflow-hidden border-t border-white/12"
                >
                  <div className="px-5 py-4 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-500 tracking-[0.2em]">FILTERS</span>
                      {activeFilterCount > 0 && (
                        <button onClick={clearFilters} className="text-[11px] text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors">
                          CLEAR ALL
                        </button>
                      )}
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

          {/* Message list — scrollable */}
          <div ref={sidebarScrollRef} className="flex-1 overflow-y-auto px-5 py-3">
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
              <div className="space-y-0.5">
                {filteredMessages.map((msg, index) => {
                  const isSelected = selectedMsg?.id === msg.id;
                  const showMonthHeader = index === 0 || filteredMessages[index - 1].month !== msg.month;

                  return (
                    <div key={msg.id} className={showMonthHeader && index > 0 ? 'pt-2' : ''}>
                      {showMonthHeader && msg.month && (
                        <div className="flex items-center gap-2 mb-1 px-1 py-1.5 border-l-2 border-red-600 bg-red-950/20">
                          <span className="text-[11px] text-red-400 font-bold tracking-[0.2em] pl-2">{msg.month}</span>
                        </div>
                      )}
                      <motion.button
                        ref={el => { if (el) msgItemRefs.current.set(msg.id, el); else msgItemRefs.current.delete(msg.id); }}
                        onClick={() => selectMsg(msg)}
                        className={`w-full text-left px-3 py-3 border transition-colors ${
                          isSelected
                            ? 'border-red-600/40 bg-red-950/20'
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
                            {msg.isNew && (
                              <span className="text-[10px] text-green-400 font-bold tracking-widest">NEW!</span>
                            )}
                            {msg.unread && !isSelected && (
                              <span className="text-[10px] text-red-400 font-bold tracking-widest">UNREAD</span>
                            )}
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
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar footer */}
          <div className="flex-shrink-0 px-5 py-3 border-t border-white/12 flex items-center justify-between">
            <span className="text-[11px] text-gray-700 font-mono">
              {listLoading ? 'LOADING…' : activeFilterCount > 0 ? `${filteredMessages.length} OF ${messages.length} MESSAGES` : `${messages.length} MESSAGES`}
            </span>
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
        <div className={`print-maradmin-detail ${mobileView === 'list' ? 'hidden md:flex' : 'flex'} md:flex flex-col ${isFullscreen ? '' : 'sticky self-start top-20 h-[calc(100vh-80px)]'} overflow-hidden`}>

          {/* Detail top bar */}
          <div className="print-hide relative flex-shrink-0 z-10 border-b border-white/12 bg-black/90 px-4 py-3 backdrop-blur-sm md:flex md:items-center md:justify-between md:px-8">
            <div className="flex items-center justify-between gap-3 md:contents">
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
                onClick={goToNext} disabled={currentIdx >= messages.length - 1}
                className="flex items-center gap-1 text-[12px] font-mono tracking-widest disabled:text-gray-800 text-gray-500 hover:text-gray-300 transition-colors"
              >
                NEXT <ChevronRight className="w-3 h-3" />
              </button>
              </div>

              <div className="flex items-center gap-3 md:gap-3">
                {fetchMethod && (
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border ${
                    fetchMethod === 'direct'
                      ? 'border-green-700/40 text-green-600'
                      : 'border-yellow-700/40 text-yellow-600'
                  }`}>
                    {fetchMethod === 'direct' ? 'DIRECT' : 'VIA PROXY'}
                  </span>
                )}
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
                {onToggleFullscreen && (
                  <button
                    onClick={onToggleFullscreen}
                    className="text-gray-700 hover:text-gray-400 transition-colors"
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>

            {/* MARADMIN number + date centered in the bar */}
            <AnimatePresence mode="popLayout" custom={navDirection}>
              {selectedMsg && (
                <motion.div
                  key={selectedMsg.id}
                  custom={navDirection}
                  initial={(dir: number) => ({ opacity: 0, x: dir > 0 ? -20 : 20 })}
                  animate={{ opacity: 1, x: 0 }}
                  exit={(dir: number) => ({ opacity: 0, x: dir > 0 ? 20 : -20 })}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center leading-none md:pointer-events-none md:absolute md:left-1/2 md:top-1/2 md:mt-0 md:max-w-[min(50vw,720px)] md:-translate-x-1/2 md:-translate-y-1/2 md:flex-nowrap md:overflow-hidden md:whitespace-nowrap"
                >
                  {selectedMsg.unread && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-[10px] text-red-500 font-bold tracking-widest">UNREAD</span>
                    </div>
                  )}
                  {selectedMsg.isNew && (
                    <span className="text-[10px] text-green-400 font-bold tracking-widest">NEW!</span>
                  )}
                  <span className="text-[12px] text-red-500 font-bold tracking-widest">
                    MARADMIN {selectedMsg.number}
                  </span>
                  <span className="h-3.5 w-px self-center bg-white/18 rounded-full" aria-hidden="true" />
                  <span className="text-[12px] text-gray-500 font-mono">
                    {selectedMsg.displayDate}
                  </span>
                  <span className="h-3.5 w-px self-center bg-white/18 rounded-full" aria-hidden="true" />
                  <span className="text-[12px] text-gray-500 font-mono">
                    {selectedMsg.source}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Detail body */}
          <div ref={detailScrollRef} className="print-maradmin-body flex-1 overflow-y-auto relative overflow-x-hidden">
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
                    <ContentDisplay sections={detailSections} />
                  ) : fetchMethod === null && !detailLoading ? (
                    <FetchFailed url={selectedMsg.link} />
                  ) : (
                    <ParseFailed url={selectedMsg.link} />
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

      {/* Footer panels — hidden in fullscreen */}
      {!isFullscreen && <div className="print-hide grid grid-cols-1 md:grid-cols-3 border-t border-white/12 flex-shrink-0">
        <div className="p-6 border-r border-white/12">
          <div className="text-[11px] text-red-500 font-bold tracking-[0.2em] mb-3">STAY INFORMED</div>
          <p className="text-[13px] text-gray-400 leading-relaxed mb-4">
            Subscribe to receive notifications when new MARADMINs are published.
          </p>
          <button className="flex items-center gap-2 px-4 py-2 border border-red-600/40 text-red-500 text-[11px] font-bold tracking-widest hover:bg-red-900/10 transition-colors">
            <Bell className="w-3 h-3" /> MANAGE ALERTS
          </button>
        </div>
        <div className="p-6 border-r border-white/12">
          <div className="text-[11px] text-red-500 font-bold tracking-[0.2em] mb-3">QUICK LINKS</div>
          <div className="space-y-2">
            {['MARADMIN Archive', 'MARADMIN FAQs', 'Distribution Statement Policy', 'Message Authentication'].map(link => (
              <button key={link} className="w-full flex items-center justify-between text-[13px] text-gray-400 hover:text-white transition-colors py-1">
                <span>{link}</span>
                <ChevronRight className="w-3 h-3 text-gray-700" />
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          <div className="text-[11px] text-red-500 font-bold tracking-[0.2em] mb-3">NEED HELP?</div>
          <p className="text-[13px] text-gray-400 leading-relaxed mb-4">
            Contact the Marine Corps Message Management Team.
          </p>
          <button className="flex items-center gap-2 px-4 py-2 border border-red-600/40 text-red-500 text-[11px] font-bold tracking-widest hover:bg-red-900/10 transition-colors">
            CONTACT US
          </button>
        </div>
      </div>}

    </div>
  );
}

function encodeMessageNumber(number: string): string {
  return number.replace(/\//g, '-');
}

function decodeMessageNumber(messageNumber?: string): string | null {
  if (!messageNumber) return null;
  return messageNumber.replace(/-/g, '/');
}

function buildMessagePath(number: string): string {
  return `/messages/${encodeMessageNumber(number)}`;
}

// ── Link helpers ──────────────────────────────────────────────────────────────

function renderWithLinks(raw: string): ReactNode {
  const text  = fixSpelledOutURLs(raw);
  const TOKEN = /(https?:\/\/[^\s<>"')\]]+|[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}|\b(?:DSN[:\s]*)?\d{3}[-.\s]\d{3}[-.\s]\d{4}\b)/g;
  const parts: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = TOKEN.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const val = m[1].replace(/[.,;:)]+$/, '');
    if (val.startsWith('http')) {
      parts.push(<a key={m.index} href={val} target="_blank" rel="noopener noreferrer"
        className="text-red-400 hover:text-red-300 underline underline-offset-2 break-all">{val}</a>);
    } else if (val.includes('@')) {
      parts.push(<a key={m.index} href={`mailto:${val}`}
        className="text-red-400 hover:text-red-300 underline underline-offset-2">{val}</a>);
    } else {
      parts.push(<a key={m.index} href={`tel:${val.replace(/\D/g,'')}`}
        className="text-red-400 hover:text-red-300 underline underline-offset-2 whitespace-nowrap">{val}</a>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

interface LinkButton { url: string; label: string }
function extractURLButtons(text: string): LinkButton[] {
  const fixed   = fixSpelledOutURLs(text);
  const matches = [...fixed.matchAll(/https?:\/\/[^\s<>"')\]]+/g)];
  return matches.map(m => {
    const url = m[0].replace(/[.,;:)]+$/, '');
    try { return { url, label: new URL(url).hostname.replace(/^www\./, '').toUpperCase() }; }
    catch { return { url, label: 'VIEW LINK' }; }
  });
}

interface Contact { name: string; email?: string; comm?: string }
function extractContacts(text: string): Contact[] {
  const contacts: Contact[] = [];
  const emailRe = /([^\n.]+?)\s+Email:\s*([\w.+-]+@[\w.-]+\.[a-zA-Z]{2,})/gi;
  let em: RegExpExecArray | null;
  while ((em = emailRe.exec(text)) !== null) {
    const name  = em[1].trim().replace(/^\d+[.a-z]+\s+/i, '');
    const email = em[2];
    const rest  = text.slice(em.index + em[0].length, em.index + em[0].length + 80);
    const comm  = (rest.match(/Comm:\s*([\d.\-\s]+)/) ?? [])[1]?.trim();
    contacts.push({ name, email, comm });
  }
  return contacts;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ContentSkeleton() {
  return (
    <div className="space-y-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-4 h-3 bg-gray-900 rounded animate-pulse flex-shrink-0 mt-1" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-900 rounded w-28 animate-pulse" />
            <div className="h-3 bg-gray-900 rounded w-full animate-pulse" />
            <div className={`h-3 bg-gray-900 rounded animate-pulse ${i % 2 === 0 ? 'w-3/4' : 'w-5/6'}`} />
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 text-gray-800 text-[11px] font-mono tracking-widest mt-2">
        <Loader2 className="w-3 h-3 animate-spin" />
        FETCHING FULL MESSAGE…
      </div>
    </div>
  );
}

function ContentDisplay({ sections }: { sections: ContentSection[] }) {
  return (
    <div className="space-y-5 mb-8">
      {sections.map((section, i) => {
        const isPOC      = /\bpoc\b|point of contact|points of contact/i.test(section.heading);
        const urlButtons = extractURLButtons(section.body);
        const bulletText = flattenSubSectionText(section.bullets ?? []).join(' ');
        const contacts   = isPOC ? extractContacts(section.body + ' ' + bulletText) : [];

        return (
          <div key={i} className="flex gap-3">
            <span className="text-sm text-gray-700 font-mono mt-0.5 flex-shrink-0">{i + 1}.</span>
            <div className="flex-1 min-w-0">
              {section.heading && (
                <span className="text-[15px] font-bold text-white">{section.heading}. </span>
              )}
              {section.body && (
                <span className="text-[15px] text-gray-300 leading-relaxed">
                  {renderWithLinks(section.body)}
                </span>
              )}
              {section.bullets && section.bullets.length > 0 && (
                <SubSectionList items={section.bullets} className="mt-2 ml-2" />
              )}
              {section.tables && section.tables.length > 0 && (
                <div className="mt-3 space-y-4">
                  {section.tables.map((table, ti) => (
                    <TableBlock key={ti} table={table} />
                  ))}
                </div>
              )}
              {urlButtons.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {urlButtons.map((btn, bi) => (
                    <a key={bi} href={btn.url} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-600/40 text-red-500 text-[11px] font-bold tracking-widest hover:bg-red-900/10 transition-colors">
                      <Globe className="w-3 h-3" /> {btn.label} <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              )}
              {contacts.length > 0 && (
                <div className="mt-3 space-y-2">
                  {contacts.map((c, ci) => (
                    <div key={ci} className="border border-white/12 px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="text-[13px] font-bold text-white w-full">{c.name}</span>
                      {c.email && (
                        <a href={`mailto:${c.email}`}
                           className="inline-flex items-center gap-1.5 text-[12px] text-red-400 hover:text-red-300 transition-colors">
                          <Mail className="w-3 h-3" /> {c.email}
                        </a>
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
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function flattenSubSectionText(items: ContentSubSection[]): string[] {
  return items.flatMap(item => [
    item.body,
    ...flattenSubSectionText(item.children ?? []),
  ]).filter(Boolean);
}

function SubSectionList({ items, className = '' }: { items: ContentSubSection[]; className?: string }) {
  return (
    <ul className={`space-y-1.5 ${className}`.trim()}>
      {items.map((item, index) => (
        <li key={`${item.label}-${index}`} className="flex gap-2 text-[15px] text-gray-300 leading-relaxed">
          <span className="text-red-600 mt-0.5 flex-shrink-0">{item.label}</span>
          <div className="min-w-0 flex-1 space-y-2">
            {item.body && <span className="block">{renderWithLinks(item.body)}</span>}
            {item.tables && item.tables.length > 0 && (
              <div className="space-y-4">
                {item.tables.map((table, ti) => (
                  <TableBlock key={ti} table={table} />
                ))}
              </div>
            )}
            {item.children && item.children.length > 0 && (
              <SubSectionList items={item.children} className="ml-3 pt-1" />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function TableBlock({ table }: { table: DetectedTable }) {
  const isPersonnelTable =
    table.headers.length === 3 &&
    table.headers[0] === 'Name' &&
    (table.headers[1] === 'DOR' || table.headers[1] === 'Grade') &&
    table.headers[2] === 'MCC';

  return (
    <div className="space-y-2">
      {table.title && (
        <div className="text-[11px] font-bold tracking-[0.18em] text-red-500">
          {table.title}
        </div>
      )}
      <div className="overflow-x-auto md:overflow-visible border border-white/10 bg-black/40">
      <table className="w-full border-collapse text-[13px] font-mono">
        {table.headers.length > 0 && (
          <thead>
            <tr className="border-b border-white/12 bg-white/[0.03]">
              {table.headers.map((h, hi) => (
                <th
                  key={hi}
                  className="sticky top-0 z-10 border-b border-white/12 bg-[#080808]/95 px-4 py-2 text-left text-[11px] font-bold tracking-[0.15em] text-gray-400 backdrop-blur-sm whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {table.rows.map((row, ri) => (
            <tr key={ri} className="border-b border-white/6 hover:bg-white/[0.02] transition-colors">
              {row.map((cell, ci) => {
                const trimmed = cell.trim();
                const isExplicitDash = trimmed === '-';
                const isEmptyValue = trimmed === '';
                const cellWhitespace =
                  isPersonnelTable && ci === 0 ? 'whitespace-normal' : 'whitespace-nowrap';

                return (
                  <td
                    key={ci}
                    className={`px-4 py-2 ${cellWhitespace} ${
                      ci === 0
                        ? 'text-gray-200 font-bold'
                        : isExplicitDash
                          ? 'text-gray-500 tabular-nums italic'
                          : isEmptyValue
                            ? 'text-gray-600 tabular-nums'
                            : 'text-gray-400 tabular-nums'
                    }`}
                  >
                    {ci === 0 ? cell : isExplicitDash || isEmptyValue ? '—' : cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function FetchFailed({ url }: { url: string }) {
  return (
    <div className="border border-white/12 p-6 mb-8">
      <div className="text-[11px] text-gray-600 font-bold tracking-[0.2em] mb-2">FULL TEXT UNAVAILABLE</div>
      <p className="text-[13px] text-gray-400 leading-relaxed mb-4">
        The full message could not be retrieved automatically. Read the complete MARADMIN on Marines.mil.
      </p>
      <a href={url} target="_blank" rel="noopener noreferrer"
         className="inline-flex items-center gap-2 px-4 py-2 border border-red-600/40 text-red-500 text-[11px] font-bold tracking-widest hover:bg-red-900/10 transition-colors">
        READ ON MARINES.MIL <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}

function ParseFailed({ url }: { url: string }) {
  return (
    <div className="border border-white/12 p-6 mb-8">
      <div className="text-[11px] text-gray-600 font-bold tracking-[0.2em] mb-2">CONTENT PARSING INCOMPLETE</div>
      <p className="text-[13px] text-gray-400 leading-relaxed mb-4">
        The message was retrieved but could not be fully parsed. Read the original on Marines.mil.
      </p>
      <a href={url} target="_blank" rel="noopener noreferrer"
         className="inline-flex items-center gap-2 px-4 py-2 border border-red-600/40 text-red-500 text-[11px] font-bold tracking-widest hover:bg-red-900/10 transition-colors">
        READ ON MARINES.MIL <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}
