# 선수 검색 레지스트리

> 30명 해외파 선수의 구조화된 검색 데이터. `docs/player-search-registry.md` 기반.
> 최종 검증: 2026-02-24 (Google News RSS + Reddit 실측)

---

## Tier 1 (5명) — 데이터 풍부

### 손흥민

```yaml
id: 212867
fotmobName: "Heung-Min Son"
nameKr: "손흥민"
team: "Los Angeles FC"
league: "MLS"
tier: 1
searchQueries:
  googleNews: '"Son Heung-min" OR "Heung-Min Son"'
  reddit: '"Son Heung-min" OR "Heung-Min Son"'
subreddits: ["soccer", "LAFC"]
falsePositiveRisk: "low"
notes: "Reddit에서 Family-Given순(Son Heung-min)이 압도적"
```

### 김민재

```yaml
id: 828159
fotmobName: "Min-Jae Kim"
nameKr: "김민재"
team: "Bayern Munich"
league: "Bundesliga"
tier: 1
searchQueries:
  googleNews: '"Kim Min-jae" OR "Min-Jae Kim"'
  reddit: '"Kim Min-jae" OR "Min-Jae Kim"'
subreddits: ["soccer", "fcbayern"]
falsePositiveRisk: "medium"
notes: "동명이인 (여배우). X에서 노이즈 있음"
```

### 이강인

```yaml
id: 940976
fotmobName: "Kang-In Lee"
nameKr: "이강인"
team: "PSG"
league: "Ligue 1"
tier: 1
searchQueries:
  googleNews: '"Lee Kang-in" OR "Kang-In Lee"'
  reddit: '"Lee Kang-in" OR "Kang-In Lee"'
subreddits: ["soccer", "psg"]
falsePositiveRisk: "low"
notes: ""
```

### 황희찬

```yaml
id: 620026
fotmobName: "Hee-Chan Hwang"
nameKr: "황희찬"
team: "Wolverhampton"
league: "Premier League"
tier: 1
searchQueries:
  googleNews: '"Hwang Hee-Chan" OR "Hee-Chan Hwang"'
  reddit: '"Hwang Hee-Chan" OR "Hee-Chan Hwang"'
subreddits: ["soccer", "WWFC"]
falsePositiveRisk: "low"
notes: "Reddit에서 FotMob순 0건, 역순 필수"
```

### 오현규

```yaml
id: 1044299
fotmobName: "Hyun Gyu Oh"
nameKr: "오현규"
team: "Besiktas"
league: "Super Lig"
tier: 1
searchQueries:
  googleNews: '"Hyeon-Gyu Oh" OR "Oh Hyeon-Gyu"'
  reddit: '"Hyeon-Gyu Oh" OR "Oh Hyeon-Gyu"'
subreddits: ["soccer", "besiktas"]
falsePositiveRisk: "low"
notes: "CRITICAL: FotMob 이름 'Hyun Gyu Oh'는 GN 9건. 검색 시 반드시 'Hyeon-Gyu Oh' 사용"
```

---

## Tier 2 (11명) — 중간 수준

### 황인범

```yaml
id: 623698
fotmobName: "In-Beom Hwang"
nameKr: "황인범"
team: "Feyenoord"
league: "Eredivisie"
tier: 2
searchQueries:
  googleNews: '"Hwang In-Beom" OR "In-Beom Hwang"'
  reddit: '"Hwang In-Beom" OR "In-Beom Hwang"'
subreddits: ["soccer", "Feyenoord"]
falsePositiveRisk: "low"
notes: ""
```

### 배준호

```yaml
id: 1386482
fotmobName: "Bae Jun-Ho"
nameKr: "배준호"
team: "Stoke City"
league: "Championship"
tier: 2
searchQueries:
  googleNews: '"Bae Jun-Ho" OR "Jun-Ho Bae"'
  reddit: '"Bae Jun-Ho"'
subreddits: ["soccer", "StokeCityFC"]
falsePositiveRisk: "low"
notes: "Reddit/X 데이터 극소. Google News가 유일한 안정 소스"
```

### 양민혁

```yaml
id: 1609329
fotmobName: "Min-Hyeok Yang"
nameKr: "양민혁"
team: "Coventry City"
league: "Championship"
tier: 2
searchQueries:
  googleNews: '"Yang Min-hyeok" OR "Min-Hyeok Yang"'
  reddit: '"Yang Min-hyeok" OR "Min-Hyeok Yang"'
subreddits: ["soccer", "ccfc"]
falsePositiveRisk: "low"
notes: "Reddit 0건. Google News가 주요 소스"
```

