/**
 * Utility to detect and linkify URLs in text content.
 * Opens links in new tabs and shows clean display text.
 * Supports URLs with and without protocol (e.g., example.com or https://example.com)
 */

// Common TLDs for detecting URLs without protocol
const COMMON_TLDS = [
  'com', 'org', 'net', 'edu', 'gov', 'io', 'co', 'ai', 'app', 'dev',
  'uk', 'de', 'fr', 'us', 'ca', 'au', 'eu', 'fyi', 'xyz', 'info',
  'me', 'tv', 'cc', 'ly', 'it', 'es', 'nl', 'be', 'ch', 'at', 'cz'
];

// Regex to match URLs with protocol
const URL_WITH_PROTOCOL_REGEX = /https?:\/\/[^\s<>\[\]()'"]+/gi;

// Regex to match domain-like patterns without protocol
// Matches: subdomain.domain.tld or domain.tld followed by optional path
const DOMAIN_REGEX = new RegExp(
  `(?<![\\w@])([a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\\.)+(?:${COMMON_TLDS.join('|')})(?:\\/[^\\s<>\\[\\]()'"\`]*)?(?![\\w])`,
  'gi'
);

// Short URL services that should be displayed as-is
const SHORT_URL_HOSTS = ['bit.ly', 'tinyurl.com', 'linktr.ee', 't.co', 'goo.gl'];

/**
 * Extract the clean display text for a URL
 * e.g., "https://www.dominiklukes.net/path" -> "dominiklukes.net"
 */
export function getCleanUrlDisplay(url: string): string {
  try {
    // Add protocol if missing for URL parsing
    const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`;
    const parsed = new URL(urlWithProtocol);
    let host = parsed.hostname;

    // Remove www. prefix
    if (host.startsWith('www.')) {
      host = host.slice(4);
    }

    // For short URLs, show the full URL
    if (SHORT_URL_HOSTS.some(h => host.includes(h))) {
      return host + parsed.pathname;
    }

    // If there's a meaningful path, show host + shortened path
    if (parsed.pathname && parsed.pathname !== '/') {
      const path = parsed.pathname.length > 20
        ? parsed.pathname.slice(0, 17) + '...'
        : parsed.pathname;
      return host + path;
    }

    return host;
  } catch {
    // If URL parsing fails, return as-is
    return url;
  }
}

export interface LinkifiedPart {
  type: 'text' | 'link';
  content: string;
  href?: string;
  display?: string;
}

interface UrlMatch {
  index: number;
  length: number;
  url: string;
  hasProtocol: boolean;
}

/**
 * Find all URL matches in text (both with and without protocol)
 */
function findAllUrls(text: string): UrlMatch[] {
  const matches: UrlMatch[] = [];
  const seen = new Set<string>(); // Track matched ranges to avoid duplicates

  // Find URLs with protocol first (higher priority)
  URL_WITH_PROTOCOL_REGEX.lastIndex = 0;
  let match;
  while ((match = URL_WITH_PROTOCOL_REGEX.exec(text)) !== null) {
    const key = `${match.index}-${match.index + match[0].length}`;
    if (!seen.has(key)) {
      seen.add(key);
      matches.push({
        index: match.index,
        length: match[0].length,
        url: match[0],
        hasProtocol: true,
      });
    }
  }

  // Find domain patterns without protocol
  DOMAIN_REGEX.lastIndex = 0;
  while ((match = DOMAIN_REGEX.exec(text)) !== null) {
    // Check if this range overlaps with an existing match
    let overlaps = false;
    for (const existing of matches) {
      if (
        (match.index >= existing.index && match.index < existing.index + existing.length) ||
        (existing.index >= match.index && existing.index < match.index + match[0].length)
      ) {
        overlaps = true;
        break;
      }
    }

    if (!overlaps) {
      matches.push({
        index: match.index,
        length: match[0].length,
        url: match[0],
        hasProtocol: false,
      });
    }
  }

  // Sort by index
  matches.sort((a, b) => a.index - b.index);

  return matches;
}

/**
 * Parse text and split into text parts and link parts
 */
export function linkifyText(text: string): LinkifiedPart[] {
  const parts: LinkifiedPart[] = [];
  const matches = findAllUrls(text);

  let lastIndex = 0;

  for (const match of matches) {
    // Add text before this match
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    // Add the link
    const href = match.hasProtocol ? match.url : `https://${match.url}`;
    parts.push({
      type: 'link',
      content: match.url,
      href: href,
      display: getCleanUrlDisplay(match.url),
    });

    lastIndex = match.index + match.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return parts;
}

/**
 * Check if text contains any URLs
 */
export function containsUrl(text: string): boolean {
  URL_WITH_PROTOCOL_REGEX.lastIndex = 0;
  DOMAIN_REGEX.lastIndex = 0;
  return URL_WITH_PROTOCOL_REGEX.test(text) || DOMAIN_REGEX.test(text);
}
