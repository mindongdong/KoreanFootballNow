# n8n 여론 수집 파이프라인 기획 정의서

> **문서 상태**: v1.0 확정
> **작성일**: 2026-02-23
> **목적**: Reddit, X, 현지매체에서 해외파 선수 관련 여론을 수집하는 n8n 워크플로우 설계

---

## 0. 파이프라인 개요

### 전체 흐름

```
[1] 경기 일정 사전 수집 (FotMob)
  → [2] 경기 종료 예상 시각 + 2시간 후 n8n 스케줄 설정
    → [3] 병렬 수집
        ├─ Reddit (.json 엔드포인트)
        ├─ X (TwitterAPI.io)
        └─ 현지 매체 (RSS 피드)
      → [4] 수집 데이터 통합
        → [5] GPT API로 기사 생성
          → [6] Static JSON 파일로 저장
            → [7] 사이트에 반영
```

### 핵심 결정 요약

| 항목 | 결정 |
|------|------|
| 트리거 | 사전 스케줄링 (경기 종료 + 2시간 후) |
| Reddit | 무료 `.json` 엔드포인트, r/soccer + 팀별 서브레딧 |
| X (Twitter) | 서드파티 TwitterAPI.io ($0.15/1,000트윗) |
| 현지 매체 | RSS 피드 (리그별 주요 매체) |
| 검색 키워드 | 영문명만 |
| 수집량 (MVP) | Reddit 20, X 30, 매체 5 |
| 시간 윈도우 | 경기 종료 후 2시간 이내 |
| 필터링 | AI(GPT)에게 위임 |
| 에러 처리 | 3회 재시도 후 수집된 데이터만으로 진행 |
| 월 예산 | $10~50 (X API + GPT API 포함) |

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

## 2. Reddit 수집

### 방식: 무료 `.json` 엔드포인트

OAuth 불필요, 비용 0원. n8n HTTP Request 노드로 직접 호출.

### 수집 대상

1. **r/soccer 전체**: 가장 트래픽이 많은 축구 서브레딧
2. **팀별 서브레딧**: 해당 선수 소속팀의 전용 커뮤니티

### 수집 프로세스

```
[n8n 노드 흐름]

HTTP Request (r/soccer 검색)
  URL: https://www.reddit.com/r/soccer/search.json?q={영문명}&sort=new&limit=20&restrict_sr=on&t=day
  Headers: { User-Agent: "KoreanFootballNow/1.0" }

HTTP Request (팀 서브레딧 검색)
  URL: https://www.reddit.com/r/{subreddit}/search.json?q={영문명}&sort=new&limit=10&restrict_sr=on&t=day

→ Merge Node (결과 통합)

→ Loop: 관련 게시글 상위 N개에 대해
  HTTP Request (댓글 수집)
    URL: https://www.reddit.com/r/{subreddit}/comments/{post_id}.json?sort=top&limit=10

→ Code Node (데이터 정제: 제목, 본문, 상위 댓글 10개, 점수, 작성시간)
```

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
| 정호연 | Minnesota United | r/minnesotaunited |
| 정우영 | Union Berlin | r/UnionBerlin |
| 윤도영 | FC Dordrecht | r/Eredivisie |
| 박승수 | Newcastle U21 | r/NUFC |
| 엄지성 | Swansea City | r/SwanseaCity |
| 이한범 | FC Midtjylland | r/Superligaen |
| 이태석 | Austria Wien | r/soccer (팀 서브 없음) |
| 이현주 | Arouca | r/soccer (팀 서브 없음) |
| 김지수 | Kaiserslautern | r/2bundesliga |
| 이영준 | Grasshopper | r/soccer (팀 서브 없음) |
| 고영준 | Górnik Zabrze | r/soccer (팀 서브 없음) |
| 김용학 | Portimonense | r/soccer (팀 서브 없음) |

> **참고**: 팀 서브레딧이 작거나 없는 경우 r/soccer 검색 결과만 사용

---

## 3. X (Twitter) 수집

### 방식: TwitterAPI.io (서드파티)

- 비용: $0.15 / 1,000 트윗
- n8n HTTP Request 노드로 REST API 호출
- 월 예상 비용: $1~3 (일 30트윗 × 30일 = 900트윗/월)

### 수집 프로세스

