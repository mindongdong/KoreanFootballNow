# KFN v2 — UI/UX 재구성 설계서

> **문서 상태**: v1.0 초안
> **작성일**: 2026-03-26
> **목적**: 기존 데이터/컴포넌트를 유지하면서 페이지 구성과 UI를 재설계
> **관련 문서**: `docs/v2-pivot-spec.md` (전환 기획서)

---

## 0. 핵심 결정 요약

| 항목 | 결정 |
|------|------|
| 네비게이션 | `News \| Stats` → **`홈 \| 선수 \| 뉴스`** |
| 기사 페이지 | **별도 유지**, 선수 상세에서 링크 연결 |
| 선수 상세 | 모달 → **전체 페이지** (`/player/:id`) |
| 메인 페이지 | `/` = **큐레이션 메인** (뉴스 + 선수 통합) |
| EvidenceView | 차트 제거, **데이터 & AI 해석 + 참고 출처만** 기사 본문 하단에 인라인 |

---

## 1. 라우트 구조 변경

### 현재 (v1)

```
/                           → /news 리다이렉트
/news                       → ArticleList (기사 목록)
/news/:articleId            → ArticleView (기사 본문)
/news/:articleId/evidence   → EvidenceView (차트 + 데이터 + 출처)
/stats                      → StatsDashboard (테이블 + 필터)
/stats/:playerId            → PlayerProfileModal (모달)
```

### 변경 (v2)

```
/                           → HomePage (큐레이션 메인)
/players                    → PlayerListPage (31명 전체 + 리그 필터)
/player/:id                 → PlayerDetailPage (4섹션 전체 페이지)
/news                       → ArticleList (기사 아카이브)
/news/:articleId            → ArticleView (기사 본문 + Evidence 인라인)
```

### 삭제되는 라우트

| 라우트 | 이유 |
|--------|------|
| `/news/:articleId/evidence` | Evidence가 기사 본문 하단에 인라인됨 |
| `/stats` | `/players`로 대체 |
| `/stats/:playerId` | `/player/:id`로 대체 |

---

## 2. 네비게이션 바

### 현재 (v1)

```
[KFN Korean Football Now]              [News] [Stats]
```

### 변경 (v2)

```
[KFN Korean Football Now]         [홈] [선수] [뉴스]
```

| 탭 | 라우트 | 설명 |
|----|--------|------|
| **홈** | `/` | 큐레이션 메인 (활약 선수 + 뉴스 헤드라인 + 여론 온도차) |
| **선수** | `/players` | 31명 전체 선수 목록 (리그별 필터) |
| **뉴스** | `/news` | 기사 아카이브 (시간순) |

### 변경 사항

- 기존 [Navbar.tsx](kfn-app/src/components/layout/Navbar.tsx) 수정
- 아이콘: `Newspaper`, `BarChart3` → `Home`, `Users`, `Newspaper` (lucide-react)
- 활성 탭 판별: `location.pathname` 기반 유지
- 로고 클릭 → `/` (현재 `/news` → `/`로 변경)

---

## 3. 홈 페이지 (`/`)

### 역할

유저가 처음 방문했을 때 **3초 내에 흥미를 느끼게** 하는 큐레이션 페이지.
뉴스와 선수 데이터를 통합하여 보여줌.

### 레이아웃

