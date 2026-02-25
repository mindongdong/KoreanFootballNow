import type { PlayerConfig } from './types.js';

export const OH_HYEON_GYU: PlayerConfig = {
  id: 1044299,
  fotmobName: 'Hyun Gyu Oh',
  nameKr: '오현규',
  nameEn: 'Hyeon-Gyu Oh',
  team: 'Besiktas',
  league: 'Super Lig',
  tier: 1,
  searchQueries: {
    googleNews: '"Hyeon-Gyu Oh" OR "Oh Hyeon-Gyu"',
    reddit: '"Hyeon-Gyu Oh" OR "Oh Hyeon-Gyu"',
  },
  subreddits: ['soccer', 'besiktas'],
  falsePositiveRisk: 'low',
};
