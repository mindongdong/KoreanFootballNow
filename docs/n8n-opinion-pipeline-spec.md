# n8n 여론 수집 파이프라인 기획 정의서

> **문서 상태**: v1.1 테스트 결과 반영
> **작성일**: 2026-02-23
> **최종 수정**: 2026-02-24
> **목적**: Reddit, X, 현지매체에서 해외파 선수 관련 여론을 수집하는 n8n 워크플로우 설계
>
> **관련 문서**:
> - `docs/source-test-report.md` — 소스별 테스트 결과 및 전략 제안서
> - `docs/player-search-registry.md` — 30명 검색 키워드 레지스트리 (실측 기반)

---

## 0. 파이프라인 개요

### 전체 흐름

```
[1] 경기 일정 사전 수집 (FotMob)
  → [2] 경기 종료 예상 시각 + 2시간 후 n8n 스케줄 설정
    → [3] 병렬 수집
        ├─ Google News RSS (1순위 - 전 선수 대상)
        ├─ Reddit (.json 엔드포인트, 2순위 - Tier 1-2 선수)
        ├─ 개별 매체 RSS (3순위 - 작동 확인된 4개)
        └─ X TwitterAPI.io (Phase 2 - Tier 1-2 선수)
      → [4] 수집 데이터 통합 + 노이즈 필터링
        → [5] GPT API로 기사 생성
          → [6] Static JSON 파일로 저장
            → [7] 사이트에 반영
```

### 핵심 결정 요약

| 항목 | 결정 | 비고 (v1.1 변경) |
|------|------|------------------|
| 트리거 | 사전 스케줄링 (경기 종료 + 2시간 후) | |
| **매체 수집 (1순위)** | **Google News RSS** (전 선수 커버, 무료) | v1.1 추가. 개별 RSS 대체 |
| Reddit (2순위) | 무료 `.json` 엔드포인트, r/soccer + 팀별 서브레딧 | |
| 개별 매체 RSS (3순위) | 작동 확인된 4개만 (BBC, Guardian, DW, Daily Sabah) | v1.1 축소. 4/8 URL 사망 |
| X (Phase 2) | TwitterAPI.io ($0.15/1K), **Tier 1-2만** | v1.1 Phase 2로 이동 |
| 검색 키워드 | **양방향 OR** (`"Family Given" OR "Given Family"`) | v1.1 변경. 실측 기반 |
| 수집량 (MVP) | Google News ~20, Reddit ~10+댓글, 매체 ~5 | v1.1 조정 |
| 시간 윈도우 | 경기 종료 후 2시간 이내 | |
| 필터링 | AI(GPT)에게 위임 + FP 고위험 선수는 팀명 추가 검색 | v1.1 보강 |
| 에러 처리 | 3회 재시도 후 수집된 데이터만으로 진행 | |
| 월 예산 | Phase 1: ~$8-23 / Phase 2: ~$9-26 | v1.1 Phase 구분 |

---

## 1. 트리거: 경기 종료 감지

### 방식: 사전 스케줄링

1. **주 1회** FotMob에서 해당 주 경기 일정 수집 (기존 스크래퍼 활용)
2. 각 경기의 **킥오프 시간 + 약 4시간** 후에 n8n Cron 트리거 설정
   - 경기 시간 (90분 + 추가시간) ≈ 2시간
   - 여론 축적 대기 ≈ 2시간
   - 합계: 킥오프 + 4시간 후 수집 시작
3. n8n의 **Schedule Trigger** 노드 또는 **Cron** 노드 활용

### 예시

```
손흥민 (LAFC) 경기: 2026-02-22 19:30 PST (킥오프)
→ 경기 종료 예상: 21:30 PST
→ 여론 수집 트리거: 23:30 PST (= 2026-02-23 16:30 KST)
→ 기사 생성 완료: 약 17:00 KST
```

### n8n 노드 구성

```
Schedule Trigger (주간 일정 수집)
  → HTTP Request (FotMob 경기 일정 API)
  → Code Node (킥오프 + 4시간 계산, Cron 식 생성)
  → 개별 경기별 Schedule Trigger 동적 생성
```

> **MVP 대안**: 초기에는 수동으로 경기 일정 확인 후 n8n 워크플로우 수동 실행도 가능

