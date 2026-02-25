# 여론 수집 소스 테스트 결과 및 파이프라인 제안서

> **문서 상태**: v1.0
> **작성일**: 2026-02-24
> **목적**: Reddit, Google News RSS, TwitterAPI.io 실제 테스트 결과를 바탕으로 n8n 여론 수집 파이프라인 구현 전략 제안

---

## 1. 테스트 개요

### 목적

`n8n-opinion-pipeline-spec.md`에 정의된 3개 수집 소스(Reddit, X, 현지 매체 RSS)의 **실제 가용성**을 검증하고, 선수별 데이터 수량/품질을 측정하여 MVP 구현 전략을 수립한다.

### 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 일시 | 2026-02-23 ~ 2026-02-24 |
| 도구 | `curl` + `python3` (JSON/XML 파싱) |
| 대상 선수 | 손흥민, 오현규, 김민재, 이강인, 황희찬, 양민혁, 배준호, 홍현석, 황인범, 설영우 |
| 시간 윈도우 | Reddit `t=week`, Google News 기본(최근), X `queryType=Top/Latest` |

### 테스트 대상 소스

| 소스 | 엔드포인트 | 인증 | 비용 |
|------|-----------|------|------|
| Reddit `.json` | `reddit.com/r/{sub}/search.json` | 불필요 (User-Agent 헤더만) | 무료 |
| Google News RSS | `news.google.com/rss/search?q=...` | 불필요 (Browser User-Agent 필수) | 무료 |
| TwitterAPI.io | `api.twitterapi.io/twitter/tweet/advanced_search` | `X-API-Key` 헤더 | $0.15/1K tweets |

---

## 2. Reddit `.json` 엔드포인트 테스트

### 테스트 방법

```bash
# 서브레딧 검색
curl -s -H "User-Agent: KoreanFootballNow/1.0" \
  "https://www.reddit.com/r/soccer/search.json?q=%22Son+Heung-min%22&sort=new&limit=25&restrict_sr=on&t=week"

# 댓글 수집
curl -s -H "User-Agent: KoreanFootballNow/1.0" \
  "https://www.reddit.com/r/{subreddit}/comments/{post_id}.json?sort=top&limit=10"
```

- `t=week` (7일) 시간 윈도우 사용
- `restrict_sr=on`으로 특정 서브레딧 내 검색 제한
- 결과를 Python으로 파싱하여 게시글 제목, score, 댓글 수 확인

### 검색 결과

| 선수 | r/soccer | 팀 서브레딧 | 합계 | 최대 score | 비고 |
|------|----------|------------|------|-----------|------|
| 손흥민 | 14건 | r/LAFC 5건 | **19** | 1,500+ | 가장 풍부, 댓글 품질 높음 |
| 오현규 | 5건 (`Hyeon-Gyu Oh`) | r/besiktas 10건 | **15** | 266 | **스펙의 "Hyun Gyu Oh"로는 0건** |
| 이강인 | 5건 | - | **5** | - | 보통 수준 |
| 황희찬 | 5건 | - | **5** | - | 보통 수준 |
| 황인범 | 5건 | - | **5** | - | 보통 수준 |
| 양민혁 | 0건 | r/ccfc 0건 | **0** | - | Reddit에서 부재 |
| 배준호 | 2건 | - | **2** | - | 매치 스레드 내 언급만 |
| 김민재 | 0건 | r/fcbayern 0건 | **0** | - | 이름 검색 실패 |
| 홍현석 | 0건 | - | **0** | - | Reddit에서 부재 |
| 설영우 | 0건 | - | **0** | - | Reddit에서 부재 |

### 시간 윈도우 비교

| 윈도우 | 손흥민 결과 |
|--------|-----------|
| `t=day` (1일) | 2건 |
| `t=week` (7일) | 14건 |

→ 경기 후 반응이 1-2일에 집중되므로 `t=day`로 충분하나, 안전 마진 위해 `t=week` 사용 권장.

### 댓글 수집 테스트

- `comments/{id}.json?sort=top&limit=10` 정상 동작 확인
- 댓글 `body`, `score`, `author` 추출 가능
- 중첩 댓글(replies)도 재귀적으로 포함됨

### Rate Limit 테스트

5회 연속 요청 (간격 없음) 모두 HTTP 200 성공. 비인증 엔드포인트 rate limit이 느슨한 것으로 확인.

### 발견된 문제점

