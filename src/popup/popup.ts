import { queryTabs } from '../shared/chrome-async';
import { closeMatchingTabs } from '../shared/close-tabs';
import { getHost } from '../shared/domain';

const setState = (host: string | null): void => {
  const domain = document.getElementById('domain');
  const button = document.getElementById('close') as HTMLButtonElement | null;
  if (!domain || !button) {
    return;
  }

  if (host) {
    domain.textContent = `Target: ${host}`;
    button.textContent = `Close all tabs from ${host}`;
    button.disabled = false;
  } else {
    domain.textContent = 'Select a tab to begin.';
    button.textContent = 'Close all tabs from <domain>';
    button.disabled = true;
  }
};

const getMostRecentHost = async (): Promise<string | null> => {
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

const resolveHost = async (): Promise<string | null> => {
  const [tab] = await queryTabs({ active: true, currentWindow: true });
  const activeHost = tab?.url ? getHost(tab.url) : null;
  return activeHost ?? (await getMostRecentHost());
};

const init = async (): Promise<void> => {
  const currentHost = await resolveHost();
  setState(currentHost);

  const button = document.getElementById('close') as HTMLButtonElement | null;
  if (!button) {
    return;
  }

  button.addEventListener('click', async () => {
    // Re-resolve the host at click-time to avoid stale state.
    const host = await resolveHost();
    if (!host) {
      return;
    }
    await closeMatchingTabs(host);
    window.close();
  });
};

void init();