```
┌─────────────────────────────────────────────────┐
│  Navbar                                         │
├─────────────────────────────────────────────────┤
│                                                 │
│  [섹션 A] 이번 라운드 활약 선수          더보기 > │
│  ┌──────┐  ┌──────┐  ┌──────┐                  │
│  │ 카드  │  │ 카드  │  │ 카드  │                 │
│  └──────┘  └──────┘  └──────┘                  │
│  → 가로 스크롤 (모바일) / 3~4열 그리드 (데스크톱) │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  [섹션 B] 주요 뉴스 헤드라인             더보기 > │
│  • 제목1 — 리그 태그 — 시간               →     │
│  • 제목2 — 리그 태그 — 시간               →     │
│  • 제목3 — 리그 태그 — 시간               →     │
│  → 최신 기사 3~5개, 클릭 시 /news/:id 이동      │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  [섹션 C] 국내 vs 해외 온도차             더보기 > │
│  ┌─────────────────────────────────────┐       │
│  │ 선수명  🇰🇷 78% vs 🌍 91% (갭 +13%) │       │
│  │ "한 줄 AI 분석"                      │       │
│  └─────────────────────────────────────┘       │
│  → 갭이 가장 큰 선수 1~2명, 클릭 시 /player/:id │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  [섹션 D] 리그별 선수                            │
│  [EPL(3)] [분데스(5)] [라리가(2)] [MLS(1)] ...  │
│  ┌──────┐  ┌──────┐  ┌──────┐                  │
│  │ 카드  │  │ 카드  │  │ 카드  │                 │
│  └──────┘  └──────┘  └──────┘                  │
│  → 탭 클릭 시 해당 리그 선수 카드 표시            │
│  → 각 카드 클릭 시 /player/:id 이동              │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  [섹션 E] 다음 라운드 경기 예정                   │
│  3/28 (토) 손흥민 vs 마이애미 | 김민재 vs 유벤투스 │
│  → 일정 기반, 선수 이름 클릭 시 /player/:id      │
│                                                 │
├─────────────────────────────────────────────────┤
│  Footer (구독 폼 유지)                           │
└─────────────────────────────────────────────────┘
```

### 섹션별 상세

#### 섹션 A: 이번 라운드 활약 선수

- **데이터**: 기존 player stats → `recent_rating` 기준 상위 정렬
- **카드 내용**: 선수명, 소속팀, 리그, 최근 평점, 최근 골/어시, 국내/해외 여론 비율 (v2 데이터 추가 후)
- **더보기**: `/players` 이동
- **모바일**: 가로 스크롤 카드 슬라이더
- **데스크톱**: 3~4열 그리드, 최대 4~5명 표시

#### 섹션 B: 주요 뉴스 헤드라인

- **데이터**: 기존 articles → `publishedAt` 기준 최신순
- **표시**: 제목 + 리그 태그 + 상대 시간 (기존 `formatRelativeDate` 재사용)
- **더보기**: `/news` 이동
- **클릭**: `/news/:articleId` 이동

#### 섹션 C: 국내 vs 해외 온도차

- **데이터**: 여론 파이프라인 v2 데이터 (Phase 2 이후 표시)
- **Phase 1**: 이 섹션은 숨김 (데이터 없음). 여론 데이터 확보 후 활성화
- **표시**: 선수명, 국내/해외 긍정 비율, 갭 수치, AI 한 줄 분석
- **클릭**: `/player/:id` 이동

#### 섹션 D: 리그별 선수

- **데이터**: 기존 player stats → `league` 기준 그룹핑
- **UI**: 탭 형태 리그 선택 → 해당 리그 선수 카드 표시
- **기존 활용**: `getUniqueLeagues()` (csvParser.ts), `translateLeague()` (translations.ts)
- **31명 전원 커버**: 어떤 리그를 선택하든 소속 선수 전원 표시

#### 섹션 E: 다음 라운드 경기 예정

- **데이터**: FotMob 경기 일정 (현재 수동, 향후 자동화)
- **Phase 1**: 정적 데이터 또는 숨김. 경기 일정 API 연동 후 활성화
- **표시**: 날짜, 선수명, 상대팀

### 신규 컴포넌트

