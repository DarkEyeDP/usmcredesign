import assert from 'node:assert/strict';
import worker from '../workers/news-metrics/src/index.js';
import { markTestFilePass, markTestFileStart, testAsync } from './test-helpers';

markTestFileStart();

type Row = {
  slug: string;
  views: number;
  reads: number;
  updated_at: string;
  number?: string;
  link?: string;
  text?: string;
  source?: string;
  method?: string;
  cached_at?: string;
};

class FakeD1Statement {
  private values: unknown[] = [];

  constructor(private db: FakeD1Database, private sql: string) {}

  bind(...values: unknown[]) {
    this.values = values;
    return this;
  }

  async first(): Promise<Row | null> {
    const key = String(this.values[0]);
    if (/FROM\s+maradmin_articles/i.test(this.sql)) {
      return this.db.maradminArticles.get(key) ?? null;
    }
    if (/FROM\s+maradmins/i.test(this.sql)) {
      return this.db.maradmins.get(key) ?? null;
    }
    return this.db.rows.get(key) ?? null;
  }

  async run(): Promise<{ success: true }> {
    if (/INSERT INTO\s+maradmin_articles/i.test(this.sql)) {
      const [number, text, source, method] = this.values.map(String);
      this.db.maradminArticles.set(number, {
        slug: number,
        views: 0,
        reads: 0,
        updated_at: '2026-06-02 00:00:01',
        number,
        text,
        source,
        method,
        cached_at: '2026-06-02 00:00:01',
      });
      return { success: true };
    }

    if (/UPDATE\s+maradmins/i.test(this.sql)) {
      const [source, number] = this.values.map(String);
      const row = this.db.maradmins.get(number);
      if (row && (!row.source || row.source === 'HQMC')) row.source = source;
      return { success: true };
    }

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
  maradmins = new Map<string, Row>();
  maradminArticles = new Map<string, Row>();

  prepare(sql: string) {
    return new FakeD1Statement(this, sql);
  }

  async batch(statements: FakeD1Statement[]) {
    return await Promise.all(statements.map(statement => statement.run()));
  }
}

function makeEnv() {
  return {
    DB: new FakeD1Database(),
    ALLOWED_ORIGINS: 'http://localhost:5174',
  };
}

async function json(response: Response) {
  return await response.json() as {
    slug?: string;
    views?: number;
    reads?: number;
    error?: string;
    text?: string;
    source?: string;
    method?: string;
  };
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

await testAsync('falls back to reader text when Marines.mil blocks direct MARADMIN fetches', async () => {
  const env = makeEnv();
  env.DB.maradmins.set('282/26', {
    slug: '282/26',
    views: 0,
    reads: 0,
    updated_at: '2026-06-02 00:00:00',
    number: '282/26',
    link: 'https://www.marines.mil/News/Messages/Messages-Display/Article/4521796/example/',
    source: 'HQMC',
  });

  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.startsWith('https://www.marines.mil/')) {
      return new Response('Access Denied', { status: 403 });
    }
    if (url.startsWith('https://r.jina.ai/http://')) {
      return new Response(`
Title: ANNOUNCEMENT OF IRREGULAR WARFARE AND COMPETITION SPECIALTY TRAINING

URL Source: https://www.marines.mil/News/Messages/Messages-Display/Article/4521796/example/

Markdown Content:
MARADMINS : 282/26

R 181900Z JUN 26
MARADMIN 282/26
MSGID/GENADMIN/CMC CD&I QUANTICO//
SUBJ/ANNOUNCEMENT OF IRREGULAR WARFARE AND COMPETITION SPECIALTY TRAINING//
GENTEXT/RMKS/1. Purpose. This MARADMIN announces training.
2. Release authorized by Lieutenant General E. E. Austin, Headquarters Marine Corps, Deputy Commandant for Combat Development and Integration.//
`);
    }
    return new Response('Unexpected URL', { status: 500 });
  }) as typeof fetch;

  try {
    const response = await worker.fetch(new Request('http://metrics.test/maradmins/282-26/content'), env);
    const body = await json(response);

    assert.equal(response.status, 200);
    assert.equal(body.method, 'reader');
    assert.match(body.text ?? '', /MARADMIN 282\/26/);
    assert.equal(body.source, 'Deputy Commandant for Combat Development and Integration');
    assert.equal(env.DB.maradminArticles.get('282/26')?.method, 'reader');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

markTestFilePass();
