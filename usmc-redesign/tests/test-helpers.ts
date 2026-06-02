type TestStats = {
  filesPassed: number;
  filesTotal: number;
  testsPassed: number;
  testsTotal: number;
};

declare global {
  var __TEST_STATS__: TestStats | undefined;
}

function getStats(): TestStats {
  if (!globalThis.__TEST_STATS__) {
    globalThis.__TEST_STATS__ = {
      filesPassed: 0,
      filesTotal: 0,
      testsPassed: 0,
      testsTotal: 0,
    };
  }

  return globalThis.__TEST_STATS__;
}

export function markTestFileStart() {
  getStats().filesTotal += 1;
}

export function markTestFilePass() {
  getStats().filesPassed += 1;
}

export function test(name: string, fn: () => void) {
  const stats = getStats();
  stats.testsTotal += 1;

  try {
    fn();
    stats.testsPassed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

export async function testAsync(name: string, fn: () => Promise<void>) {
  const stats = getStats();
  stats.testsTotal += 1;

  try {
    await fn();
    stats.testsPassed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

export function getTestStats(): TestStats {
  return getStats();
}
