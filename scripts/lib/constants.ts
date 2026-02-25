// Brand colors
export const BRAND_RED = '#d90828';
export const BRAND_DARK = '#0a0a0a';
export const NEUTRAL_GRAY = '#94a3b8';

// Sentiment colors
export const POSITIVE_GREEN = '#22c55e';
export const NEUTRAL_SLATE = '#94a3b8';
export const NEGATIVE_RED = '#ef4444';

// Collection settings
export const GOOGLE_NEWS_MAX_ITEMS = 20;
export const GOOGLE_NEWS_DAYS_WINDOW = 7;
export const REDDIT_MIN_SCORE = 5;
export const REDDIT_MAX_POSTS_FOR_COMMENTS = 3;
export const REDDIT_MAX_COMMENTS_PER_POST = 5;
export const REDDIT_RATE_LIMIT_MS = 1000;

// QA thresholds
export const QA_PASS_SCORE = 80;
export const QA_MAX_ITERATIONS = 3;
export const MIN_CONTENT_LENGTH = 500;
export const MIN_INTERPRETATION_LENGTH = 30;
export const MIN_SECTIONS_COUNT = 3;
export const MIN_CHART_TYPES = 2;

// Browser User-Agent (required for Google News RSS)
export const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
export const REDDIT_USER_AGENT = 'KoreanFootballNow/1.0';

// Output paths
export const OUTPUT_DIR = new URL('../output/', import.meta.url).pathname;
