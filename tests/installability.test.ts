import { describe, it, expect } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';

type ManifestBackgroundMv3 = {
  service_worker?: string;
};

type ManifestBackgroundMv2 = {
  scripts?: string[];
};

type ExtensionManifest = {
  manifest_version: number;
  background?: ManifestBackgroundMv2 | ManifestBackgroundMv3;
  permissions?: string[];
};

describe('build installability', () => {
  it('produces a Chrome MV3 dist with service_worker', async () => {
    const manifestPath = join(process.cwd(), 'dist', 'manifest.json');
    const raw = await fs.readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(raw) as ExtensionManifest;

    expect(manifest.manifest_version).toBe(3);
    expect(manifest.background).toBeDefined();

    const mv3Background = manifest.background as ManifestBackgroundMv3;
    expect(typeof mv3Background.service_worker).toBe('string');
  });

  it('produces a Firefox-compatible MV2 dist with background.scripts', async () => {
    const manifestPath = join(process.cwd(), 'dist-firefox', 'manifest.json');
    const raw = await fs.readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(raw) as ExtensionManifest;

    expect(manifest.manifest_version).toBe(2);
    expect(manifest.background).toBeDefined();

    const mv2Background = manifest.background as ManifestBackgroundMv2;
    const scripts = mv2Background.scripts ?? [];
    expect(Array.isArray(scripts)).toBe(true);
    expect(scripts.length).toBeGreaterThan(0);

    const [firstScript] = scripts;
    expect(typeof firstScript).toBe('string');

    const bgPath = join(process.cwd(), 'dist-firefox', firstScript as string);
    const buf = await fs.readFile(bgPath);
    expect(buf.length).toBeGreaterThan(0);
  });

  it('keeps privacy-safe permissions in both manifests', async () => {
    const chromeManifestRaw = await fs.readFile(
      join(process.cwd(), 'dist', 'manifest.json'),
      'utf8',
    );
    const firefoxManifestRaw = await fs.readFile(
      join(process.cwd(), 'dist-firefox', 'manifest.json'),
      'utf8',
    );

    const chromeManifest = JSON.parse(chromeManifestRaw) as Record<string, unknown>;
    const firefoxManifest = JSON.parse(firefoxManifestRaw) as ExtensionManifest;

    const chromePermissions = (chromeManifest as ExtensionManifest).permissions ?? [];
    const firefoxPermissions = firefoxManifest.permissions ?? [];

    expect(chromePermissions).toContain('tabs');
    expect(chromePermissions).toContain('contextMenus');
    expect(chromePermissions).not.toContain('storage');

    expect(firefoxPermissions).toContain('tabs');
    expect(firefoxPermissions).toContain('contextMenus');
    expect(firefoxPermissions).not.toContain('storage');
  });
});
