export interface RecentMatch {
  date: string;
  opponent: string;
  result: string;
  is_home: boolean;
  minutes: number;
  goals: number;
  assists: number;
  rating: string | null;
  is_motm: boolean;
}

export interface Player {
  collection_date: string;
  week: string;
  player_id: number;
  player_name: string;
  player_name_kr: string;
  team: string;
  league: string;
  position: string;
  recent_match?: RecentMatch | null;
  season_matches: number | null;
  season_goals: number | null;
  season_assists: number | null;
  season_avg_rating: number | null;
  season_yellow_cards: number | null;
  season_red_cards: number | null;
  recent_matches_json: string | null;
  is_injured: string;
  injury_status: string | null;
  injury_expected_return: string | null;
  on_loan: string;
  contract_end: string | null;
  fotmob_url: string;
}

export interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}

export interface FilterOptions {
  leagues: string[];
  position: string;
  injuredOnly: boolean;
}
