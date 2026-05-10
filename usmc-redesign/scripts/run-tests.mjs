import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const root = process.cwd();
const testFiles = [
  path.join(root, 'tests', 'maradmin-link-utils.test.ts'),
  path.join(root, 'tests', 'maradmin-storage.test.ts'),
  path.join(root, 'tests', 'maradmin-table-parsers.test.ts'),
  path.join(root, 'tests', 'route-utils.test.ts'),
];

const tempDir = path.join(root, '.tmp-test-build');

async function run() {
  await rm(tempDir, { recursive: true, force: true });
  await mkdir(tempDir, { recursive: true });

  globalThis.__TEST_STATS__ = {
    filesPassed: 0,
    filesTotal: 0,
    testsPassed: 0,
    testsTotal: 0,
  };

  for (const testFile of testFiles) {
    const outfile = path.join(
      tempDir,
      `${path.basename(testFile, path.extname(testFile))}-${Date.now()}-${Math.random().toString(36).slice(2)}.mjs`,
    );

    await build({
      entryPoints: [testFile],
      bundle: true,
      platform: 'node',
      format: 'esm',
      outfile,
      sourcemap: false,
      logLevel: 'silent',
      target: `node${process.versions.node.split('.')[0]}`,
    });

    await import(pathToFileURL(outfile).href);
  }

  const stats = globalThis.__TEST_STATS__;
  console.log('');
  console.log(`Tests: ${stats.testsPassed} passed, ${stats.testsTotal} total`);
  console.log(`Files: ${stats.filesPassed} passed, ${stats.filesTotal} total`);
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
