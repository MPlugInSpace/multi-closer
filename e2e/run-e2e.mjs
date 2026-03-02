import { runTests } from './runner.mjs';

runTests({
  browserName: 'chromium',
  extensionDir: new URL('../dist-test', import.meta.url),
  testFile: new URL('./tests/close-tabs.mjs', import.meta.url),
});
