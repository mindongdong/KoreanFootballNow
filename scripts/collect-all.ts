import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { OH_HYEON_GYU } from './lib/player-config.js';
import { OUTPUT_DIR } from './lib/constants.js';
import { collectGoogleNews } from './collect-google-news.js';
import { collectReddit } from './collect-reddit.js';
import type { PlayerCollectionResult } from './lib/types.js';

async function main() {
  console.log('=== KFN 여론 수집 파이프라인 ===');
  console.log(`대상 선수: ${OH_HYEON_GYU.nameKr} (${OH_HYEON_GYU.nameEn})`);
  console.log(`팀: ${OH_HYEON_GYU.team} | 리그: ${OH_HYEON_GYU.league}`);
  console.log('');

  // Ensure output directory exists
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Step 1: Google News RSS
  console.log('--- Step 1: Google News RSS ---');
  const googleNews = await collectGoogleNews(OH_HYEON_GYU);
  writeFileSync(
    join(OUTPUT_DIR, 'google-news-oh.json'),
    JSON.stringify(googleNews, null, 2),
    'utf-8',
  );

  // Step 2: Reddit
  console.log('');
  console.log('--- Step 2: Reddit ---');
  const reddit = await collectReddit(OH_HYEON_GYU);
  writeFileSync(
    join(OUTPUT_DIR, 'reddit-oh.json'),
    JSON.stringify(reddit, null, 2),
    'utf-8',
  );

  // Step 3: Merge results
  console.log('');
  console.log('--- Step 3: 통합 ---');
  const result: PlayerCollectionResult = {
    player: OH_HYEON_GYU,
    collected: {
      googleNews,
      reddit,
      collectedAt: new Date().toISOString(),
      totalItems: googleNews.length + reddit.length,
    },
  };

  const outPath = join(OUTPUT_DIR, 'collected-data-oh.json');
  writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');

  console.log('');
  console.log('=== 수집 완료 ===');
  console.log(`Google News: ${googleNews.length}건`);
  console.log(`Reddit: ${reddit.length}건`);
  console.log(`합계: ${result.collected.totalItems}건`);
  console.log(`출력: ${outPath}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
