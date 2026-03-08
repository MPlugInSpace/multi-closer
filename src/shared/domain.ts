export const isHttpUrl = (url: string): boolean =>
  url.startsWith('http://') || url.startsWith('https://');

const normalizeHost = (host: string): string => host.trim().toLowerCase().replace(/\.$/, '');

export const getHost = (url: string): string | null => {
  if (!isHttpUrl(url)) {
    return null;
  }

  try {
    return normalizeHost(new URL(url).host);
  } catch {
    return null;
  }
};

export const isMatchingHost = (targetHost: string, candidateHost: string): boolean => {
  const normalizedTarget = normalizeHost(targetHost);
  const normalizedCandidate = normalizeHost(candidateHost);
  return (
    normalizedCandidate === normalizedTarget || normalizedCandidate.endsWith(`.${normalizedTarget}`)
  );
};

export const getCloseMenuTitle = (host: string | null): string =>
  host ? `Close all tabs from ${host}` : 'Close all tabs from <domain>';