| 컴포넌트 | 위치 | 설명 |
|---------|------|------|
| `HomePage` | `pages/HomePage.tsx` | 홈 페이지 레이아웃 오케스트레이터 |
| `HotPlayersSection` | `components/home/HotPlayersSection.tsx` | 섹션 A: 활약 선수 카드 슬라이더 |
| `NewsHeadlinesSection` | `components/home/NewsHeadlinesSection.tsx` | 섹션 B: 뉴스 헤드라인 리스트 |
| `OpinionGapSection` | `components/home/OpinionGapSection.tsx` | 섹션 C: 온도차 카드 (Phase 2) |
| `LeaguePlayersSection` | `components/home/LeaguePlayersSection.tsx` | 섹션 D: 리그별 탭 + 선수 카드 |
| `UpcomingMatchesSection` | `components/home/UpcomingMatchesSection.tsx` | 섹션 E: 경기 예정 (Phase 2) |
| `PlayerMiniCard` | `components/common/PlayerMiniCard.tsx` | 홈/선수목록에서 공유하는 선수 카드 |

---

## 4. 선수 목록 페이지 (`/players`)

### 역할

31명 전체 선수를 리그별로 필터링하여 볼 수 있는 페이지.
홈 페이지의 "더보기"에서 진입.

### 레이아웃

```
┌─────────────────────────────────────────────────┐
│  Navbar                                         │
├─────────────────────────────────────────────────┤
│                                                 │
│  해외파 한국 선수 31명                            │
│                                                 │
│  [전체] [EPL] [분데스] [라리가] [MLS] [스코티시]..│
│                                                 │
│  정렬: [평점순▾] [이름순] [출전시간순]            │
│                                                 │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │ 카드  │  │ 카드  │  │ 카드  │  │ 카드  │      │
│  ├──────┤  ├──────┤  ├──────┤  ├──────┤       │
│  │ 카드  │  │ 카드  │  │ 카드  │  │ 카드  │      │
│  └──────┘  └──────┘  └──────┘  └──────┘       │
│  → 카드 그리드, 클릭 시 /player/:id 이동         │
│                                                 │
├─────────────────────────────────────────────────┤
│  Footer                                         │
└─────────────────────────────────────────────────┘
```

### 기존 컴포넌트 재활용

| 기존 | 활용 방식 |
|------|----------|
| `FilterPanel.tsx` | 리그 필터 탭으로 단순화. 체크박스 → 탭/칩 형태 |
| `loadPlayerData()` | 데이터 로딩 유지 |
| `getUniqueLeagues()` | 리그 목록 추출 유지 |
| `sortData()`, `filterData()` | 정렬/필터 로직 유지 |
| `translateTeam()`, `translateLeague()` | 한글 번역 유지 |

### 기존 대비 변경

| 기존 (StatsDashboard) | 변경 (PlayerListPage) |
|----------------------|----------------------|
| 테이블 (StatsTable) | **카드 그리드** (PlayerMiniCard) |
| 체크박스 필터 (FilterPanel) | **탭/칩 필터** |
| 모달로 상세 보기 | **전체 페이지 이동** (`/player/:id`) |
| 데스크톱: 테이블 / 모바일: 아코디언 | **모두 카드 그리드** (반응형 열 수만 변경) |

### PlayerMiniCard 내용

```
┌─────────────────────────┐
│  손흥민                   │
│  LAFC · MLS              │
│                          │
│  최근 평점  ⭐ 8.2        │
│  시즌      8G 4A         │
│                          │
│  [🇰🇷 78%  🌍 91%]       │  ← Phase 2 이후
│                          │
└─────────────────────────┘
```

- **모바일**: 2열 그리드
- **데스크톱**: 3~4열 그리드
- 클릭 → `/player/:id`

### 신규 컴포넌트

| 컴포넌트 | 위치 | 설명 |
|---------|------|------|
| `PlayerListPage` | `pages/PlayerListPage.tsx` | 선수 목록 페이지 |

---

## 5. 선수 상세 페이지 (`/player/:id`)

### 역할

선수 한 명의 **스탯 + 여론 + 기사**를 한 페이지에서 점진적 깊이로 제공.
기존 `PlayerProfileModal`을 전체 페이지로 확장.

### 레이아웃

