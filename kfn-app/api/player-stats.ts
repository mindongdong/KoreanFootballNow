import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSheetData } from './_lib/sheets.js';

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
    const tabName = process.env.GOOGLE_SHEET_TAB_STATS || 'WeeklyStats';
    const rows = await getSheetData(tabName, 'example.csv', 'player-stats');

    // Server-side validation: mirror validatePlayer logic
    const data = rows.filter((row) =>
      row.player_name_kr && row.player_id && row.team && row.league
    );

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json({
      data,
      source: 'sheets',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[player-stats] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