### 이재성

```yaml
id: 523749
fotmobName: "Jae-Sung Lee"
nameKr: "이재성"
team: "Mainz 05"
league: "Bundesliga"
tier: 2
searchQueries:
  googleNews: '"Lee Jae-Sung" OR "Jae-Sung Lee"'
  reddit: '"Lee Jae-Sung" OR "Jae-Sung Lee"'
subreddits: ["soccer", "Mainz05"]
falsePositiveRisk: "low"
notes: ""
```

### 조규성

```yaml
id: 1026781
fotmobName: "Gue-Sung Cho"
nameKr: "조규성"
team: "FC Midtjylland"
league: "Superligaen"
tier: 2
searchQueries:
  googleNews: '"Cho Gue-Sung" OR "Gue-Sung Cho"'
  reddit: '"Cho Gue-Sung" OR "Gue-Sung Cho"'
subreddits: ["soccer", "Superligaen"]
falsePositiveRisk: "low"
notes: ""
```

### 홍현석

```yaml
id: 925345
fotmobName: "Hyun-Seok Hong"
nameKr: "홍현석"
team: "KRC Genk"
league: "Belgian Pro League"
tier: 2
searchQueries:
  googleNews: '"Hong Hyun-seok" OR "Hyun-Seok Hong"'
  reddit: '"Hong Hyun-seok" OR "Hyun-Seok Hong"'
subreddits: ["soccer", "belgianfootball"]
falsePositiveRisk: "low"
notes: "GN 8건으로 데이터 적은 편"
```

### 황의조

```yaml
id: 433677
fotmobName: "Ui-Jo Hwang"
nameKr: "황의조"
team: "Alanyaspor"
league: "Super Lig"
tier: 2
searchQueries:
  googleNews: '"Hwang Ui-Jo" OR "Ui-Jo Hwang"'
  reddit: '"Hwang Ui-Jo" OR "Ui-Jo Hwang"'
subreddits: ["soccer", "superlig"]
falsePositiveRisk: "low"
notes: ""
```

### 옌스 카스트로프

```yaml
id: 1185902
fotmobName: "Jens Castrop"
nameKr: "옌스 카스트로프"
team: "Borussia Monchengladbach"
league: "Bundesliga"
tier: 2
searchQueries:
  googleNews: '"Jens Castrop"'
  reddit: '"Jens Castrop"'
subreddits: ["soccer", "fohlenelf"]
falsePositiveRisk: "low"
notes: "독일/영어 이름이므로 순서 이슈 없음"
```

### 정우영

```yaml
id: 949673
fotmobName: "Woo-Yeong Jeong"
nameKr: "정우영"
team: "Union Berlin"
league: "Bundesliga"
tier: 2
searchQueries:
  googleNews: '"Jeong Woo-Yeong" OR "Woo-Yeong Jeong"'
  reddit: '"Woo-Yeong Jeong" OR "Jeong Woo-Yeong"'
subreddits: ["soccer", "UnionBerlin"]
falsePositiveRisk: "low"
notes: ""
```

### 양현준

```yaml
id: 1232560
fotmobName: "Hyun-Jun Yang"
nameKr: "양현준"
team: "Celtic"
league: "Scottish Premiership"
tier: 2
searchQueries:
  googleNews: '"Yang Hyun-Jun" OR "Hyun-Jun Yang"'
  reddit: '"Yang Hyun-Jun" OR "Hyun-Jun Yang"'
subreddits: ["soccer", "CelticFC"]
falsePositiveRisk: "low"
notes: ""
```

### 정상빈

```yaml
id: 1109166
fotmobName: "Sang-Bin Jeong"
nameKr: "정상빈"
team: "St. Louis City"
league: "MLS"
tier: 2
searchQueries:
  googleNews: '"Jeong Sang-Bin" OR "Sang-Bin Jeong"'
  reddit: '"Sang-Bin Jeong" OR "Jeong Sang-bin"'
subreddits: ["soccer", "stlouiscitysc"]
falsePositiveRisk: "low"
notes: "Reddit 0건. Google News가 주요 소스"
```

---

