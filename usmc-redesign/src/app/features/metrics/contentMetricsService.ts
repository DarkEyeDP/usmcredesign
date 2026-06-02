export interface ContentMetrics {
  slug: string;
  views: number;
  reads: number;
  updatedAt: string | null;
}

const METRICS_URL = import.meta.env.VITE_NEWS_METRICS_URL?.replace(/\/$/, '') ?? '';

function metricsEnabled(): boolean {
  return METRICS_URL.length > 0;
}

async function requestMetrics(path: string, init?: RequestInit): Promise<ContentMetrics | null> {
  if (!metricsEnabled()) return null;

  try {
    const response = await fetch(`${METRICS_URL}${path}`, init);
    if (!response.ok) return null;
    return await response.json() as ContentMetrics;
  } catch {
    return null;
  }
}

export function getContentMetrics(key: string): Promise<ContentMetrics | null> {
  return requestMetrics(`/articles/${encodeURIComponent(key)}`);
}

export function recordContentView(key: string): Promise<ContentMetrics | null> {
  return requestMetrics(`/articles/${encodeURIComponent(key)}/view`, { method: 'POST' });
}

export function recordContentRead(key: string): Promise<ContentMetrics | null> {
  return requestMetrics(`/articles/${encodeURIComponent(key)}/read`, { method: 'POST' });
}

export function hasContentMetricsConfigured(): boolean {
  return metricsEnabled();
}
