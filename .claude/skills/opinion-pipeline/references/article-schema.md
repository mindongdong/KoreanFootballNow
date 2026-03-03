# Article JSON 스키마 + 렌더링 규칙

> 소스: `kfn-app/src/types/article.ts`
> 렌더링: `ArticleView.tsx`, `EvidenceView.tsx`

---

## TypeScript 인터페이스

```typescript
interface Article {
  id: string;               // "opinion-{playerNameKr}-{timestamp}"
  title: string;             // 한글 제목 (수치/인용 포함)
  subtitle: string;          // "리그명 | 경기 정보"
  summary: string;           // 1-2문장 요약
  content: string;           // 마크다운 본문 (3섹션 필수)
  playerName: string;        // FotMob 영문명
  playerNameKr: string;      // 한글명
  team: string;              // 팀명
  league: string;            // 리그명
  matchInfo: string;         // "리그명 | 스코어"
  publishedAt: string;       // ISO 8601
  thumbnailUrl: string;      // "" (빈 문자열 허용)
  tags: string[];            // ["선수한글명", "팀한글명", ...]
  evidence?: EvidenceData;   // 차트 + 데이터 + 출처
}

interface EvidenceData {
  charts: ChartData[];       // 3-4개
  dataRows: DataRow[];       // 4-6개
  sources?: SourceItem[];    // 6개 이상
}

interface ChartData {
  id: string;                // "{player}-{type}" 형식
  title: string;             // 한글 차트 제목
  type: 'bar' | 'radar' | 'line' | 'pie';
  data: Record<string, unknown>[];
  dataKeys: string[];        // 차트에서 사용할 키
  colors: string[];          // 차트 색상
}

interface DataRow {
  label: string;             // 지표명
  value: string | number;    // 수치 또는 텍스트
  interpretation: string;    // 30자 이상 해석
  source?: string;           // 출처명
  sourceUrl?: string;        // 출처 URL
}

interface SourceItem {
  url: string;               // 전체 URL
  title: string;             // 출처 설명
  type: 'reddit' | 'news' | 'data';
}
```

---

## 차트 타입별 data 구조

### pie (감성 분석 — 필수)

```json
{
  "id": "player-sentiment",
  "title": "현지 여론 감성 분석",
  "type": "pie",
  "data": [
    { "name": "긍정", "value": 75, "fill": "#22c55e" },
    { "name": "중립", "value": 15, "fill": "#94a3b8" },
    { "name": "부정", "value": 10, "fill": "#ef4444" }
  ],
  "dataKeys": ["value"],
  "colors": ["#22c55e", "#94a3b8", "#ef4444"]
}
```

**규칙**: value 합계 = 100 (허용 오차 ±2). 각 항목에 `fill` 속성 필수.

### bar (경기 지표 — 필수)

```json
{
  "id": "player-match-stats",
  "title": "경기 주요 지표",
  "type": "bar",
  "data": [
    { "name": "골", "손흥민": 1, "MLS평균": 0.25 },
    { "name": "도움", "손흥민": 3, "MLS평균": 0.18 },
    { "name": "찬스 창출", "손흥민": 5, "MLS평균": 1.4 }
  ],
  "dataKeys": ["손흥민", "MLS평균"],
  "colors": ["#d90828", "#94a3b8"]
}
```

**규칙**: `data[].name`이 카테고리, `dataKeys`가 시리즈. 브랜드 컬러 `#d90828` 사용.

### radar (종합 퍼포먼스 — 선택)

```json
{
  "id": "player-radar",
  "title": "종합 퍼포먼스",
  "type": "radar",
  "data": [
    { "stat": "슈팅", "value": 90 },
    { "stat": "패스", "value": 78 },
    { "stat": "드리블", "value": 82 },
    { "stat": "창의성", "value": 95 },
    { "stat": "수비기여", "value": 40 },
    { "stat": "공중볼", "value": 35 }
  ],
  "dataKeys": ["value"],
  "colors": ["#d90828"]
}
```

**규칙**: `stat`이 축 레이블, `value`가 0-100 범위.

### line (시즌 추이 — 선택)

```json
{
  "id": "player-trend",
  "title": "LAFC 합류 후 공격 포인트 누적",
  "type": "line",
  "data": [
    { "match": "2025 5경기", "공격포인트": 6 },
    { "match": "2025 10경기", "공격포인트": 12 },
    { "match": "2025 13경기", "공격포인트": 16 }
  ],
  "dataKeys": ["공격포인트"],
  "colors": ["#d90828"]
}
```

