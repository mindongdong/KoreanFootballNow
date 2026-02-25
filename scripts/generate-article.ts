import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { OUTPUT_DIR } from './lib/constants.js';
import type { PlayerCollectionResult, Article } from './lib/types.js';

function buildPrompts(data: PlayerCollectionResult): { system: string; user: string } {
  const { player, collected } = data;
  const { googleNews, reddit } = collected;

  // Build news summary text
  const newsText = googleNews
    .map((n, i) => `[뉴스${i + 1}] ${n.title} (${n.source}, ${n.pubDate})`)
    .join('\n');

  // Build Reddit text with comments
  const redditText = reddit
    .map((r, i) => {
      const commentsStr = (r.comments || [])
        .map((c) => `  - "${c.body.substring(0, 200)}" (score: ${c.score})`)
        .join('\n');
      return `[Reddit${i + 1}] "${r.title}" (score: ${r.score}, r/${r.subreddit})\n${commentsStr}`;
    })
    .join('\n\n');

  const system = `너는 한국 축구 전문 AI 기자이다. 해외파 선수에 대한 현지 여론과 뉴스를 분석하여 한국어 기사를 작성한다.

출력 형식은 반드시 아래 JSON 스키마를 따라야 한다:
{
  "title": "기사 제목 (한글, 핵심 수치/반응 포함, 인용 반응 또는 핵심 수치 + 선수명)",
  "subtitle": "부제목 (경기/리그 정보)",
  "summary": "1-2문장 요약 (핵심 수치 + 영문 반응 인용 포함)",
  "content": "마크다운 기사 본문 (3개 섹션: ## 경기 요약, ## 해외 현지 반응 (AI 요약), ## AI 분석 요약)",
  "matchInfo": "리그/대회명 | 경기 스코어",
  "tags": ["선수이름한글", "팀이름한글", ...],
  "evidence": {
    "charts": [
      {
        "id": "고유-kebab-id",
        "title": "차트 제목 (한글)",
        "type": "bar|radar|line|pie",
        "data": [/* 차트 타입에 맞는 데이터 */],
        "dataKeys": ["키1", "키2"],
        "colors": ["#d90828", "#94a3b8"]
      }
    ],
    "dataRows": [
      {
        "label": "지표명 (한글)",
        "value": "수치 또는 텍스트",
        "interpretation": "해석 (한글, 2문장 이상, 30자 이상, 비교/맥락 포함)",
        "source": "출처명 (실제 존재하는 매체/데이터소스)"
      }
    ]
  }
}

=== 차트 데이터 구조 규칙 ===

1. bar 차트: data 각 항목에 { name: "항목명(한글)", 키1: 숫자, 키2: 숫자 }
   예: { name: "골", 오현규: 3, 리그평균: 0.8 }

2. radar 차트: data 각 항목에 { stat: "능력명(한글)", value: 0~100 숫자 }
   예: { stat: "슈팅", value: 85 }

3. line 차트: data 각 항목에 { match/시점을 나타내는 키: "라벨", 데이터키: 숫자 }
   예: { match: "22R", 공격포인트: 5 }

4. pie 차트: data 각 항목에 { name: "카테고리(한글)", value: 숫자, fill: "#hex색상" }
   - 감성 분석: 긍정(#22c55e), 중립(#94a3b8), 부정(#ef4444) 사용
   - value 합계 = 100

=== 기사 작성 규칙 ===

1. content는 반드시 3개 섹션: ## 경기 요약, ## 해외 현지 반응 (AI 요약), ## AI 분석 요약
2. "해외 현지 반응" 섹션에서:
   - ### Reddit r/{subreddit} 반응, ### 터키 현지 매체 등 하위 섹션 사용
   - Reddit 인용: - **최다 추천 (N)**: "원문 영어" 형식
   - 반드시 수집 데이터의 실제 인용만 사용 (출처 조작 금지)
3. evidence.charts: 3-4개, 최소 2종류 이상 차트 타입, 감성 pie chart 필수 포함
4. evidence.dataRows: 4-5개, 각 interpretation 30자 이상
5. colors에는 브랜드 컬러 #d90828(빨강)과 #94a3b8(회색) 사용
6. 한글 일관성: 선수명 한글(오현규), 영문(Hyeon-Gyu Oh, NOT "Hyun Gyu Oh")
7. 태그에 반드시 "오현규", "베식타스" 포함
8. 각 섹션 최소 2문단 이상
9. content 전체 500자 이상
10. 비축구 콘텐츠 필터링, 다국어 원문 한국어 번역`;

  const user = `선수: ${player.nameKr} (${player.nameEn})
팀: ${player.team}
리그: ${player.league}

=== 수집된 뉴스 (Google News, ${googleNews.length}건) ===
${newsText || '(수집된 뉴스 없음)'}

=== 수집된 Reddit 반응 (${reddit.length}건) ===
${redditText || '(수집된 Reddit 반응 없음)'}

위 데이터를 기반으로 기사 JSON을 생성해줘. 반드시 수집된 데이터의 실제 인용과 수치만 사용할 것.`;

  return { system, user };
}