```
┌─────────────────────────────────────────────────────┐
│  Navbar                                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ◀ 뒤로                                             │
│                                                     │
│  ── [헤더] ─────────────────────────────────────     │
│  손흥민                                              │
│  LAFC · MLS · 공격수                                 │
│  FotMob 프로필 ↗                                    │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ── [섹션 1] 최근 폼 요약 ─────────────────────────  │
│                                                     │
│  ┌─────────────────┐  ┌──────────────────────┐     │
│  │ 최근 5경기 평점   │  │ 시즌 핵심 스탯        │    │
│  │                  │  │                      │     │
│  │  7.8              │  │ 8골 4어시스트         │    │
│  │  ▁▃▇▅█           │  │ 경기당 슈팅 3.2      │     │
│  │  (미니 스파크라인) │  │ 패스성공률 87%       │     │
│  └─────────────────┘  └──────────────────────┘     │
│                                                     │
│  데이터 소스: FotMob 기존 스탯 데이터                  │
│  기존 활용: recent_match, season_* 필드               │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ── [섹션 2] 여론 온도 (Pattern B) ─────────────     │
│                                                     │
│  가장 최근 경기: vs 오스틴 FC (3/22)                  │
│                                                     │
│  🇰🇷 국내              🌍 해외                      │
│  ┌───────────┐       ┌───────────┐                 │
│  │ 긍정 78%  │       │ 긍정 91%  │                 │
│  │ ████████░░│       │ █████████░│                 │
│  └───────────┘       └───────────┘                 │
│                                                     │
│  🔍 온도차 분석                                      │
│  "AI 생성 갭 분석 텍스트..."                         │
│                                                     │
│  주요 의견 샘플:                                     │
│  📍r/MLS  "Best signing in MLS history"             │
│  📍에펨코  "MLS 수준이 낮아서 그런거 아님?"           │
│  📍Premier League (YT) "Miss him"                   │
│  📍이스타TV (YT) "적응 완료"                         │
│                                                     │
│  → Phase 2 이후 활성화. Phase 1에서는 숨김            │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ── [섹션 3] 경기별 타임라인 ───────────────────     │
│                                                     │
│  3/22 vs 오스틴  ⭐8.2  1골     [🇰🇷78% 🌍91%]     │
│  3/15 vs 시애틀  ⭐6.5          [🇰🇷65% 🌍70%]     │
│  3/08 vs 달라스  ⭐7.8  1AS    [🇰🇷82% 🌍85%]     │
│                                                     │
│  [경기 행 클릭 → 아코디언 펼침: 상세 여론]            │
│                                                     │
│  데이터 소스: recent_matches_json (기존)              │
│  + 여론 데이터 (Phase 2)                              │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ── [섹션 4] 시즌 상세 스탯 ────────────────────     │
│                                                     │
│  [공격] [수비] [패스] [기타]  ← 탭                   │
│                                                     │
│  골          8   ████████░░░░  리그 상위 12%        │
│  어시스트     4   ████░░░░░░░░  리그 상위 25%        │
│  슈팅/경기   3.2  ██████░░░░░░  리그 상위 8%         │
│                                                     │
│  데이터 소스: PlayerProfile (기존 103개 필드)          │
│  기존 활용: loadPlayerProfile() + profileParser.ts   │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ── [섹션 5] 관련 기사 ─────────────────────────     │
│                                                     │
│  • 기사 제목 1 — 3일 전                      →      │
│  • 기사 제목 2 — 1주 전                      →      │
│  → 해당 선수의 기사만 필터 (playerIds 매칭)           │
│  → 클릭 시 /news/:articleId 이동                     │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Footer                                             │
└─────────────────────────────────────────────────────┘
```

### 기존 데이터 활용 매핑

| 섹션 | 데이터 소스 | 기존 유틸/타입 |
|------|-----------|--------------|
| 헤더 | Player 기본 정보 | `player.ts` (Player 타입) |
| 최근 폼 요약 | `recent_match`, `season_*` | `csvParser.ts`, `dataHelpers.ts` |
| 여론 온도 | **신규 여론 데이터** | Phase 2에서 타입 정의 |
| 경기별 타임라인 | `recent_matches_json` | `player.ts` (RecentMatch 타입) |
| 시즌 상세 스탯 | PlayerProfile (103필드) | `profileParser.ts`, `playerProfile.ts` |
| 관련 기사 | articles (playerIds 매칭) | `article.ts`, `articleLoader.ts` |

