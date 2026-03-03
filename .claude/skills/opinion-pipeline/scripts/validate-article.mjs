#!/usr/bin/env node

/**
 * KFN Article QA Validator
 *
 * 6가지 검증 수행:
 * 1. SCHEMA: 필수 필드 존재 + 타입 체크
 * 2. CONTENT: 필수 섹션 존재
 * 3. EVIDENCE: 차트/데이터 검증
 * 4. KOREAN: 한글 품질
 * 5. SOURCES: URL 유효성
 * 6. CONSISTENCY: 데이터 정합성
 *
 * Usage:
 *   node validate-article.mjs <file.json>
 *   cat article.json | node validate-article.mjs
 *
 * Exit codes: 0 = pass, 1 = fail
 */

import { readFileSync } from 'node:fs';

// ─── Configuration ──────────────────────────────────────

const CONFIG = {
  MIN_CONTENT_LENGTH: 500,
  MIN_CHARTS: 3,
  MAX_CHARTS: 4,
  MIN_CHART_TYPES: 3,
  MIN_DATA_ROWS: 4,
  MAX_DATA_ROWS: 6,
  MIN_SOURCES: 1,
  PIE_SUM_TARGET: 100,
  PIE_SUM_TOLERANCE: 2,
  MIN_INTERPRETATION_LENGTH: 50,
  MIN_COMPARISON_DATA_ROWS: 2,
};

// ─── Input ──────────────────────────────────────────────

function readInput() {
  const filePath = process.argv[2];
  if (filePath) {
    return readFileSync(filePath, 'utf-8');
  }
  return readFileSync(0, 'utf-8');
}

let article;
try {
  const raw = readInput();
  const parsed = JSON.parse(raw);
  article = parsed.article && typeof parsed.article === 'object' ? parsed.article : parsed;
} catch (err) {
  console.error(JSON.stringify({
    passed: false,
    score: 0,
    checks: { parse: { passed: false, errors: [`JSON 파싱 실패: ${err.message}`] } },
    summary: 'JSON 파싱 실패',
  }));
  process.exit(1);
}

// ─── Validation Engine ──────────────────────────────────

const VALID_CHECK_NAMES = ['schema', 'content', 'evidence', 'korean', 'sources', 'consistency'];

const results = Object.fromEntries(
  VALID_CHECK_NAMES.map(name => [name, { passed: true, errors: [], warnings: [] }])
);

function fail(check, msg) {
  if (!results[check]) {
    throw new Error(`Invalid check name: "${check}". Valid: ${VALID_CHECK_NAMES.join(', ')}`);
  }
  results[check].passed = false;
  results[check].errors.push(msg);
}

function warn(check, msg) {
  if (!results[check]) {
    throw new Error(`Invalid check name: "${check}". Valid: ${VALID_CHECK_NAMES.join(', ')}`);
  }
  results[check].warnings.push(msg);
}

// ─── 1. SCHEMA ──────────────────────────────────────────

const REQUIRED_STRING_FIELDS = [
  'id', 'title', 'subtitle', 'summary', 'content',
  'playerName', 'playerNameKr', 'team', 'league',
  'matchInfo', 'publishedAt',
];

for (const field of REQUIRED_STRING_FIELDS) {
  if (typeof article[field] !== 'string' || article[field].trim() === '') {
    fail('schema', `필수 필드 누락 또는 빈 문자열: ${field}`);
  }
}

if (!Array.isArray(article.tags) || article.tags.length === 0) {
  fail('schema', 'tags: 비어있지 않은 배열이어야 합니다');
} else {
  for (let i = 0; i < article.tags.length; i++) {
    if (typeof article.tags[i] !== 'string' || article.tags[i].trim() === '') {
      fail('schema', `tags[${i}]: 비어있지 않은 문자열이어야 합니다`);
    }
  }
}

if (typeof article.thumbnailUrl !== 'string') {
  fail('schema', 'thumbnailUrl: string이어야 합니다 (빈 문자열 허용)');
}

if (article.publishedAt && isNaN(Date.parse(article.publishedAt))) {
  fail('schema', `publishedAt: 유효한 ISO 8601 날짜가 아닙니다 — "${article.publishedAt}"`);
}

// ─── 2. CONTENT STRUCTURE ───────────────────────────────

const content = article.content || '';

