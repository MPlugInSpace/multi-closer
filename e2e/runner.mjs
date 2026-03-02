import http from 'node:http';
import { chromium } from 'playwright';

const startServer = async () => {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<html><body>Host: ${req.headers.host ?? 'unknown'}</body></html>`);
  });

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to start local server');
  }

  return { server, port: address.port };
};

const getExtensionId = async (context) => {
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);

  const startedAt = Date.now();
  while (Date.now() - startedAt < 20_000) {
    const { targetInfos } = await cdp.send('Target.getTargets');
    const extensionTarget = targetInfos.find((target) => {
      if (!target.url.startsWith('chrome-extension://')) {
        return false;
      }
      return !target.url.endsWith('_generated_background_page.html');
    });

    if (extensionTarget) {
      const match = extensionTarget.url.match(/^chrome-extension:\/\/(.+?)\//);
      if (match) {
        await page.close();
        return match[1];
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  await page.close();
  throw new Error('Unable to resolve extension id from targets');
};

export const runTests = async ({ browserName, extensionDir, testFile }) => {
  if (browserName !== 'chromium') {
    throw new Error('Only chromium is supported in the initial E2E runner.');
  }

  const { server, port } = await startServer();
  const userDataDir = new URL('./.user-data', import.meta.url);
  const hostRules = [
    'MAP example.test 127.0.0.1',
    'MAP sub.example.test 127.0.0.1',
    'MAP other.test 127.0.0.1',
  ].join(', ');

  const args = [
    `--disable-extensions-except=${extensionDir.pathname}`,
    `--load-extension=${extensionDir.pathname}`,
    `--host-resolver-rules=${hostRules}`,
  ];

  // --no-sandbox is required on Linux CI environments (e.g. GitHub Actions) where
  // the sandbox cannot be used inside a container. Never enable this locally unless
  // strictly necessary, as it removes the renderer process security boundary.
  if (process.env.CI) {
    args.push('--no-sandbox');
  }

  const context = await chromium.launchPersistentContext(userDataDir.pathname, {
    headless: false,
    args,
    viewport: { width: 1200, height: 800 },
  });

  try {
    const extensionId = await getExtensionId(context);
    const testModule = await import(testFile.pathname);
    if (typeof testModule.run !== 'function') {
      throw new Error('E2E test file must export a run() function.');
    }
    await testModule.run({ context, port, extensionId });
  } finally {
    await context.close();
    await new Promise((resolve) => server.close(resolve));
  }
};