---

## 2. Google News RSS 수집 (1순위)

> v1.1 신규 섹션. 테스트 결과 전 선수 커버리지가 가장 높은 소스로 확인되어 1순위로 격상.

### 방식: Google News RSS 검색

무료, 전 선수 커버 (30/30 선수 8건 이상), n8n HTTP Request 노드로 호출.

### 수집 프로세스

```
[n8n 노드 흐름]

HTTP Request (Google News RSS 검색)
  URL: https://news.google.com/rss/search?q={검색쿼리}&hl=en&gl=US&ceid=US:en
  Method: GET
  Headers: {
    User-Agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  }
  ⚠️ Follow Redirects: ON (필수)
  ⚠️ Browser User-Agent 필수 (커스텀 UA 사용 시 302 빈 응답)

→ Code Node (XML 파싱: <item> 태그에서 title, link, pubDate, source 추출)
→ Code Node (최근 24시간 필터링 + 중복 제거)
```

### 검색 쿼리 구성

```
기본: "{선수 영문명}"
FP 고위험 선수: "{선수 영문명}" {팀명} OR football
```

**예시**:
- 손흥민: `"Son Heung-min" OR "Heung-Min Son"`
- 김지수 (FP 고위험): `"Ji-Soo Kim" Kaiserslautern OR football`
- 서종민 (데이터 극소): `"Seo Jong-Min" OR "Jong-Min Seo" FC Midtjylland`

### 수집 데이터 구조

```json
{
  "source": "google_news",
  "articles": [
    {
      "title": "Son Heung-min scores a brace in LAFC victory",
      "url": "https://www.espn.com/...",
      "outlet": "ESPN",
      "published_at": "2026-02-22T23:30:00Z",
      "language": "en"
    }
  ]
}
```

### 주의사항

1. **Browser User-Agent 필수**: `KoreanFootballNow/1.0` 등 커스텀 UA → HTTP 302 + 빈 응답
2. **Follow Redirects 활성화**: Google은 초기 요청을 리다이렉트함
3. **결과 최대 100건**: RSS 피드의 `<item>` 상한. 충분한 양.
4. **다국어 포함**: 영어 외 터키어, 독일어, 프랑스어 기사도 수집됨 → GPT 번역 활용
5. **False Positive**: 짧은/흔한 이름 선수는 팀명 추가 검색 필수 (→ FP 완화 전략 참조)

### 선수별 Google News 검색 결과 (실측, 2026-02-24)

| 티어 | 건수 범위 | 선수 수 | 비고 |
|------|----------|---------|------|
| Tier 1 | 85-100건 | 5명 | 데이터 풍부 |
| Tier 2 | 19-100건 | 10명 | 안정적 |
| Tier 3 | 9-100건 | 7명 | 일부 FP 포함 |
| Tier 4 | 2-58건 | 8명 | FP 위험, 팀명 추가 필요 |

---

## 3. Reddit 수집 (2순위)

### 방식: 무료 `.json` 엔드포인트

OAuth 불필요, 비용 0원. n8n HTTP Request 노드로 직접 호출.

### 수집 대상

1. **r/soccer 전체**: 가장 트래픽이 많은 축구 서브레딧
2. **팀별 서브레딧**: 해당 선수 소속팀의 전용 커뮤니티

> **실측 결과**: Tier 1-2 선수만 유의미한 데이터 확보 가능. Tier 3-4는 대부분 0건.

### 수집 프로세스

```
[n8n 노드 흐름]

HTTP Request (r/soccer 검색)
  URL: https://www.reddit.com/r/soccer/search.json?q={검색쿼리}&sort=new&limit=20&restrict_sr=on&t=day
  Headers: { User-Agent: "KoreanFootballNow/1.0" }

HTTP Request (팀 서브레딧 검색)
  URL: https://www.reddit.com/r/{subreddit}/search.json?q={검색쿼리}&sort=new&limit=10&restrict_sr=on&t=day

→ Merge Node (결과 통합)

→ Loop: 관련 게시글 상위 N개에 대해
  HTTP Request (댓글 수집)
    URL: https://www.reddit.com/r/{subreddit}/comments/{post_id}.json?sort=top&limit=10

→ Code Node (데이터 정제: 제목, 본문, 상위 댓글 10개, 점수, 작성시간)
```

