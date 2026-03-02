import { queryTabs, removeTabs } from './chrome-async';
import { getHost, isMatchingHost } from './domain';

export const closeMatchingTabs = async (rootHost: string): Promise<number> => {
  const tabs = await queryTabs({});
  const toClose = tabs
    .filter((tab) => {
      if (typeof tab.url !== 'string') return false;
      const host = getHost(tab.url);
      return host ? isMatchingHost(rootHost, host) : false;
    })
    .map((tab) => tab.id)
    .filter((id): id is number => typeof id === 'number');

  if (toClose.length > 0) {
    await removeTabs(toClose);
  }

  return toClose.length;
};
