import { closeMatchingTabs } from '../shared/close-tabs';
import { getHost } from '../shared/domain';

const runCloseMatchingTabs = async (host?: string | null): Promise<number> => {
  if (host) {
    return closeMatchingTabs(host);
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeHost = tab?.url ? getHost(tab.url) : null;
  if (!activeHost) {
    return 0;
  }
  return closeMatchingTabs(activeHost);
};

const globalWindow = window as Window & {
  runCloseMatchingTabs?: (host?: string | null) => Promise<number>;
};
globalWindow.runCloseMatchingTabs = runCloseMatchingTabs;
