---
name: opinion-pipeline
description: >
  KFN 여론 수집 + AI 기사 생성 파이프라인.
  해외파 한국 축구 선수의 경기 후 현지 반응(Reddit, 뉴스 매체)을 수집하고,
  FotMob 스탯을 병합하여 한국어 기사 JSON을 자동 생성합니다.
  Use when: "여론 수집", "기사 생성", "opinion pipeline", "/opinion-pipeline"
---

# KFN Opinion Pipeline

해외파 한국 축구 선수의 경기 후 현지 반응을 수집하고 기사 JSON을 생성하는 파이프라인.

## 호출 형식

```
/opinion-pipeline 오현규
/opinion-pipeline 손흥민 김민재
/opinion-pipeline --tier 1
/opinion-pipeline --dry-run 이강인
```

**인자 파싱 규칙**:
- 한글 선수명: `references/player-registry.md`의 `nameKr` 필드와 매칭
- 영문 선수명: `fotmobName` 필드와 매칭
- `--tier N`: 해당 티어 이하 전원 (1=5명, 2=16명, 3=23명, 4=30명)
- `--dry-run`: 수집만 수행, 기사 생성 스킵 (데이터 확인용)
- 인자 없음: 사용자에게 선수 선택 요청

---

## 워크플로우 개요

```
[1] 선수 선택 (인자 파싱 + 레지스트리 조회)
  → [2] 뉴스 수집 (WebSearch)
  → [3] Reddit 수집 (WebFetch → Arctic Shift API)
  → [4] 스탯 보강 (WebFetch → KFN API)
  → [5] 데이터 충분성 평가
  → [6] 기사 본문 생성 (content + 메타데이터)
  → [6.5] Evidence 생성 (charts + dataRows + sources)
  → [7] QA 검증 (validate-article.mjs + 자체 검토)
  → [8] 파일 출력 (JSON 저장 + 요약)
```

**선수가 여러 명인 경우**: 각 선수에 대해 Step 2-8을 순차 실행.

---

## Step 1: 선수 선택

1. 사용자 인자에서 선수명 또는 `--tier` 플래그 파싱
2. `references/player-registry.md` 읽기 (`Read` 도구)
3. `nameKr` 또는 `fotmobName`으로 선수 매칭
4. 매칭된 선수의 전체 정보(id, team, league, searchQueries, subreddits, tier, falsePositiveRisk) 추출

**매칭 실패 시**: 유사한 이름 제안 + 전체 선수 목록 출력

---

## Step 2: 뉴스 수집 (WebSearch)

선수별 1-2회 WebSearch 호출로 현지 매체 기사 수집.

### 검색 쿼리 구성

```
1차 쿼리 (해당 경기 직접 보도 우선):
  "{player.searchQueries.googleNews}" {opponent team} match
  → 예: "Son Heung-min" OR "Heung-Min Son" Houston Dynamo match

2차 쿼리 (1차 직접 보도 3건 미만 시):
  "{player.searchQueries.googleNews}"
  → 양방향 OR 포함 (예: "Son Heung-min" OR "Heung-Min Son")

FP 고위험(high) 선수: 팀명 추가
  → 예: "Kim Ji-Soo" Kaiserslautern football

보조 검색 (결과 부족 시): "{fotmobName} {team} match reaction"
```

### 리그별 매체 포커스

`references/league-media.md`를 참조하여 해당 리그 현지 매체 기사를 우선 추출.
최소 3개 서로 다른 매체 출처 확보 목표.

### 수집 데이터 구조화 및 관련성 분류

WebSearch 결과에서 다음 정보를 구조화된 메모로 정리하되, **해당 경기 관련성을 반드시 분류**한다:

```
[뉴스1] 제목: {title}
  매체: {outlet}
  URL: {url}
  핵심 내용: {key quote or stat}
  게시일: {date}
  관련성: 직접 | 맥락

[뉴스2] ...
```

**관련성 분류 기준**:
- **직접 보도**: 해당 경기의 결과, 선수 활약, 경기 후 반응을 다룬 기사
- **맥락 보도**: 선수의 시즌 전반, 이적, 다른 경기, 인터뷰 등 해당 경기와 직접 관련 없는 기사

**관련성 필터 규칙**:
- 수집된 기사 중 **직접 보도 최소 2건** 확보 필수
- 직접 보도 2건 미만 시 → 상대팀명/경기 날짜 포함 쿼리로 추가 검색
- 맥락 보도는 직접 보도를 보충하는 용도로만 활용 (단독으로 매체 섹션 구성 불가)

