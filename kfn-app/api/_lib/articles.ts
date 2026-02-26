import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

// In-memory cache with TTL (mirrors sheets.ts pattern)
const cache: { data: ArticleSummary[]; timestamp: number } | null = { data: [], timestamp: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface ArticleSummary {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  content: string;
  playerName: string;
  playerNameKr: string;
  team: string;
  league: string;
  matchInfo: string;
  publishedAt: string;
  thumbnailUrl: string;
  tags: string[];
  evidence?: unknown;
}

interface RawArticleJson {
  id?: string;
  title?: string;
  content?: string;
  playerNameKr?: string;
  _qa?: unknown;
  article?: RawArticleJson;
  meta?: unknown;
  [key: string]: unknown;
}

function isValidArticle(raw: RawArticleJson): boolean {
  return (
    typeof raw.id === 'string' &&
    typeof raw.title === 'string' &&
    typeof raw.content === 'string' &&
    typeof raw.playerNameKr === 'string'
  );
}

function stripQa(raw: RawArticleJson): ArticleSummary {
  const { _qa, ...rest } = raw;
  return rest as unknown as ArticleSummary;
}

/**
 * Load articles from disk (JSON files).
 * Mirrors src/utils/articleLoader.ts logic for serverless environment.
 * Returns articles sorted by publishedAt descending.
 */
export function loadArticlesFromDisk(articlesDir: string, limit?: number): ArticleSummary[] {
  // Check cache
  if (cache && Date.now() - cache.timestamp < CACHE_TTL && cache.data.length > 0) {
    return limit ? cache.data.slice(0, limit) : cache.data;
  }

  let files: string[];
  try {
    files = readdirSync(articlesDir);
  } catch {
    return [];
  }

  const jsonFiles = files.filter((f) => f.endsWith('.json'));
  const articles: ArticleSummary[] = [];

  for (const file of jsonFiles) {
    try {
      const raw = JSON.parse(readFileSync(join(articlesDir, file), 'utf-8')) as RawArticleJson | RawArticleJson[];
      const entries = Array.isArray(raw) ? raw : [raw];

      for (const entry of entries) {
        // Pipeline wrapper format: { article: {...}, meta: {...} }
        const resolved =
          entry.article && isValidArticle(entry.article as RawArticleJson)
            ? (entry.article as RawArticleJson)
            : entry;

        if (isValidArticle(resolved)) {
          articles.push(stripQa(resolved));
        }
      }
    } catch (err) {
      console.warn(`[articles] Failed to parse ${file}, skipping:`, err);
    }
  }

  // Sort by publishedAt descending (newest first)
  articles.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  // Update cache
  cache.data = articles;
  cache.timestamp = Date.now();

  return limit ? articles.slice(0, limit) : articles;
}