**규칙**: `match`가 X축 레이블, `dataKeys` 값이 시리즈.

---

## content 마크다운 렌더링 규칙

ArticleView.tsx는 `react-markdown`으로 content를 렌더링.

**지원 구문**:
- `## 제목` (h2), `### 소제목` (h3)
- `**굵게**`, `*기울임*`
- `> 블록쿼트` — 영문 원문 인용에 사용
- `[링크텍스트](URL)` — 매체/Reddit 인라인 링크
- `- 리스트`
- 일반 문단 (빈 줄로 구분)

**필수 섹션 (순서 고정)**:
1. `## 경기 요약`
2. `## 해외 현지 반응 (AI 요약)`
   - `### Reddit 반응` (하위)
   - `### 현지 매체` (하위)
3. `## AI 분석 요약`

---

## articleLoader.ts 호환성

`kfn-app/src/utils/articleLoader.ts`는 다음 형식을 지원:

1. **단일 Article 객체**: `{ id, title, content, playerNameKr, ... }`
2. **래퍼 형식**: `{ article: {...}, meta: {...} }` — `article` 필드를 자동 추출
3. **배열**: 여러 기사를 하나의 JSON에 담을 수 있음

유효성 검사: `id`, `title`, `content`, `playerNameKr`가 모두 string이어야 함.
`_qa` 필드는 자동 제거됨 (검증 메타데이터용).

---

## 골든 예시

파일: `kfn-app/src/data/articles/opinion-손흥민-1771470000000.json`