**주의사항**:
- 7일 이내 기사만 수집
- 한국어 소스 제외 (현지 반응 목적)
- 매체명은 구체적으로 명시 (BBC Sport, Kicker 등 — "영국 매체" 같은 일반 표현 금지)

---

## Step 3: Reddit 수집 (WebFetch → Arctic Shift API)

**Tier 1-2 선수만 수집** (Tier 3-4는 역사적으로 0건이므로 스킵).

> **중요**: `www.reddit.com`은 WebFetch 차단 도메인이므로 Reddit .json API를 직접 사용할 수 없다.
> 모든 Reddit 데이터는 **Arctic Shift API** (`arctic-shift.photon-reddit.com`)를 통해 수집한다.

### Arctic Shift API 기본 사항

- **Base URL**: `https://arctic-shift.photon-reddit.com/api`
- **포스트 검색**: `/posts/search`
- **댓글 검색**: `/comments/search`
- **`after` 파라미터**: `YYYY-MM-DD` 또는 Unix epoch (초 단위) 사용. ~~`7d` 같은 상대 시간 미지원~~
- **`query` 파라미터**: title + selftext 검색. 댓글 본문은 별도 `body` 파라미터로 검색
- **응답 구조**: `{ "data": [ ... ] }` — 빈 결과 시 `{ "data": [] }`

### 3a. 포스트 검색 (최대 5회)

7일 전 epoch 타임스탬프를 계산한다:
```
after_epoch = Math.floor(Date.now() / 1000) - 7 * 86400
```

**검색 전략 — 선수명 검색 + 팀명 검색을 병행한다:**

r/soccer 골 스레드 제목 형식은 `[Team1] 0-[1] [Team2] - Scorer minute'`이므로,
선수가 **어시스트만 기록한 경기**에서는 제목에 선수명이 포함되지 않는다.
따라서 선수명 검색만으로는 관련 포스트를 놓칠 수 있어, 팀명 검색을 반드시 병행한다.

```
# 1차: 선수명으로 r/soccer 검색 (득점/직접 언급 포스트)
WebFetch: https://arctic-shift.photon-reddit.com/api/posts/search
  ?query={searchQueries.reddit}
  &subreddit=soccer
  &limit=10
  &after={after_epoch}
  &sort=desc
프롬프트: "Extract all posts from the data array: title, id, score, num_comments, permalink, created_utc."

# 2차: 팀명으로 r/soccer 검색 (어시스트/팀 경기 포스트)
WebFetch: https://arctic-shift.photon-reddit.com/api/posts/search
  ?query={team}
  &subreddit=soccer
  &limit=10
  &after={after_epoch}
  &sort=desc
프롬프트: "Extract all posts: title, id, score, num_comments, permalink, created_utc."

# 3차: 팀 서브레딧에서 검색
WebFetch: https://arctic-shift.photon-reddit.com/api/posts/search
  ?query={player last name}
  &subreddit={팀 서브레딧}
  &limit=10
  &after={after_epoch}
  &sort=desc

# 4차 (결과 부족 시): 팀명+상대팀으로 r/soccer 검색
WebFetch: ...?query={team}+{opponent}&subreddit=soccer&after={after_epoch}&sort=desc

# 5차 (결과 부족 시): 댓글 본문에서 선수명 검색
WebFetch: https://arctic-shift.photon-reddit.com/api/comments/search
  ?body={player last name}
  &subreddit=soccer
  &after={after_epoch}
  &limit=10
  &sort=desc
프롬프트: "Extract comments: body, score, author, link_id. Group by link_id (post)."
→ 발견된 link_id로 해당 포스트 정보를 역추적
```

**포스트 필터링**: 1-2차 결과를 합산 후 중복 제거(id 기준). 선수명이 title에 포함되거나,
해당 선수의 팀 경기 관련 포스트(골, 카드, 매치 스레드)를 선별한다.

응답 JSON에서 추출: `title`, `id`, `score`, `num_comments`, `permalink`, `created_utc`

> **CRITICAL: Reddit URL 구성 시 반드시 `permalink` 필드를 그대로 사용**
> Arctic Shift API 응답의 `permalink` 값(예: `/r/soccer/comments/1rhmkmt/houston_dynamo_0_2_lafc_stephen_eustaquio_82/`)을
> `https://reddit.com` 뒤에 그대로 붙여서 URL을 생성한다.
> 절대 post ID를 기억에 의존하여 URL을 재구성하지 않는다.
> Reddit post ID는 글로벌 고유값이므로, ID가 한 글자라도 틀리면 전혀 무관한 포스트로 연결된다.