1. **이름 철자 불일치 (Critical)**
   - 스펙: `"Hyun Gyu Oh"` → 0건
   - 실제 Reddit/FotMob: `"Hyeon-Gyu Oh"` → 5건 (r/soccer), 10건 (r/besiktas)
   - 다른 선수들도 동일 문제 가능성 높음

2. **팀 서브레딧 활성도 편차**
   - r/besiktas: 매우 활발 (오현규 관련 10건, score 266)
   - r/ccfc (Coventry): 양민혁 관련 0건
   - r/fcbayern: 김민재 관련 0건

3. **Tier 3-4 선수 데이터 부재**
   - 양민혁, 홍현석, 설영우 등 Reddit에서 거의 언급 없음

---

## 3. Google News RSS 테스트

### 테스트 방법

```bash
# Google News RSS 검색 (Browser User-Agent + 리다이렉트 팔로우 필수)
curl -s -L \
  -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" \
  "https://news.google.com/rss/search?q=%22Son+Heung-min%22&hl=en&gl=US&ceid=US:en"
```

- **Browser User-Agent 필수**: 커스텀 UA (`KoreanFootballNow/1.0`) 사용 시 HTTP 302 리다이렉트 후 빈 응답
- **`-L` 플래그 필수**: Google의 리다이렉트를 팔로우해야 실제 RSS XML 수신
- 결과를 `grep -c "<item>"` 또는 Python XML 파싱으로 건수 확인

### 검색 결과

| 선수 | 검색 쿼리 | 결과 건수 | 비고 |
|------|-----------|----------|------|
| 손흥민 | `"Son Heung-min"` | **92건** | 최다, 글로벌 미디어 광범위 커버 |
| 김민재 | `"Kim Min-jae"` | **100건** | RSS 한도(100) 도달, 매우 풍부 |
| 양민혁 | `"Yang Min-hyeok"` | **68건** | Reddit(0건)과 극명한 대조 |
| 배준호 | `"Bae Jun-Ho"` | **56건** | Reddit(2건), X(0건)과 극명한 대조 |
| 오현규 | `"Hyeon-Gyu Oh"` | **33건** | 터키+영국 미디어 |
| 홍현석 | `"Hong Hyun-seok"` | **18건** | Reddit(0건)에서 커버 불가한 선수도 커버 |

### 개별 미디어 RSS URL 검증

`n8n-opinion-pipeline-spec.md`에 명시된 개별 미디어 RSS URL을 직접 테스트:

| 매체 | RSS URL | HTTP 상태 | 결과 |
|------|---------|-----------|------|
| BBC Sport | `feeds.bbci.co.uk/sport/football/rss.xml` | 200 | **정상** (단, 짧은 이름 false positive) |
| The Guardian | `theguardian.com/football/rss` | 200 | **정상** |
| DW Sports | `rss.dw.com/xml/rss-en-sports` | 200 | **정상** |
| Daily Sabah | `dailysabah.com/rssFeed/sports` | 200 | **정상** |
| **Kicker** | `kicker.de/news/rss/fussball.xml` | **403** | **차단됨** |
| **MLS** | `mlssoccer.com/rss/en.xml` | **404** | **URL 폐쇄** |
| **L'Equipe** | `lequipe.fr/rss/actu_rss_Football.xml` | **404** | **URL 폐쇄** |
| **Marca** | `marca.com/en/rss/football.xml` | **404** | **URL 폐쇄** |

→ **8개 중 4개(50%) 사용 불가**. 개별 미디어 RSS 전략은 유지보수 부담이 크다.

### BBC RSS False Positive 문제

BBC RSS에서 "son" 키워드 매칭 시, "Son Heung-min"과 무관한 기사도 매칭됨:
- 예: 기사 제목에 "son" (아들)이라는 단어가 포함된 비축구 기사
- 짧은 이름 선수(Son, Lee 등)에서 false positive 위험

### 핵심 발견

1. **Google News RSS가 모든 선수를 커버하는 유일한 소스**: Reddit/X에서 0건인 선수도 수십 건 확보
2. **개별 미디어 RSS보다 Google News RSS가 압도적으로 안정적**: 50% URL 사망 vs Google News 100% 가용
3. **Browser User-Agent 필수**: n8n HTTP Request 노드에서 헤더 설정 필요
4. **영어 기사 외 현지어 기사도 포함**: 터키어, 독일어, 프랑스어 기사도 수집됨 → GPT 다국어 번역 활용

---

## 4. TwitterAPI.io 테스트

### 테스트 방법

