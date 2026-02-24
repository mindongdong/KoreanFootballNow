import Papa from 'papaparse';
import type { Player, RecentMatch } from '../types';
import { parseRecentMatches, computeRecentAggregate } from './dataHelpers';

export const parseRecentMatch = (jsonString: string | null): RecentMatch | null => {
  if (!jsonString || jsonString.trim() === '') return null;

  try {
    const matches = JSON.parse(jsonString) as RecentMatch[];
    if (!Array.isArray(matches) || matches.length === 0) return null;
    return matches[0];
  } catch {
    return null;
  }
};

export const loadPlayerData = async (filePath: string): Promise<Player[]> => {
  // 1. Try API first
  try {
    const apiResponse = await fetch('/api/player-stats', {
      signal: AbortSignal.timeout(10000),
    });
    if (apiResponse.ok) {
      const json = await apiResponse.json();
      if (json.data && Array.isArray(json.data)) {
        return (json.data as Player[]).map((player) => {
          const matchesJson = typeof player.recent_matches_json === 'string'
            ? player.recent_matches_json
            : null;
          const matches = parseRecentMatches(matchesJson);
          return {
            ...player,
            recent_match: matches[0] ?? null,
            recentAggregate: computeRecentAggregate(matches),
          };
        });
      }
    }
  } catch {
    console.warn('[loadPlayerData] API unavailable, falling back to CSV');
  }

  // 2. CSV fallback (original logic)
  const response = await fetch(filePath);
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<Player>(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      transform: (value: string) => (value === '' ? null : value),
      complete: (results) => {
        const playersWithRecentMatch = results.data.map((player) => {
          const matches = parseRecentMatches(player.recent_matches_json);
          return {
            ...player,
            recent_match: matches[0] ?? null,
            recentAggregate: computeRecentAggregate(matches),
          };
        });
        resolve(playersWithRecentMatch);
      },
      error: (error: Error) => reject(error),
    });
  });
};

export const getUniqueLeagues = (players: Player[]): string[] => {
  const leagues = players
    .map((p) => p.league)
    .filter((l): l is string => !!l && l.trim() !== '');
  return [...new Set(leagues)].sort();
};

export const getUniquePositions = (players: Player[]): string[] => {
  const positions = players
    .map((p) => p.position)
    .filter((p): p is string => !!p && p.trim() !== '');
  return [...new Set(positions)].sort();
};