### 3b. 댓글 수집 (상위 3-4개 포스트)

score 또는 num_comments 기준 상위 3-4개 포스트 선택 후, Arctic Shift 댓글 API로 수집:

```
WebFetch: https://arctic-shift.photon-reddit.com/api/comments/search
  ?link_id={post_id}
  &limit=10
  &sort=desc
프롬프트: "Extract all comments: body, score, author, author_flair_text. Return structured data sorted by score descending."
```

**주의**: `link_id`에는 `t3_` prefix 없이 순수 post ID만 전달 (예: `1rhmkmt`).

### Rate Limit 대응

- Arctic Shift는 일반 사용량(초당 수 회)에서는 제한 없음
- `X-RateLimit-Remaining` 헤더로 잔여 요청 확인 가능
- 429 반환 시 → 3초 대기 후 1회 재시도, 실패 시 스킵

### 수집 데이터 정리

```
[Reddit 포스트1]
  제목: {title}
  서브레딧: r/{subreddit}
  추천수: {score} | 댓글수: {num_comments}
  URL: https://reddit.com{permalink}
  상위 댓글:
    - "{comment body}" (↑{score}, u/{author})
    - ...

[Reddit 포스트2] ...
```

### 검색 미발견 시 대응

선수명 + 팀명 검색 모두 0건인 경우:
1. `after` 범위를 14일로 확대: `after={Math.floor(Date.now()/1000) - 14*86400}`
2. 댓글 `body` 검색으로 간접 언급 탐색 (5차 검색)
3. 그래도 0건이면 Reddit 데이터 없이 뉴스 데이터만으로 기사 생성 진행

---

## Step 4: 스탯 보강 (WebFetch)

### 프로필 데이터

```
WebFetch: https://korean-football-now.vercel.app/api/player-profile?id={fotmobId}
프롬프트: "Extract key stats: rating, goals, assists, xG, xA, minutes_played, pass_accuracy, tackles, interceptions from this JSON."
```

### 주간 스탯

```
WebFetch: https://korean-football-now.vercel.app/api/player-stats
프롬프트: "Find the player with fotmob_id={fotmobId} and extract: season_matches, season_goals, season_assists, season_rating, recent_matches_json."
```

**API 실패 시**: 스탯 없이 기사 생성 진행 (뉴스/Reddit 데이터만으로).

---

## Step 5: 데이터 충분성 평가

| 티어 | 최소 뉴스 | 최소 Reddit | 부족 시 액션 |
|------|----------|------------|-------------|
| Tier 1 | 3건 | 1건 | WebSearch 쿼리 변형하여 재검색 (최대 2회) |
| Tier 2 | 2건 | 0건 | WebSearch 재검색 1회 |
| Tier 3-4 | 1건 | - | 1건 미만 시 선수 스킵 + 로그 |

**재검색 쿼리 변형**:
- 팀명 추가: `"{player name}" {team} football`
- 매체 한정: `"{player name}" site:{league media site}`
- 기간 확대: `after:7d` → 최근 2주

**모든 재검색 실패 시**: 수집된 데이터만으로 기사 생성 시도. 총 데이터 3건 미만이면 선수 스킵.

---

## Step 6: 기사 생성

수집된 뉴스, Reddit 반응, FotMob 스탯을 기반으로 기사 JSON을 직접 생성한다.

### 저널리즘 페르소나

```
당신은 한국 해외축구 전문 기자입니다.
해외 현지 반응을 정확하게 전달하되 균형 잡힌 시각으로 분석합니다.
출처를 명시하고, 팩트에 기반하며, 감정적 과장을 피합니다.
```

### 기사 구조 규칙

content 마크다운은 반드시 3개 섹션으로 구성:

#### `## 경기 요약`
- 경기 결과, 스코어, 대회/리그명
- 해당 선수의 구체적 활약 (골, 도움, 평점, 출전시간)
- 경기 맥락 (순위, 시즌 흐름)
- 최소 2문단

#### `## 해외 현지 반응 (AI 요약)`

##### `### Reddit 반응`
- 영문 원문 직접 인용 (`>` 블록쿼트 또는 `""` 인라인)
- 서브레딧명 + 추천수 명시
- 한국어 번역/요약 병기
- 인용 시 `[포스트 제목](reddit URL)` 링크 필수
- **CRITICAL**: Reddit URL은 Step 3에서 수집한 `permalink`를 그대로 사용. AI가 post ID를 기억에서 재구성하면 잘못된 포스트로 연결될 수 있음

