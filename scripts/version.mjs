import { readFile, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';

const run = (command) => execSync(command, { encoding: 'utf8' }).trim();

const getBranchName = () => {
  const ref = process.env.GITHUB_REF_NAME;
  if (ref) {
    return ref;
  }
  try {
    return run('git rev-parse --abbrev-ref HEAD');
  } catch {
    return 'main';
  }
};

const sanitizePrerelease = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/**
 * Derive a Chrome-compatible manifest version from a semver base.
 *
 * Chrome's manifest `version` field only accepts up to 4 dot-separated integers
 * (major.minor.patch.build). Semver prerelease strings like `0.1.0-feature-foo.1`
 * are rejected at extension load time.
 *
 * For production builds:  "0.1.0"       → "0.1.0"
 * For prerelease builds:  "0.1.0" + PR  → "0.1.0.1"
 *
 * The build counter (4th component) uses GITHUB_RUN_NUMBER when available,
 * otherwise defaults to 1. The full semver prerelease string is stored in
 * package.json only, where it is valid and meaningful for npm/tooling consumers.
 */
const toManifestVersion = (baseVersion, isPrerelease) => {
  if (!isPrerelease) {
    return baseVersion;
  }
  const buildNumber = process.env.GITHUB_RUN_NUMBER ?? '1';
  return `${baseVersion}.${buildNumber}`;
};

const main = async () => {
  const branch = getBranchName();
  const pkgPath = new URL('../package.json', import.meta.url);
  const distManifestPath = new URL('../dist/manifest.json', import.meta.url);

  const pkgText = await readFile(pkgPath, 'utf8');
  const distManifestText = await readFile(distManifestPath, 'utf8');
  const pkg = JSON.parse(pkgText);
  const distManifest = JSON.parse(distManifestText);

  const baseVersion = pkg.version;
  const prerelease = branch.startsWith('feature/') ? sanitizePrerelease(branch) : null;

  // Full semver string goes into package.json (valid for npm/tooling).
  const pkgVersion = prerelease ? `${baseVersion}-${prerelease}.1` : baseVersion;
  // Chrome-compatible 4-part integer version goes into the manifest.
  const manifestVersion = toManifestVersion(baseVersion, prerelease !== null);

  pkg.version = pkgVersion;
  distManifest.version = manifestVersion;

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2));
  // Only update the dist manifest — never mutate src/manifest.json from a script.
  await writeFile(distManifestPath, JSON.stringify(distManifest, null, 2));
};

main().catch((err) => {
  console.error('version.mjs failed:', err);
  process.exit(1);
});
