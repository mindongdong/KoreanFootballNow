import type { Article } from '@/types';

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

const jsonModules = import.meta.glob<RawArticleJson | RawArticleJson[]>(
  '../data/articles/*.json',
  { eager: true, import: 'default' },
);

function isValidArticle(raw: RawArticleJson): boolean {
  return (
    typeof raw.id === 'string' &&
    typeof raw.title === 'string' &&
    typeof raw.content === 'string' &&
    typeof raw.playerNameKr === 'string'
  );
}

function stripQa(raw: RawArticleJson): Article {
  const { _qa, ...article } = raw;
  return article as unknown as Article;
}

export function loadArticles(): Article[] {
  const articles: Article[] = [];

  for (const mod of Object.values(jsonModules)) {
    const entries = Array.isArray(mod) ? mod : [mod];
    for (const entry of entries) {
      // 파이프라인 출력 포맷: { article: {...}, meta: {...} }
      const raw = entry.article && isValidArticle(entry.article as RawArticleJson)
        ? entry.article as RawArticleJson
        : entry;
      if (isValidArticle(raw)) {
        articles.push(stripQa(raw));
      }
    }
  }

  // Sort by publishedAt descending (newest first)
  articles.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return articles;
}