##### `### 현지 매체`
- 매체명 + 원문 핵심 인용
- 최소 3개 서로 다른 매체 인용
- 매체명에 `[매체명](URL)` 마크다운 링크 필수
- 다국어 원문은 한국어로 번역
- **관련성 기반 배치 규칙**:
  - **직접 보도**(해당 경기 관련)를 먼저 배치 — 최소 2건 필수
  - **맥락 보도**(시즌 전반, 다른 경기, 인터뷰 등)는 "한편," 또는 별도 단락으로 구분하여 보조 정보로 배치
  - 맥락 보도만으로 매체 섹션을 구성하지 않는다
- 좋은 예시: `[Fox Sports](URL)는 이 경기에서 손흥민의 도움을 조명했다. 한편, [Best of Korea](URL)는 시즌 전반의 '손흥민 효과'를 분석했다.`
- 나쁜 예시: 3개 매체 모두 다른 경기/시즌 총평만 인용 (해당 경기 직접 보도 없음)

#### `## AI 분석 요약`
- 수집된 여론 + FotMob 데이터를 교차 분석
- 시즌 맥락에서의 의미
- 향후 전망
- 최소 2문단

### 한국어 표기 규칙

기사 본문(content)에서 한국어 서술 텍스트에 등장하는 **외국 인명/팀명은 반드시 한글로 음차 표기**한다.

**적용 대상**: `## 경기 요약`, `## AI 분석 요약` 등 서술 텍스트
**예외 (영문 유지)**:
- Reddit 포스트 제목 링크: `[Houston Dynamo 0-[2] LAFC - Stephen Eustaquio 82'](...)`
- 영문 원문 직접 인용: `> "He very clearly steps onto Son's Achilles..."`
- 매체 원문 인용: `"Mark Delgado, Son Heung-min lead LAFC to 2-0 victory"`

**음차 표기 예시**:
| 영문 | 한글 |
|------|------|
| Houston Dynamo | 휴스턴 다이나모 |
| Inter Miami | 인터 마이애미 |
| Mark Delgado | 마크 델가도 |
| Denis Bouanga | 드니 부앙가 |
| Stephen Eustaquio | 스테판 에우스타키오 |
| Antonio Carlos | 안토니오 카를로스 |
| Marc Dos Santos | 마르크 도스 산토스 |

**규칙**:
- 한국어 서술문에서 "Houston Dynamo전" ❌ → "휴스턴 다이나모전" ✅
- "Mark Delgado의 선제골" ❌ → "마크 델가도의 선제골" ✅
- 음차 기준: 국립국어원 외래어 표기법 준수, 축구계 관용 표기 우선
- 잘 알려진 선수(메시, 호날두 등)는 관용 표기 사용

### 헤드라인/요약 작성 규칙

**title**:
- 핵심 수치 또는 현지 반응 인용 포함
- **활약 중심 프레이밍**: 선수의 성과와 임팩트를 부각 (피해자 프레이밍 금지)
- 좋은 예시: `"28분 만에 1골 3도움" 손흥민, LAFC 시즌 개막전 폭발`
- 좋은 예시: `"벤치로 밀려난 김민재" — 바이에른 팬들 사이 갈리는 반응`
- 좋은 예시: `"2경기 연속 도움에 2퇴장 유도" 손흥민, MLS 완전 지배`
- 나쁜 예시: `손흥민 좋은 경기` (너무 모호)
- 나쁜 예시: `손흥민, 악성 태클 표적` (피해자 프레이밍 — 선수 활약이 아닌 피해를 강조)

**title 톤 규칙**:
- 퇴장 유발 → "X퇴장 유도 맹활약" (선수의 지배력 부각)
- 부상 위험 태클 → "위협적인 태클에도 경기 지배" (극복 프레이밍)
- 부진한 경기 → 부진 자체보다 맥락과 전망 제시
- "악성 태클", "표적", "희생양" 등 피해자 프레이밍 표현 사용 금지

**summary**:
- 1-2문장. 핵심 수치 + 영문 반응 인용 포함
- 예시: `오현규가 하프타임에 교체된 후, r/besiktas에서는 "He deserved more minutes"라는 반응이 다수...`

### 자연스러운 한국어 표현 규칙

기사에서 어색하거나 과장된 복합 표현을 피하고 자연스러운 한국어를 사용한다.