### 기존 컴포넌트 재활용

| 기존 컴포넌트 | 활용 방식 |
|-------------|----------|
| `PlayerProfileModal.tsx` | 내부 데이터 로딩/표시 로직을 `PlayerDetailPage`로 이전 |
| `formatRating()`, `formatStat()` 등 | 그대로 재사용 |
| `translateTeam()`, `translateLeague()` | 그대로 재사용 |
| `loadPlayerProfile()` | 그대로 재사용 |

### 신규 컴포넌트

| 컴포넌트 | 위치 | 설명 |
|---------|------|------|
| `PlayerDetailPage` | `pages/PlayerDetailPage.tsx` | 선수 상세 페이지 오케스트레이터 |
| `PlayerHeader` | `components/player/PlayerHeader.tsx` | 선수 헤더 (이름, 팀, 리그, FotMob 링크) |
| `RecentFormSection` | `components/player/RecentFormSection.tsx` | 섹션 1: 최근 폼 스파크라인 + 핵심 스탯 |
| `OpinionTemperature` | `components/player/OpinionTemperature.tsx` | 섹션 2: Pattern B (Phase 2) |
| `MatchTimeline` | `components/player/MatchTimeline.tsx` | 섹션 3: 경기별 타임라인 아코디언 |
| `SeasonStatsDetail` | `components/player/SeasonStatsDetail.tsx` | 섹션 4: 탭 기반 상세 스탯 |
| `RelatedArticles` | `components/player/RelatedArticles.tsx` | 섹션 5: 관련 기사 링크 |

---

## 6. 기사 페이지 변경 (`/news`, `/news/:articleId`)

### 기사 목록 (`/news`)

기존 `ArticleList.tsx` **거의 그대로 유지**. 변경 사항:

| 항목 | 변경 |
|------|------|
| 라우트 | `/news` (변경 없음) |
| "뒤로가기" | 불필요 (Navbar에서 접근) |
| 기능 | 기존 페이지네이션 + 카드 그리드 유지 |
| 데이터 | `loadArticles()` 그대로 사용 |

### 기사 상세 (`/news/:articleId`)

기존 `ArticleView.tsx`에 Evidence 데이터를 **인라인으로 통합**.

#### 변경 전

```
/news/:articleId          → 기사 본문 + "근거 보기" 버튼
/news/:articleId/evidence → 별도 페이지 (차트 + 데이터 + 출처)
```

#### 변경 후

```
/news/:articleId → 기사 본문
                   + [인라인] 데이터 & AI 해석 논리 (DataRows)
                   + [인라인] 참고 출처 (Sources)
                   (차트 섹션 제거)
```

#### 구체적 변경 내용

`ArticleView.tsx` 하단에 추가:

