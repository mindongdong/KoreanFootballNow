# 선수 검색 키워드 레지스트리

> **문서 상태**: v1.0
> **작성일**: 2026-02-24
> **목적**: 30명 해외파 선수의 소스별 검색 키워드를 실제 테스트 기반으로 확정
> **근거**: Google News RSS + Reddit r/soccer 실측 데이터 (2026-02-24)

---

## 검증 방법론

### 테스트 프로세스

1. **1차 검증**: FotMob 등록 이름으로 Google News RSS / Reddit r/soccer 검색 (30명 전원)
2. **2차 검증**: 결과가 저조한 선수 대상 이름 변형 테스트 (역순, 하이픈 제거, 로마자 변형)
3. **3차 검증**: False positive 의심 선수 대상 `+football OR soccer` 키워드 추가 검색
4. **Reddit 역순 테스트**: 주요 8명 선수 대상 FotMob순(Given-Family) vs Reddit순(Family-Given) 비교

### 핵심 발견

1. **Google News RSS**: FotMob 이름 대부분 유효 (28/30). 오현규만 Critical 수정 필요.
2. **Reddit**: **Family-Given 순서가 일관되게 더 많이 검색됨**. 전 선수 검색 쿼리에 OR로 양방향 포함 필요.
3. **False positive**: 동명이인 리스크가 있는 선수 5명 식별 → 팀/리그명 추가 검색으로 완화.

---

## 검증 결과 요약

### Google News RSS (FotMob 이름 기준)

| # | 선수 | FotMob 이름 | GN 건수 | 상태 | 비고 |
|---|------|------------|---------|------|------|
| 1 | 손흥민 | Heung-Min Son | 92 | OK | |
| 2 | 김민재 | Min-Jae Kim | 100 | OK | |
| 3 | 이강인 | Kang-In Lee | 100 | OK | |
| 4 | 황희찬 | Hee-Chan Hwang | 100 | OK | |
| 5 | 황인범 | In-Beom Hwang | 25 | OK | |
| 6 | 배준호 | Bae Jun-Ho | 100 | OK | |
| 7 | 양민혁 | Min-Hyeok Yang | 42 | OK | |
| 8 | 이재성 | Jae-Sung Lee | 52 | OK | |
| 9 | 조규성 | Gue-Sung Cho | 27 | OK | |
| 10 | 홍현석 | Hyun-Seok Hong | 8 | OK | |
| 11 | 황의조 | Ui-Jo Hwang | 19 | OK | |
| 12 | 설영우 | Seol Young-Woo | 100 | OK | FP 33% |
| 13 | 양현준 | Hyun-Jun Yang | 79 | OK | |
| 14 | 옌스 카스트로프 | Jens Castrop | 97 | OK | |
| 15 | 권혁규 | Hyeok-Kyu Kwon | 16 | OK | |
| 16 | 김민수 | Min-Su Kim | 17 | OK | |
| 17 | **오현규** | **Hyun Gyu Oh** | **9** | **수정 필요** | **Hyeon-Gyu Oh → 85건** |
| 18 | 백승호 | Seung-Ho Paik | 39 | OK | |
| 19 | 정상빈 | Sang-Bin Jeong | 37 | OK | |
| 20 | 정우영 | Woo-Yeong Jeong | 30 | OK | |
| 21 | 윤도영 | Do-Young Yoon | 9 | OK | |
| 22 | 박승수 | Park Seung-Soo | 100 | OK | FP 35% |
| 23 | 엄지성 | Ji-Sung Eom | 21 | OK | |
| 24 | 이한범 | Han-Beom Lee | 12 | OK | |
| 25 | 이태석 | Tae-Seok Lee | 10 | OK | |
| 26 | 이현주 | Hyun-Ju Lee | 22 | OK | FP 57% |
| 27 | 김지수 | Ji-Soo Kim | 58 | OK | FP 57% |
| 28 | 이영준 | Young-Jun Lee | 15 | OK | |
| 29 | 전진우 | Jin-Woo Jeon | 30 | OK | |
| 30 | **서종민** | **Jong-Min Seo** | **2** | **데이터 극소** | Seo Jong-Min → 5건 |

> **GN 건수**: Google News RSS `"이름"` 검색 결과 건수 (최대 100)
> **FP**: False Positive 비율 = 1 - (축구 한정 검색 건수 / 전체 건수)