| 어색한 표현 | 자연스러운 대안 |
|------------|---------------|
| 악성 태클 | 위협적인 태클, 거친 태클, 위험한 태클 |
| 악성 파울 | 거친 파울, 과격한 파울 |
| 악성 부상 | 심각한 부상, 큰 부상 |
| 폭발적 데뷔 | 인상적인 데뷔, 성공적인 데뷔 |
| 압도적 지배 | 경기 지배, 완벽한 지배 |

**원칙**:
- "악성"은 축구 맥락에서 부자연스러운 수식어 — "위협적인", "거친", "위험한"으로 대체
- 과도한 감정 표현 자제 — 데이터와 팩트 기반의 절제된 톤 유지
- 독자가 자연스럽게 읽히는 표현 우선

### 독자 가독성 규칙

기사의 최종 독자는 축구에 관심 있는 일반 팬이다. 데이터 분석 과정에서 사용한 내부 용어나 원시 필드명이 독자에게 노출되지 않도록 한다.

#### 1. FotMob 원시 필드명 노출 금지

content 본문과 evidence(dataRows의 value, interpretation)에서 FotMob API의 원시 필드명을 그대로 노출하지 않는다.

| 금지 (원시 필드명) | 허용 (독자 친화적 표현) |
|-------------------|----------------------|
| `rating_percentile 97.89` | 상위 2.1% |
| `assists_percentile 75.79` | 도움 부문 리그 상위 25% |
| `goals_percentile 76.84` | 득점 부문 리그 상위 23% |
| `attack_xg_difference` | xG 대비 초과 득점 |
| `defense_duel_success_rate` | 듀얼 성공률 |

**규칙**: `_percentile`, `_per90`, `_difference`, `_success_rate` 등 언더스코어가 포함된 FotMob 필드명은 반드시 한국어로 의미를 풀어서 표현한다. percentile 값은 `상위 X%`로 환산하여 표기한다.

#### 2. AI 분석 요약에서 중복 괄호 주석 금지

`## 경기 요약`에서 이미 설명한 기술 용어나 플레이 디테일을 `## AI 분석 요약`에서 괄호로 재설명하지 않는다.

| 금지 (중복 괄호 주석) | 허용 (간결한 참조) |
|---------------------|--------------------|
| `카를로스 퇴장(바이올런트 컨덕트)` | `카를로스 퇴장` |
| `파울로 저지(DOGSO)` | `파울로 퇴장` |
| `동료들의 마무리(델가도 24야드 슛, ...)` | `동료들의 뛰어난 마무리` |

**규칙**: 경기 요약에서 한 번 상세히 서술한 내용은 AI 분석 요약에서 반복하지 않는다. AI 분석 요약은 "왜 중요한지"에 집중하고, "무슨 일이 있었는지"의 반복은 피한다.

#### 3. 전문 약어 사용 기준

| 용어 | 경기 요약 (첫 등장) | AI 분석 요약 (재등장) |
|------|-------------------|---------------------|
| DOGSO | "결정적 득점 기회를 파울로 저지하여 퇴장" (풀어서 설명) | "퇴장" (약어 생략) |
| 바이올런트 컨덕트 | "바이올런트 컨덕트(난폭 행위)로 퇴장" (한 번 설명) | "퇴장" (약어 생략) |
| xG / xA | 사용하지 않음 | "기대골(xG)", "기대도움(xA)" (첫 등장 시 한 번만 한국어 병기) |

**원칙**: 전문 용어는 기사 전체에서 **최초 1회만** 괄호로 설명하고, 이후에는 간결한 표현으로 참조한다.

### 출력 JSON 형식

Step 6은 기사 본문과 메타데이터만 생성한다. Evidence는 Step 6.5에서 별도 생성.

```json
{
  "id": "opinion-{playerNameKr}-{Date.now()}",
  "title": "한글 제목 (수치/인용 포함)",
  "subtitle": "리그/대회 | 경기 정보",
  "summary": "1-2문장 (영문 인용 포함)",
  "content": "## 경기 요약\n\n...\n\n## 해외 현지 반응 (AI 요약)\n\n### Reddit 반응\n\n...\n\n### 현지 매체\n\n...\n\n## AI 분석 요약\n\n...",
  "playerName": "FotMob 영문명",
  "playerNameKr": "한글명",
  "team": "팀명",
  "league": "리그명",
  "matchInfo": "리그명 | 경기 스코어 or 상황 요약",
  "publishedAt": "ISO 8601 (현재 시각)",
  "thumbnailUrl": "",
  "tags": ["선수한글명", "팀한글명", "리그한글명"]
}
```

---

