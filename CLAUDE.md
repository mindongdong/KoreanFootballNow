# KFN (Korean Football Now) - Project Context

## 프로젝트 개요

코리안리거 해외 반응 AI 요약 미디어 & 매치 데이터 플랫폼.
해외 현지 반응을 AI로 요약해 기사/뉴스레터로 발행하고, 데이터와 해석 논리(Reasoning)를 투명하게 제공.

**배포**: Vercel
**앱 디렉토리**: 모든 애플리케이션 코드는 `kfn-app/` 하위

## 개발 커맨드

`kfn-app/` 디렉토리에서 실행:

```bash
npm run dev        # Vite 개발 서버 (http://localhost:3000)
npm run build      # TypeScript 체크 + Vite 프로덕션 빌드 → dist/
npm run preview    # dist/ 로컬 서빙
```

뉴스레터:
```bash
./newsletters/send.sh preview <file.md>             # HTML 프리뷰 (stdout)
./newsletters/send.sh preview <file.md> out.html    # HTML 파일 저장
./newsletters/send.sh send <file.md>                # 빌드 + API 발송
npx tsx newsletters/build.ts <file.md> [--send] [--out file.html]
```

테스트 스위트, 린터 미설정.

## 핵심 파일 맵

### 데이터 파이프라인
- `docker-compose.n8n.yml` — n8n Docker 오케스트레이션
- `Dockerfile.n8n` — Chromium + Playwright 내장 커스텀 n8n 이미지
- `fotmob-scraper.js` — FotMob 선수 데이터 Playwright 스크래퍼 (n8n 내부 실행)

### API (Vercel Serverless)
- `kfn-app/api/_lib/sheets.ts` — Google Sheets + 인메모리 캐시(5분 TTL) + CSV fallback 데이터 레이어
- `kfn-app/api/player-stats.ts` — 주간 선수 스탯 조회 (GET)
- `kfn-app/api/player-profile.ts` — 선수 상세 프로필 조회 (GET, ?id=)
- `kfn-app/api/subscribe.ts` — 이메일 구독 (POST)
- `kfn-app/api/unsubscribe.ts` — 이메일 해지 (POST)
- `kfn-app/api/send-newsletter.ts` — 뉴스레터 배치 발송 (POST, Bearer 인증)

### 프론트엔드 (React + TypeScript)
- `kfn-app/src/App.tsx` — 루트 컴포넌트, News/Stats 뷰 전환
- `kfn-app/src/components/news/` — ArticleList, ArticleView, EvidenceView, AdCuration
- `kfn-app/src/components/stats/` — StatsDashboard, StatsTable, PlayerCard, FilterPanel, PlayerProfileModal
- `kfn-app/src/components/layout/` — Navbar, Footer (구독 폼 포함)
- `kfn-app/src/components/ui/` — Radix UI 기반 공통 컴포넌트
- `kfn-app/src/data/mockArticles.ts` — 목업 기사 데이터 (실제 파이프라인 미구축)

### 타입 정의
- `kfn-app/src/types/article.ts` — Article, EvidenceData, ChartData, DataRow, AdCuration
- `kfn-app/src/types/player.ts` — Player, RecentMatch, SortConfig, FilterOptions
- `kfn-app/src/types/playerProfile.ts` — PlayerProfile (103개 필드)

### 유틸리티
- `kfn-app/src/utils/csvParser.ts` — API-first + CSV fallback 선수 스탯 로더
- `kfn-app/src/utils/profileParser.ts` — API-first + CSV fallback 선수 프로필 로더
- `kfn-app/src/utils/translations.ts` — 포지션/리그/팀 한글 번역 사전
- `kfn-app/src/utils/dataHelpers.ts` — 데이터 변환 헬퍼

### 뉴스레터
- `kfn-app/newsletters/core.ts` — Markdown → HTML 이메일 변환 엔진
- `kfn-app/newsletters/build.ts` — CLI 빌드/발송 도구
- `kfn-app/newsletters/*.md` — 뉴스레터 콘텐츠 (YAML frontmatter + Markdown 섹션)

## 아키텍처 상세

### 클라이언트 네비게이션 (State 기반, 라우터 없음)
`App.tsx`에서 React 상태로 모든 네비게이션 관리:
- `mainView`: `'news' | 'stats'` — Navbar 토글
- `newsView`: `'list' | 'article' | 'evidence'` — 뉴스 하위 네비게이션