## Tier 3 (7명) — 데이터 적음

### 설영우

```yaml
id: 1132818
fotmobName: "Seol Young-Woo"
nameKr: "설영우"
team: "Crvena Zvezda"
league: "Serbian SuperLiga"
tier: 3
searchQueries:
  googleNews: '"Seol Young-Woo" OR "Young-Woo Seol"'
  reddit: '"Seol Young-Woo"'
subreddits: ["soccer"]
falsePositiveRisk: "medium"
notes: "FP 33%. 팀명(Crvena Zvezda) 추가 시 정확도 향상"
```

### 백승호

```yaml
id: 848102
fotmobName: "Seung-Ho Paik"
nameKr: "백승호"
team: "Birmingham City"
league: "Championship"
tier: 3
searchQueries:
  googleNews: '"Paik Seung-Ho" OR "Seung-Ho Paik"'
  reddit: '"Paik Seung-Ho" OR "Seung-Ho Paik"'
subreddits: ["soccer", "BCFC"]
falsePositiveRisk: "low"
notes: ""
```

### 권혁규

```yaml
id: 1085809
fotmobName: "Hyeok-Kyu Kwon"
nameKr: "권혁규"
team: "SC Paderborn"
league: "2. Bundesliga"
tier: 3
searchQueries:
  googleNews: '"Kwon Hyeok-Kyu" OR "Hyeok-Kyu Kwon"'
  reddit: '"Kwon Hyeok-Kyu" OR "Hyeok-Kyu Kwon"'
subreddits: ["soccer", "2bundesliga"]
falsePositiveRisk: "low"
notes: ""
```

### 김민수

```yaml
id: 1684578
fotmobName: "Min-Su Kim"
nameKr: "김민수"
team: "FC Andorra"
league: "Segunda Division"
tier: 3
searchQueries:
  googleNews: '"Kim Min-Su" OR "Min-Su Kim"'
  reddit: '"Kim Min-Su" OR "Min-Su Kim"'
subreddits: ["soccer"]
falsePositiveRisk: "medium"
notes: "흔한 이름이므로 팀명(FC Andorra) 추가 권장"
```

### 윤도영

```yaml
id: 1613077
fotmobName: "Do-Young Yoon"
nameKr: "윤도영"
team: "PSV"
league: "Eredivisie"
tier: 3
searchQueries:
  googleNews: '"Yoon Do-Young" OR "Do-Young Yoon"'
  reddit: '"Yoon Do-Young" OR "Do-Young Yoon"'
subreddits: ["soccer", "Eredivisie"]
falsePositiveRisk: "low"
notes: "GN 9건으로 데이터 적은 편"
```

### 박승수

```yaml
id: 1656881
fotmobName: "Park Seung-Soo"
nameKr: "박승수"
team: "Newcastle United"
league: "Premier League"
tier: 3
searchQueries:
  googleNews: '"Park Seung-Soo"'
  reddit: '"Park Seung-Soo"'
subreddits: ["soccer", "NUFC"]
falsePositiveRisk: "medium"
notes: "FP 35%. 팀명(Newcastle) 추가 시 정확도 향상"
```

### 엄지성

```yaml
id: 1107283
fotmobName: "Ji-Sung Eom"
nameKr: "엄지성"
team: "Swansea City"
league: "Championship"
tier: 3
searchQueries:
  googleNews: '"Eom Ji-Sung" OR "Ji-Sung Eom"'
  reddit: '"Eom Ji-Sung" OR "Ji-Sung Eom"'
subreddits: ["soccer", "SwanseaCity"]
falsePositiveRisk: "low"
notes: ""
```

---

## Tier 4 (7명) — 데이터 극소

### 이한범

```yaml
id: 1232253
fotmobName: "Han-Beom Lee"
nameKr: "이한범"
team: "FC Nordsjaelland"
league: "Superligaen"
tier: 4
searchQueries:
  googleNews: '"Lee Han-Beom" OR "Han-Beom Lee"'
  reddit: '"Lee Han-Beom" OR "Han-Beom Lee"'
subreddits: ["soccer", "Superligaen"]
falsePositiveRisk: "low"
notes: "GN 12건"
```

### 이태석

