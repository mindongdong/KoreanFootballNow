# KFN (Korean Football Now)
https://koreanfootballnow.com/

> 코리안리거 해외 반응 AI 요약 미디어 & 매치 데이터 플랫폼

## 서비스 개요

**코리안 풋볼 나우(KFN)** 는 해외에서 활약하는 코리안리거에 대한 해외 현지 반응을 AI로 요약해 **기사**와 **뉴스레터**로 발행하고, 분석의 바탕이 된 **데이터와 해석 논리(Reasoning)** 를 투명하게 제공하는 미디어 기반 매치 데이터 플랫폼입니다.

### 핵심 가치 제안

- **소스부터 논리까지, 팩트로 읽는 해외 반응**
- 크리에이터의 리서치 비용을 대체하는 **즉시 활용 가능한 데이터 소스**
- 정보 노이즈 제거와 **팩트 체크된 여론 요약**

---

## 핵심 기능

### 1. AI 여론 요약 기사 & 뉴스레터

경기 직후 레딧(Reddit), 엑스(X) 등의 해외 현지 반응을 수집해 노이즈를 제거하고, 핵심 여론만 압축한 콘텐츠를 웹과 메일함으로 즉시 발행합니다.

### 2. 데이터 근거 보기 (Evidence View)

요약 기사의 투명성과 팩트 체크를 위해, 바탕이 된 실제 경기 스탯과 AI가 여론을 도출해 낸 해석 논리(Reasoning)를 상세 페이지로 제공합니다.

### 3. 시즌 타임라인 대시보드

시즌 진행에 따라 매 라운드별 요약 기사와 선수 평점 변화를 한눈에 파악할 수 있도록 리스트 형태로 시각화합니다.

### 4. 선수 스탯 대시보드

해외파 코리안리거 전체의 주간 스탯과 상세 프로필을 필터링/정렬하여 확인할 수 있습니다.

---

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프론트엔드 | React 18 + TypeScript, Vite 6 |
| 스타일링 | Tailwind CSS v3, tailwindcss-animate |
| UI 컴포넌트 | Radix UI |
| 차트 시각화 | Recharts (Bar, Radar, Line, Pie) |
| API 런타임 | Vercel Serverless Functions |
| 데이터 소스 | Google Sheets API v4 (인메모리 캐시 + CSV fallback) |
| 이메일 | Resend API |
| 자동화 | n8n (Self-hosted Docker) |
| 스크래핑 | Playwright-core (Chromium) |
| AI | OpenAI ChatGPT |
| 배포 | Vercel |

---

## 아키텍처

```
사용자 (웹/이메일)
        │
  ┌─────▼─────┐
  │  Vercel    │
  │ React+API  │
  └──┬─────┬──┘
     │     │
 ┌───▼──┐ ┌▼────────┐
 │Google │ │ Resend  │
 │Sheets │ │ (이메일) │
 └──▲────┘ └─────────┘
    │
 ┌──┴──────┐
 │  n8n    │
 │(Docker) │
 └─┬────┬──┘
   │    │
┌──▼──┐┌▼────────┐
│FotMob││ OpenAI  │
│Scrp. ││(ChatGPT)│
└─────┘└─────────┘
```

### 데이터 접근 패턴

모든 데이터 조회는 3단계 계층으로 안정성을 보장합니다:

1. **인메모리 캐시** (5분 TTL)
2. **Google Sheets API** (8초 타임아웃)
3. **CSV 정적 파일** (최후 방어선)

---

## 프로젝트 구조

```
KoreanFootballNow/
├── docker-compose.n8n.yml    # n8n Docker 오케스트레이션
├── Dockerfile.n8n            # 커스텀 n8n 이미지 (Chromium + Playwright)
├── fotmob-scraper.js         # FotMob Playwright 스크래퍼
└── kfn-app/                  # 웹 애플리케이션
    ├── api/                  # Vercel Serverless API
    │   ├── _lib/sheets.ts    # Google Sheets + 캐시 + CSV fallback
    │   ├── player-stats.ts   # 주간 선수 스탯 API
    │   ├── player-profile.ts # 선수 상세 프로필 API
    │   ├── subscribe.ts      # 이메일 구독
    │   ├── unsubscribe.ts    # 이메일 해지
    │   └── send-newsletter.ts# 뉴스레터 발송
    ├── src/
    │   ├── components/
    │   │   ├── layout/       # Navbar, Footer
    │   │   ├── news/         # ArticleList, ArticleView, EvidenceView, AdCuration
    │   │   ├── stats/        # StatsDashboard, StatsTable, PlayerCard, FilterPanel
    │   │   └── ui/           # Radix UI 기반 공통 컴포넌트
    │   ├── data/             # mockArticles.ts (목업 기사 데이터)
    │   ├── types/            # TypeScript 타입 정의
    │   └── utils/            # CSV 파싱, 번역, 데이터 헬퍼
    └── newsletters/          # 뉴스레터 빌드 시스템
        ├── core.ts           # Markdown → HTML 변환
        ├── build.ts          # CLI 빌드/발송 스크립트
        └── *.md              # 뉴스레터 콘텐츠
```

---

## 환경 변수

| 변수 | 용도 |
|------|------|
| `GOOGLE_SHEETS_API_KEY` | Google Sheets API 인증 |
| `GOOGLE_SHEET_ID` | 스프레드시트 ID |
| `GOOGLE_SHEET_TAB_STATS` | 주간 스탯 시트 탭명 |
| `GOOGLE_SHEET_TAB_PROFILE` | 선수 프로필 시트 탭명 |
| `RESEND_API_KEY` | Resend 이메일 API 키 |
| `RESEND_AUDIENCE_ID` | Resend 구독자 오디언스 ID |
| `RESEND_FROM_EMAIL` | 발신자 이메일 주소 |
| `NEWSLETTER_SEND_SECRET` | 뉴스레터 발송 인증 토큰 |
| `VERCEL_URL` | Vercel 배포 URL |

---

## 개발 환경 설정

```bash
# 웹 앱 실행
cd kfn-app
npm install
npm run dev

# n8n 실행 (Docker)
docker compose -f docker-compose.n8n.yml up -d
```

---

## 비즈니스 모델

**트래픽 기반 2-Way 수익화 구조**

| 수익 모델 | 대상 | 설명 |
|-----------|------|------|
| 크리에이터용 데이터 구독 (B2B SaaS) | 유튜버, 칼럼니스트 | Evidence View 심층 스탯 + AI 해석 논리 열람 권한 |
| 헤비 팬 타겟 커머스 (Affiliate) | 고관여 축구팬 | OTT, 티켓, 유니폼 큐레이션 중개 수수료 |