## Step 6.5: Evidence 생성

Step 6에서 생성한 기사 본문과 별도로, 데이터 분석가 관점에서 Evidence(charts, dataRows, sources)를 생성한다.

### 데이터 분석가 페르소나

```
당신은 스포츠 데이터 분석가입니다.
FotMob 통계와 팬 반응 데이터를 교차 분석하여,
일반 팬이 "이 수치가 왜 중요한지"를 바로 이해할 수 있도록 시각화하고 해석합니다.
모든 해석에는 비교 대상(리그 평균, 포지션 상위 %, 직전 시즌)을 포함합니다.
```

### FotMob 필드 활용 가이드 — 포지션별 핵심 지표

현재 0% 활용되는 percentile, per90, xG 관련 필드를 포지션별로 분류하여 차트/dataRow에 사용한다.

| 포지션 | 필수 분석 지표 | FotMob 필드 |
|--------|-------------|------------|
| 공격수(FW) | xG vs 실제 골, 슈팅 효율, 드리블 | `attack_expected_goals`, `attack_xg_difference`, `attack_conversion_rate`, `attack_dribble_success_rate`, `goals_percentile` |
| 미드필더(MF) | 창의성, 패스 정확도, 찬스 창출 | `passing_expected_assists`, `passing_xa_difference`, `passing_key_passes`, `passing_pass_accuracy`, `assists_percentile` |
| 수비수(DF) | 듀얼 성공률, 인터셉트, 공중볼 | `defense_duel_success_rate`, `defense_interceptions`, `defense_aerial_success_rate`, `defense_recoveries`, `rating_percentile` |
| 골키퍼(GK) | (FotMob 필드 제한으로 기본 지표만) | `rating`, `rating_percentile`, `matches` |

### charts (4개, 최소 3가지 타입)

**[필수] 차트 1 — pie: 감성 분석**
- 수집된 Reddit 댓글 + 매체 논조에서 긍정/중립/부정 비율 계산
- 색상: 긍정 `#22c55e`, 중립 `#94a3b8`, 부정 `#ef4444`
- `value` 합계 반드시 100
- `fill` 속성으로 각 항목 색상 지정
```json
{
  "id": "{player}-sentiment",
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

**[필수] 차트 2 — bar: "기대 vs 실제" 비교 (multi-series 활용)**
- xG vs 실제 골, xA vs 실제 도움 2축 비교로 전환
- 예시 data:
```json
{
  "id": "{player}-expected-vs-actual",
  "title": "기대 지표 vs 실제 기록",
  "type": "bar",
  "data": [
    { "name": "골", "실제": 1, "기대(xG)": 0.85 },
    { "name": "도움", "실제": 3, "기대(xA)": 1.2 },
    { "name": "슈팅", "유효슈팅": 4, "전체슈팅": 6 }
  ],
  "dataKeys": ["실제", "기대(xG)"],
  "colors": ["#d90828", "#94a3b8"]
}
```
- 색상: 실제 `#d90828`, 기대 `#94a3b8`

**[필수] 차트 3 — radar: 리그 내 백분위 포지션 (percentile 필수 사용)**
- FotMob percentile 필드를 직접 사용하여 radar 차트 생성
- 포지션별 6개 축:
  - FW: 평점, 득점력, 드리블, 창의성, 슈팅정확도, 수비기여
  - MF: 평점, 패스정확도, 찬스창출, 드리블, 인터셉트, 수비기여
  - DF: 평점, 태클성공률, 인터셉트, 공중볼, 패스정확도, 볼회수
- **필수**: 각 축의 값은 FotMob `_percentile` 필드에서 직접 가져온다 (0-100)
- 선수가 리그 내 어느 수준인지를 한눈에 파악 가능
```json
{
  "id": "{player}-radar",
  "title": "리그 내 포지션 백분위",
  "type": "radar",
  "data": [
    { "stat": "평점", "value": 92 },
    { "stat": "득점력", "value": 88 },
    { "stat": "드리블", "value": 75 },
    { "stat": "창의성", "value": 82 },
    { "stat": "슈팅정확도", "value": 70 },
    { "stat": "수비기여", "value": 45 }
  ],
  "dataKeys": ["value"],
  "colors": ["#d90828"]
}
```

