import assert from 'node:assert/strict';
import worker from '../workers/news-metrics/src/index.js';
import { markTestFilePass, markTestFileStart, testAsync } from './test-helpers';

markTestFileStart();

type Row = {
  slug: string;
  views: number;
  reads: number;
  updated_at: string;
};

class FakeD1Statement {
  private values: unknown[] = [];

  constructor(private db: FakeD1Database, private sql: string) {}

  bind(...values: unknown[]) {
    this.values = values;
    return this;
  }

  async first(): Promise<Row | null> {
    const slug = String(this.values[0]);
    return this.db.rows.get(slug) ?? null;
  }

  async run(): Promise<{ success: true }> {
    const slug = String(this.values[0]);
    const row = this.db.rows.get(slug) ?? {
      slug,
      views: 0,
      reads: 0,
      updated_at: '2026-06-02 00:00:00',
    };

    if (/\bviews\b/.test(this.sql)) row.views += 1;
    if (/\breads\b/.test(this.sql)) row.reads += 1;

    row.updated_at = '2026-06-02 00:00:01';
    this.db.rows.set(slug, row);
    return { success: true };
  }
}

class FakeD1Database {
  rows = new Map<string, Row>();

  prepare(sql: string) {
    return new FakeD1Statement(this, sql);
  }
}

function makeEnv() {
  return {
    DB: new FakeD1Database(),
    ALLOWED_ORIGINS: 'http://localhost:5174',
  };
}

async function json(response: Response) {
  return await response.json() as { slug?: string; views?: number; reads?: number; error?: string };
}

await testAsync('returns zero counts for unknown metric keys', async () => {
  const env = makeEnv();
  const response = await worker.fetch(new Request('http://metrics.test/articles/news:sample-article'), env);
  const body = await json(response);

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    slug: 'news:sample-article',
    views: 0,
    reads: 0,
    updatedAt: null,
  });
});

await testAsync('increments views and reads for namespaced metric keys', async () => {
  const env = makeEnv();

  const viewResponse = await worker.fetch(new Request('http://metrics.test/articles/maradmin:123-26/view', { method: 'POST' }), env);
  const readResponse = await worker.fetch(new Request('http://metrics.test/articles/maradmin:123-26/read', { method: 'POST' }), env);
  const body = await json(readResponse);

  assert.equal(viewResponse.status, 200);
  assert.equal(readResponse.status, 200);
  assert.equal(body.slug, 'maradmin:123-26');
  assert.equal(body.views, 1);
  assert.equal(body.reads, 1);
});

await testAsync('sends CORS headers for allowed origins', async () => {
  const env = makeEnv();
  const response = await worker.fetch(
    new Request('http://metrics.test/articles/news:sample-article', {
      headers: { Origin: 'http://localhost:5174' },
    }),
    env,
  );

  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5174');
  assert.equal(response.headers.get('access-control-allow-methods'), 'GET,POST,OPTIONS');
});

await testAsync('rejects invalid metric keys', async () => {
  const env = makeEnv();
  const response = await worker.fetch(new Request('http://metrics.test/articles/news:%2Fbad'), env);
  const body = await json(response);

  assert.equal(response.status, 404);
  assert.equal(body.error, 'Not found');
});

markTestFilePass();
