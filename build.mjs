import { build } from 'esbuild';
import { mkdir, rm, cp } from 'node:fs/promises';
import { readFile, writeFile } from 'node:fs/promises';
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
    // Production build: build Chrome MV3 variant into dist/
    await buildProduction('dist');
    console.log('Built production variant → dist/');

    // Also create a Firefox-compatible MV2 variant in dist-firefox/
    // Firefox (stable) currently has service_worker disabled; build a
    // manifest that uses background.scripts and a non-module background
    // bundle so users can load the extension temporarily in Firefox.
    const firefoxDist = 'dist-firefox';
    await rm(firefoxDist, { recursive: true, force: true });
    await mkdir(firefoxDist, { recursive: true });
    await mkdir(join(firefoxDist, 'popup'), { recursive: true });

    // background-firefox.js: IIFE bundle compatible with MV2 background.scripts
    await build({
      entryPoints: [join(srcDir, 'background.ts')],
      bundle: true,
      format: 'iife',
      target: 'es2022',
      outfile: join(firefoxDist, 'background-firefox.js'),
    });

    // popup can be reused
    await build({
      entryPoints: [join(srcDir, 'popup', 'popup.ts')],
      bundle: true,
      format: 'iife',
      target: 'es2022',
      outfile: join(firefoxDist, 'popup', 'popup.js'),
    });

    // copy icons and popup files
    await cp(join(srcDir, 'icons'), join(firefoxDist, 'icons'), { recursive: true });
    await cp(join(srcDir, 'popup', 'popup.html'), join(firefoxDist, 'popup', 'popup.html'));
    await cp(join(srcDir, 'popup', 'popup.css'), join(firefoxDist, 'popup', 'popup.css'));

    // Create a Firefox-compatible manifest by deriving from src/manifest.json.
    // Replace MV3 service_worker with MV2 background.scripts and set
    // manifest_version to 2 so Firefox (stable/nightly) will accept it when
    // loading the temporary add-on.
    try {
      const srcManifestRaw = await readFile(join(srcDir, 'manifest.json'), 'utf8');
      const srcManifest = JSON.parse(srcManifestRaw);
      const ffManifest = { ...srcManifest };
      // Downgrade manifest version to 2 for Firefox compatibility
      ffManifest.manifest_version = 2;
      if (ffManifest.background) {
        // remove service_worker and type fields
        delete ffManifest.background.service_worker;
        delete ffManifest.background.type;
      }
      // Add background.scripts pointing to our built IIFE bundle
      ffManifest.background = ffManifest.background || {};
      ffManifest.background.scripts = ['background-firefox.js'];

      // Firefox may require explicit "applications" keys for some metadata,
      // but for temporary installs this is optional.

      await writeFile(
        join(firefoxDist, 'manifest.json'),
        JSON.stringify(ffManifest, null, 2),
        'utf8',
      );
    } catch {
      // If anything fails, fall back to copying manifest.json
      await cp(join(srcDir, 'manifest.json'), join(firefoxDist, 'manifest.json'));
    }

    console.log('Built firefox-compatible variant → dist-firefox/');
  }
};

main();
