import Papa from 'papaparse';
import { PlayerProfile } from '@/types/playerProfile';

export async function loadPlayerProfile(playerId: string): Promise<PlayerProfile | null> {
  try {
    const response = await fetch('/player-profile.csv');
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse<PlayerProfile>(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const player = results.data.find(
            (p) => String(p.player_id) === String(playerId)
          );
          resolve(player || null);
        },
        error: (error: Error) => reject(error),
      });
    });
  } catch {
    return null;
  }
}

export function formatPercentile(percentile: number | null): string {
  if (percentile === null || percentile === undefined) return '-';
  return `${percentile.toFixed(1)}%`;
}

export function formatDecimal(value: number | null, decimals: number = 2): string {
  if (value === null || value === undefined) return '-';
  return value.toFixed(decimals);
}

export function formatSuccessRate(value: number | null): string {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(1)}%`;
}
