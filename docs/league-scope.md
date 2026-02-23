# KFN 추적 리그 범위 정의서

> **문서 버전**: v1.1
> **최종 확정일**: 2026-02-23
> **데이터 기준**: FotMob API (2026-02-23 수집)

## 1. 개요

KoreanFootballNow(KFN) 프로젝트에서 추적하는 해외파 한국인 축구 선수들의 리그 범위를 정의한다.

### 적용 원칙

| 원칙 | 설명 |
|------|------|
| 유럽 리그 | 현재 한국 선수가 소속된 국가의 **1부 + 2부 리그** 필수 포함 |
| 이탈리아 | 현재 소속 선수 없으나 **1부 + 2부 리그** 선제 포함 |
| 잉글랜드 예외 | **Premier League 2** (U21 리저브리그) 추가 포함 |
| 세르비아 예외 | **1부 리그(Super Liga)만** 포함 (FotMob에서 2부 미지원) |
| 미국 | **1부 리그(MLS)만** 포함 |

### 요약

- **총 15개국 / 29개 리그 / 514개 팀** (FotMob API 기준)
- 유럽 14개국: 27개 리그 (1부 14 + 2부 13) + 잉글랜드 U21 1개 = **28개 리그**
- 비유럽 1개국: **1개 리그**

---

## 2. 유럽 리그 (14개국 / 28개 리그)

### 2.1 잉글랜드 (3개 리그)

| 구분 | FotMob 리그명 | 한글 리그명 | 팀 수 | 비고 |
|------|---------------|-------------|-------|------|
| 1부 | Premier League | 프리미어리그 | 20 | |
| 2부 | Championship | 챔피언십 | 24 | |
| U21 | Premier League 2 | 프리미어리그 2 | 29 | 잉글랜드 한정 예외 |

### 2.2 독일 (2개 리그)

| 구분 | FotMob 리그명 | 한글 리그명 | 팀 수 | 비고 |
|------|---------------|-------------|-------|------|
| 1부 | Bundesliga | 분데스리가 | 18 | |
| 2부 | 2. Bundesliga | 2. 분데스리가 | 18 | |

### 2.3 프랑스 (2개 리그)

| 구분 | FotMob 리그명 | 한글 리그명 | 팀 수 | 비고 |
|------|---------------|-------------|-------|------|
| 1부 | Ligue 1 | 리그 1 | 18 | |
| 2부 | Ligue 2 | 리그 2 | 18 | |

### 2.4 스페인 (2개 리그)

| 구분 | FotMob 리그명 | 한글 리그명 | 팀 수 | 비고 |
|------|---------------|-------------|-------|------|
| 1부 | LaLiga | 라리가 | 20 | |
| 2부 | LaLiga2 | 라리가2 | 22 | |

### 2.5 이탈리아 (2개 리그)

| 구분 | FotMob 리그명 | 한글 리그명 | 팀 수 | 비고 |
|------|---------------|-------------|-------|------|
| 1부 | Serie A | 세리에 A | 20 | 신규 추가 (선제 포함) |
| 2부 | Serie B | 세리에 B | 20 | 신규 추가 (선제 포함) |

### 2.6 네덜란드 (2개 리그)

| 구분 | FotMob 리그명 | 한글 리그명 | 팀 수 | 비고 |
|------|---------------|-------------|-------|------|
| 1부 | Eredivisie | 에레디비시 | 18 | |
| 2부 | Eerste Divisie | 에르스터 디비시 | 20 | |

### 2.7 스코틀랜드 (2개 리그)

| 구분 | FotMob 리그명 | 한글 리그명 | 팀 수 | 비고 |
|------|---------------|-------------|-------|------|
| 1부 | Premiership | 스코티시 프리미어십 | 12 | |
| 2부 | Scottish Championship | 스코티시 챔피언십 | 10 | |

### 2.8 튀르키예 (2개 리그)

| 구분 | FotMob 리그명 | 한글 리그명 | 팀 수 | 비고 |
|------|---------------|-------------|-------|------|
| 1부 | Super Lig | 쉬페르리그 | 18 | |
| 2부 | 1. Lig | TFF 1. 리그 | 20 | |

### 2.9 벨기에 (2개 리그)