### 검색 쿼리 전략 (v1.1 변경)

> **핵심 발견**: Reddit에서는 **Family-Given 순서가 일관되게 더 많이 검색됨**.
> FotMob순(Given-Family)만 사용 시 주요 선수 0건 발생.
> → **양방향 OR 검색 필수**.

| 선수 | FotMob순 (Given-Family) | Reddit순 (Family-Given) | 결론 |
|------|------------------------|------------------------|------|
| 손흥민 | "Heung-Min Son" → **0건** | "Son Heung-min" → **16건** | Family-Given 필수 |
| 황희찬 | "Hee-Chan Hwang" → **0건** | "Hwang Hee-Chan" → **8건** | Family-Given 필수 |
| 김민재 | "Min-Jae Kim" → 4건 | "Kim Min-jae" → **9건** | Family-Given 우세 |
| 오현규 | "Hyeon-Gyu Oh" → **15건** | "Oh Hyeon-Gyu" → 1건 | Given-Family 우세 (예외) |

**검색 쿼리 형식**: `"{Family Given}" OR "{Given-Family}"` 양방향 포함

### 수집 데이터 구조

```json
{
  "source": "reddit",
  "posts": [
    {
      "title": "Son Heung-min scores a brace against Liverpool",
      "body": "...",
      "subreddit": "r/soccer",
      "score": 1523,
      "url": "https://reddit.com/r/soccer/...",
      "created_utc": 1740268800,
      "top_comments": [
        { "body": "What a player...", "score": 342 },
        { "body": "Best Asian player ever", "score": 215 }
      ]
    }
  ]
}
```

### 팀별 서브레딧 매핑

| 선수 | 팀 (2026-02) | 서브레딧 |
|------|-------------|----------|
| 손흥민 | Los Angeles FC | r/LAFC |
| 김민재 | Bayern München | r/fcbayern |
| 이강인 | Paris Saint-Germain | r/psg |
| 황희찬 | Wolverhampton | r/WWFC |
| 황인범 | Feyenoord | r/Feyenoord |
| 배준호 | Stoke City | r/StokeCityFC |
| 양민혁 | Coventry City | r/ccfc |
| 이재성 | Mainz 05 | r/Mainz05 |
| 조규성 | FC Midtjylland | r/Superligaen |
| 홍현석 | Gent | r/belgianfootball |
| 황의조 | Alanyaspor | r/superlig |
| 설영우 | FK Crvena Zvezda | r/soccer (팀 서브 없음) |
| 양현준 | Celtic | r/CelticFC |
| 옌스 카스트로프 | B. Mönchengladbach | r/fohlenelf |
| 권혁규 | Karlsruher SC | r/2bundesliga |
| 김민수 | FC Andorra | r/soccer (팀 서브 없음) |
| 오현규 | Besiktas | r/besiktas |
| 백승호 | Birmingham City | r/BCFC |
| 정상빈 | St. Louis City | r/stlouiscitysc |
| 정우영 | Union Berlin | r/UnionBerlin |
| 윤도영 | FC Dordrecht | r/Eredivisie |
| 박승수 | Newcastle U21 | r/NUFC |
| 엄지성 | Swansea City | r/SwanseaCity |
| 이한범 | FC Midtjylland | r/Superligaen |
| 이태석 | Austria Wien | r/soccer (팀 서브 없음) |
| 이현주 | Arouca | r/soccer (팀 서브 없음) |
| 김지수 | Kaiserslautern | r/2bundesliga |
| 이영준 | Grasshopper | r/soccer (팀 서브 없음) |
| 전진우 | Mainz 05 | r/Mainz05 |
| 서종민 | FC Midtjylland | r/Superligaen |

> **참고**: 팀 서브레딧이 작거나 없는 경우 r/soccer 검색 결과만 사용.
> Reddit에서 Tier 3-4 선수는 대부분 0건이므로, Google News RSS 결과로 보완.

---

## 4. 현지 매체 RSS 수집 (3순위)

### v1.1 변경: Google News RSS가 1순위, 개별 매체 RSS는 보조

> **실측 결과**: 스펙 v1.0에 명시된 개별 매체 RSS URL 8개 중 **4개(50%) 사용 불가** 확인.
> Google News RSS가 전 선수를 안정적으로 커버하므로, 개별 매체 RSS는 보조 역할로 축소.