```bash
curl -s "https://api.twitterapi.io/twitter/tweet/advanced_search" \
  -H "X-API-Key: $TWITTERAPI_IO_KEY" \
  -G --data-urlencode 'query="Son Heung-min" min_faves:10' \
  --data-urlencode 'queryType=Top'
```

- `queryType=Top`: 인기순 정렬 (engagement 높은 트윗 우선)
- `queryType=Latest`: 최신순 정렬
- `min_faves:N`: 최소 좋아요 수 필터 (노이즈 제거)
- `OR` 연산자로 이름 변형 병합 검색

### 검색 결과

| 선수 | 쿼리 | queryType | 필터 | 결과 | 최대 likes | 비고 |
|------|-------|-----------|------|------|-----------|------|
| 오현규 | `"Hyeon-Gyu Oh"` | Top | min_faves:5 | **20건** | 6,167 | 터키 팬 반응 풍부 |
| 손흥민 | `"Son Heung-min"` | Top | min_faves:10 | **19건** | 27,492 | 최상위 engagement |
| 양민혁 | `"Yang Min-hyeok"` | Top | 없음 | **12건** | - | 축구 관련 코멘트 |
| 김민재 | `"Kim Min-jae" OR "Minjae Kim"` | Latest | 없음 | **20건** | - | **동명이인 노이즈 심각** (여배우/감독) |
| 김민재 | 동일 | Top | min_faves:5 | **0건** | - | 필터 적용 시 전멸 |
| 이강인 | `"Lee Kang-in" OR "Kang-in Lee"` | Latest | 없음 | **20건** | - | 터키어 트윗 다수 |
| 이강인 | 동일 | Top | min_faves:10 | **0건** | - | 필터 적용 시 전멸 |
| 배준호 | 다수 변형 | Latest | 없음 | **0건** | - | X에서 완전 부재 |
| 황희찬 | `"Hwang Hee-Chan"` | Top | 없음 | **0건** | - | X에서 부재 |
| 홍현석 | `"Hong Hyun-seok"` | Latest | 없음 | **0건** | - | X에서 부재 |

### 핵심 발견

1. **Tier 1 선수(손흥민, 오현규)만 안정적 수집 가능**: `min_faves` 필터 + `Top` 조합으로 고품질 콘텐츠
2. **Tier 2 선수(김민재, 이강인)는 필터 제거 필요**: `min_faves` 적용 시 0건, 제거 시 노이즈 유입
3. **동명이인 문제**: 김민재(여배우), 이강인(오현규와의 터키어 연관 트윗) 등 비축구 콘텐츠 혼입
4. **Tier 3-4 선수(배준호, 황희찬, 홍현석) 데이터 부재**: X에서 수집 자체 불가
5. **다국어 콘텐츠**: 터키어 트윗 비중 높음 (오현규 ~40%, 이강인 일부)

---

## 5. 소스 간 크로스 비교

### 선수별 소스 커버리지 매트릭스

| 선수 | Reddit | Google News RSS | TwitterAPI.io | 유효 소스 수 | 데이터 등급 |
|------|--------|-----------------|---------------|-------------|------------|
| **손흥민** | 19건 | 92건 | 19건 (Top) | **3/3** | A (풍부) |
| **오현규** | 15건 | 33건 | 20건 (Top) | **3/3** | A (풍부) |
| **김민재** | 0건 | 100건 | 20건 (노이즈) | **2/3** | B (RSS 의존) |
| **양민혁** | 0건 | 68건 | 12건 | **2/3** | B (RSS 주력) |
| **이강인** | 5건 | 미테스트 | 20건 (노이즈) | **2/3** | B (보통) |
| **배준호** | 2건 | 56건 | 0건 | **1/3** | C (RSS만) |
| **황희찬** | 5건 | 미테스트 | 0건 | **1/3** | C (Reddit만) |
| **황인범** | 5건 | 미테스트 | 미테스트 | **1/3** | C (Reddit만) |
| **홍현석** | 0건 | 18건 | 0건 | **1/3** | C (RSS만) |
| **설영우** | 0건 | 미테스트 | 미테스트 | **0/3** | D (극소) |

### 소스별 특성 비교