```json
{
  "id": "1",
  "title": "\"28분 만에 1골 3도움\" 손흥민, LAFC 시즌 개막전 폭발 — MLS 팬 반응 총정리",
  "subtitle": "CONCACAF 챔피언스컵 1R: LAFC 6-1 레알 에스파냐",
  "summary": "손흥민이 LAFC의 2026시즌 첫 공식전에서 전반 28분 만에 1골 3도움을 기록하며 평점 9.6을 받았다. r/MLS에서는 \"This guy is genuinely too good for this league\"라는 반응이 폭발했다.",
  "content": "## 경기 요약\n\nLAFC가 CONCACAF 챔피언스컵 1라운드 1차전...(중략)\n\n## 해외 현지 반응 (AI 요약)\n\n### Reddit r/MLS 반응\n- **최다 추천 (5.1k)**: \"Son Heung-min just casually dropped a 1G 3A...\"\n...(중략)\n\n### 미국 현지 매체\n- **ESPN**: ...\n- **The Athletic**: ...\n\n## AI 분석 요약\n\n손흥민은 62분 출전에서 **1골 3도움**...",
  "playerName": "Son Heung-min",
  "playerNameKr": "손흥민",
  "team": "Los Angeles FC",
  "league": "Major League Soccer",
  "matchInfo": "CONCACAF 챔피언스컵 1R | LAFC 6-1 레알 에스파냐",
  "publishedAt": "2026-02-19T03:00:00Z",
  "thumbnailUrl": "",
  "tags": ["손흥민", "LAFC", "MLS", "CONCACAF"],
  "evidence": {
    "charts": [
      {
        "id": "son-match-stats",
        "title": "경기 주요 지표",
        "type": "bar",
        "data": [
          { "name": "골", "손흥민": 1, "MLS평균": 0.25 },
          { "name": "도움", "손흥민": 3, "MLS평균": 0.18 },
          { "name": "찬스 창출", "손흥민": 5, "MLS평균": 1.4 },
          { "name": "기대골(xG)", "손흥민": 0.85, "MLS평균": 0.32 }
        ],
        "dataKeys": ["손흥민", "MLS평균"],
        "colors": ["#d90828", "#94a3b8"]
      },
      {
        "id": "son-radar",
        "title": "종합 퍼포먼스 (62분 기준)",
        "type": "radar",
        "data": [
          { "stat": "슈팅", "value": 90 },
          { "stat": "패스", "value": 78 },
          { "stat": "드리블", "value": 82 },
          { "stat": "창의성", "value": 95 },
          { "stat": "수비기여", "value": 40 },
          { "stat": "공중볼", "value": 35 }
        ],
        "dataKeys": ["value"],
        "colors": ["#d90828"]
      },
      {
        "id": "son-sentiment",
        "title": "현지 여론 감성 분석",
        "type": "pie",
        "data": [
          { "name": "긍정", "value": 92, "fill": "#22c55e" },
          { "name": "중립", "value": 6, "fill": "#94a3b8" },
          { "name": "부정", "value": 2, "fill": "#ef4444" }
        ],
        "dataKeys": ["value"],
        "colors": ["#22c55e", "#94a3b8", "#ef4444"]
      },
      {
        "id": "son-mls-career",
        "title": "LAFC 합류 후 공격 포인트 누적",
        "type": "line",
        "data": [
          { "match": "2025 5경기", "공격포인트": 6 },
          { "match": "2025 10경기", "공격포인트": 12 },
          { "match": "2025 13경기", "공격포인트": 16 },
          { "match": "2025 PO", "공격포인트": 16 },
          { "match": "2026 개막전", "공격포인트": 20 }
        ],
        "dataKeys": ["공격포인트"],
        "colors": ["#d90828"]
      }
    ],
    "dataRows": [
      {
        "label": "경기 평점",
        "value": "9.6 / 10.0",
        "interpretation": "양 팀 전체 출전 선수 중 두 번째로 높은 평점입니다. 62분 출전으로 4개의 공격 포인트를 기록한 압도적인 효율성이 반영되었습니다.",
        "source": "FotMob",
        "sourceUrl": "https://www.fotmob.com"
      },
      {
        "label": "28분 만에 1골 3도움",
        "value": "전반 28분",
        "interpretation": "경기 시작 28분 만에 1골 3도움을 완성했습니다. MLS 역사상 단일 전반전에 4개 공격 포인트를 기록한 것은 극히 이례적인 기록입니다.",
        "source": "MLS Stats",
        "sourceUrl": "https://www.mlssoccer.com"
      },
      {
        "label": "찬스 창출",
        "value": "5회 (62분 출전)",
        "interpretation": "62분 동안 5번의 찬스를 창출했습니다. 90분 환산 시 7.3회로, MLS 경기당 평균(1.4회)의 5배가 넘는 수치입니다.",
        "source": "FotMob",
        "sourceUrl": "https://www.fotmob.com"
      },
      {
        "label": "LAFC 통산 기록",
        "value": "14경기 13골 7도움",
        "interpretation": "2025년 8월 토트넘에서 MLS 역대 최고 이적료(2,700만 달러)로 합류한 이후 14경기에서 20개 공격 포인트를 기록 중입니다. 경기당 1.43 공격 포인트는 MLS 역대 최고 수준입니다.",
        "source": "MLS / FotMob",
        "sourceUrl": "https://www.mlssoccer.com"
      },
      {
        "label": "Reddit r/MLS 긍정 반응",
        "value": "92%",
        "interpretation": "r/MLS 경기 후 스레드 상위 100개 댓글 중 92%가 극찬 반응입니다. \"too good for MLS\" 키워드가 23회 등장하며, MLS 차원이 다른 선수라는 평가가 압도적입니다.",
        "source": "Reddit r/MLS",
        "sourceUrl": "https://reddit.com/r/MLS/"
      }
    ],
    "sources": [
      {
        "url": "https://reddit.com/r/MLS/",
        "title": "Son Heung-min 1G 3A in 62 minutes on season debut — r/MLS",
        "type": "reddit"
      },
      {
        "url": "https://reddit.com/r/LAFC/",
        "title": "Sonny is already a legend here — r/LAFC",
        "type": "reddit"
      },
      {
        "url": "https://www.espn.com",
        "title": "Son Heung-min LAFC Season Debut: 1G 3A in 28 minutes",
        "type": "news"
      },
      {
        "url": "https://theathletic.com",
        "title": "The most impactful signing in MLS since Messi — The Athletic",
        "type": "news"
      },
      {
        "url": "https://www.fotmob.com",
        "title": "Son Heung-min Match Rating 9.6 — FotMob",
        "type": "data"
      }
    ]
  }
}
```

### 골든 예시 품질 체크포인트

- title에 수치(`1골 3도움`)와 인용(`"28분 만에"`) 포함
- content에 3개 필수 섹션 모두 존재
- Reddit 인용에 서브레딧명 + 추천수 명시
- 매체 인용 2개 이상 (ESPN, The Athletic)
- pie 차트 합계 = 100 (92+6+2)
- bar 차트에 브랜드 컬러 `#d90828` 사용
- dataRows 5개, 각 interpretation 30자 이상
- sources 5개 (reddit 2 + news 2 + data 1)
- tags에 playerNameKr("손흥민") 포함