### 작동 확인된 매체 RSS (4개)

| 매체 | RSS URL | 상태 | 언어 |
|------|---------|------|------|
| BBC Sport Football | `https://feeds.bbci.co.uk/sport/football/rss.xml` | **정상** | en |
| The Guardian Football | `https://www.theguardian.com/football/rss` | **정상** | en |
| DW Sports | `https://rss.dw.com/xml/rss-en-sports` | **정상** | en |
| Daily Sabah Sports | `https://www.dailysabah.com/rssFeed/sports` | **정상** | en |

### 사용 불가 확인된 매체 RSS (4개, 제거)

| 매체 | RSS URL | 상태 | 비고 |
|------|---------|------|------|
| ~~Kicker~~ | ~~`kicker.de/news/rss/fussball.xml`~~ | **403 Forbidden** | 차단됨 |
| ~~MLS~~ | ~~`mlssoccer.com/rss/en.xml`~~ | **404 Not Found** | URL 폐쇄 |
| ~~L'Equipe~~ | ~~`lequipe.fr/rss/actu_rss_Football.xml`~~ | **404 Not Found** | URL 폐쇄 |
| ~~Marca~~ | ~~`marca.com/en/rss/football.xml`~~ | **404 Not Found** | URL 폐쇄 |

### 수집 프로세스

```
[n8n 노드 흐름]

HTTP Request (개별 매체 RSS, 4개 병렬)
  URL: {매체 RSS URL}

→ Code Node (선수 영문명 full-name 매칭 필터)
    ⚠️ 반드시 full-name exact match ("Son Heung-min")
    ⚠️ 단어 단위 매칭("son") 시 false positive 다수 발생
→ Code Node (제목 + 요약 + URL + 매체명 추출)
```

### 수집 데이터 구조

```json
{
  "source": "media",
  "articles": [
    {
      "title": "Son shines as LAFC cruise to victory",
      "summary": "...",
      "outlet": "The Guardian",
      "url": "https://theguardian.com/...",
      "published_at": "2026-02-22T23:30:00Z",
      "language": "en"
    }
  ]
}
```

### BBC RSS False Positive 주의

BBC RSS에서 짧은 이름 키워드 매칭 시 비관련 기사가 포함됨:
- "son" → "아들" 의미의 일반 기사 매칭
- **반드시 full-name exact match** 사용: `"Son Heung-min"` (O), `son` (X)

---

## 5. X (Twitter) 수집 (Phase 2)

> v1.1 변경: Phase 2로 이동. Phase 1은 Google News RSS + Reddit만으로 운영.
> 이유: Tier 1 선수만 안정적, Tier 3-4 완전 부재, 유료 API.

### 방식: TwitterAPI.io (서드파티)

- 비용: $0.15 / 1,000 트윗
- n8n HTTP Request 노드로 REST API 호출
- **Tier 1-2 선수만 수집** (Tier 3-4는 0건이므로 스킵)

### 수집 프로세스

```
[n8n 노드 흐름]

HTTP Request (트윗 검색)
  URL: https://api.twitterapi.io/twitter/tweet/advanced_search
  Method: GET
  Headers: { X-API-Key: "{{$credentials.twitterApiIo}}" }
  Params: {
    query: "{검색쿼리}",    // 선수별 tier에 따라 min_faves 차등
    queryType: "{Top|Latest}", // 선수별 tier에 따라 결정
  }

→ Code Node (데이터 정제: 본문, 좋아요, RT, 작성시간, 프로필)
```

### 티어별 수집 전략 (v1.1 신규)

> **실측 결과**: 일률적 `min_faves` 적용 시 Tier 2 선수 0건 발생.
> 선수 티어별 차등 적용 필수.

| 티어 | queryType | min_faves | 기대 결과 | 선수 예시 |
|------|-----------|-----------|----------|----------|
| Tier 1 | Top | 10 | 15-20건 고품질 | 손흥민, 오현규 |
| Tier 2 | Top | 3 | 5-15건 | 김민재, 이강인, 양민혁 |
| Tier 3 | Latest | 없음 | 0-5건 (없으면 스킵) | 황희찬, 배준호 |
| Tier 4 | - | - | **X 수집 스킵** | 홍현석, 서종민 |

