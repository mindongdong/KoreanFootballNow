import type { VercelRequest, VercelResponse } from '@vercel/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadArticlesFromDisk } from './_lib/articles.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
      .end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    const articlesDir = join(__dirname, '..', 'src', 'data', 'articles');
    const limitParam = req.query.limit;
    const limit = limitParam ? parseInt(String(limitParam), 10) : undefined;
    const id = req.query.id ? String(req.query.id) : undefined;
    const summary = req.query.summary === 'true';

    const articles = loadArticlesFromDisk(articlesDir);

    // Single article by id
    if (id) {
      const article = articles.find((a) => a.id === id);
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }
      const data = summary ? stripHeavyFields(article) : article;
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
      return res.status(200).json({
        data,
        source: 'json',
        timestamp: new Date().toISOString(),
      });
    }

    // List articles
    const sliced = limit && limit > 0 ? articles.slice(0, limit) : articles;
    const data = summary ? sliced.map(stripHeavyFields) : sliced;

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json({
      data,
      source: 'json',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[articles] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function stripHeavyFields(article: Record<string, unknown>) {
  const { evidence, content, ...rest } = article;
  return rest;
}
