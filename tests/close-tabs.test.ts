import { describe, expect, it, vi, beforeEach } from 'vitest';

import { closeMatchingTabs } from '../src/shared/close-tabs';

// Mock the chrome-async module so tests run in Node without a browser.
vi.mock('../src/shared/chrome-async', () => ({
  queryTabs: vi.fn(),
  removeTabs: vi.fn(),
}));

// Import the mocks after vi.mock so we get the mocked versions.
import { queryTabs, removeTabs } from '../src/shared/chrome-async';

const mockQueryTabs = vi.mocked(queryTabs);
const mockRemoveTabs = vi.mocked(removeTabs);

const makeTab = (id: number, url: string): chrome.tabs.Tab =>
  ({ id, url, title: url }) as unknown as chrome.tabs.Tab;

beforeEach(() => {
  vi.clearAllMocks();
  mockRemoveTabs.mockResolvedValue(undefined);
});

describe('closeMatchingTabs', () => {
  it('closes tabs that exactly match the root host', async () => {
    mockQueryTabs.mockResolvedValue([
      makeTab(1, 'https://example.com/page'),
      makeTab(2, 'https://other.com/page'),
    ]);

    const count = await closeMatchingTabs('example.com');

    expect(mockRemoveTabs).toHaveBeenCalledWith([1]);
    expect(count).toBe(1);
  });

  it('closes subdomain tabs as well as the root host', async () => {
    mockQueryTabs.mockResolvedValue([
      makeTab(1, 'https://example.com/'),
      makeTab(2, 'https://sub.example.com/'),
      makeTab(3, 'https://deep.sub.example.com/'),
      makeTab(4, 'https://other.com/'),
    ]);

    const count = await closeMatchingTabs('example.com');

    expect(mockRemoveTabs).toHaveBeenCalledWith([1, 2, 3]);
    expect(count).toBe(3);
  });

  it('does not close parent domain when root is a subdomain', async () => {
    mockQueryTabs.mockResolvedValue([
      makeTab(1, 'https://example.com/'),
      makeTab(2, 'https://sub.example.com/'),
      makeTab(3, 'https://other.sub.example.com/'),
    ]);

    const count = await closeMatchingTabs('sub.example.com');

    expect(mockRemoveTabs).toHaveBeenCalledWith([2, 3]);
    expect(count).toBe(2);
  });

  it('ignores non-http(s) tabs', async () => {
    mockQueryTabs.mockResolvedValue([
      makeTab(1, 'chrome://extensions/'),
      makeTab(2, 'about:blank'),
      makeTab(3, 'https://example.com/'),
    ]);

    const count = await closeMatchingTabs('example.com');

    expect(mockRemoveTabs).toHaveBeenCalledWith([3]);
    expect(count).toBe(1);
  });

  it('ignores tabs with no url', async () => {
    mockQueryTabs.mockResolvedValue([
      { id: 1 } as unknown as chrome.tabs.Tab,
      makeTab(2, 'https://example.com/'),
    ]);

    const count = await closeMatchingTabs('example.com');

    expect(mockRemoveTabs).toHaveBeenCalledWith([2]);
    expect(count).toBe(1);
  });

  it('does not call removeTabs when nothing matches', async () => {
    mockQueryTabs.mockResolvedValue([makeTab(1, 'https://other.com/')]);

    const count = await closeMatchingTabs('example.com');

    expect(mockRemoveTabs).not.toHaveBeenCalled();
    expect(count).toBe(0);
  });

  it('ignores tabs with no numeric id', async () => {
    mockQueryTabs.mockResolvedValue([
      { url: 'https://example.com/' } as chrome.tabs.Tab, // no id
      makeTab(2, 'https://example.com/other'),
    ]);

    const count = await closeMatchingTabs('example.com');

    expect(mockRemoveTabs).toHaveBeenCalledWith([2]);
    expect(count).toBe(1);
  });
});
