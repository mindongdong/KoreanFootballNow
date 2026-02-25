// Shared types for the opinion pipeline scripts

// ===== Collection Types =====

export interface GoogleNewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

export interface RedditComment {
  body: string;
  score: number;
}

export interface RedditPost {
  title: string;
  body: string;
  score: number;
  numComments: number;
  subreddit: string;
  permalink: string;
  postId: string;
  comments: RedditComment[];
}

export interface CollectedData {
  googleNews: GoogleNewsItem[];
  reddit: RedditPost[];
  collectedAt: string;
  totalItems: number;
}

export interface PlayerCollectionResult {
  player: PlayerConfig;
  collected: CollectedData;
}

// ===== Player Config =====

export interface PlayerConfig {
  id: number;
  fotmobName: string;
  nameKr: string;
  nameEn: string;
  team: string;
  league: string;
  tier: number;
  searchQueries: {
    googleNews: string;
    reddit: string;
  };
  subreddits: string[];
  falsePositiveRisk: 'low' | 'medium' | 'high';
}

// ===== Article Types (mirrors kfn-app/src/types/article.ts) =====

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
}

export interface EvidenceData {
  charts: ChartData[];
  dataRows: DataRow[];
}

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
}

// ===== QA Types =====

export type IssueSeverity = 'critical' | 'warning' | 'info';

export interface QAIssue {
  agent: string;
  field: string;
  severity: IssueSeverity;
  message: string;
}

export interface QAAgentResult {
  agent: string;
  pass: boolean;
  score: number;
  issues: QAIssue[];
}

export interface QAReport {
  iteration: number;
  timestamp: string;
  results: QAAgentResult[];
  allPass: boolean;
  totalScore: number;
}