```
[n8n 노드 흐름]

HTTP Request (트윗 검색)
  URL: https://api.twitterapi.io/twitter/tweet/advanced_search
  Method: GET
  Headers: { X-API-Key: "{{$credentials.twitterApiIo}}" }
  Params: {
    query: "{영문명}",
    start_time: "{경기종료시각_ISO}",
    limit: 30,
    sort: "relevance"
  }

→ Code Node (데이터 정제: 본문, 좋아요, RT, 작성시간, 프로필)
```

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

### 검색 쿼리 전략

영문명만 사용 (해외 플랫폼 기준):

| 선수 | 검색 쿼리 |
|------|-----------|
| 손흥민 | `"Son Heung-min" OR "Heung-min Son"` |
| 김민재 | `"Kim Min-jae" OR "Min-jae Kim"` |
| 이강인 | `"Lee Kang-in" OR "Kang-in Lee"` |
| ... | 각 선수별 영문명 변형 포함 |

> **팁**: FotMob의 영문명 표기를 기준으로 통일

---

## 4. 현지 매체 수집

### 방식: RSS 피드

무료, 단순, n8n RSS Feed Read 노드 또는 HTTP Request로 호출.

### 수집 프로세스

```
[n8n 노드 흐름]

RSS Feed Read (매체별)
  URL: {매체 RSS URL}

→ Code Node (선수 영문명 키워드 매칭 필터)
→ HTTP Request (기사 본문 fetch, 필요 시)
→ Code Node (제목 + 요약 + URL 추출)
```

### 수집 데이터 구조

```json
{
  "source": "media",
  "articles": [
    {
      "title": "Son shines as Spurs crush Liverpool",
      "summary": "...",
      "outlet": "The Guardian",
      "url": "https://theguardian.com/...",
      "published_at": "2026-02-22T23:30:00Z",
      "language": "en"
    }
  ]
}
```

### 리그별 주요 매체 및 RSS

| 리그 | 매체 | RSS URL | 언어 |
|------|------|---------|------|
| **Premier League** | BBC Sport Football | `feeds.bbci.co.uk/sport/football/rss.xml` | en |
| | The Guardian Football | `theguardian.com/football/rss` | en |
| **Bundesliga** | Kicker | `kicker.de/news/rss/fussball.xml` | de |
| | DW Sports | `rss.dw.com/xml/rss-en-sports` | en |
| **Ligue 1** | L'Equipe | `lequipe.fr/rss/actu_rss_Football.xml` | fr |
| **La Liga** | Marca | `marca.com/en/rss/football.xml` | en |
| **Eredivisie** | Voetbal International | `vi.nl/rss` | nl |
| **Championship** | BBC Sport Football | (상동) | en |
| **MLS** | MLSSoccer.com | `mlssoccer.com/rss/en.xml` | en |
| **Scottish Premiership** | BBC Scotland Sport | `feeds.bbci.co.uk/sport/football/scottish/rss.xml` | en |
| **Super Lig (Turkey)** | Daily Sabah | `dailysabah.com/rssFeed/sports` | en |
| **Belgian Pro League** | HLN Sportwereld | `hln.be/sport/voetbal/rss.xml` | nl |
| **Superligaen (Denmark)** | Bold.dk | `bold.dk/rss` | da |
| **Ekstraklasa (Poland)** | Sport.pl | `sport.pl/rss.xml` | pl |
| **Liga Portugal** | A Bola | `abola.pt/rss` | pt |
| **Swiss Super League** | Blick Sport | `blick.ch/sport/rss.xml` | de |
| **Austrian Bundesliga** | Kurier Sport | `kurier.at/rss/sport` | de |
| **Serbian Super Liga** | Google News 검색 | Google News RSS fallback | en |

> **참고**: RSS URL은 실제 가용성 검증 필요. 일부 매체는 RSS 제공을 중단했을 수 있음.
> **Fallback**: RSS 미제공 매체는 Google News RSS 검색으로 대체
> `https://news.google.com/rss/search?q={영문명}+{팀명}&hl=en`

---

## 5. 데이터 통합 및 AI 전달

### 통합 프로세스

