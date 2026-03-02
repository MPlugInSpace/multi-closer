/**
 * Poll a condition function until it returns true or the timeout expires.
 * Throws if the condition is never met.
 */
const poll = async (
  condition,
  { timeoutMs = 3000, intervalMs = 100, label = 'condition' } = {},
) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await condition()) return;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`Timed out waiting for: ${label}`);
};

export const run = async ({ context, port, extensionId }) => {
  const pageA = await context.newPage();
  const pageB = await context.newPage();
  const pageC = await context.newPage();

  await pageA.goto(`http://example.test:${port}`);
  await pageB.goto(`http://sub.example.test:${port}`);
  await pageC.goto(`http://other.test:${port}`);

  await pageA.bringToFront();

  const runner = await context.newPage();
  await runner.goto(`chrome-extension://${extensionId}/test/runner.html`);

  const activeHost = new URL(pageA.url()).host;
  const response = await runner.evaluate(async (host) => {
    const closed = await window.runCloseMatchingTabs?.(host);
    return { closed };
  }, activeHost);

  if (!response || typeof response.closed !== 'number') {
    throw new Error('Expected a numeric response from runCloseMatchingTabs');
  }

  // example.test (pageA) + sub.example.test (pageB) = 2 tabs closed.
  if (response.closed !== 2) {
    throw new Error(`Expected 2 tabs closed, got ${response.closed}`);
  }

  // Poll instead of a fixed sleep — tabs are removed asynchronously.
  await poll(
    () => {
      const urls = context.pages().map((p) => p.url());
      const noExample = !urls.some((u) => u.includes('example.test'));
      const hasOther = urls.some((u) => u.includes('other.test'));
      return Promise.resolve(noExample && hasOther);
    },
    { label: 'example.test tabs removed, other.test tab remaining' },
  );

  await runner.close();
};
