import { readFile } from 'node:fs/promises';

const CHROME_VERSION_RE = /^\d+\.\d+\.\d+(\.\d+)?$/;

const main = async () => {
  const pkgText = await readFile(new URL('../package.json', import.meta.url), 'utf8');
  const manifestText = await readFile(new URL('../dist/manifest.json', import.meta.url), 'utf8');
  const pkg = JSON.parse(pkgText);
  const manifest = JSON.parse(manifestText);

  // package.json may carry a full semver prerelease string (e.g. 0.1.0-feature-foo.1).
  // dist/manifest.json must always carry a Chrome-compatible version (up to 4 integers).
  if (!CHROME_VERSION_RE.test(manifest.version)) {
    throw new Error(
      `dist/manifest.json version "${manifest.version}" is not a valid Chrome manifest version. ` +
        `Expected up to 4 dot-separated integers (e.g. 1.2.3 or 1.2.3.4).`,
    );
  }

  // The manifest base version (first 3 components) must match the semver base in package.json.
  const pkgBase = pkg.version.replace(/-.*$/, '');
  // Compare first 3 dot-separated parts
  const first3 = (v) => v.split('.').slice(0, 3).join('.');
  if (first3(pkgBase) !== first3(manifest.version)) {
    throw new Error(
      `Version base mismatch: package.json base=${pkgBase} manifest base=${first3(manifest.version)}`,
    );
  }
};

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
