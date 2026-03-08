"use strict";
(() => {
  // src/shared/chrome-async.ts
  var queryTabs = (query) => chrome.tabs.query(query);
  var removeTabs = (tabIds) => chrome.tabs.remove(tabIds);

  // src/shared/domain.ts
  var isHttpUrl = (url) => url.startsWith("http://") || url.startsWith("https://");
  var getHost = (url) => {
    if (!isHttpUrl(url)) {
      return null;
    }
    try {
      return new URL(url).host;
    } catch {
      return null;
    }
  };
  var isMatchingHost = (targetHost, candidateHost) => {
    return candidateHost === targetHost || candidateHost.endsWith(`.${targetHost}`);
  };

  // src/shared/close-tabs.ts
  var closeMatchingTabs = async (rootHost) => {
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
      await closeMatchingTabs(host);
      window.close();
    });
  };
  void init();
})();