| 항목 | Reddit | Google News RSS | TwitterAPI.io |
|------|--------|-----------------|---------------|
| **비용** | 무료 | 무료 | $0.15/1K tweets |
| **커버리지 범위** | Tier 1-2만 | **전 선수** (최광범) | Tier 1만 안정 |
| **콘텐츠 유형** | 팬 토론, 매치 분석 | 언론 기사 헤드라인+링크 | 팬 반응, 짧은 코멘트 |
| **콘텐츠 깊이** | 높음 (댓글 토론) | 중간 (기사 제목+요약) | 낮음 (280자 제한) |
| **언어** | 영어 위주 | 영어 + 현지어 혼재 | 다국어 (터키어 등) |
| **노이즈 수준** | 낮음 | 짧은 이름 false positive | 동명이인 문제 |
| **Rate Limit** | 느슨 (비인증) | 없음 (UA 필수) | API 키 기반 |
| **실시간성** | 준실시간 | 수시간 딜레이 | 준실시간 |
| **n8n 구현 난이도** | 쉬움 (HTTP Request) | 쉬움 (HTTP Request) | 쉬움 (HTTP Request) |
| **유지보수 부담** | 낮음 | 낮음 | 중간 (API 키 관리) |

### 소스별 역할 정의

| 소스 | 최적 역할 | 이유 |
|------|-----------|------|
| **Google News RSS** | **기사 헤드라인/출처 수집** (메인) | 전 선수 커버, 무료, 안정적 |
| **Reddit** | **팬 여론/심층 토론 수집** (보조) | 댓글 토론 품질 높음, Tier 1-2 한정 |
| **TwitterAPI.io** | **실시간 팬 반응 수집** (선택) | Tier 1 선수 engagement 높음, 비용 발생 |

---

## 6. 기존 스펙 대비 수정 필요사항

### 6.1 검색 키워드 레지스트리 (Critical)

**문제**: FotMob 영문명과 Reddit/X/RSS에서 실제 검색되는 이름이 불일치

| 선수 | 스펙 기존 이름 | 실제 검색 유효 이름 | 상태 |
|------|--------------|-------------------|------|
| 오현규 | Hyun Gyu Oh | **Hyeon-Gyu Oh** | 수정 필요 |
| 기타 선수 | (FotMob 기준) | (미검증) | 전수 검증 필요 |

**권장 조치**: 30명 전원에 대해 Reddit/Google News에서 실제 검색되는 이름 변형을 검증하고, `searchQueries` 필드에 모든 유효 변형을 `OR`로 포함.

### 6.2 개별 미디어 RSS URL (Critical)

**문제**: 스펙에 명시된 RSS URL 중 50%가 사용 불가

| 상태 | 매체 |
|------|------|
| 정상 (4개) | BBC Sport, The Guardian, DW Sports, Daily Sabah |
| **사망 (4개)** | **Kicker (403), MLS (404), L'Equipe (404), Marca (404)** |

**권장 조치**: 개별 미디어 RSS를 1차 소스에서 제외하고, **Google News RSS를 매체 수집의 메인 소스로 전환**. 정상 작동하는 4개 RSS는 보조 소스로 유지.

### 6.3 TwitterAPI.io min_faves 필터 전략

**문제**: 일률적 `min_faves` 적용 시 Tier 2-3 선수 데이터 전멸

**권장 조치**: 선수 티어별 차등 적용

| 티어 | 선수 예시 | queryType | min_faves | 기대 결과 |
|------|----------|-----------|-----------|----------|
| Tier 1 | 손흥민, 오현규 | Top | 10 | 15-20건 고품질 |
| Tier 2 | 김민재, 이강인, 양민혁 | Top | 3 | 5-15건 |
| Tier 3 | 황희찬, 배준호 | Latest | 없음 | 0-5건 (없으면 스킵) |
| Tier 4 | 홍현석, 설영우 | - | - | X 수집 스킵 |

### 6.4 BBC RSS False Positive

**문제**: "son" 등 짧은 이름으로 개별 RSS 키워드 매칭 시 비관련 기사 포함

**권장 조치**: 개별 미디어 RSS 사용 시 full-name 매칭(`"Son Heung-min"`) 적용. Google News RSS는 검색 쿼리 자체가 full-name이므로 문제 없음.

### 6.5 Google News RSS n8n 구현 시 주의사항

**문제**: 커스텀 User-Agent로 호출 시 302 리다이렉트 후 빈 응답

**권장 조치**:
- n8n HTTP Request 노드에서 `User-Agent` 헤더를 브라우저 UA로 설정
- `Follow Redirects` 옵션 활성화 (n8n 기본 설정으로 활성화됨)

```
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
```

---

## 7. MVP 파이프라인 구현 전략 제안