### 실측 데이터 (2026-02-24)

| 선수 | 쿼리 | 결과 | 최대 likes | 비고 |
|------|-------|------|-----------|------|
| 오현규 | `"Hyeon-Gyu Oh" min_faves:5` (Top) | **20건** | 6,167 | 터키 팬 풍부 |
| 손흥민 | `"Son Heung-min" min_faves:10` (Top) | **19건** | 27,492 | 최상위 engagement |
| 양민혁 | `"Yang Min-hyeok"` (Top) | **12건** | - | 축구 코멘트 |
| 김민재 | `"Kim Min-jae" OR "Minjae Kim"` (Latest) | **20건** | - | 동명이인 노이즈 |
| 이강인 | `"Lee Kang-in" OR "Kang-in Lee"` (Latest) | **20건** | - | 터키어 트윗 혼재 |
| 배준호 | 다수 변형 (Latest) | **0건** | - | X 부재 |
| 황희찬 | `"Hwang Hee-Chan"` (Top) | **0건** | - | X 부재 |
| 홍현석 | `"Hong Hyun-seok"` (Latest) | **0건** | - | X 부재 |

### 수집 데이터 구조

```json
{
  "source": "x",
  "tweets": [
    {
      "text": "Son Heung-min is absolutely on fire tonight...",
      "likes": 523,
      "retweets": 89,
      "author": "@footballanalyst",
      "url": "https://x.com/...",
      "created_at": "2026-02-22T23:15:00Z"
    }
  ]
}
```

### 주의사항

1. **동명이인 노이즈**: 김민재(여배우/감독), 이강인(오현규 연관 터키어 트윗) → GPT 필터링 위임
2. **다국어 콘텐츠**: 터키어 비중 높음 (오현규 ~40%) → GPT 번역 활용
3. **비용 관리**: Tier 1-2만 수집 시 월 ~$1-3

---

## 6. 데이터 통합 및 AI 전달

### 통합 프로세스

```
[n8n 노드 흐름]

Merge Node (Google News + Reddit + 매체 + X 데이터 통합)
  → Code Node (통합 JSON 구성)
    → HTTP Request (GPT API 호출 - 기사 생성)
      → HTTP Request (GPT API 호출 - Evidence 차트 데이터 생성)
        → Code Node (최종 JSON 구성)
          → Write File (Static JSON 저장)
```

### GPT API에 전달하는 데이터 구조

```json
{
  "player": {
    "name_en": "Son Heung-min",
    "name_kr": "손흥민",
    "team": "Los Angeles FC",
    "league": "Major League Soccer"
  },
  "match": {
    "date": "2026-02-22",
    "opponent": "Inter Miami",
    "result": "3-1 (W)",
    "player_stats": {
      "rating": 8.5,
      "goals": 2,
      "assists": 1,
      "minutes": 90
    }
  },
  "collected_opinions": {
    "google_news": { "articles": [...] },
    "reddit": { "posts": [...] },
    "x": { "tweets": [...] },
    "media": { "articles": [...] }
  }
}
```

### GPT 프롬프트 전략 (개요)

**기사 생성 프롬프트**:
- 역할: 한국 해외축구 전문 기자
- 입력: 경기 데이터 + 수집된 여론
- 출력: 3단 구조 기사 (경기요약 / 해외여론(출처별 그룹핑) / AI분석)
- 제약: 한국어, 팩트 기반, 출처 명시
- **추가 지시**: 비축구 콘텐츠(동명이인 등) 필터링, 다국어 원문 한국어 번역

**Evidence 차트 데이터 생성 프롬프트**:
- 역할: 스포츠 데이터 분석가
- 입력: 경기 데이터 + 시즌 누적 스탯
- 출력: 차트 JSON (bar/radar/line/pie 중 적합한 유형 선택)

> **상세 프롬프트 설계**는 별도 문서로 관리 예정

---

## 7. 에러 처리 및 안정성

### 재시도 전략