```yaml
id: 1107251
fotmobName: "Tae-Seok Lee"
nameKr: "이태석"
team: "Randers FC"
league: "Superligaen"
tier: 4
searchQueries:
  googleNews: '"Lee Tae-Seok" OR "Tae-Seok Lee"'
  reddit: '"Lee Tae-Seok" OR "Tae-Seok Lee"'
subreddits: ["soccer"]
falsePositiveRisk: "low"
notes: "GN 10건"
```

### 이현주

```yaml
id: 1328820
fotmobName: "Hyun-Ju Lee"
nameKr: "이현주"
team: "Arouca"
league: "Liga Portugal"
tier: 4
searchQueries:
  googleNews: '"Lee Hyun-Ju" OR "Hyun-Ju Lee"'
  reddit: '"Lee Hyun-Ju" OR "Hyun-Ju Lee"'
subreddits: ["soccer"]
falsePositiveRisk: "high"
notes: "FP 57%. 팀명(Arouca) 추가 필수"
```

### 김지수

```yaml
id: 1341538
fotmobName: "Ji-Soo Kim"
nameKr: "김지수"
team: "Kaiserslautern"
league: "2. Bundesliga"
tier: 4
searchQueries:
  googleNews: '"Kim Ji-Soo" OR "Ji-Soo Kim"'
  reddit: '"Kim Ji-Soo" OR "Ji-Soo Kim"'
subreddits: ["soccer", "2bundesliga"]
falsePositiveRisk: "high"
notes: "FP 57%. 배우 김지수와 동명이인. 팀명(Kaiserslautern) 추가 필수"
```

### 이영준

```yaml
id: 1238478
fotmobName: "Young-Jun Lee"
nameKr: "이영준"
team: "Grasshopper"
league: "Swiss Super League"
tier: 4
searchQueries:
  googleNews: '"Lee Young-Jun" OR "Young-Jun Lee"'
  reddit: '"Lee Young-Jun" OR "Young-Jun Lee"'
subreddits: ["soccer"]
falsePositiveRisk: "low"
notes: "GN 15건"
```

### 전진우

```yaml
id: 922539
fotmobName: "Jin-Woo Jeon"
nameKr: "전진우"
team: "Grasshopper"
league: "Swiss Super League"
tier: 4
searchQueries:
  googleNews: '"Jeon Jin-Woo" OR "Jin-Woo Jeon"'
  reddit: '"Jeon Jin-Woo" OR "Jin-Woo Jeon"'
subreddits: ["soccer"]
falsePositiveRisk: "low"
notes: ""
```

### 서종민

```yaml
id: 1275290
fotmobName: "Jong-Min Seo"
nameKr: "서종민"
team: "FC Midtjylland"
league: "Superligaen"
tier: 4
searchQueries:
  googleNews: '"Seo Jong-Min" OR "Jong-Min Seo"'
  reddit: '"Seo Jong-Min" OR "Jong-Min Seo"'
subreddits: ["soccer"]
falsePositiveRisk: "high"
notes: "GN 2건 (데이터 최소). 'Jong Seo'는 배우 오염. 팀명(FC Midtjylland) 추가 필수"
```

---

## False Positive 완화 전략

| 위험도 | 선수 | 완화 방법 |
|--------|------|-----------|
| high | 김지수 | 팀명(Kaiserslautern) 추가: `"Kim Ji-Soo" Kaiserslautern football` |
| high | 이현주 | 팀명(Arouca) 추가: `"Hyun-Ju Lee" Arouca football` |
| high | 서종민 | 반드시 full-name + 팀명: `"Seo Jong-Min" FC Midtjylland` |
| medium | 설영우 | 팀명 추가: `"Seol Young-Woo" Crvena Zvezda football` |
| medium | 박승수 | 팀명 추가: `"Park Seung-Soo" Newcastle football` |
| medium | 김민재 | GPT 필터링 (여배우 동명이인) |
| medium | 김민수 | 팀명 추가: `"Min-Su Kim" FC Andorra football` |

## 티어 기준

| 티어 | GN 건수 | Reddit | 수집 전략 |
|------|---------|--------|----------|
| Tier 1 | 85+ | 5+ | 뉴스 + Reddit 전체 수집 |
| Tier 2 | 20-100 | 0-5 | 뉴스 메인 + Reddit 보조 |
| Tier 3 | 8-25 | 0 | 뉴스 단독 (팀명 추가) |
| Tier 4 | 2-15 | 0 | 뉴스 단독 (팀명 추가 필수) |
