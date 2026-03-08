import { describe, expect, it } from 'vitest';

import { getCloseMenuTitle, getHost, isMatchingHost } from '../src/shared/domain';

describe('isMatchingHost', () => {
  it('matches exact host', () => {
    expect(isMatchingHost('docs.example.com', 'docs.example.com')).toBe(true);
  });

  it('matches subdomain host', () => {
    expect(isMatchingHost('docs.example.com', 'a.docs.example.com')).toBe(true);
  });

  it('does not match parent domain', () => {
    expect(isMatchingHost('docs.example.com', 'example.com')).toBe(false);
  });
});

describe('getHost', () => {
  it('returns host for http url', () => {
    expect(getHost('http://example.test:3000/path')).toBe('example.test:3000');
  });

  it('normalizes host to lowercase and trims trailing dot', () => {
    expect(getHost('https://Example.TEST./path')).toBe('example.test');
  });

  it('returns host for https url', () => {
    expect(getHost('https://sub.example.test')).toBe('sub.example.test');
  });

  it('returns null for non-http url', () => {
    expect(getHost('chrome://extensions')).toBeNull();
  });

  it('returns null for invalid url', () => {
    expect(getHost('not a url')).toBeNull();
  });
});

describe('getCloseMenuTitle', () => {
  it('returns placeholder title when host is null', () => {
    expect(getCloseMenuTitle(null)).toBe('Close all tabs from <domain>');
  });

  it('returns host-specific title when host is present', () => {
    expect(getCloseMenuTitle('docs.example.com')).toBe('Close all tabs from docs.example.com');
  });
});
