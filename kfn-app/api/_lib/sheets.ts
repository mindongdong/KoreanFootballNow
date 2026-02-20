import { readFile } from 'fs/promises';
import { join } from 'path';

// In-memory cache with TTL
const cache = new Map<string, { data: Record<string, unknown>[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key: string): Record<string, unknown>[] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: Record<string, unknown>[]): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// Reproduce Papa Parse dynamicTyping behavior
function coerceValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return trimmed;
}

function parseSheetToObjects(values: string[][]): Record<string, unknown>[] {
  const headers = values[0].map((h) => h.trim());
  return values.slice(1).map((row) => {
    const obj: Record<string, unknown> = {};
    headers.forEach((header, i) => {
      const raw = i < row.length ? row[i] : '';
      obj[header] = coerceValue(raw);
    });
    return obj;
  });
}

async function fetchSheetData(tabName: string): Promise<Record<string, unknown>[]> {
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!apiKey || !sheetId) {
    throw new Error('Google Sheets env vars not configured');
  }

  const encodedTab = encodeURIComponent(tabName);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodedTab}?key=${apiKey}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, { signal: controller.signal });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(`Unexpected content-type: ${contentType}`);
    }

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status}`);
    }

    const json = await response.json();
    const values: string[][] = json.values;

    if (!values || values.length < 2) {
      throw new Error('Sheet is empty or has no data rows');
    }

    return parseSheetToObjects(values);
  } finally {
    clearTimeout(timeout);
  }
}

// Lightweight CSV parser handling quoted fields (no Papa Parse dependency on server)
function parseCsvToObjects(csvText: string): Record<string, unknown>[] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < csvText.length && csvText[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      current.push(field);
      field = '';
    } else if (ch === '\n' || (ch === '\r' && csvText[i + 1] === '\n')) {
      current.push(field);
      field = '';
      if (current.length > 1 || current[0] !== '') rows.push(current);
      current = [];
      if (ch === '\r') i++;
    } else {
      field += ch;
    }
  }
  // Last field/row
  current.push(field);
  if (current.length > 1 || current[0] !== '') rows.push(current);

  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((row) => {
    const obj: Record<string, unknown> = {};
    headers.forEach((header, i) => {
      const raw = i < row.length ? row[i] : '';
      obj[header] = coerceValue(raw);
    });
    return obj;
  });
}

async function fetchCsvFallback(csvFileName: string): Promise<string> {
  // 1. Try filesystem first (works in vercel dev)
  try {
    const filePath = join(process.cwd(), 'public', csvFileName);
    return await readFile(filePath, 'utf-8');
  } catch {
    // Not on disk (production) — fall through to HTTP
  }

  // 2. HTTP fetch (works in production with VERCEL_URL)
  const host = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';
  const response = await fetch(`${host}/${csvFileName}`);
  if (!response.ok) {
    throw new Error(`CSV fallback fetch failed: ${response.status}`);
  }
  return response.text();
}

export async function getSheetData(
  tabName: string,
  csvFallbackFile: string,
  cacheKey: string
): Promise<Record<string, unknown>[]> {
  // 1. Check cache
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // 2. Try Google Sheets API
  try {
    const data = await fetchSheetData(tabName);
    setCache(cacheKey, data);
    return data;
  } catch (err) {
    console.warn(`[sheets] Google Sheets fetch failed for "${tabName}", falling back to CSV:`, err);
  }

  // 3. CSV fallback
  const csvText = await fetchCsvFallback(csvFallbackFile);
  const data = parseCsvToObjects(csvText);
  setCache(cacheKey, data);
  return data;
}
