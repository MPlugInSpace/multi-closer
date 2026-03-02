import { build } from 'esbuild';
import { mkdir, rm, cp } from 'node:fs/promises';
import { join } from 'node:path';

const srcDir = 'src';

/**
 * Build shared production assets (background, popup) into the given output directory.
 */
const buildProduction = async (distDir) => {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
  await mkdir(join(distDir, 'popup'), { recursive: true });

  await Promise.all([
    build({
      entryPoints: [join(srcDir, 'background.ts')],
      bundle: true,
      format: 'esm',
      target: 'es2022',
      outfile: join(distDir, 'background.js'),
    }),
    build({
      entryPoints: [join(srcDir, 'popup', 'popup.ts')],
      bundle: true,
      format: 'iife',
      target: 'es2022',
      outfile: join(distDir, 'popup', 'popup.js'),
    }),
    cp(join(srcDir, 'manifest.json'), join(distDir, 'manifest.json')),
    cp(join(srcDir, 'icons'), join(distDir, 'icons'), { recursive: true }),
    cp(join(srcDir, 'popup', 'popup.html'), join(distDir, 'popup', 'popup.html')),
    cp(join(srcDir, 'popup', 'popup.css'), join(distDir, 'popup', 'popup.css')),
  ]);
};

/**
 * Build the E2E test variant into dist-test/.
 * Copies production assets and adds the test runner bundle.
 * No web_accessible_resources is declared — the runner page is accessible to
 * the extension itself (which is all the E2E harness needs) but is not reachable
 * by any web origin, since Chrome only exposes extension pages to external pages
 * when they are explicitly listed under web_accessible_resources.
 */
const buildTest = async (distDir) => {
  await mkdir(join(distDir, 'test'), { recursive: true });

  await build({
    entryPoints: [join(srcDir, 'test', 'runner.ts')],
    bundle: true,
    format: 'iife',
    target: 'es2022',
    outfile: join(distDir, 'test', 'runner.js'),
  });

  await cp(join(srcDir, 'test', 'runner.html'), join(distDir, 'test', 'runner.html'));
};

const main = async () => {
  const target = process.env.BUILD_TARGET ?? 'production';

  if (target === 'test') {
    // E2E build: production assets + test runner, in dist-test/
    const testDistDir = 'dist-test';
    await buildProduction(testDistDir);
    await buildTest(testDistDir);
    console.log('Built E2E test variant → dist-test/');
  } else {
    // Production build: no test runner, no web_accessible_resources
    await buildProduction('dist');
    console.log('Built production variant → dist/');
  }
};

main();