### Reddit 이름 순서 비교 (주요 8명)

| 선수 | FotMob순 (Given-Family) | Reddit순 (Family-Given) | 배율 |
|------|------------------------|------------------------|------|
| 손흥민 | "Heung-Min Son" → **0건** | "Son Heung-min" → **16건** | ∞ |
| 김민재 | "Min-Jae Kim" → 4건 | "Kim Min-jae" → **9건** | 2.3x |
| 이강인 | "Kang-In Lee" → 2건 | "Lee Kang-in" → **8건** | 4x |
| 황희찬 | "Hee-Chan Hwang" → **0건** | "Hwang Hee-Chan" → **8건** | ∞ |
| 양민혁 | "Min-Hyeok Yang" → 0건 | "Yang Min-hyeok" → 0건 | - |
| 오현규 | "Hyeon-Gyu Oh" → **15건** | "Oh Hyeon-Gyu" → 1건 | 0.07x |
| 배준호 | "Bae Jun-Ho" → 2건 | "Jun-Ho Bae" → 0건 | 0x |
| 정상빈 | "Sang-Bin Jeong" → 0건 | "Jeong Sang-bin" → 0건 | - |

→ **대부분의 선수에서 Family-Given 순서가 우세**. 단, 오현규/배준호는 Given-Family가 더 유효.
→ **결론**: 양방향 OR 검색 필수 (`"Son Heung-min" OR "Heung-Min Son"`)

### 오현규 이름 변형 상세 테스트

| 변형 | Google News | Reddit r/soccer |
|------|-------------|-----------------|
| Hyun Gyu Oh (FotMob) | 9 | 0 |
| **Hyeon-Gyu Oh** | **85** | **4** |
| **Oh Hyeon-Gyu** | **100** | 1 |
| Oh Hyun-gyu | 55 | 0 |
| Hyeongyu Oh | 32 | 0 |

→ **FotMob 이름 "Hyun Gyu Oh"는 사실상 사용 불가. "Hyeon-Gyu Oh"가 정확한 이름.**

---

## 최종 검색 키워드 레지스트리

### n8n 워크플로우용 JavaScript 설정