| 단계 | 재시도 횟수 | 간격 | 실패 시 |
|------|------------|------|---------|
| Google News RSS | 3회 | 30초 간격 | 스킵, 나머지 소스로 진행 |
| Reddit 수집 | 3회 | 30초 간격 | 스킵, 나머지 소스로 진행 |
| 개별 매체 RSS | 3회 | 30초 간격 | 스킵, 나머지 소스로 진행 |
| X 수집 (Phase 2) | 3회 | 30초 간격 | 스킵, 나머지 소스로 진행 |
| GPT API | 3회 | 60초 간격 | 전체 워크플로우 실패 처리 |

### 최소 데이터 기준

- **Google News RSS 3건 이상** 또는 **총 수집 5건 이상** 시 기사 생성 진행
- 모든 소스 실패 시 → 워크플로우 중단 + 알림 발송
- 여론 데이터가 극히 부족한 경우 (총 3개 미만) → 기사 생성 스킵 + 로그 기록
- **서종민 등 Tier 4 데이터 극소 선수**: 기사 생성 스킵 가능성 인지

### 알림

- n8n Error Trigger → Slack/이메일로 실패 알림
- 일간 수집 현황 요약 (성공/실패/스킵 건수)

---

## 8. 비용 추정

### Phase 1: Google News RSS + Reddit (MVP)

| 항목 | 단가 | 월 사용량 | 월 비용 |
|------|------|-----------|---------|
| Google News RSS | 무료 | - | $0 |
| Reddit | 무료 | - | $0 |
| 개별 매체 RSS | 무료 | - | $0 |
| GPT-4o (기사 생성) | ~$5/1M input | ~30 기사 | ~$5~15 |
| GPT-4o (Evidence) | ~$5/1M input | ~30 기사 | ~$3~8 |
| n8n (self-hosted) | 무료 | - | $0 |
| **Phase 1 합계** | | | **~$8~23/월** |

### Phase 2: + TwitterAPI.io

| 항목 | 추가 단가 | 추가 사용량 | 추가 비용 |
|------|----------|-----------|----------|
| TwitterAPI.io | $0.15/1K | ~1,000 트윗/월 (Tier 1-2만) | ~$1~3 |
| **Phase 2 합계** | | | **~$9~26/월** |

> **참고**: GPT-4o-mini 사용 시 비용 대폭 절감 가능 (~$2~5/월)
> 예산 범위 $10~50 내에서 충분히 운영 가능

---

## 9. 선수별 검색 키워드 레지스트리

> **상세 레지스트리**: `docs/player-search-registry.md` 참조 (30명 전원 실측 데이터 + JavaScript 설정 코드)

### 키워드 설계 원칙 (v1.1 확정)

1. **양방향 OR 필수**: `"Family Given" OR "Given Family"` (Reddit에서 순서에 따라 결과 편차 극심)
2. **오현규 이름 수정**: FotMob `"Hyun Gyu Oh"` → **`"Hyeon-Gyu Oh"`** (GN 9건 → 85건)
3. **FP 고위험 선수 팀명 추가**: 김지수, 이현주, 서종민은 검색 시 팀명/리그명 포함
4. **X 검색 티어별 min_faves**: Tier 1(10), Tier 2(3), Tier 3(없음), Tier 4(스킵)

### 간략 레지스트리 (주요 선수)

```javascript
const playerSearchConfig = [
  {
    id: 212867,
    fotmobName: "Heung-Min Son",
    nameKr: "손흥민",
    tier: 1,
    searchQueries: {
      googleNews: '"Son Heung-min" OR "Heung-Min Son"',
      reddit: '"Son Heung-min" OR "Heung-Min Son"',
      x: '"Son Heung-min" OR "Heung-min Son" min_faves:10',
    },
    xQueryType: "Top",
    subreddits: ["soccer", "LAFC"],
    falsePositiveRisk: "low",
  },
  {
    id: 1044299,
    fotmobName: "Hyun Gyu Oh",  // ⚠️ FotMob 이름 부정확
    nameKr: "오현규",
    tier: 1,
    searchQueries: {
      googleNews: '"Hyeon-Gyu Oh" OR "Oh Hyeon-Gyu"',  // ⚠️ FotMob 이름 사용 금지
      reddit: '"Hyeon-Gyu Oh" OR "Oh Hyeon-Gyu"',
      x: '"Hyeon-Gyu Oh" min_faves:5',
    },
    xQueryType: "Top",
    subreddits: ["soccer", "besiktas"],
    falsePositiveRisk: "low",
  },
  {
    id: 828159,
    fotmobName: "Min-Jae Kim",
    nameKr: "김민재",
    tier: 1,
    searchQueries: {
      googleNews: '"Kim Min-jae" OR "Min-Jae Kim"',
      reddit: '"Kim Min-jae" OR "Min-Jae Kim"',
      x: '"Kim Min-jae" OR "Minjae Kim"',
    },
    xQueryType: "Top",
    subreddits: ["soccer", "fcbayern"],
    falsePositiveRisk: "medium",  // 동명이인 (여배우)
  },
  // ... 나머지 27명은 docs/player-search-registry.md 참조
];
```