### Phase 1: Google News RSS + Reddit (비용 $0/월)

스펙의 [3] 병렬 수집 단계를 다음과 같이 수정:

```
[3] 병렬 수집 (Phase 1)
  ├─ Google News RSS (메인 - 전 선수 대상)
  │   └─ "영문명" + 팀명/리그명 조합 검색
  ├─ Reddit .json (보조 - Tier 1-2 선수 대상)
  │   ├─ r/soccer 검색
  │   └─ 팀 서브레딧 검색 + 상위 게시글 댓글 수집
  └─ 개별 미디어 RSS (보조 - 작동 확인된 4개만)
      └─ BBC, Guardian, DW, Daily Sabah
```

**구현 우선순위**:
1. Google News RSS 수집 노드 (전 선수 커버, 가장 높은 ROI)
2. Reddit 검색 + 댓글 수집 노드 (팬 여론 심층 데이터)
3. 개별 미디어 RSS 노드 (보조, 선택적)

### Phase 2: TwitterAPI.io 추가 (비용 ~$5-15/월)

Phase 1 안정화 후 X 수집 추가:

```
[3] 병렬 수집 (Phase 2)
  ├─ Google News RSS (메인)
  ├─ Reddit .json (보조)
  ├─ TwitterAPI.io (보조 - Tier 1-2 선수만)
  │   └─ 선수 티어별 min_faves 차등 적용
  └─ 개별 미디어 RSS (보조)
```

### n8n 워크플로우 노드 구성 (Phase 1 상세)

```
[Schedule Trigger 또는 수동 실행]
  │
  ├─ [Code Node] 대상 선수 목록 + 검색 키워드 로드
  │     └─ playerSearchConfig (이름 변형, 서브레딧, 티어 정보)
  │
  ├─ [Split In Batches] 선수별 반복
  │   │
  │   ├─── [Google News RSS 수집] ─────────────────────────────┐
  │   │   HTTP Request                                         │
  │   │   URL: news.google.com/rss/search?q="영문명"           │
  │   │   Headers: { User-Agent: Browser UA }                  │
  │   │   → Code Node: XML 파싱, <item> 추출                   │
  │   │     (title, link, pubDate, source)                     │
  │   │                                                        │
  │   ├─── [Reddit 검색] ──────────────────────────────────────┤
  │   │   HTTP Request (r/soccer)                              │
  │   │   URL: reddit.com/r/soccer/search.json?q=...&t=day    │
  │   │   → HTTP Request (팀 서브레딧)                          │
  │   │   → Loop: 상위 3-5개 게시글 댓글 수집                    │
  │   │   → Code Node: 정제 (title, score, top_comments)       │
  │   │                                                        │
  │   └─── [Merge Node] ──────────────────────────────────────┘
  │         Reddit + Google News + 매체 데이터 통합
  │
  ├─ [Code Node] 통합 JSON 구성 (GPT 입력 포맷)
  │
  ├─ [HTTP Request] GPT API - 기사 생성
  │     → 3단 구조: 경기요약 / 해외여론 / AI분석
  │
  ├─ [HTTP Request] GPT API - Evidence 차트 데이터
  │
  ├─ [Code Node] 최종 JSON 구성 (article schema)
  │
  └─ [Write File / HTTP Request] Static JSON 저장 또는 Git commit
```

### 선수별 수집 전략 매트릭스

