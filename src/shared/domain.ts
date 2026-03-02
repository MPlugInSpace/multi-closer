export const isHttpUrl = (url: string): boolean =>
  url.startsWith('http://') || url.startsWith('https://');

export const getHost = (url: string): string | null => {
  if (!isHttpUrl(url)) {
    return null;
  }

  try {
    return new URL(url).host;
  } catch {
    return null;
  }
};

export const isMatchingHost = (targetHost: string, candidateHost: string): boolean => {
  return candidateHost === targetHost || candidateHost.endsWith(`.${targetHost}`);
};