```javascript
const playerSearchConfig = [
  // ===== Tier 1: 주요 선수 (데이터 풍부) =====
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
    subreddits: ["soccer", "LAFC"],
    falsePositiveRisk: "low",
    notes: "Reddit에서 Family-Given순(Son Heung-min)이 압도적",
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
    subreddits: ["soccer", "fcbayern"],
    falsePositiveRisk: "medium", // 동명이인 (여배우)
    notes: "X에서 동명이인 노이즈 있음. Reddit r/fcbayern에서 0건",
  },
  {
    id: 940976,
    fotmobName: "Kang-In Lee",
    nameKr: "이강인",
    tier: 1,
    searchQueries: {
      googleNews: '"Lee Kang-in" OR "Kang-In Lee"',
      reddit: '"Lee Kang-in" OR "Kang-In Lee"',
      x: '"Lee Kang-in" OR "Kang-in Lee"',
    },
    subreddits: ["soccer", "psg"],
    falsePositiveRisk: "low",
    notes: "",
  },
  {
    id: 620026,
    fotmobName: "Hee-Chan Hwang",
    nameKr: "황희찬",
    tier: 1,
    searchQueries: {
      googleNews: '"Hwang Hee-Chan" OR "Hee-Chan Hwang"',
      reddit: '"Hwang Hee-Chan" OR "Hee-Chan Hwang"',
      x: '"Hwang Hee-Chan" OR "Hee-Chan Hwang"',
    },
    subreddits: ["soccer", "WWFC"],
    falsePositiveRisk: "low",
    notes: "Reddit에서 FotMob순 0건, 역순 필수",
  },
  {
    id: 1044299,
    fotmobName: "Hyun Gyu Oh", // ⚠️ FotMob 이름 부정확
    nameKr: "오현규",
    tier: 1,
    searchQueries: {
      googleNews: '"Hyeon-Gyu Oh" OR "Oh Hyeon-Gyu"',  // FotMob이름 제외
      reddit: '"Hyeon-Gyu Oh" OR "Oh Hyeon-Gyu"',
      x: '"Hyeon-Gyu Oh" min_faves:5',
    },
    subreddits: ["soccer", "besiktas"],
    falsePositiveRisk: "low",
    notes: "⚠️ CRITICAL: FotMob 이름 'Hyun Gyu Oh'는 GN 9건. 'Hyeon-Gyu Oh'가 85건으로 정확한 이름",
  },

  // ===== Tier 2: 중간 수준 선수 =====
  {
    id: 623698,
    fotmobName: "In-Beom Hwang",
    nameKr: "황인범",
    tier: 2,
    searchQueries: {
      googleNews: '"Hwang In-Beom" OR "In-Beom Hwang"',
      reddit: '"Hwang In-Beom" OR "In-Beom Hwang"',
      x: '"Hwang In-Beom" OR "In-Beom Hwang"',
    },
    subreddits: ["soccer", "Feyenoord"],
    falsePositiveRisk: "low",
    notes: "",
  },
  {
    id: 1386482,
    fotmobName: "Bae Jun-Ho",
    nameKr: "배준호",
    tier: 2,
    searchQueries: {
      googleNews: '"Bae Jun-Ho" OR "Jun-Ho Bae"',
      reddit: '"Bae Jun-Ho"',  // 역순 0건이므로 FotMob순만
      x: '"Bae Jun-Ho"',
    },
    subreddits: ["soccer", "StokeCityFC"],
    falsePositiveRisk: "low",
    notes: "Reddit/X 데이터 극소. Google News가 유일한 안정 소스 (100건)",
  },
  {
    id: 1609329,
    fotmobName: "Min-Hyeok Yang",
    nameKr: "양민혁",
    tier: 2,
    searchQueries: {
      googleNews: '"Yang Min-hyeok" OR "Min-Hyeok Yang"',
      reddit: '"Yang Min-hyeok" OR "Min-Hyeok Yang"',
      x: '"Yang Min-hyeok" OR "Min-Hyeok Yang"',
    },
    subreddits: ["soccer", "ccfc"],
    falsePositiveRisk: "low",
    notes: "Reddit 0건. Google News + X가 주요 소스",
  },
  {
    id: 523749,
    fotmobName: "Jae-Sung Lee",
    nameKr: "이재성",
    tier: 2,
    searchQueries: {
      googleNews: '"Lee Jae-Sung" OR "Jae-Sung Lee"',
      reddit: '"Lee Jae-Sung" OR "Jae-Sung Lee"',
      x: '"Lee Jae-Sung" OR "Jae-Sung Lee"',
    },
    subreddits: ["soccer", "Mainz05"],
    falsePositiveRisk: "low",
    notes: "",
  },
  {
    id: 1026781,
    fotmobName: "Gue-Sung Cho",
    nameKr: "조규성",
    tier: 2,
    searchQueries: {
      googleNews: '"Cho Gue-Sung" OR "Gue-Sung Cho"',
      reddit: '"Cho Gue-Sung" OR "Gue-Sung Cho"',
      x: '"Cho Gue-Sung" OR "Gue-Sung Cho"',
    },
    subreddits: ["soccer", "Superligaen"],
    falsePositiveRisk: "low",
    notes: "",
  },
  {
    id: 925345,
    fotmobName: "Hyun-Seok Hong",
    nameKr: "홍현석",
    tier: 2,
    searchQueries: {
      googleNews: '"Hong Hyun-seok" OR "Hyun-Seok Hong"',
      reddit: '"Hong Hyun-seok" OR "Hyun-Seok Hong"',
      x: '"Hong Hyun-seok"',
    },
    subreddits: ["soccer", "belgianfootball"],
    falsePositiveRisk: "low",
    notes: "GN 8건으로 데이터 적은 편",
  },
  {
    id: 433677,
    fotmobName: "Ui-Jo Hwang",
    nameKr: "황의조",
    tier: 2,
    searchQueries: {
      googleNews: '"Hwang Ui-Jo" OR "Ui-Jo Hwang"',
      reddit: '"Hwang Ui-Jo" OR "Ui-Jo Hwang"',
      x: '"Hwang Ui-Jo" OR "Ui-Jo Hwang"',
    },
    subreddits: ["soccer", "superlig"],
    falsePositiveRisk: "low",
    notes: "",
  },
  {
    id: 1185902,
    fotmobName: "Jens Castrop",
    nameKr: "옌스 카스트로프",
    tier: 2,
    searchQueries: {
      googleNews: '"Jens Castrop"',
      reddit: '"Jens Castrop"',
      x: '"Jens Castrop"',
    },
    subreddits: ["soccer", "fohlenelf"],
    falsePositiveRisk: "low",
    notes: "독일/영어 이름이므로 순서 이슈 없음",
  },
  {
    id: 949673,
    fotmobName: "Woo-Yeong Jeong",
    nameKr: "정우영",
    tier: 2,
    searchQueries: {
      googleNews: '"Jeong Woo-Yeong" OR "Woo-Yeong Jeong"',
      reddit: '"Woo-Yeong Jeong" OR "Jeong Woo-Yeong"',
      x: '"Woo-Yeong Jeong" OR "Jeong Woo-Yeong"',
    },
    subreddits: ["soccer", "UnionBerlin"],
    falsePositiveRisk: "low",
    notes: "",
  },
  {
    id: 1232560,
    fotmobName: "Hyun-Jun Yang",
    nameKr: "양현준",
    tier: 2,
    searchQueries: {
      googleNews: '"Yang Hyun-Jun" OR "Hyun-Jun Yang"',
      reddit: '"Yang Hyun-Jun" OR "Hyun-Jun Yang"',
      x: '"Yang Hyun-Jun" OR "Hyun-Jun Yang"',
    },
    subreddits: ["soccer", "CelticFC"],
    falsePositiveRisk: "low",
    notes: "",
  },
  {
    id: 1109166,
    fotmobName: "Sang-Bin Jeong",
    nameKr: "정상빈",
    tier: 2,
    searchQueries: {
      googleNews: '"Jeong Sang-Bin" OR "Sang-Bin Jeong"',
      reddit: '"Sang-Bin Jeong" OR "Jeong Sang-bin"',
      x: '"Sang-Bin Jeong"',
    },
    subreddits: ["soccer", "stlouiscitysc"],
    falsePositiveRisk: "low",
    notes: "Reddit 0건. Google News가 주요 소스",
  },

  // ===== Tier 3: 데이터 적은 선수 =====
  {
    id: 1132818,
    fotmobName: "Seol Young-Woo",
    nameKr: "설영우",
    tier: 3,
    searchQueries: {
      googleNews: '"Seol Young-Woo" OR "Young-Woo Seol"',
      reddit: '"Seol Young-Woo"',
    },
    subreddits: ["soccer"],
    falsePositiveRisk: "medium", // GN 100건 중 67건만 축구 (33% FP)
    notes: "FP 33%. 팀명(Crvena Zvezda) 추가 시 정확도 향상 가능",
  },
  {
    id: 848102,
    fotmobName: "Seung-Ho Paik",
    nameKr: "백승호",
    tier: 3,
    searchQueries: {
      googleNews: '"Paik Seung-Ho" OR "Seung-Ho Paik"',
      reddit: '"Paik Seung-Ho" OR "Seung-Ho Paik"',
    },
    subreddits: ["soccer", "BCFC"],
    falsePositiveRisk: "low",
    notes: "",
  },
  {
    id: 1085809,
    fotmobName: "Hyeok-Kyu Kwon",
    nameKr: "권혁규",
    tier: 3,
    searchQueries: {
      googleNews: '"Kwon Hyeok-Kyu" OR "Hyeok-Kyu Kwon"',
      reddit: '"Kwon Hyeok-Kyu" OR "Hyeok-Kyu Kwon"',
    },
    subreddits: ["soccer", "2bundesliga"],
    falsePositiveRisk: "low",
    notes: "",
  },
  {
    id: 1684578,
    fotmobName: "Min-Su Kim",
    nameKr: "김민수",
    tier: 3,
    searchQueries: {
      googleNews: '"Kim Min-Su" OR "Min-Su Kim"',
      reddit: '"Kim Min-Su" OR "Min-Su Kim"',
    },
    subreddits: ["soccer"],
    falsePositiveRisk: "medium", // 흔한 이름
    notes: "흔한 이름이므로 팀명(FC Andorra) 추가 권장",
  },
  {
    id: 1613077,
    fotmobName: "Do-Young Yoon",
    nameKr: "윤도영",
    tier: 3,
    searchQueries: {
      googleNews: '"Yoon Do-Young" OR "Do-Young Yoon"',
      reddit: '"Yoon Do-Young" OR "Do-Young Yoon"',
    },
    subreddits: ["soccer", "Eredivisie"],
    falsePositiveRisk: "low",
    notes: "GN 9건으로 데이터 적은 편",
  },
  {
    id: 1656881,
    fotmobName: "Park Seung-Soo",
    nameKr: "박승수",
    tier: 3,
    searchQueries: {
      googleNews: '"Park Seung-Soo"',
      reddit: '"Park Seung-Soo"',
    },
    subreddits: ["soccer", "NUFC"],
    falsePositiveRisk: "medium", // GN 100건 중 65건만 축구 (35% FP)
    notes: "FP 35%. 팀명(Newcastle) 추가 시 정확도 향상 가능",
  },
  {
    id: 1107283,
    fotmobName: "Ji-Sung Eom",
    nameKr: "엄지성",
    tier: 3,
    searchQueries: {
      googleNews: '"Eom Ji-Sung" OR "Ji-Sung Eom"',
      reddit: '"Eom Ji-Sung" OR "Ji-Sung Eom"',
    },
    subreddits: ["soccer", "SwanseaCity"],
    falsePositiveRisk: "low",
    notes: "",
  },

  // ===== Tier 4: 데이터 극소 선수 =====
  {
    id: 1232253,
    fotmobName: "Han-Beom Lee",
    nameKr: "이한범",
    tier: 4,
    searchQueries: {
      googleNews: '"Lee Han-Beom" OR "Han-Beom Lee"',
      reddit: '"Lee Han-Beom" OR "Han-Beom Lee"',
    },
    subreddits: ["soccer", "Superligaen"],
    falsePositiveRisk: "low",
    notes: "GN 12건",
  },
  {
    id: 1107251,
    fotmobName: "Tae-Seok Lee",
    nameKr: "이태석",
    tier: 4,
    searchQueries: {
      googleNews: '"Lee Tae-Seok" OR "Tae-Seok Lee"',
      reddit: '"Lee Tae-Seok" OR "Tae-Seok Lee"',
    },
    subreddits: ["soccer"],
    falsePositiveRisk: "low",
    notes: "GN 10건",
  },
  {
    id: 1328820,
    fotmobName: "Hyun-Ju Lee",
    nameKr: "이현주",
    tier: 4,
    searchQueries: {
      googleNews: '"Lee Hyun-Ju" OR "Hyun-Ju Lee"',
      reddit: '"Lee Hyun-Ju" OR "Hyun-Ju Lee"',
    },
    subreddits: ["soccer"],
    falsePositiveRisk: "high", // GN 23건 중 10건만 축구 (57% FP)
    notes: "⚠️ FP 57%. 팀명(Arouca) 추가 필수",
  },
  {
    id: 1341538,
    fotmobName: "Ji-Soo Kim",
    nameKr: "김지수",
    tier: 4,
    searchQueries: {
      googleNews: '"Kim Ji-Soo" OR "Ji-Soo Kim"',
      reddit: '"Kim Ji-Soo" OR "Ji-Soo Kim"',
    },
    subreddits: ["soccer", "2bundesliga"],
    falsePositiveRisk: "high", // GN 58건 중 25건만 축구 (57% FP)
    notes: "⚠️ FP 57%. 배우 김지수와 동명이인. 팀명(Kaiserslautern) 추가 필수",
  },
  {
    id: 1238478,
    fotmobName: "Young-Jun Lee",
    nameKr: "이영준",
    tier: 4,
    searchQueries: {
      googleNews: '"Lee Young-Jun" OR "Young-Jun Lee"',
      reddit: '"Lee Young-Jun" OR "Young-Jun Lee"',
    },
    subreddits: ["soccer"],
    falsePositiveRisk: "low",
    notes: "GN 15건",
  },
  {
    id: 922539,
    fotmobName: "Jin-Woo Jeon",
    nameKr: "전진우",
    tier: 4,
    searchQueries: {
      googleNews: '"Jeon Jin-Woo" OR "Jin-Woo Jeon"',
      reddit: '"Jeon Jin-Woo" OR "Jin-Woo Jeon"',
    },
    subreddits: ["soccer"],
    falsePositiveRisk: "low",
    notes: "",
  },
  {
    id: 1275290,
    fotmobName: "Jong-Min Seo",
    nameKr: "서종민",
    tier: 4,
    searchQueries: {
      googleNews: '"Seo Jong-Min" OR "Jong-Min Seo"',
      reddit: '"Seo Jong-Min" OR "Jong-Min Seo"',
    },
    subreddits: ["soccer"],
    falsePositiveRisk: "high", // "Jong Seo" 검색 시 배우 오염
    notes: "⚠️ GN 2건 (데이터 최소). 'Jong Seo'는 배우 오염 100건. 팀명(FC Midtjylland) 추가 필수",
  },
];
```