**[선택] 차트 4 — line 또는 bar: 시즌 트렌드 or 경기별 비교**
- `recent_matches_json` 데이터가 있으면 → line 차트 (최근 5경기 평점/xG 추이)
- 없으면 → bar 차트로 시즌 per90 스탯 vs 리그 평균 비교
```json
{
  "id": "{player}-trend",
  "title": "최근 경기 평점 추이",
  "type": "line",
  "data": [
    { "match": "vs TeamA", "평점": 7.2 },
    { "match": "vs TeamB", "평점": 6.8 }
  ],
  "dataKeys": ["평점"],
  "colors": ["#d90828"]
}
```

### dataRows (5-6개, 4가지 유형)

**interpretation 작성 공식**: `수치 → percentile/비교 → 의미 해석 → 팬 반응과의 연결`

| 유형 | 개수 | 패턴 | 예시 |
|------|------|------|------|
| **핵심 수치 분석** | 2개 | FotMob 스탯 + percentile + 의미 | label: "xG 대비 득점 효율", value: "+0.15 (xG 0.85 → 실제 1골)", interpretation: "기대골 대비 +0.15 초과 득점. FotMob 기준 리그 상위 12%에 해당하며, 이는 단순 운이 아닌 마무리 능력의 우수함을 보여준다." |
| **여론-데이터 교차** | 2개 | Reddit/매체 반응 + FotMob 검증 | label: "\"Too good for MLS\" 여론 검증", value: "상위 2.1%", interpretation: "r/MLS의 \"이 리그 수준이 아니다\"라는 반응은 데이터로도 뒷받침된다. FotMob 평점 8.12는 MLS 전체 선수 중 상위 2.1%(rating_percentile)로, 리그 평균 6.5를 크게 상회한다." |
| **포지션 맥락 분석** | 1개 | 같은 포지션 선수 대비 비교 | label: "MLS 공격수 대비 창의성", value: "찬스 창출 5회 (90분 환산 7.3회)", interpretation: "90분 환산 기준 MLS 공격수 평균 찬스 창출(1.4회)의 5배. 토트넘 시절(경기당 2.1회)과 비교해도 확연히 증가한 수치로, 플레이메이커 역할이 확대되었음을 시사한다." |
| **시즌 궤적/전망** | 1개 | 시즌 누적 + 페이스 예측 | label: "시즌 궤적 분석", value: "2경기 0골 2도움", interpretation: "xG 0.98 대비 0골은 표본이 작아 우려할 수준이 아니다. 지난 시즌 같은 시점(2경기 1골)과 유사한 페이스이며, 경기당 공격 포인트 1.0은 역대 MLS 데뷔 시즌 Top 10 수준이다." |

**interpretation 품질 기준**:
- 최소 50자
- 반드시 1개 이상의 비교 대상 포함 (리그 평균, percentile, 직전 시즌, 동포지션 등)
- 단순 수치 나열 금지 — "왜 이 수치가 중요한지" 설명 필수
- FotMob percentile 또는 per90 데이터를 최소 2개 dataRow에서 인용

### sources (6개 이상)

```
- 뉴스 최소 3개 (type: "news")
- Reddit 최소 1개 (type: "reddit") — Reddit 수집 실패 시 0 허용
- FotMob 1개 (type: "data") — sourceUrl에 FotMob 선수 URL 포함
- content 본문에서 인용한 모든 URL 포함
```

### 출력: Step 6 JSON에 evidence 필드 병합

Step 6.5에서 생성한 `evidence` 객체를 Step 6에서 생성한 기사 JSON에 병합하여 최종 Article JSON을 완성한다.

```json
{
  "evidence": {
    "charts": [ /* 위 규칙에 따라 3-4개 */ ],
    "dataRows": [ /* 위 규칙에 따라 5-6개 */ ],
    "sources": [ /* 위 규칙에 따라 6개 이상 */ ]
  }
}
```

---

## Step 7: QA 검증

### 자동 검증 (validate-article.mjs)

생성된 JSON을 파일로 저장 후 검증 스크립트 실행:

```bash
node .claude/skills/kfn-opinion-pipeline/scripts/validate-article.mjs /path/to/article.json
```

**6가지 검증 항목**:
1. SCHEMA: 필수 필드 존재 + 타입 체크
2. CONTENT: 필수 섹션 존재 (`## 경기 요약`, `## 해외 현지 반응`, `## AI 분석 요약`)
3. EVIDENCE: 차트 ≥3개 (pie+bar+radar 필수), 최소 3가지 타입, radar 값 0-100 범위, dataRows ≥4개, interpretation ≥50자, 비교 데이터 키워드(percentile/상위/per90/평균) 포함 dataRow ≥2개
4. KOREAN: 한글 품질 (직역 금지 용어, placeholder 없음)
5. SOURCES: URL 유효성, 마크다운 링크 존재
6. CONSISTENCY: tags에 playerNameKr 포함, id prefix 확인