```
┌─────────────────────────────────────────────────┐
│  기사 본문 (기존 유지)                             │
│  ...                                             │
│  ...                                             │
├─────────────────────────────────────────────────┤
│                                                 │
│  ── 데이터 & AI 해석 논리 ──────────────────     │
│  ┌─────────────────────────────────────┐       │
│  │ [1] 레이블  ──────────────── 값     │       │
│  │ 🧠 AI 해석: "..."                   │       │
│  ├─────────────────────────────────────┤       │
│  │ [2] 레이블  ──────────────── 값     │       │
│  │ 🧠 AI 해석: "..."                   │       │
│  └─────────────────────────────────────┘       │
│                                                 │
│  ── 참고 출처 ──────────────────────────────     │
│  [Reddit] 출처 제목1                      ↗    │
│  [Data]   출처 제목2                      ↗    │
│  [News]   출처 제목3                      ↗    │
│                                                 │
│  ── 광고 큐레이션 (기존 유지) ──────────────     │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### 컴포넌트 변경

| 컴포넌트 | 변경 |
|---------|------|
| `ArticleView.tsx` | Evidence DataRows + Sources를 본문 하단에 인라인 렌더링 추가 |
| `EvidenceView.tsx` | **삭제 또는 미사용**. 별도 페이지로 라우팅하지 않음 |
| `DataRowCard` | `EvidenceView.tsx`에서 추출하여 `components/news/DataRowCard.tsx`로 분리, `ArticleView`에서 import |
| `SourcesList` | `EvidenceView.tsx`에서 추출하여 `components/news/SourcesList.tsx`로 분리 |

#### 삭제 대상 (EvidenceView에서)

- `renderChart()` 함수 (bar, radar, line, pie 차트 렌더링)
- Recharts 관련 import (BarChart, RadarChart, LineChart, PieChart 등)
- "데이터 시각화" 섹션 전체
- Evidence 전용 헤더/면책 조항 (기사 본문에 통합되므로)

---

## 7. 컴포넌트 전체 변경 맵

### 유지 (변경 없음)

| 컴포넌트 | 이유 |
|---------|------|
| `components/ui/*` | Radix UI 기반 공통 컴포넌트 |
| `components/common/Pagination.tsx` | ArticleList에서 계속 사용 |
| `components/common/ScrollToTop.tsx` | 전체 앱에서 사용 |
| `components/layout/Footer.tsx` | 구독 폼 유지 |
| `components/news/AdCuration.tsx` | 기사 하단 광고 유지 |

### 수정

| 컴포넌트 | 변경 내용 |
|---------|----------|
| `components/layout/Navbar.tsx` | 탭 변경: News\|Stats → 홈\|선수\|뉴스 |
| `components/news/ArticleView.tsx` | Evidence DataRows + Sources 인라인 추가, "근거 보기" 버튼 제거 |
| `components/news/ArticleList.tsx` | 변경 최소: "뒤로가기" 제거 정도 |
| `App.tsx` | 라우트 재구성 |

### 신규 생성

| 컴포넌트 | 용도 |
|---------|------|
| `pages/HomePage.tsx` | 큐레이션 메인 |
| `pages/PlayerListPage.tsx` | 선수 목록 |
| `pages/PlayerDetailPage.tsx` | 선수 상세 |
| `components/home/HotPlayersSection.tsx` | 활약 선수 섹션 |
| `components/home/NewsHeadlinesSection.tsx` | 뉴스 헤드라인 섹션 |
| `components/home/OpinionGapSection.tsx` | 온도차 섹션 (Phase 2) |
| `components/home/LeaguePlayersSection.tsx` | 리그별 선수 섹션 |
| `components/home/UpcomingMatchesSection.tsx` | 경기 예정 섹션 (Phase 2) |
| `components/common/PlayerMiniCard.tsx` | 공유 선수 카드 |
| `components/player/PlayerHeader.tsx` | 선수 헤더 |
| `components/player/RecentFormSection.tsx` | 최근 폼 |
| `components/player/OpinionTemperature.tsx` | 여론 온도 (Phase 2) |
| `components/player/MatchTimeline.tsx` | 경기별 타임라인 |
| `components/player/SeasonStatsDetail.tsx` | 시즌 상세 스탯 |
| `components/player/RelatedArticles.tsx` | 관련 기사 |
| `components/news/DataRowCard.tsx` | EvidenceView에서 추출 |
| `components/news/SourcesList.tsx` | EvidenceView에서 추출 |

### 삭제/미사용 처리

| 컴포넌트 | 처리 |
|---------|------|
| `components/news/EvidenceView.tsx` | **삭제** (DataRowCard, SourcesList로 분리 후) |
| `components/stats/StatsDashboard.tsx` | **삭제** (PlayerListPage로 대체) |
| `components/stats/StatsTable.tsx` | **삭제** (카드 그리드로 대체) |
| `components/stats/FilterPanel.tsx` | **삭제** (탭 필터로 대체) |
| `components/stats/PlayerCard.tsx` | **삭제** (PlayerMiniCard로 대체) |
| `components/stats/PlayerProfileModal.tsx` | **삭제** (PlayerDetailPage로 대체) |

---

## 8. 디자인 시스템 (유지 항목)

기존 디자인 토큰 그대로 유지:

| 항목 | 값 | 비고 |
|------|-----|------|
| 브랜드 컬러 | `kfn-red` (#d90828) | 변경 없음 |
| 배경 | `#fafafa` (메인), `white` (카드) | 변경 없음 |
| 폰트 | Pretendard (CDN) | 변경 없음 |
| 유틸 | `cn()` (clsx + tailwind-merge) | 변경 없음 |
| 아이콘 | lucide-react | 변경 없음 |
| 컨테이너 | `max-w-[1400px]` (네비), `max-w-[860px]` (기사) | 변경 없음 |
| 반응형 | Tailwind 브레이크포인트 (768px 기준) | 변경 없음 |

---

## 9. 모바일 대응

### 홈 페이지

| 섹션 | 데스크톱 | 모바일 |
|------|---------|--------|
| 활약 선수 | 3~4열 그리드 | **가로 스크롤** 카드 슬라이더 |
| 뉴스 헤드라인 | 리스트 | 리스트 (변경 없음) |
| 온도차 | 카드 | 카드 (변경 없음) |
| 리그별 선수 | 탭 + 3~4열 그리드 | 탭 + **2열 그리드** |
| 경기 예정 | 가로 리스트 | **세로 리스트** |

### 선수 목록

| 데스크톱 | 모바일 |
|---------|--------|
| 3~4열 카드 그리드 | **2열 카드 그리드** |

### 선수 상세

| 데스크톱 | 모바일 |
|---------|--------|
| 폼 요약: 2컬럼 (차트 + 스탯) | **1컬럼 스택** |
| 여론 온도: 좌우 비교 | **상하 스택** |
| 경기 타임라인: 가로 넓게 | **카드 형태** |
| 상세 스탯: 바 차트 넓게 | **축소 바 차트** |

---

## 10. 구현 순서

### Phase 1: 구조 전환 (기존 데이터만 사용)

```
1. App.tsx 라우트 재구성
2. Navbar 탭 변경
3. PlayerMiniCard 컴포넌트 생성
4. PlayerListPage 생성 (기존 StatsDashboard 데이터 로직 이전)
5. PlayerDetailPage 생성 (기존 PlayerProfileModal 로직 이전)
   - 섹션 1: 최근 폼 요약 (기존 데이터)
   - 섹션 3: 경기별 타임라인 (recent_matches_json)
   - 섹션 4: 시즌 상세 스탯 (PlayerProfile)
   - 섹션 5: 관련 기사 (articles 매칭)
6. HomePage 생성
   - 섹션 A: 활약 선수 (기존 스탯 데이터 정렬)
   - 섹션 B: 뉴스 헤드라인 (기존 기사 데이터)
   - 섹션 D: 리그별 선수 (기존 스탯 데이터 그룹핑)
7. ArticleView에 Evidence DataRows + Sources 인라인 통합
8. 기존 컴포넌트 삭제 (StatsDashboard, StatsTable, FilterPanel 등)
```

### Phase 2: 여론 데이터 연동 후

```
9. 여론 데이터 타입 정의 + JSON 구조 확정
10. OpinionTemperature 컴포넌트 (섹션 2) 활성화
11. OpinionGapSection (홈 섹션 C) 활성화
12. PlayerMiniCard에 국내/해외 여론 비율 표시 추가
13. MatchTimeline에 여론 데이터 연결
14. UpcomingMatchesSection (홈 섹션 E) 활성화
```

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2026-03-26 | v1.0 | 초안 작성 — 라우트, 네비게이션, 5개 페이지 레이아웃, 컴포넌트 맵, 구현 순서 |