```
[n8n 노드 흐름]

Merge Node (Reddit + X + 매체 데이터 통합)
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

**Evidence 차트 데이터 생성 프롬프트**:
- 역할: 스포츠 데이터 분석가
- 입력: 경기 데이터 + 시즌 누적 스탯
- 출력: 차트 JSON (bar/radar/line/pie 중 적합한 유형 선택)

> **상세 프롬프트 설계**는 별도 문서로 관리 예정

---

## 6. 에러 처리 및 안정성

### 재시도 전략

| 단계 | 재시도 횟수 | 간격 | 실패 시 |
|------|------------|------|---------|
| Reddit 수집 | 3회 | 30초 간격 | 스킵, 나머지 소스로 진행 |
| X 수집 | 3회 | 30초 간격 | 스킵, 나머지 소스로 진행 |
| 매체 수집 | 3회 | 30초 간격 | 스킵, 나머지 소스로 진행 |
| GPT API | 3회 | 60초 간격 | 전체 워크플로우 실패 처리 |

### 최소 데이터 기준

- **수집 소스 최소 1개 성공** 시 기사 생성 진행
- 모든 소스 실패 시 → 워크플로우 중단 + 알림 발송
- 여론 데이터가 극히 부족한 경우 (총 5개 미만) → 기사 생성 스킵 + 로그 기록

### 알림

- n8n Error Trigger → Slack/이메일로 실패 알림
- 일간 수집 현황 요약 (성공/실패/스킵 건수)

---

## 7. 비용 추정

### 월간 예상 비용 (MVP 기준)

| 항목 | 단가 | 월 사용량 | 월 비용 |
|------|------|-----------|---------|
| Reddit | 무료 | - | $0 |
| TwitterAPI.io | $0.15/1K | ~1,000 트윗 | ~$0.15 |
| RSS 피드 | 무료 | - | $0 |
| GPT-4o (기사 생성) | ~$5/1M input | ~30 기사 | ~$5~15 |
| GPT-4o (Evidence) | ~$5/1M input | ~30 기사 | ~$3~8 |
| n8n (self-hosted) | 무료 | - | $0 |
| **합계** | | | **~$8~23/월** |

> **참고**: GPT-4o-mini 사용 시 비용 대폭 절감 가능 (~$2~5/월)
> 예산 범위 $10~50 내에서 충분히 운영 가능

---

## 8. 선수별 검색 키워드 레지스트리

n8n 워크플로우의 Code 노드에서 관리하는 선수 검색 설정:

```javascript
const playerSearchConfig = [
  {
    id: 212867,
    nameEn: "Son Heung-min",
    nameKr: "손흥민",
    searchQueries: {
      reddit: '"Son Heung-min" OR "Heung-min Son"',
      x: '"Son Heung-min" OR "Heung-min Son"',
    },
    subreddits: ["soccer", "LAFC"],
    mediaRss: ["bbci", "mlssoccer"],
  },
  {
    id: 828159,
    nameEn: "Kim Min-jae",
    nameKr: "김민재",
    searchQueries: {
      reddit: '"Kim Min-jae" OR "Min-jae Kim"',
      x: '"Kim Min-jae" OR "Min-jae Kim"',
    },
    subreddits: ["soccer", "fcbayern"],
    mediaRss: ["kicker", "dw"],
  },
  // ... 나머지 선수들
];
```

> **관리 원칙**: 이적 등으로 팀 변경 시 `subreddits`와 `mediaRss` 업데이트 필요

---

## 9. 향후 확장

| 항목 | 시기 | 비고 |
|------|------|------|
| 자동 경기 종료 감지 (FotMob 폴링) | MVP 이후 | 사전 스케줄링 → 실시간 감지로 전환 |
| X 공식 API Pay-per-use 전환 | 비용 확인 후 | 서드파티 대비 안정성 향상 |
| 감성 분석 (긍정/부정/중립) | 필터링 고도화 시 | AI 프롬프트에 감성 분류 추가 |
| 비경기 이슈 트리거 | 비경기 기사 추가 시 | 이적/부상 뉴스 키워드 모니터링 |
| 수집 데이터 DB 저장 | DB 전환 시 | 원본 여론 데이터 보존 |
| 리그별 RSS 확장/교체 | 지속적 | 매체 RSS 가용성 변화에 대응 |

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2026-02-23 | v1.0 | 전체 파이프라인 설계 확정 - Q&A 기반 의사결정 완료 |