---

## 티어 분류 기준

| 티어 | Google News 건수 | Reddit 건수 | X 데이터 | 선수 수 | 수집 전략 |
|------|-----------------|-------------|----------|---------|-----------|
| **Tier 1** | 85+ | 5+ | 풍부 | 5명 | 3소스 전체 수집 |
| **Tier 2** | 20-100 | 0-5 | 일부 가능 | 10명 | GN 메인 + Reddit 보조 |
| **Tier 3** | 8-25 | 0 | 거의 없음 | 7명 | GN 단독 (팀명 추가) |
| **Tier 4** | 2-15 | 0 | 없음 | 8명 | GN 단독 (팀명 추가 필수) |

### 티어별 선수 배정

**Tier 1** (5명): 손흥민, 김민재, 이강인, 황희찬, 오현규
**Tier 2** (10명): 황인범, 배준호, 양민혁, 이재성, 조규성, 홍현석, 황의조, 옌스 카스트로프, 정우영, 양현준, 정상빈
**Tier 3** (7명): 설영우, 백승호, 권혁규, 김민수, 윤도영, 박승수, 엄지성
**Tier 4** (8명): 이한범, 이태석, 이현주, 김지수, 이영준, 전진우, 서종민

---

## False Positive 완화 전략

### 고위험 선수 (FP 50%+)

