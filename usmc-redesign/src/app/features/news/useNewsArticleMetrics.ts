import { useContentMetrics } from '../metrics/useContentMetrics';
import { buildNewsArticleMetricKey } from '../metrics/contentMetricKeys';

export function useNewsArticleMetrics(slug: string | undefined) {
  return useContentMetrics(buildNewsArticleMetricKey(slug), {
    recordRead: true,
    viewStoragePrefix: 'usmc-news-viewed:',
    readStoragePrefix: 'usmc-news-read:',
  });
}
