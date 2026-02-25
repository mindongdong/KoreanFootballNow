export interface Article {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  content: string;
  playerName: string;
  playerNameKr: string;
  team: string;
  league: string;
  matchInfo: string;
  publishedAt: string;
  thumbnailUrl: string;
  tags: string[];
  evidence?: EvidenceData;
  adCurations?: AdCuration[];
}

export interface EvidenceData {
  charts: ChartData[];
  dataRows: DataRow[];
  sources?: SourceItem[];
}

export interface ChartData {
  id: string;
  title: string;
  type: 'bar' | 'radar' | 'line' | 'pie';
  data: Record<string, unknown>[];
  dataKeys: string[];
  colors: string[];
}

export interface DataRow {
  label: string;
  value: string | number;
  interpretation: string;
  source?: string;
  sourceUrl?: string;
}

export interface SourceItem {
  url: string;
  title: string;
  type: 'reddit' | 'news' | 'data';
}

export interface AdCuration {
  id: string;
  type: 'ott' | 'ticket' | 'merchandise';
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaUrl: string;
  tag: string;
}

export type MainView = 'news' | 'stats';
export type NewsView = 'list' | 'article' | 'evidence';
