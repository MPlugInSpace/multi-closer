"use strict";
(() => {
  // src/shared/chrome-async.ts
  var queryTabs = (query) => chrome.tabs.query(query);

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

  // src/popup/popup.ts
  var setState = (host) => {
    const domain = document.getElementById("domain");
    const button = document.getElementById("close");
    if (!domain || !button) {
      return;
    }
    if (host) {
      domain.textContent = `Target: ${host}`;
      button.textContent = `Close all tabs from ${host}`;
      button.disabled = false;
    } else {
      domain.textContent = "Select a tab to begin.";
      button.textContent = "Close all tabs from <domain>";
      button.disabled = true;
    }
  };
  var getMostRecentHost = async () => {
    const tabs = await queryTabs({ currentWindow: true });
    const candidates = tabs.filter((tab) => tab.url && getHost(tab.url));
    if (candidates.length === 0) {
      return null;
    }
    const mostRecent = candidates.reduce((latest, tab) => {
      const latestAccessed = latest.lastAccessed ?? 0;
      const tabAccessed = tab.lastAccessed ?? 0;
      return tabAccessed > latestAccessed ? tab : latest;
    });
    return mostRecent.url ? getHost(mostRecent.url) : null;
  };
  var resolveHost = async () => {
    const [tab] = await queryTabs({ active: true, currentWindow: true });
    const activeHost = tab?.url ? getHost(tab.url) : null;
    return activeHost ?? await getMostRecentHost();
  };
  var init = async () => {
    const currentHost = await resolveHost();
    setState(currentHost);
    const button = document.getElementById("close");
    if (!button) {
      return;
    }
    button.addEventListener("click", async () => {
      const host = await resolveHost();
      if (!host) {
        return;
      }
      await chrome.runtime.sendMessage({ type: "close-matching-tabs", host });
      window.close();
    });
  };
  void init();
})();