> **관리 원칙**: 이적 등으로 팀 변경 시 `subreddits` 업데이트 필요.
> FotMob 이름과 실제 검색 유효 이름이 다를 수 있으므로, 신규 선수 추가 시 반드시 Google News RSS 실측 검증 수행.

---

## 10. False Positive 완화 전략

> v1.1 신규 섹션.

### FP 위험도별 선수 분류

| 위험도 | 선수 | FP 비율 | 원인 | 완화 방법 |
|--------|------|---------|------|-----------|
| **High** | 김지수 | 57% | 배우 동명이인 | 팀명(Kaiserslautern) 추가 |
| **High** | 이현주 | 57% | 흔한 이름 | 팀명(Arouca) 추가 |
| **High** | 서종민 | 높음 | 배우 "Jong Seo" 오염 | 반드시 full-name + 팀명 |
| **Medium** | 설영우 | 33% | - | 팀명(Crvena Zvezda) 추가 |
| **Medium** | 박승수 | 35% | 흔한 이름 | 팀명(Newcastle) 추가 |
| **Medium** | 김민재 | X에서 중간 | 여배우 동명이인 | GPT 필터링 |
| **Medium** | 김민수 | - | 흔한 이름 | 팀명(FC Andorra) 추가 |
| **Low** | 나머지 23명 | <15% | - | 기본 검색 충분 |

### 구현 방법

1. **Google News RSS**: FP 고위험 선수는 `"이름" 팀명 OR football` 쿼리 사용
2. **개별 매체 RSS**: full-name exact match (`"Son Heung-min"`) 필수, 단어 매칭 금지
3. **GPT 필터링**: 수집된 데이터를 GPT에 전달 시, 축구 관련 여부 1차 판별 지시 포함
4. **n8n Code Node**: `falsePositiveRisk` 필드에 따라 검색 쿼리 자동 분기

---

## 11. 향후 확장

| 항목 | 시기 | 비고 |
|------|------|------|
| Phase 2: TwitterAPI.io 추가 | Phase 1 안정화 후 | Tier 1-2 선수만, ~$1-3/월 추가 |
| 자동 경기 종료 감지 (FotMob 폴링) | MVP 이후 | 사전 스케줄링 → 실시간 감지로 전환 |
| X 공식 API Pay-per-use 전환 | 비용 확인 후 | 서드파티 대비 안정성 향상 |
| 감성 분석 (긍정/부정/중립) | 필터링 고도화 시 | AI 프롬프트에 감성 분류 추가 |
| 비경기 이슈 트리거 | 비경기 기사 추가 시 | 이적/부상 뉴스 키워드 모니터링 |
| 수집 데이터 DB 저장 | DB 전환 시 | 원본 여론 데이터 보존 |
| Google News RSS 장애 대응 | 지속적 | 개별 매체 RSS 확대 또는 웹 스크래핑 fallback |
| 신규 선수 추가 시 이름 검증 | 수시 | Google News RSS 실측 필수 (FotMob 이름 신뢰 불가) |

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2026-02-23 | v1.0 | 전체 파이프라인 설계 확정 - Q&A 기반 의사결정 완료 |
| 2026-02-24 | v1.1 | 소스 테스트 결과 반영: Google News RSS 1순위 격상, 개별 매체 RSS 축소(4/8 사망), Reddit 양방향 OR 검색 확정, X를 Phase 2로 이동, 오현규 이름 수정(Hyun Gyu Oh→Hyeon-Gyu Oh), FP 완화 전략 추가, 30명 키워드 레지스트리 분리(player-search-registry.md) |
