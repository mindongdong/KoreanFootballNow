import Papa from 'papaparse';
import type { Player, RecentMatch } from '../types';

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
        const playersWithRecentMatch = results.data.map((player) => ({
          ...player,
          recent_match: parseRecentMatch(player.recent_matches_json),
        }));
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