const REQUIRED_SECTIONS = [
  { pattern: /##\s*경기\s*요약/, label: '## 경기 요약' },
  { pattern: /##\s*해외\s*현지\s*반응/, label: '## 해외 현지 반응 (AI 요약)' },
  { pattern: /##\s*AI\s*분석\s*요약/, label: '## AI 분석 요약' },
];

const REQUIRED_SUBSECTIONS = [
  { pattern: /###\s*Reddit/, label: '### Reddit 반응' },
  { pattern: /###\s*.*매체/, label: '### 현지 매체 (또는 "### {지역} 현지 매체")' },
];

for (const section of REQUIRED_SECTIONS) {
  if (!section.pattern.test(content)) {
    fail('content', `필수 섹션 누락: ${section.label}`);
  }
}

for (const sub of REQUIRED_SUBSECTIONS) {
  if (!sub.pattern.test(content)) {
    fail('content', `필수 하위 섹션 누락: ${sub.label}`);
  }
}

if (content.length < CONFIG.MIN_CONTENT_LENGTH) {
  fail('content', `content 길이 부족: ${content.length}자 (최소 ${CONFIG.MIN_CONTENT_LENGTH}자)`);
}

// ─── 3. EVIDENCE ────────────────────────────────────────

if (!article.evidence || typeof article.evidence !== 'object') {
  fail('evidence', 'evidence 필드 누락 (charts, dataRows, sources가 포함된 객체 필수)');
}

const evidence = article.evidence || {};
const charts = evidence.charts || [];
const dataRows = evidence.dataRows || [];
const sources = evidence.sources || [];

// Charts count
if (charts.length < CONFIG.MIN_CHARTS) {
  fail('evidence', `차트 ${charts.length}개 (최소 ${CONFIG.MIN_CHARTS}개 필요)`);
} else if (charts.length > CONFIG.MAX_CHARTS) {
  warn('evidence', `차트 ${charts.length}개 (권장 최대 ${CONFIG.MAX_CHARTS}개)`);
}

// Chart type diversity
const chartTypes = new Set(charts.map(c => c.type));
if (charts.length >= CONFIG.MIN_CHARTS && chartTypes.size < CONFIG.MIN_CHART_TYPES) {
  fail('evidence', `차트 타입이 ${chartTypes.size}가지 (최소 ${CONFIG.MIN_CHART_TYPES}가지 필요)`);
}

// pie 필수
const pieChart = charts.find(c => c.type === 'pie');
if (!pieChart) {
  fail('evidence', 'pie 차트 필수 (감성 분석)');
} else {
  const pieSum = (pieChart.data || []).reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  if (Math.abs(pieSum - CONFIG.PIE_SUM_TARGET) > CONFIG.PIE_SUM_TOLERANCE) {
    fail('evidence', `pie 차트 value 합계 = ${pieSum} (${CONFIG.PIE_SUM_TARGET} ±${CONFIG.PIE_SUM_TOLERANCE} 필요)`);
  }
  // pie fill 속성 검증
  for (const entry of pieChart.data || []) {
    if (!entry.fill || typeof entry.fill !== 'string') {
      fail('evidence', `pie 차트 항목에 fill 속성 누락: "${entry.name || 'unknown'}"`);
    }
  }
}

// bar 필수
const barChart = charts.find(c => c.type === 'bar');
if (!barChart) {
  fail('evidence', 'bar 차트 필수 (경기 주요 지표)');
}

// radar 필수 (percentile 기반)
const radarChart = charts.find(c => c.type === 'radar');
if (!radarChart) {
  fail('evidence', 'radar 차트 필수 (리그 내 백분위 포지션)');
}

// radar value 범위 검증 (percentile 기반이므로 0-100 필수)
const radarCharts = charts.filter(c => c.type === 'radar');
for (const radar of radarCharts) {
  for (const entry of radar.data || []) {
    const val = Number(entry.value);
    if (isNaN(val) || val < 0 || val > 100) {
      fail('evidence', `radar 차트 value가 0-100 범위 벗어남 (percentile 기반이어야 함): ${entry.stat || 'unknown'} = ${entry.value}`);
    }
  }
}

// 차트 구조 검증
for (const chart of charts) {
  if (!chart.id || !chart.title || !chart.type) {
    fail('evidence', `차트에 id/title/type 누락: ${JSON.stringify(chart).slice(0, 80)}`);
  }
  if (!Array.isArray(chart.data) || chart.data.length === 0) {
    fail('evidence', `차트 data 비어있음: ${chart.id || 'unknown'}`);
  }
  if (!Array.isArray(chart.dataKeys) || chart.dataKeys.length === 0) {
    fail('evidence', `차트 dataKeys 비어있음: ${chart.id || 'unknown'}`);
  }
  if (!Array.isArray(chart.colors) || chart.colors.length === 0) {
    fail('evidence', `차트 colors 비어있음: ${chart.id || 'unknown'}`);
  }
}

// dataRows count
if (dataRows.length < CONFIG.MIN_DATA_ROWS) {
  fail('evidence', `dataRows ${dataRows.length}개 (최소 ${CONFIG.MIN_DATA_ROWS}개 필요)`);
} else if (dataRows.length > CONFIG.MAX_DATA_ROWS) {
  warn('evidence', `dataRows ${dataRows.length}개 (권장 최대 ${CONFIG.MAX_DATA_ROWS}개)`);
}

// dataRows interpretation 길이
for (const row of dataRows) {
  if (!row.label || row.value === undefined || !row.interpretation) {
    fail('evidence', `dataRow 필수 필드 누락: ${JSON.stringify(row).slice(0, 60)}`);
    continue;
  }
  if (row.interpretation.length < CONFIG.MIN_INTERPRETATION_LENGTH) {
    fail('evidence', `dataRow interpretation 너무 짧음 (${row.interpretation.length}자 < ${CONFIG.MIN_INTERPRETATION_LENGTH}자): "${row.label}"`);
  }
}

// dataRows 비교 데이터 사용 검증 (percentile/상위/per90/평균 키워드)
const COMPARISON_KEYWORDS = ['percentile', '상위', 'per90', '평균', '백분위', 'top'];
const comparisonCount = dataRows.filter(row => {
  const text = `${row.interpretation || ''} ${row.value || ''}`;
  return COMPARISON_KEYWORDS.some(kw => text.toLowerCase().includes(kw.toLowerCase()));
}).length;
if (comparisonCount < CONFIG.MIN_COMPARISON_DATA_ROWS) {
  fail('evidence', `비교 데이터가 포함된 dataRow가 ${comparisonCount}개 (최소 ${CONFIG.MIN_COMPARISON_DATA_ROWS}개 필요 — percentile, 상위, per90, 평균 등의 비교 키워드 필수)`);
}

// sources count
if (sources.length < CONFIG.MIN_SOURCES) {
  fail('evidence', `sources: ${sources.length}개 (최소 ${CONFIG.MIN_SOURCES}개 필요)`);
}

// ─── 4. KOREAN QUALITY ──────────────────────────────────

// title에 한글 포함
const HANGUL_REGEX = /[\uAC00-\uD7AF]/;
if (article.title && !HANGUL_REGEX.test(article.title)) {
  fail('korean', 'title에 한글이 포함되어 있지 않습니다');
}

// placeholder 텍스트 감지
const PLACEHOLDER_PATTERNS = [
  /\{[a-zA-Z_]+\}/,
  /\[TODO\]/i,
  /\[TBD\]/i,
  /lorem ipsum/i,
  /placeholder/i,
  /여기에.*입력/,
  /작성.*예정/,
];

const fullText = `${article.title || ''} ${article.subtitle || ''} ${article.summary || ''} ${content}`;
for (const pattern of PLACEHOLDER_PATTERNS) {
  if (pattern.test(fullText)) {
    fail('korean', `placeholder 텍스트 감지: ${fullText.match(pattern)?.[0]}`);
  }
}

// 축구 용어 직역 감지
const BAD_TRANSLATIONS = [
  { bad: '자전거 킥', good: '바이시클 킥' },
  { bad: '자유 차기', good: '프리킥' },
  { bad: '관통 패스', good: '스루패스' },
  { bad: '모서리 차기', good: '코너킥' },
  { bad: '머리공', good: '헤딩' },
  { bad: '벌칙 구역', good: '페널티 에어리어' },
  { bad: '문지기', good: '골키퍼' },
  { bad: '높은 수비선', good: '하이라인' },
  { bad: '비디오 판독', good: 'VAR' },
  { bad: '위치 위반', good: '오프사이드' },
  { bad: '던져 넣기', good: '스로인' },
  { bad: '노란 딱지', good: '옐로카드' },
  { bad: '개인기 돌파', good: '드리블' },
  { bad: '측면 올리기', good: '크로스' },
  { bad: '가로채기', good: '인터셉트' },
  { bad: '볼 빼앗기', good: '태클' },
  { bad: '3골 기록', good: '해트트릭' },
  { bad: '90분 종료', good: '풀타임' },
  { bad: '전반 종료', good: '하프타임' },
];

for (const { bad, good } of BAD_TRANSLATIONS) {
  if (fullText.includes(bad)) {
    fail('korean', `축구 용어 직역 감지: "${bad}" → "${good}" 사용 필요`);
  }
}

// FotMob 원시 필드명 노출 감지 (독자 가독성)
const RAW_FIELD_PATTERNS = [
  /\b\w+_percentile\b/,
  /\b\w+_per90\b/,
  /\b\w+_difference\b/,
  /\b\w+_success_rate\b/,
  /\b\w+_expected_\w+\b/,
  /\battack_\w+\b/,
  /\bdefense_\w+\b/,
  /\bpassing_\w+\b/,
];

// content + dataRow value/interpretation에서 검사
const userFacingTexts = [
  { label: 'content', text: content },
  ...dataRows.map((row, i) => ({
    label: `dataRows[${i}].value`,
    text: String(row.value || ''),
  })),
  ...dataRows.map((row, i) => ({
    label: `dataRows[${i}].interpretation`,
    text: row.interpretation || '',
  })),
];

for (const { label, text } of userFacingTexts) {
  for (const pattern of RAW_FIELD_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      warn('korean', `FotMob 원시 필드명 노출 (${label}): "${match[0]}" → 한국어로 풀어서 표현 필요`);
    }
  }
}

// ─── 5. SOURCES & URLs ──────────────────────────────────

// evidence.sources URL 유효성
for (const src of sources) {
  if (!src.url || !/^https?:\/\//.test(src.url)) {
    fail('sources', `유효하지 않은 source URL: "${src.url}"`);
  }
  if (!src.title || typeof src.title !== 'string') {
    fail('sources', `source에 title 누락: ${src.url || 'unknown'}`);
  }
  if (!['reddit', 'news', 'data', 'stats'].includes(src.type)) {
    warn('sources', `source type이 reddit/news/data/stats 중 하나가 아닙니다: "${src.type}" (${src.url})`);
  }
}

// content 내 마크다운 링크 존재 (권장)
const markdownLinkPattern = /\[.+?\]\(https?:\/\/.+?\)/;
if (!markdownLinkPattern.test(content)) {
  warn('sources', 'content 본문에 마크다운 링크([text](url))가 없습니다 — 매체/Reddit 인용 시 링크 포함 권장');
}

// ─── 6. CONSISTENCY ─────────────────────────────────────

// tags에 playerNameKr 포함
if (article.playerNameKr && Array.isArray(article.tags)) {
  if (!article.tags.includes(article.playerNameKr)) {
    fail('consistency', `tags에 playerNameKr("${article.playerNameKr}")가 포함되어 있지 않습니다`);
  }
}

// id prefix
if (article.id && !String(article.id).startsWith('opinion-')) {
  warn('consistency', `id가 "opinion-" prefix로 시작하지 않습니다: "${article.id}"`);
}

// playerName과 content 일관성
if (article.playerName && !content.includes(article.playerName) && !content.includes(article.playerNameKr)) {
  warn('consistency', 'content에 playerName 또는 playerNameKr가 언급되지 않습니다');
}

// ─── Output ─────────────────────────────────────────────

const checks = {};
let passedCount = 0;
const totalChecks = Object.keys(results).length;

for (const [name, result] of Object.entries(results)) {
  checks[name] = {
    passed: result.passed,
    errors: result.errors,
    warnings: result.warnings,
  };
  if (result.passed) passedCount++;
}

const allPassed = passedCount === totalChecks;
const score = passedCount;

const output = {
  passed: allPassed,
  score,
  total: totalChecks,
  checks,
  summary: allPassed
    ? `전체 ${totalChecks}개 검증 통과`
    : `${totalChecks - passedCount}개 검증 실패: ${Object.entries(results).filter(([, r]) => !r.passed).map(([n]) => n).join(', ')}`,
};

console.log(JSON.stringify(output, null, 2));
process.exit(allPassed ? 0 : 1);
