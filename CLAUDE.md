# KFN (Korean Football Now) - Project Context

## 프로젝트 개요

코리안리거 해외 반응 AI 요약 미디어 & 매치 데이터 플랫폼.
해외 현지 반응을 AI로 요약해 기사/뉴스레터로 발행하고, 데이터와 해석 논리(Reasoning)를 투명하게 제공.

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
- `kfn-app/newsletters/build.ts` — CLI: `npx tsx newsletters/build.ts <file.md> [--send] [--out file.html]`
- `kfn-app/newsletters/*.md` — 뉴스레터 콘텐츠 (YAML frontmatter + Markdown 섹션)

## 기술 스택

- **프론트엔드**: React 18 + TypeScript, Vite 6, Tailwind CSS v3, Radix UI, Recharts, Lucide React
- **API**: Vercel Serverless Functions (@vercel/node)
- **데이터**: Google Sheets API v4, PapaParse (CSV), 인메모리 캐시
- **이메일**: Resend API
- **자동화**: n8n (Docker), Playwright-core (Chromium)
- **AI**: OpenAI ChatGPT (여론 정제, 요약, JSON 파싱)
- **배포**: Vercel
- **폰트**: Pretendard (CDN)

## 데이터 접근 패턴

모든 API 호출은 **API-first + CSV fallback** 3단계 계층:
1. 인메모리 캐시 (5분 TTL)
2. Google Sheets API (8초 타임아웃)
3. CSV 정적 파일 (public/ 디렉토리)

클라이언트도 동일 패턴: API 호출 (10초 abort) → CSV fetch fallback

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
