/**
 * Copy text to clipboard, returns true on success
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/**
 * Truncate a URL for display
 */
export const truncateUrl = (url, maxLen = 55) => {
  if (!url) return '';
  return url.length > maxLen ? `${url.slice(0, maxLen)}…` : url;
};

/**
 * Format a number with K/M suffixes
 */
export const formatCount = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

/**
 * Get favicon URL for a domain
 */
export const getFavicon = (url) => {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?sz=32&domain=${hostname}`;
  } catch {
    return null;
  }
};
