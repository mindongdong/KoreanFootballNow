import { writeFileSync } from 'fs';
import { join } from 'path';
import type { RedditPost, RedditComment, PlayerConfig } from './lib/types.js';
import {
  REDDIT_USER_AGENT,
  REDDIT_MIN_SCORE,
  REDDIT_MAX_POSTS_FOR_COMMENTS,
  REDDIT_MAX_COMMENTS_PER_POST,
  REDDIT_RATE_LIMIT_MS,
  OUTPUT_DIR,
} from './lib/constants.js';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchSubredditPosts(
  subreddit: string,
  query: string,
): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&sort=new&limit=10&restrict_sr=on&t=week`;

  console.log(`[Reddit] Searching r/${subreddit}: ${query}`);

  const response = await fetch(url, {
    headers: { 'User-Agent': REDDIT_USER_AGENT },
  });

  if (!response.ok) {
    console.error(`[Reddit] r/${subreddit} HTTP ${response.status}`);
    return [];
  }

  const data = await response.json();
  const children = data?.data?.children ?? [];

  return children
    .map((c: { data: Record<string, unknown> }) => c.data)
    .filter((p: Record<string, unknown>) => (p.score as number) >= REDDIT_MIN_SCORE)
    .map((p: Record<string, unknown>): RedditPost => ({
      title: (p.title as string) || '',
      body: ((p.selftext as string) || '').substring(0, 500),
      score: (p.score as number) || 0,
      numComments: (p.num_comments as number) || 0,
      subreddit,
      permalink: (p.permalink as string) || '',
      postId: (p.id as string) || '',
      comments: [],
    }));
}

async function fetchComments(post: RedditPost): Promise<RedditComment[]> {
  const url = `https://www.reddit.com/comments/${post.postId}.json?limit=${REDDIT_MAX_COMMENTS_PER_POST}&sort=top`;

  const response = await fetch(url, {
    headers: { 'User-Agent': REDDIT_USER_AGENT },
  });

  if (!response.ok) {
    console.error(`[Reddit] Comments for ${post.postId} HTTP ${response.status}`);
    return [];
  }

  const data = await response.json();
  const commentChildren = data[1]?.data?.children ?? [];

  return commentChildren
    .filter(
      (c: { kind: string; data?: { body?: string } }) =>
        c.kind === 't1' && c.data?.body,
    )
    .slice(0, REDDIT_MAX_COMMENTS_PER_POST)
    .map(
      (c: { data: { body: string; score: number } }): RedditComment => ({
        body: (c.data.body || '').substring(0, 300),
        score: c.data.score || 0,
      }),
    );
}

export async function collectReddit(player: PlayerConfig): Promise<RedditPost[]> {
  const query = player.searchQueries.reddit;
  const allPosts: RedditPost[] = [];

  for (const sub of player.subreddits) {
    const posts = await fetchSubredditPosts(sub, query);
    allPosts.push(...posts);
    await sleep(REDDIT_RATE_LIMIT_MS);
  }

  console.log(`[Reddit] Found ${allPosts.length} posts (score >= ${REDDIT_MIN_SCORE})`);

  // Fetch comments for top N posts
  const topPosts = [...allPosts]
    .sort((a, b) => b.score - a.score)
    .slice(0, REDDIT_MAX_POSTS_FOR_COMMENTS);

  for (const post of topPosts) {
    post.comments = await fetchComments(post);
    console.log(`[Reddit] Fetched ${post.comments.length} comments for "${post.title.substring(0, 50)}..."`);
    await sleep(REDDIT_RATE_LIMIT_MS);
  }

  return allPosts;
}

// CLI entry point
async function main() {
  const { OH_HYEON_GYU } = await import('./lib/player-config.js');
  const results = await collectReddit(OH_HYEON_GYU);
  const outPath = join(OUTPUT_DIR, 'reddit-oh.json');
  writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`[Reddit] Saved to ${outPath}`);
}

const isDirectRun = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/.*\//, ''));
if (isDirectRun) {
  main().catch(console.error);
}
