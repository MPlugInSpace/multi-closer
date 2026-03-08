"use strict";
(() => {
  // src/shared/chrome-async.ts
  var queryTabs = (query) => chrome.tabs.query(query);
  var getTab = (tabId) => chrome.tabs.get(tabId).then(
    (tab) => tab,
    () => void 0
  );
  var removeTabs = (tabIds) => chrome.tabs.remove(tabIds);
  var createContextMenu = (options) => new Promise((resolve, reject) => {
    chrome.contextMenus.create(options, () => {
      const err = chrome.runtime.lastError;
      if (err) reject(new Error(err.message ?? "Unknown Chrome API error"));
      else resolve();
    });
  });
  var updateContextMenu = (menuId, options) => new Promise((resolve, reject) => {
    chrome.contextMenus.update(menuId, options, () => {
      const err = chrome.runtime.lastError;
      if (err) reject(new Error(err.message ?? "Unknown Chrome API error"));
      else resolve();
    });
  });

  // src/shared/domain.ts
  var isHttpUrl = (url) => url.startsWith("http://") || url.startsWith("https://");
  var normalizeHost = (host) => host.trim().toLowerCase().replace(/\.$/, "");
  var getHost = (url) => {
    if (!isHttpUrl(url)) {
      return null;
    }
    try {
      return normalizeHost(new URL(url).host);
    } catch {
      return null;
    }
  };
  var isMatchingHost = (targetHost, candidateHost) => {
    const normalizedTarget = normalizeHost(targetHost);
    const normalizedCandidate = normalizeHost(candidateHost);
    return normalizedCandidate === normalizedTarget || normalizedCandidate.endsWith(`.${normalizedTarget}`);
  };
  var getCloseMenuTitle = (host) => host ? `Close all tabs from ${host}` : "Close all tabs from <domain>";

  // src/shared/close-tabs.ts
  var closeMatchingTabs = async (rootHost) => {
    if (rootHost.trim() === "") {
      return 0;
    }
    const tabs = await queryTabs({});
    const toClose = tabs.filter((tab) => {
      if (typeof tab.url !== "string") return false;
      const host = getHost(tab.url);
      return host ? isMatchingHost(rootHost, host) : false;
    }).map((tab) => tab.id).filter((id) => typeof id === "number");
    if (toClose.length > 0) {
      await removeTabs(toClose);
    }
    return toClose.length;
  };

  // src/background.ts
  var MENU_ID = "close-tabs-by-domain";
  var MENU_CONTEXTS = ["page", "action"];
  var getActiveTab = async (windowId) => {
    const query = { active: true };
    if (windowId !== void 0) {
      query.windowId = windowId;
    }
    const tabs = await queryTabs(query);
    return tabs[0] ?? null;
  };
  var updateMenuTitle = async (tab) => {
    const host = tab?.url ? getHost(tab.url) : null;
    const title = getCloseMenuTitle(host);
    try {
      await updateContextMenu(MENU_ID, { title });
    } catch {
      try {
        await createContextMenu({ id: MENU_ID, title, contexts: MENU_CONTEXTS });
      } catch {
      }
    }
  };
  var handleClick = async (tab) => {
    const host = tab?.url ? getHost(tab.url) : null;
    if (!host) {
      return;
    }
    await closeMatchingTabs(host);
  };
  var createMenu = async () => {
    try {
      await updateContextMenu(MENU_ID, { title: getCloseMenuTitle(null) });
      return;
    } catch {
    }
    await createContextMenu({
      id: MENU_ID,
      title: getCloseMenuTitle(null),
      contexts: MENU_CONTEXTS
    });
  };
  var syncMenuTitle = async () => {
    const activeTab = await getActiveTab();
    await updateMenuTitle(activeTab ?? void 0);
  };
  chrome.runtime.onInstalled.addListener(() => {
    void createMenu().then(syncMenuTitle);
  });
  chrome.runtime.onStartup.addListener(() => {
    void syncMenuTitle();
  });
  chrome.contextMenus.onClicked.addListener((_info, tab) => {
    void handleClick(tab);
  });
  var handleCloseMessage = async (message) => {
    if (!message || typeof message !== "object") {
      return null;
    }
    const payload = message;
    if (payload.type !== "close-matching-tabs" || typeof payload.host !== "string") {
      return null;
    }
    const closed = await closeMatchingTabs(payload.host);
    return { closed };
  };
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
    await updateMenuTitle(tab ?? void 0);
  });
  chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
      void updateMenuTitle(tab);
    }
  });
  void createMenu().then(syncMenuTitle).catch(() => {
  });
})();
