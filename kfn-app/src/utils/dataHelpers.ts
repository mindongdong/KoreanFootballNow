import type { Player, FilterOptions } from '../types';

export const sortData = (
  data: Player[],
  key: string | null,
  direction: 'asc' | 'desc'
): Player[] => {
  if (!key) return data;

  return [...data].sort((a, b) => {
    let aValue: unknown;
    let bValue: unknown;

    if (key === 'recent_rating') {
      aValue = a.recent_match?.rating ? parseFloat(a.recent_match.rating) : null;
      bValue = b.recent_match?.rating ? parseFloat(b.recent_match.rating) : null;
    } else if (key === 'recent_minutes') {
      aValue = a.recent_match?.minutes ?? null;
      bValue = b.recent_match?.minutes ?? null;
    } else if (key === 'recent_goals') {
      aValue = a.recent_match?.goals ?? null;
      bValue = b.recent_match?.goals ?? null;
    } else if (key === 'recent_assists') {
      aValue = a.recent_match?.assists ?? null;
      bValue = b.recent_match?.assists ?? null;
    } else {
      aValue = a[key as keyof Player];
      bValue = b[key as keyof Player];
    }

    if (aValue == null || aValue === '') aValue = direction === 'asc' ? Infinity : -Infinity;
    if (bValue == null || bValue === '') bValue = direction === 'asc' ? Infinity : -Infinity;

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    return direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });
};

export const filterData = (data: Player[], filters: FilterOptions): Player[] => {
  const { leagues, position, injuredOnly } = filters;

  return data.filter((player) => {
    if (leagues.length > 0 && !leagues.includes(player.league)) return false;
    if (position && player.position !== position) return false;
    if (injuredOnly && player.is_injured !== 'Yes') return false;
    return true;
  });
};

export const formatRating = (rating: number | null | undefined): string => {
  if (rating == null || rating === 0) return '-';
  return typeof rating === 'number' ? rating.toFixed(2) : String(rating);
};

export const formatStat = (value: number | string | null | undefined): string => {
  if (value == null || value === 0 || value === '') return '-';
  return String(value);
};

export const formatMinutes = (minutes: number | null | undefined): string => {
  if (minutes == null || minutes === 0) return '-';
  return `${minutes}'`;
};

export const validatePlayer = (player: unknown): player is Player => {
  if (!player || typeof player !== 'object') return false;
  const p = player as Record<string, unknown>;
  return !!(p.player_name_kr && p.player_id && p.team && p.league);
};
