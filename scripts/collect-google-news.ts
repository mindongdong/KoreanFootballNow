import { writeFileSync } from 'fs';
import { join } from 'path';
import type { GoogleNewsItem, PlayerConfig } from './lib/types.js';
import {
  BROWSER_USER_AGENT,
  GOOGLE_NEWS_MAX_ITEMS,
  GOOGLE_NEWS_DAYS_WINDOW,
  OUTPUT_DIR,
} from './lib/constants.js';

export async function collectGoogleNews(player: PlayerConfig): Promise<GoogleNewsItem[]> {
  const query = player.searchQueries.googleNews;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en&gl=US&ceid=US:en`;

  console.log(`[Google News] Fetching: ${query}`);

  const response = await fetch(url, {
    headers: { 'User-Agent': BROWSER_USER_AGENT },
    redirect: 'follow',
  });

  if (!response.ok) {
    console.error(`[Google News] HTTP ${response.status}`);
    return [];
  }

  const xml = await response.text();

  // Regex-based XML parsing (same pattern as n8n Code node)
  const items: GoogleNewsItem[] = [];
  const itemRegex = /<item>(.*?)<\/item>/gs;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const titleMatch =
      itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
      itemXml.match(/<title>(.*?)<\/title>/);
    const linkMatch =
      itemXml.match(/<link>(.*?)<\/link>/) ||
      itemXml.match(/<link\s*\/?>\s*(https?:\/\/[^<\s]+)/);
    const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);
    const sourceMatch =
      itemXml.match(/<source[^>]*>(.*?)<\/source>/) ||
      itemXml.match(/<source[^>]*url="[^"]*">(.*?)<\/source>/);

    if (titleMatch) {
      items.push({
        title: titleMatch[1].trim(),
        link: linkMatch ? linkMatch[1].trim() : '',
        pubDate: pubDateMatch ? pubDateMatch[1].trim() : '',
        source: sourceMatch ? sourceMatch[1].trim() : 'Google News',
      });
    }
  }

  // Filter to recent N days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - GOOGLE_NEWS_DAYS_WINDOW);

  const filtered = items.filter((item) => {
    if (!item.pubDate) return true;
    const itemDate = new Date(item.pubDate);
    return itemDate >= cutoff;
  });

  const result = filtered.slice(0, GOOGLE_NEWS_MAX_ITEMS);
  console.log(`[Google News] Collected ${result.length} items (from ${items.length} total)`);

  return result;
}

// CLI entry point
async function main() {
  const { OH_HYEON_GYU } = await import('./lib/player-config.js');
  const results = await collectGoogleNews(OH_HYEON_GYU);
  const outPath = join(OUTPUT_DIR, 'google-news-oh.json');
  writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`[Google News] Saved to ${outPath}`);
}

const isDirectRun = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/.*\//, ''));
if (isDirectRun) {
  main().catch(console.error);
}
