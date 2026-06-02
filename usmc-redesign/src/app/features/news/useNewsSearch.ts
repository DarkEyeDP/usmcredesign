import MiniSearch from 'minisearch';
import { useState, useEffect, useRef } from 'react';
import type { NewsItem } from './types';

interface SearchDoc {
  id: string;
  slug: string;
  title: string;
  description: string;
  source: 'news' | 'press-release';
  feedId: string | null;
  pubDate: string;
  bodyText: string;
}

// Module-level singleton — built once, reused across renders and navigations.
let indexPromise: Promise<MiniSearch<SearchDoc>> | null = null;

function getIndex(): Promise<MiniSearch<SearchDoc>> {
  if (indexPromise) return indexPromise;

  indexPromise = fetch('/data/search-index.json')
    .then(res => {
      if (!res.ok) throw new Error('Search index unavailable');
      return res.json() as Promise<SearchDoc[]>;
    })
    .then(docs => {
      const ms = new MiniSearch<SearchDoc>({
        idField: 'id',
        fields: ['title', 'description', 'bodyText'],
        storeFields: ['id', 'slug', 'source', 'feedId', 'pubDate'],
        searchOptions: {
          boost: { title: 3, description: 1.5 },
          fuzzy: 0.2,
          prefix: true,
        },
      });
      ms.addAll(docs);
      return ms;
    })
    .catch(err => {
      indexPromise = null;
      throw err;
    });

  return indexPromise;
}

export interface UseNewsSearchResult {
  results: NewsItem[];
  searching: boolean;
  hasIndex: boolean;
}

/**
 * Full-text search over the pre-built MiniSearch index.
 * Matches results back to the provided pool to preserve bookmark state
 * and ensure only current-feed articles are returned.
 */
export function useNewsSearch(query: string, pool: NewsItem[]): UseNewsSearchResult {
  const [results, setResults] = useState<NewsItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasIndex, setHasIndex] = useState(false);
  const latestQuery = useRef(query);

  // Warm the index as soon as the hook is first used.
  useEffect(() => {
    getIndex().then(() => setHasIndex(true)).catch(() => {});
  }, []);

  useEffect(() => {
    latestQuery.current = query;
    const trimmed = query.trim();

    if (!trimmed) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);

    getIndex()
      .then(index => {
        if (latestQuery.current !== query) return;

        const hits = index.search(trimmed);
        const hitIds = new Set(hits.map(h => h.id));

        // Preserve order from MiniSearch (score-ranked), match back to pool items
        const matched = hits
          .map(h => pool.find(item => item.id === h.id))
          .filter((item): item is NewsItem => item !== undefined);

        // Also include items matched by id that might not be in the pool yet
        // (e.g., edge case during load). Filter pool for any stragglers.
        const extra = pool.filter(item => hitIds.has(item.id) && !matched.includes(item));

        setResults([...matched, ...extra]);
        setSearching(false);
        setHasIndex(true);
      })
      .catch(() => {
        if (latestQuery.current !== query) return;
        setSearching(false);
      });
  }, [query, pool]);

  return { results, searching, hasIndex };
}