| 선수 | FP 비율 | 원인 | 완화 방법 |
|------|---------|------|-----------|
| 김지수 | 57% | 배우 동명이인 | `"Ji-Soo Kim" Kaiserslautern OR football` |
| 이현주 | 57% | 흔한 이름 | `"Hyun-Ju Lee" Arouca OR football` |
| 서종민 | 높음 | 배우 "Jong Seo" | 반드시 full-name + 팀명 사용 |

### 중위험 선수 (FP 30-50%)

| 선수 | FP 비율 | 완화 방법 |
|------|---------|-----------|
| 설영우 | 33% | `"Seol Young-Woo" Crvena Zvezda OR football` |
| 박승수 | 35% | `"Park Seung-Soo" Newcastle OR football` |
| 김민재 | 중간 (X) | X 수집 시 football 키워드 추가 |
| 김민수 | 중간 | `"Min-Su Kim" Andorra OR football` |

### n8n 구현 시 권장사항

1. **기본 검색**: `"선수명"` (따옴표 exact match)
2. **FP 위험 선수**: `"선수명" + 팀명 OR 리그명` 추가
3. **GPT 필터링**: 수집 후 GPT에게 축구 관련 여부 1차 필터링 위임
4. **팀명 동적 삽입**: `playerSearchConfig`에서 `team` 필드 참조하여 검색 쿼리에 자동 추가

---

## 스펙 변경 요약

### `n8n-opinion-pipeline-spec.md` 수정 필요사항

1. **검색 키워드 레지스트리** (섹션 8): 이 문서의 `playerSearchConfig`로 전면 교체
2. **오현규 이름**: `"Hyun Gyu Oh"` → `"Hyeon-Gyu Oh"` (Critical)
3. **Reddit 검색 쿼리**: 전 선수 `OR`로 양방향(Given-Family + Family-Given) 포함
4. **FP 완화**: 고위험 선수에 팀명/리그명 추가 검색 로직 명시
5. **서종민**: 데이터 극소(GN 2건) 사실 명시, 기사 생성 스킵 가능성 인지

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2026-02-24 | v1.0 | 30명 전원 검증 완료. Google News RSS + Reddit 실측 기반 레지스트리 확정 |
