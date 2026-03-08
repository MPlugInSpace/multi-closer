import { createContextMenu, getTab, queryTabs, updateContextMenu } from './shared/chrome-async';
import { closeMatchingTabs } from './shared/close-tabs';
import { getCloseMenuTitle, getHost } from './shared/domain';

const MENU_ID = 'close-tabs-by-domain';

/** Contexts where the menu item should appear. */
const MENU_CONTEXTS: chrome.contextMenus.CreateProperties['contexts'] = ['page', 'action'];

const getActiveTab = async (windowId?: number): Promise<chrome.tabs.Tab | null> => {
  const query: chrome.tabs.QueryInfo = { active: true };
  if (windowId !== undefined) {
    query.windowId = windowId;
  }
  const tabs = await queryTabs(query);
  return tabs[0] ?? null;
};

const updateMenuTitle = async (tab?: chrome.tabs.Tab): Promise<void> => {
  const host = tab?.url ? getHost(tab.url) : null;
  const title = getCloseMenuTitle(host);
  try {
    await updateContextMenu(MENU_ID, { title });
  } catch {
    // If the menu doesn't exist yet, attempt to create it. Creation may fail
    // if another concurrent startup path creates the menu — ignore errors.
    try {
      await createContextMenu({ id: MENU_ID, title, contexts: MENU_CONTEXTS });
    } catch {
      // ignore
    }
  }
};

const handleClick = async (tab?: chrome.tabs.Tab): Promise<void> => {
  const host = tab?.url ? getHost(tab.url) : null;
  if (!host) {
    return;
  }

  await closeMatchingTabs(host);
};

/**
 * Create the context menu item. Called once on extension install/update.
 * The menu persists across browser restarts, so we only create — never
 * recreate — here. Use syncMenuTitle() on subsequent startups instead.
 */
const createMenu = async (): Promise<void> => {
  // Try updating first in case the menu already exists; otherwise create it.
  try {
    await updateContextMenu(MENU_ID, { title: getCloseMenuTitle(null) });
    return;
  } catch {
    // fallthrough to create if update failed (menu not found)
  }

  await createContextMenu({
    id: MENU_ID,
    title: getCloseMenuTitle(null),
    contexts: MENU_CONTEXTS,
  });
};

/**
 * Refresh the menu title to match the currently active tab.
 * Safe to call at any point after the menu has been created.
 */
const syncMenuTitle = async (): Promise<void> => {
  const activeTab = await getActiveTab();
  await updateMenuTitle(activeTab ?? undefined);
};

// Create the menu item exactly once when the extension is installed or updated.
chrome.runtime.onInstalled.addListener(() => {
  void createMenu().then(syncMenuTitle);
});

// On browser startup the menu already exists — just sync its title.
chrome.runtime.onStartup.addListener(() => {
  void syncMenuTitle();
});

chrome.contextMenus.onClicked.addListener((_info, tab) => {
  void handleClick(tab);
});

const handleCloseMessage = async (message: unknown): Promise<{ closed: number } | null> => {
  if (!message || typeof message !== 'object') {
    return null;
  }
  const payload = message as { type?: string; host?: string };
  if (payload.type !== 'close-matching-tabs' || typeof payload.host !== 'string') {
    return null;
  }
  const closed = await closeMatchingTabs(payload.host);
  return { closed };
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Only accept messages originating from this extension itself.
  if (sender.id !== chrome.runtime.id) {
    return false;
  }

  void handleCloseMessage(message).then((response) => {
    if (response) {
      sendResponse(response);
    }
  });

  return true;
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await getTab(tabId);
  await updateMenuTitle(tab);
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    return;
  }

  const tab = await getActiveTab(windowId);
  await updateMenuTitle(tab ?? undefined);
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    void updateMenuTitle(tab);
  }
});

// Ensure menu exists when the service worker starts (dev/load-unpacked flows
// may not trigger onInstalled). Best-effort — ignore startup errors.
void createMenu()
  .then(syncMenuTitle)
  .catch(() => {});