### 데이터 접근 패턴 (API-First + CSV Fallback)

**서버** (`api/_lib/sheets.ts`):
1. 인메모리 `Map` 캐시 (5분 TTL, 서버리스 인스턴스 단위)
2. Google Sheets API (8초 타임아웃)
3. CSV 정적 파일 (public/ 디렉토리)

**클라이언트** (`src/utils/csvParser.ts`, `src/utils/profileParser.ts`):
1. API 호출 (10초 abort)
2. 실패 시 → public/ CSV fetch (PapaParse)

서버는 서버리스 환경용 커스텀 CSV 파서 사용 (PapaParse 아님).

### API 엔드포인트

| Endpoint | Method | 설명 |
|---|---|---|
| `/api/player-stats` | GET | 주간 선수 스탯 |
| `/api/player-profile?id=<id>` | GET | 선수 상세 프로필 (100+ 필드) |
| `/api/subscribe` | POST | 뉴스레터 구독 (Resend) |
| `/api/unsubscribe` | POST | 구독 해지 |
| `/api/send-newsletter` | POST | 뉴스레터 배치 발송 (Bearer 인증) |

데이터 엔드포인트: `s-maxage=300, stale-while-revalidate=60` CDN 캐싱.

### 번역 시스템
`translations.ts`에 포지션/리그(29)/팀(~514)/주발 한글 번역 테이블. lowercase 정규화 + 미등록 시 원문 fallback. i18n 라이브러리 미사용 — 새 선수/팀/리그 추가 시 수동 업데이트 필요.

## 주요 컨벤션

- **브랜드 컬러**: `kfn-red` (#d90828), `kfn-dark` (#0a0a0a)
- **폰트**: Pretendard (CDN 한글 웹폰트)
- **경로 별칭**: `@/*` → `src/*` (tsconfig.json + vite.config.ts)
- **유틸**: `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge)
- **아이콘**: `lucide-react`
- **환경변수**: 서버 전용은 `VITE_` prefix 없음. 필수 키: `GOOGLE_SHEETS_API_KEY`, `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_TAB_STATS`, `GOOGLE_SHEET_TAB_PROFILE`, `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`, `RESEND_FROM_EMAIL`, `NEWSLETTER_SEND_SECRET`
- **모바일**: Tailwind 반응형; StatsTable은 768px 이하에서 아코디언/카드 레이아웃
- **청크 분리**: Vite config에서 `react-vendor`와 `charts` (recharts/d3) 수동 분리

## 주요 규칙

- 한글 번역 사전(`translations.ts`)에 새 리그/팀/포지션 추가 시 누락 없이 매핑
- 기사 데이터는 현재 `mockArticles.ts`에 하드코딩 — 향후 백엔드 파이프라인으로 전환 예정
- n8n Docker 환경에서 스크래퍼 실행 시 `NODE_FUNCTION_ALLOW_BUILTIN=*`, `NODE_FUNCTION_ALLOW_EXTERNAL=*` 필수
- 뉴스레터 발송 시 Bearer 토큰(`NEWSLETTER_SEND_SECRET`) 인증 필수, 100건 배치 발송

## 개발 현황

### 완료
- 선수 스탯/프로필 대시보드 (전체 파이프라인)
- 뉴스레터 시스템 (작성 → 빌드 → 발송)
- 이메일 구독/해지
- n8n + FotMob 스크래퍼
- API-first + CSV fallback 패턴

### 미구현 (우선순위순)
1. AI 기사 생성 파이프라인 (Reddit/X 수집 → OpenAI 요약 → 자동 발행)
2. 기사 데이터 저장/조회 API (목업 → 실데이터 전환)
3. 시즌 타임라인 대시보드
4. 유료 구독 (B2B SaaS) 및 결제
5. 커머스 제휴 연동

## 기획 문서

- `docs/PRD.md` — 제품 요구사항 정의서
- `docs/stats-dashboard-spec.md` — Stats 대시보드 기획 정의서
- `docs/news-feature-spec.md` — 뉴스/여론 기능 기획 정의서
- `docs/n8n-opinion-pipeline-spec.md` — n8n 여론 수집 파이프라인 설계
- `docs/league-scope.md` — 추적 리그/팀 범위 정의