### 자체 품질 검토

스크립트 통과 후 다음을 자체 확인:
- 축구 용어 직역 없는지 (하단 용어 사전 참조)
- 문장이 자연스러운 한국어인지
- 원문 인용과 번역이 정확한지
- 수치가 FotMob 데이터와 일치하는지
- **[가독성]** content와 evidence에 FotMob 원시 필드명(`_percentile`, `_per90` 등)이 노출되지 않는지
- **[가독성]** AI 분석 요약에서 경기 요약의 플레이 디테일을 괄호로 반복하지 않는지
- **[가독성]** 전문 약어(DOGSO, 바이올런트 컨덕트 등)가 AI 분석 요약에서 불필요하게 재설명되지 않는지
- **[Reddit URL]** content와 evidence.sources의 Reddit URL post ID가 Step 3에서 수집한 `permalink`과 정확히 일치하는지 (AI가 post ID를 재구성하면 무관한 포스트로 연결됨)

### 검증 실패 시

- SCHEMA/CONTENT 실패: 즉시 수정 후 재검증
- EVIDENCE 실패: 차트 데이터 수정 (pie 합계 조정 등)
- KOREAN 실패: 직역 용어 교체 후 재검증
- 2회 재검증 실패 시: 사용자에게 문제 보고

---

## Step 8: 파일 출력

### JSON 저장

검증 통과한 기사를 다음 경로에 저장:

```
kfn-app/src/data/articles/opinion-{playerNameKr}-{timestamp}.json
```

`Write` 도구로 JSON 파일 생성. `articleLoader.ts`가 자동으로 인식하므로 별도 등록 불필요.

### 요약 출력

파일 저장 후 다음 정보를 사용자에게 출력:

```
--- 기사 생성 완료 ---
선수: {playerNameKr} ({fotmobName})
파일: kfn-app/src/data/articles/opinion-{playerNameKr}-{timestamp}.json
QA 점수: {score}/6
수집 소스: 뉴스 {N}건, Reddit {N}건
차트: {N}개 (pie, bar, ...)
---
```

---

## 에러 처리

| 단계 | 에러 유형 | 대응 |
|------|----------|------|
| Step 2 | WebSearch 결과 0건 | 쿼리 변형 재검색 (팀명 추가, 기간 확대) |
| Step 3 | Arctic Shift 빈 결과 | 팀명 검색 병행 + `after` 범위 14일로 확대 + 댓글 `body` 검색 |
| Step 3 | Arctic Shift 타임아웃/에러 | 3초 대기 후 1회 재시도, 실패 시 Reddit 없이 뉴스만으로 진행 |
| Step 3 | 선수명 포스트 0건 | 팀명 검색으로 매치 스레드 탐색 (어시스트 경기는 제목에 선수명 미포함) |
| Step 4 | KFN API 실패 | 스탯 없이 진행 (뉴스/Reddit만으로 기사 생성) |
| Step 5 | 데이터 총 3건 미만 | 선수 스킵 + 사유 로그 |
| Step 7 | QA 2회 실패 | 사용자에게 문제 보고 |

---

## 축구 용어 사전 (직역 금지)

| 올바른 표현 | 잘못된 직역 |
|------------|-----------|
| 바이시클 킥 | 자전거 킥 |
| 프리킥 | 자유 차기 |
| 스루패스 | 관통 패스 |
| 코너킥 | 모서리 차기 |
| 헤딩 | 머리공 |
| 페널티 에어리어 | 벌칙 구역 |
| 골키퍼 | 문지기 |
| 하이라인 | 높은 수비선 |
| VAR | 비디오 판독 |
| 오프사이드 | 위치 위반 |
| 드리블 | 개인기 돌파 |
| 크로스 | 측면 올리기 |
| 인터셉트 | 가로채기 |
| 태클 | 볼 빼앗기 |
| 스로인 | 던져 넣기 |
| 옐로카드 | 노란 딱지 |
| 해트트릭 | 3골 기록 |
| 풀타임 | 90분 종료 |
| 하프타임 | 전반 종료 |
| 리그 | 정규 리그 |

---

## References

- `references/player-registry.md` — 30명 선수 검색 레지스트리
- `references/article-schema.md` — Article JSON 스키마 + 골든 예시
- `references/league-media.md` — 리그별 현지 매체 목록
- `scripts/validate-article.mjs` — QA 검증 스크립트