| 구분 | FotMob 리그명 | 한글 리그명 | 팀 수 | 비고 |
|------|---------------|-------------|-------|------|
| 1부 | Belgian Pro League | 벨기에 프로리그 | 16 | |
| 2부 | Challenger Pro League | 챌린저 프로리그 | 17 | |

### 2.10 덴마크 (2개 리그)

| 구분 | FotMob 리그명 | 한글 리그명 | 팀 수 | 비고 |
|------|---------------|-------------|-------|------|
| 1부 | Superligaen | 수페르리가엔 | 12 | |
| 2부 | NordicBet Liga | 노르딕벳 리가 | 12 | |

### 2.11 포르투갈 (2개 리그)

| 구분 | FotMob 리그명 | 한글 리그명 | 팀 수 | 비고 |
|------|---------------|-------------|-------|------|
| 1부 | Liga Portugal | 리가 포르투갈 | 18 | |
| 2부 | Liga Portugal 2 | 리가 포르투갈 2 | 18 | |

### 2.12 스위스 (2개 리그)

| 구분 | FotMob 리그명 | 한글 리그명 | 팀 수 | 비고 |
|------|---------------|-------------|-------|------|
| 1부 | Super League | 스위스 슈퍼리그 | 12 | |
| 2부 | Challenge League | 챌린지리그 | 10 | |

### 2.13 세르비아 (1개 리그)

| 구분 | FotMob 리그명 | 한글 리그명 | 팀 수 | 비고 |
|------|---------------|-------------|-------|------|
| 1부 | Super Liga | 세르비아 슈퍼리가 | 16 | FotMob에서 2부(Prva Liga) 미지원으로 1부만 포함 |

### 2.14 오스트리아 (2개 리그)

| 구분 | FotMob 리그명 | 한글 리그명 | 팀 수 | 비고 |
|------|---------------|-------------|-------|------|
| 1부 | Austrian Bundesliga | 오스트리아 분데스리가 | 12 | |
| 2부 | 2. Liga | 2. 리가 | 16 | |

---

## 3. 비유럽 리그 (1개국 / 1개 리그)

### 3.1 미국 (1개 리그)

| 구분 | FotMob 리그명 | 한글 리그명 | 팀 수 | 비고 |
|------|---------------|-------------|-------|------|
| 1부 | Major League Soccer | 메이저리그 사커 | 30 | 1부만 포함 |

---

## 4. 전체 리그 요약 테이블

| # | 국가 | 1부 리그 | 2부 리그 | 기타 | 리그 수 | 팀 수 |
|---|------|----------|----------|------|---------|-------|
| 1 | 잉글랜드 | Premier League | Championship | Premier League 2 | 3 | 73 |
| 2 | 독일 | Bundesliga | 2. Bundesliga | - | 2 | 36 |
| 3 | 프랑스 | Ligue 1 | Ligue 2 | - | 2 | 36 |
| 4 | 스페인 | LaLiga | LaLiga2 | - | 2 | 42 |
| 5 | 이탈리아 | Serie A | Serie B | - | 2 | 40 |
| 6 | 네덜란드 | Eredivisie | Eerste Divisie | - | 2 | 38 |
| 7 | 스코틀랜드 | Premiership | Scottish Championship | - | 2 | 22 |
| 8 | 튀르키예 | Super Lig | 1. Lig | - | 2 | 38 |
| 9 | 벨기에 | Belgian Pro League | Challenger Pro League | - | 2 | 33 |
| 10 | 덴마크 | Superligaen | NordicBet Liga | - | 2 | 24 |
| 11 | 포르투갈 | Liga Portugal | Liga Portugal 2 | - | 2 | 36 |
| 12 | 스위스 | Super League | Challenge League | - | 2 | 22 |
| 13 | 세르비아 | Super Liga | - | - | 1 | 16 |
| 14 | 오스트리아 | Austrian Bundesliga | 2. Liga | - | 2 | 28 |
| 15 | 미국 | Major League Soccer | - | - | 1 | 30 |
| | **합계** | **15** | **13** | **1** | **29** | **514** |

---

## 5. 현재 추적 선수 현황 (2026-02-23 기준)

아래는 데이터 수집 시점 기준 추적 중인 해외파 한국 선수 30명이다.