function buildArticleShell(
  data: PlayerCollectionResult,
  generatedContent: Partial<Article>,
): Article {
  const { player } = data;
  const timestamp = Date.now();

  return {
    id: `opinion-오현규-${timestamp}`,
    title: generatedContent.title || '',
    subtitle: generatedContent.subtitle || '',
    summary: generatedContent.summary || '',
    content: generatedContent.content || '',
    playerName: player.nameEn,
    playerNameKr: player.nameKr,
    team: player.team,
    league: player.league,
    matchInfo: generatedContent.matchInfo || '',
    publishedAt: new Date().toISOString(),
    thumbnailUrl: '',
    tags: generatedContent.tags || [player.nameKr, '베식타스'],
    evidence: generatedContent.evidence,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const promptOnly = args.includes('--prompt-only');

  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Read collected data
  const dataPath = join(OUTPUT_DIR, 'collected-data-oh.json');
  const data: PlayerCollectionResult = JSON.parse(readFileSync(dataPath, 'utf-8'));

  console.log('=== KFN 기사 생성 ===');
  console.log(`선수: ${data.player.nameKr} (${data.player.nameEn})`);
  console.log(`수집 데이터: GN ${data.collected.googleNews.length}건, Reddit ${data.collected.reddit.length}건`);
  console.log('');

  const { system, user } = buildPrompts(data);

  if (promptOnly) {
    // Output prompts for Claude to generate article
    const promptText = `=== SYSTEM PROMPT ===\n\n${system}\n\n=== USER PROMPT ===\n\n${user}`;
    const promptPath = join(OUTPUT_DIR, 'prompt-oh.txt');
    writeFileSync(promptPath, promptText, 'utf-8');
    console.log(`[Prompt Only] 프롬프트가 저장되었습니다: ${promptPath}`);
    console.log('');
    console.log('Claude에게 이 프롬프트로 기사 JSON을 생성하도록 요청하세요.');
    console.log('생성된 JSON을 scripts/output/article-oh-draft.json에 저장한 후');
    console.log('npx tsx scripts/qa-pipeline.ts 를 실행하세요.');
    return;
  }

  // If article-oh-draft.json exists, wrap it with metadata
  const draftPath = join(OUTPUT_DIR, 'article-oh-draft.json');
  try {
    const draft = JSON.parse(readFileSync(draftPath, 'utf-8'));
    const article = buildArticleShell(data, draft);
    const outPath = join(OUTPUT_DIR, 'article-oh-draft.json');
    writeFileSync(outPath, JSON.stringify(article, null, 2), 'utf-8');
    console.log(`[Article] 기사가 저장되었습니다: ${outPath}`);
  } catch {
    console.log('[Article] article-oh-draft.json이 없습니다.');
    console.log('먼저 --prompt-only로 프롬프트를 생성한 후, Claude로 기사를 생성하세요.');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
