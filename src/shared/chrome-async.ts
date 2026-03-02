/**
 * Thin wrappers around Chrome extension APIs that normalise return types.
 *
 * MV3 Chrome APIs return native Promises when called without a callback.
 * These wrappers add explicit TypeScript signatures and narrow return types
 * where the native typings are broader than what callers need.
 */

export const queryTabs = (query: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> =>
  chrome.tabs.query(query);

export const getTab = (tabId: number): Promise<chrome.tabs.Tab | undefined> =>
  chrome.tabs.get(tabId).then(
    (tab) => tab,
    () => undefined,
  );

export const removeTabs = (tabIds: number[]): Promise<void> => chrome.tabs.remove(tabIds);

export const createContextMenu = (options: chrome.contextMenus.CreateProperties): Promise<void> =>
  new Promise((resolve, reject) => {
    chrome.contextMenus.create(options, () => {
      const err = chrome.runtime.lastError;
      if (err) reject(new Error(err.message ?? 'Unknown Chrome API error'));
      else resolve();
    });
  });

export const updateContextMenu = (
  menuId: string,
  options: Omit<chrome.contextMenus.CreateProperties, 'id'>,
): Promise<void> =>
  new Promise((resolve, reject) => {
    chrome.contextMenus.update(menuId, options, () => {
      const err = chrome.runtime.lastError;
      if (err) reject(new Error(err.message ?? 'Unknown Chrome API error'));
      else resolve();
    });
  });