| 선수명 | 영문명 | 소속팀 | 리그 | 포지션 |
|--------|--------|--------|------|--------|
| 손흥민 | Heung-Min Son | Los Angeles FC | Major League Soccer | Striker |
| 이강인 | Kang-In Lee | Paris Saint-Germain | Ligue 1 | Central Midfielder |
| 김민재 | Min-Jae Kim | Bayern Munchen | Bundesliga | Center Back |
| 황희찬 | Hee-Chan Hwang | Wolverhampton Wanderers | Premier League | Striker |
| 이재성 | Jae-Sung Lee | Mainz 05 | Bundesliga | Central Midfielder |
| 황인범 | In-Beom Hwang | Feyenoord | Eredivisie | Central Midfielder |
| 조규성 | Gue-Sung Cho | FC Midtjylland | Superligaen | Striker |
| 정우영 | Woo-Yeong Jeong | Union Berlin | Bundesliga | Attacking Midfielder |
| 양현준 | Hyun-Jun Yang | Celtic | Premiership | Left Back |
| 홍현석 | Hyun-Seok Hong | Gent | Belgian Pro League | Attacking Midfielder |
| 오현규 | Hyun Gyu Oh | Besiktas | Super Lig | Striker |
| 황의조 | Ui-Jo Hwang | Alanyaspor | Super Lig | Striker |
| 배준호 | Bae Jun-Ho | Stoke City | Championship | Central Midfielder |
| 양민혁 | Min-Hyeok Yang | Coventry City | Championship | Right Winger |
| 백승호 | Seung-Ho Paik | Birmingham City | Championship | Attacking Midfielder |
| 엄지성 | Ji-Sung Eom | Swansea City | Championship | Right Winger |
| 전진우 | Jin-Woo Jeon | Oxford United | Championship | Central Midfielder |
| 옌스 카스트로프 | Jens Castrop | Borussia Monchengladbach | Bundesliga | Central Midfielder |
| 이태석 | Tae-Seok Lee | Austria Wien | Bundesliga | Left Midfielder |
| 정상빈 | Sang-Bin Jeong | St. Louis City | Major League Soccer | Left Winger |
| 권혁규 | Hyeok-Kyu Kwon | Karlsruher SC | 2. Bundesliga | Right Back |
| 김지수 | Ji-Soo Kim | Kaiserslautern | 2. Bundesliga | Center Back |
| 설영우 | Seol Young-Woo | FK Crvena Zvezda | Super Liga | Central Midfielder |
| 이현주 | Hyun-Ju Lee | Arouca | Liga Portugal | Left Winger |
| 이영준 | Young-Jun Lee | Grasshopper | Super League | Central Midfielder |
| 김민수 | Min-Su Kim | FC Andorra | LaLiga2 | Center Back |
| 서종민 | Jong-Min Seo | First Vienna FC | 2. Liga | Striker |
| 윤도영 | Do-Young Yoon | FC Dordrecht | Eerste Divisie | Right Back |
| 박승수 | Park Seung-Soo | Newcastle United U21 | Premier League 2 | Striker |
| 이한범 | Han-Beom Lee | FC Midtjylland | Superligaen | Attacking Midfielder |

---

## 6. 후속 작업

이 문서에서 확정된 리그 범위를 기반으로 다음 작업을 진행한다.

- [x] **29개 리그, 514개 팀의 FotMob 팀 데이터 수집 완료**
  - `docs/league-teams-fotmob.csv` 생성 (FotMob API 기준)
  - 팀명, FotMob 리그 ID, FotMob 팀 ID 포함
- [x] **514개 팀의 한글 팀명 매핑 데이터 구축 완료**
  - `docs/league-teams-fotmob.csv`에 `team_name_kr` 컬럼 추가
  - 15개국 29개 리그 514개 팀 전체 한글명 매핑 완료
- [ ] **FotMob 리그명 검증**
  - 각 리그의 FotMob 내부 리그명이 실제 API/스크래핑 데이터와 일치하는지 확인
  - 시즌별 리그명 변경 가능성 모니터링 (스폰서명 변경 등)
- [ ] **승강격 반영 프로세스 정의**
  - 매 시즌 종료 후 승강격에 따른 팀 목록 업데이트 절차

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2026-02-23 | v1.0 | 최초 작성 - 15개국 30개 리그 범위 확정 |
| 2026-02-23 | v1.1 | 세르비아 2부(Prva Liga) 제외 (FotMob 미지원), FotMob API 실제 팀 수 반영 → 29개 리그 514팀 |