```javascript
const playerSearchConfig = [
  {
    id: 212867,
    nameEn: "Son Heung-min",
    nameKr: "손흥민",
    tier: 1,
    searchQueries: {
      reddit: '"Son Heung-min" OR "Heung-min Son"',
      googleNews: '"Son Heung-min"',
      x: '"Son Heung-min" OR "Heung-min Son" min_faves:10',
    },
    xQueryType: "Top",
    subreddits: ["soccer", "LAFC"],
    collectX: true,  // Phase 2
  },
  {
    id: 1336498,
    nameEn: "Hyeon-Gyu Oh",  // ⚠️ 수정됨 (기존: "Hyun Gyu Oh")
    nameKr: "오현규",
    tier: 1,
    searchQueries: {
      reddit: '"Hyeon-Gyu Oh" OR "Oh Hyeon-Gyu"',
      googleNews: '"Hyeon-Gyu Oh"',
      x: '"Hyeon-Gyu Oh" min_faves:5',
    },
    xQueryType: "Top",
    subreddits: ["soccer", "besiktas"],
    collectX: true,
  },
  {
    id: 828159,
    nameEn: "Kim Min-jae",
    nameKr: "김민재",
    tier: 2,
    searchQueries: {
      reddit: '"Kim Min-jae" OR "Min-jae Kim" OR "Minjae Kim"',
      googleNews: '"Kim Min-jae"',
      x: '"Kim Min-jae" OR "Minjae Kim" min_faves:3',
    },
    xQueryType: "Top",
    subreddits: ["soccer", "fcbayern"],
    collectX: true,
  },
  // ...
  {
    id: 1200000, // 예시
    nameEn: "Bae Jun-Ho",
    nameKr: "배준호",
    tier: 3,
    searchQueries: {
      reddit: '"Bae Jun-Ho" OR "Jun-Ho Bae"',
      googleNews: '"Bae Jun-Ho"',
      x: '"Bae Jun-Ho"',  // 필터 없음
    },
    xQueryType: "Latest",
    subreddits: ["soccer", "StokeCityFC"],
    collectX: false,  // X에서 0건이므로 스킵
  },
  {
    id: 1300000, // 예시
    nameEn: "Hong Hyun-seok",
    nameKr: "홍현석",
    tier: 4,
    searchQueries: {
      reddit: '"Hong Hyun-seok"',
      googleNews: '"Hong Hyun-seok"',
    },
    subreddits: ["soccer", "belgianfootball"],
    collectX: false,  // X/Reddit 모두 0건, RSS만 의존
  },
];
```

---

## 8. 비용 추정 (수정)

### Phase 1 (Google News RSS + Reddit)

| 항목 | 단가 | 월 사용량 | 월 비용 |
|------|------|-----------|---------|
| Reddit | 무료 | - | $0 |
| Google News RSS | 무료 | - | $0 |
| 개별 미디어 RSS | 무료 | - | $0 |
| GPT-4o (기사 생성) | ~$5/1M input | ~30 기사 | ~$5-15 |
| GPT-4o (Evidence) | ~$5/1M input | ~30 기사 | ~$3-8 |
| n8n (self-hosted) | 무료 | - | $0 |
| **Phase 1 합계** | | | **~$8-23/월** |

### Phase 2 (+ TwitterAPI.io)

| 항목 | 추가 비용 |
|------|----------|
| TwitterAPI.io | ~$1-3/월 (Tier 1-2 선수만, ~1,000 트윗) |
| **Phase 2 합계** | **~$9-26/월** |

→ 기존 스펙 예산 범위 ($10-50/월) 내에서 충분히 운영 가능.

---

## 9. 리스크 및 완화 전략

| 리스크 | 확률 | 영향 | 완화 전략 |
|--------|------|------|-----------|
| Reddit rate limit 강화 | 중 | 중 | Google News RSS가 메인이므로 영향 제한적 |
| Google News RSS 차단/변경 | 낮 | 높 | 개별 미디어 RSS fallback + X 강화 |
| TwitterAPI.io 서비스 중단 | 낮 | 낮 | Phase 1은 X 없이 운영 가능 |
| 선수 이름 검색 실패 | 높 | 중 | 30명 전원 이름 변형 사전 검증 필수 |
| GPT API 비용 초과 | 낮 | 중 | GPT-4o-mini fallback ($2-5/월) |
| 수집 데이터 부족 (총 5건 미만) | 중 | 중 | 최소 데이터 기준: Google News 3건 이상이면 기사 생성 진행 |

---

## 10. 다음 단계 (우선순위순)

| 순서 | 작업 | 예상 소요 | 선행 조건 |
|------|------|----------|-----------|
| 1 | **30명 전원 검색 키워드 검증** | 2-3시간 | 없음 |
| 2 | **n8n-opinion-pipeline-spec.md 업데이트** | 1시간 | #1 완료 |
| 3 | **Google News RSS 수집 n8n 노드 구현** | 2-3시간 | #2 완료 |
| 4 | **Reddit 수집 n8n 노드 구현** | 2-3시간 | #2 완료 |
| 5 | **GPT 프롬프트 설계** (기사 생성 + Evidence) | 3-4시간 | #3, #4 완료 |
| 6 | **통합 테스트 (1명 선수 end-to-end)** | 2시간 | #5 완료 |
| 7 | **TwitterAPI.io 노드 추가** (Phase 2) | 1-2시간 | #6 안정화 후 |

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2026-02-24 | v1.0 | 3개 소스 테스트 완료, 종합 제안서 작성 |
