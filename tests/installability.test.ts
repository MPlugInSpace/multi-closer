import { describe, it, expect } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';

describe('build installability', () => {
  it('produces a Chrome MV3 dist with service_worker', async () => {
    const manifestPath = join(process.cwd(), 'dist', 'manifest.json');
    const raw = await fs.readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(raw) as Record<string, unknown>;

    expect((manifest as any)['manifest_version']).toBe(3);
    expect((manifest as any)['background']).toBeDefined();
    expect(typeof (manifest as any)['background']['service_worker']).toBe('string');
  });

  it('produces a Firefox-compatible MV2 dist with background.scripts', async () => {
    const manifestPath = join(process.cwd(), 'dist-firefox', 'manifest.json');
    const raw = await fs.readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(raw) as Record<string, unknown>;

    expect((manifest as any)['manifest_version']).toBe(2);
    expect((manifest as any)['background']).toBeDefined();
    expect(Array.isArray((manifest as any)['background']['scripts'])).toBe(true);

    const scripts = (manifest as any)['background']['scripts'] as string[];
    expect(scripts.length).toBeGreaterThan(0);

    const bgPath = join(process.cwd(), 'dist-firefox', scripts[0]);
    const buf = await fs.readFile(bgPath);
    expect(buf.length).toBeGreaterThan(0);
  });
});
