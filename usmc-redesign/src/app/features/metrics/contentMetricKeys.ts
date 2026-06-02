const MAX_CONTENT_METRIC_KEY_LENGTH = 180;

function sanitizeMetricPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/\//g, '-')
    .replace(/[^a-z0-9._~-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildContentMetricKey(namespace: string, rawKey: string | null | undefined): string | undefined {
  const safeNamespace = sanitizeMetricPart(namespace);
  const safeRawKey = rawKey ? sanitizeMetricPart(rawKey) : '';
  if (!safeNamespace || !safeRawKey) return undefined;

  const prefix = `${safeNamespace}:`;
  const maxRawLength = MAX_CONTENT_METRIC_KEY_LENGTH - prefix.length;
  const clippedRawKey = safeRawKey.slice(0, maxRawLength).replace(/[-._~]+$/g, '');

  return clippedRawKey ? `${prefix}${clippedRawKey}` : undefined;
}

export function buildNewsArticleMetricKey(slug: string | null | undefined): string | undefined {
  return buildContentMetricKey('news', slug);
}

export function buildMARADMINMetricKey(rawKey: string | null | undefined): string | undefined {
  return buildContentMetricKey('maradmin', rawKey);
}
