import type { Article } from '@/types';

export const mockArticles: Article[] = [
  {
    id: '1',
    title: '"28분 만에 1골 3도움" 손흥민, LAFC 시즌 개막전 폭발 — MLS 팬 반응 총정리',
    subtitle: 'CONCACAF 챔피언스컵 1R: LAFC 6-1 레알 에스파냐',
    summary:
      '손흥민이 LAFC의 2026시즌 첫 공식전에서 전반 28분 만에 1골 3도움을 기록하며 평점 9.6을 받았다. r/MLS에서는 "This guy is genuinely too good for this league"라는 반응이 폭발했다.',
    content: `
## 경기 요약

LAFC가 CONCACAF 챔피언스컵 1라운드 1차전 원정에서 과테말라의 레알 에스파냐를 6-1로 대파했다. 3개월의 오프시즌 공백을 깨고 출전한 손흥민(33세)은 전반 28분 만에 1골 3도움을 몰아치며 62분간 압도적인 존재감을 과시했다. 페널티킥으로 시즌 첫 골을 기록한 뒤 세 차례의 결정적 패스로 팀의 대승을 이끌었다.

## 해외 현지 반응 (AI 요약)

### Reddit r/MLS 반응
- **최다 추천 (5.1k)**: "Son Heung-min just casually dropped a 1G 3A in 62 minutes on his season debut. This guy is genuinely too good for this league."
- **주요 반응 1**: "We are witnessing MLS history. He's making Messi's debut season look normal."
- **주요 반응 2**: "28 minutes. 4 goal contributions. I'm running out of words."

### Reddit r/LAFC 반응
- **최다 추천 (2.3k)**: "I was at the game. The entire stadium was chanting his name by the 30th minute. Sonny is already a legend here."
- **주요 반응**: "Last season 12 goals in 13 games. This season starting with 1G 3A. The MLS is not ready."

### X (Twitter) 반응
- "@LAFC 게시물 리플 분석: 긍정 반응 92%, 중립 6%, 부정 2%"
- **트렌드 키워드**: #SonnyIsBack, #LAFC, #ConcacafChampionsCup
- **대표 반응**: "Son's 2025 MLS season: 12 goals in 13 games. His 2026 debut: 1G 3A in 28 mins. This man is built different."

### 미국 현지 매체
- **ESPN**: "손흥민은 오프시즌 공백이 존재하지 않는 선수다. 데뷔 시즌 MLS 올해의 골 수상에 이어, 2시즌 차는 더 무서울 것이다."
- **The Athletic**: "메시 이후 MLS에 온 가장 임팩트 있는 선수. 다른 차원의 경기 지능."

## AI 분석 요약

손흥민은 62분 출전에서 **1골 3도움**, **패스 성공률 79%**, **찬스 창출 5회**, **경기 평점 9.6(양 팀 2위)**을 기록했다. 2025시즌 13경기 12골 4도움에 이어, 2026시즌 개막전부터 폭발적인 퍼포먼스를 보여주며 MLS 역대 최고 영입의 가치를 다시 한번 증명했다.
    `.trim(),
    playerName: 'Son Heung-min',
    playerNameKr: '손흥민',
    team: 'Los Angeles FC',
    league: 'Major League Soccer',
    matchInfo: 'CONCACAF 챔피언스컵 1R | LAFC 6-1 레알 에스파냐',
    publishedAt: '2026-02-19T03:00:00Z',
    thumbnailUrl: '',
    tags: ['손흥민', 'LAFC', 'MLS', 'CONCACAF'],
    evidence: {
      charts: [
        {
          id: 'son-match-stats',
          title: '경기 주요 지표',
          type: 'bar',
          data: [
            { name: '골', 손흥민: 1, MLS평균: 0.25 },
            { name: '도움', 손흥민: 3, MLS평균: 0.18 },
            { name: '찬스 창출', 손흥민: 5, MLS평균: 1.4 },
            { name: '기대골(xG)', 손흥민: 0.85, MLS평균: 0.32 },
          ],
          dataKeys: ['손흥민', 'MLS평균'],
          colors: ['#d90828', '#94a3b8'],
        },
        {
          id: 'son-radar',
          title: '종합 퍼포먼스 (62분 기준)',
          type: 'radar',
          data: [
            { stat: '슈팅', value: 90 },
            { stat: '패스', value: 78 },
            { stat: '드리블', value: 82 },
            { stat: '창의성', value: 95 },
            { stat: '수비기여', value: 40 },
            { stat: '공중볼', value: 35 },
          ],
          dataKeys: ['value'],
          colors: ['#d90828'],
        },
        {
          id: 'son-sentiment',
          title: '현지 여론 감성 분석',
          type: 'pie',
          data: [
            { name: '긍정', value: 92, fill: '#22c55e' },
            { name: '중립', value: 6, fill: '#94a3b8' },
            { name: '부정', value: 2, fill: '#ef4444' },
          ],
          dataKeys: ['value'],
          colors: ['#22c55e', '#94a3b8', '#ef4444'],
        },
        {
          id: 'son-mls-career',
          title: 'LAFC 합류 후 공격 포인트 누적',
          type: 'line',
          data: [
            { match: '2025 5경기', 공격포인트: 6 },
            { match: '2025 10경기', 공격포인트: 12 },
            { match: '2025 13경기', 공격포인트: 16 },
            { match: '2025 PO', 공격포인트: 16 },
            { match: '2026 개막전', 공격포인트: 20 },
          ],
          dataKeys: ['공격포인트'],
          colors: ['#d90828'],
        },
      ],
      dataRows: [
        {
          label: '경기 평점',
          value: '9.6 / 10.0',
          interpretation:
            '양 팀 전체 출전 선수 중 두 번째로 높은 평점입니다. 62분 출전으로 4개의 공격 포인트를 기록한 압도적인 효율성이 반영되었습니다.',
          source: 'FotMob',
        },
        {
          label: '28분 만에 1골 3도움',
          value: '전반 28분',
          interpretation:
            '경기 시작 28분 만에 1골 3도움을 완성했습니다. MLS 역사상 단일 전반전에 4개 공격 포인트를 기록한 것은 극히 이례적인 기록입니다.',
          source: 'MLS Stats',
        },
        {
          label: '찬스 창출',
          value: '5회 (62분 출전)',
          interpretation:
            '62분 동안 5번의 찬스를 창출했습니다. 90분 환산 시 7.3회로, MLS 경기당 평균(1.4회)의 5배가 넘는 수치입니다.',
          source: 'FotMob',
        },
        {
          label: 'LAFC 통산 기록',
          value: '14경기 13골 7도움',
          interpretation:
            '2025년 8월 토트넘에서 MLS 역대 최고 이적료(2,700만 달러)로 합류한 이후 14경기에서 20개 공격 포인트를 기록 중입니다. 경기당 1.43 공격 포인트는 MLS 역대 최고 수준입니다.',
          source: 'MLS / FotMob',
        },
        {
          label: 'Reddit r/MLS 긍정 반응',
          value: '92%',
          interpretation:
            'r/MLS 경기 후 스레드 상위 100개 댓글 중 92%가 극찬 반응입니다. "too good for MLS" 키워드가 23회 등장하며, MLS 차원이 다른 선수라는 평가가 압도적입니다.',
          source: 'Reddit r/MLS',
        },
      ],
    },
    adCurations: [
      {
        id: 'ad-1',
        type: 'ott',
        title: 'MLS 시즌 패스',
        description: '손흥민의 2026 MLS 시즌 전 경기를 실시간으로. Apple TV MLS 시즌패스.',
        imageUrl: '',
        ctaText: '무료 체험 시작',
        ctaUrl: '#',
        tag: 'OTT 중계',
      },
      {
        id: 'ad-2',
        type: 'merchandise',
        title: 'LAFC 2026 시즌 유니폼',
        description: '손흥민 #7 마킹 LAFC 정품 유니폼. 아디다스 공식 제품.',
        imageUrl: '',
        ctaText: '구매하기',
        ctaUrl: '#',
        tag: '정품 유니폼',
      },
      {
        id: 'ad-3',
        type: 'ticket',
        title: 'LAFC 홈 경기 직관',
        description: 'BMO 스타디움 현장 직관. LA 여행 + 경기 티켓 패키지.',
        imageUrl: '',
        ctaText: '예약하기',
        ctaUrl: '#',
        tag: '직관 티켓',
      },
    ],
  },
  {
    id: '2',
    title: '"대체 불가" 이강인, 47일 만의 복귀전에서 승리 견인 — PSG "판매 불가" 선언',
    subtitle: 'Ligue 1 25/26 20R: PSG vs 스트라스부르 (2-1)',
    summary:
      '47일간의 부상 이탈 후 복귀한 이강인이 수적 열세 상황에서 결승골의 기점 역할을 하며 PSG의 신승을 이끌었다. 루이스 엔리케 감독은 "압박 속 볼 키핑 능력은 대체 불가"라며 극찬했고, PSG는 이강인을 "판매 불가"로 선언했다.',
    content: `
## 경기 요약

PSG가 리그앙 20라운드에서 스트라스부르를 2-1로 꺾었다. 이강인(25세)은 47일 만에 복귀전을 치르며 후반 교체 투입되었다. 10명으로 줄어든 수적 열세 상황에서 이강인은 볼 소유권을 안정시키며 결승골로 이어지는 핵심 패스를 연결했다.

## 해외 현지 반응 (AI 요약)

### Reddit r/psg 반응
- **최다 추천 (2.8k)**: "Kang-In Lee comes back after 47 days out and immediately changes the game. Irreplaceable."
- **주요 반응 1**: "The way he keeps the ball under pressure is genuinely world class. No one else in the squad can do that."
- **주요 반응 2**: "Enrique was right to declare him untouchable. We can't sell this guy."

### 프랑스 현지 매체
- **L'Equipe**: "이강인의 복귀는 PSG에게 선물이다. 수적 열세에서 경기의 흐름을 바꾼 유일한 선수."
- **RMC Sport**: "1월에 아틀레티코가 이강인에게 관심을 보였지만, 엔리케 감독의 강력한 잔류 요청으로 협상이 무산됐다. 정당한 판단이었다."
- **France Football**: "이강인은 PSG의 창의성 그 자체다. 음바페 이후 가장 중요한 공격 자원."

## AI 분석 요약

이강인은 후반 교체 투입(32분 출전)에서 **패스 성공률 91%**, **키패스 3개**, **경기 평점 7.4**를 기록했다. 47일간의 이탈에도 불구하고 즉시 팀의 핵심으로 복귀하며, PSG가 "판매 불가"를 선언한 이유를 증명했다.
    `.trim(),
    playerName: 'Kang-In Lee',
    playerNameKr: '이강인',
    team: 'Paris Saint-Germain',
    league: 'Ligue 1',
    matchInfo: 'Ligue 1 25/26 20R | PSG 2-1 스트라스부르',
    publishedAt: '2026-02-16T11:00:00Z',
    thumbnailUrl: '',
    tags: ['이강인', 'PSG', 'Ligue 1', '복귀전'],
    evidence: {
      charts: [
        {
          id: 'lee-impact',
          title: '복귀전 주요 지표 (32분 출전)',
          type: 'bar',
          data: [
            { name: '패스 성공', 이강인: 21, 팀평균: 28 },
            { name: '키패스', 이강인: 3, 팀평균: 1.2 },
            { name: '압박 회피', 이강인: 5, 팀평균: 2.1 },
            { name: '볼 로스트', 이강인: 1, 팀평균: 3.8 },
          ],
          dataKeys: ['이강인', '팀평균'],
          colors: ['#d90828', '#94a3b8'],
        },
        {
          id: 'lee-sentiment',
          title: '현지 여론 감성 분석',
          type: 'pie',
          data: [
            { name: '긍정', value: 82, fill: '#22c55e' },
            { name: '중립', value: 13, fill: '#94a3b8' },
            { name: '부정', value: 5, fill: '#ef4444' },
          ],
          dataKeys: ['value'],
          colors: ['#22c55e', '#94a3b8', '#ef4444'],
        },
        {
          id: 'lee-season',
          title: '25/26 시즌 출전 경기 평점',
          type: 'line',
          data: [
            { match: '11R', 평점: 7.2 },
            { match: '13R', 평점: 6.8 },
            { match: '15R', 평점: 7.5 },
            { match: '17R', 평점: 7.0 },
            { match: '20R', 평점: 7.4 },
          ],
          dataKeys: ['평점'],
          colors: ['#d90828'],
        },
      ],
      dataRows: [
        {
          label: '경기 평점',
          value: '7.4 / 10.0',
          interpretation:
            '32분 교체 투입임을 감안하면 매우 높은 평점입니다. 투입 직후부터 팀의 볼 소유율이 12%포인트 상승했습니다.',
          source: 'FotMob',
        },
        {
          label: '패스 성공률',
          value: '91% (21/23)',
          interpretation:
            '32분 출전에서 23번의 패스를 시도해 21번 성공시켰습니다. 수적 열세 상황에서 이강인의 볼 키핑이 팀 안정화에 결정적이었습니다.',
          source: 'FotMob',
        },
        {
          label: 'PSG "판매 불가" 선언',
          value: '공식 입장',
          interpretation:
            '1월 이적 시장에서 아틀레티코 마드리드가 이강인에게 관심을 보였으나, PSG는 공식적으로 "판매 불가"를 선언했습니다. 엔리케 감독이 직접 잔류를 요청한 것으로 알려졌습니다.',
          source: 'L\'Equipe / RMC Sport',
        },
        {
          label: '압박 회피 성공',
          value: '5회 (32분 출전)',
          interpretation:
            '상대 프레싱 상황에서 5번 볼을 지켜냈습니다. 90분 환산 14회로, 리그 1 전체 미드필더 중 상위 3%에 해당하는 수치입니다.',
          source: 'FotMob',
        },
      ],
    },
    adCurations: [
      {
        id: 'ad-4',
        type: 'ott',
        title: 'Ligue 1 생중계',
        description: '이강인의 모든 경기를 실시간으로. 리그 1 전 경기 라이브.',
        imageUrl: '',
        ctaText: '무료 체험 시작',
        ctaUrl: '#',
        tag: 'OTT 중계',
      },
      {
        id: 'ad-5',
        type: 'merchandise',
        title: 'PSG 25/26 시즌 홈 유니폼',
        description: '이강인 마킹 정품 유니폼. 나이키 공식 제품.',
        imageUrl: '',
        ctaText: '구매하기',
        ctaUrl: '#',
        tag: '정품 유니폼',
      },
    ],
  },
  {
    id: '3',
    title: '"벤치로 밀려난 김민재" — 바이에른 팬들 사이 갈리는 반응, 이적 가능성 부상',
    subtitle: 'Bundesliga 25/26: 김민재, 2경기 연속 선발 제외',
    summary:
      '바이에른 뮌헨에서 우파메카노-요나탄 타에 밀려 3순위로 내려간 김민재. 뮌헨 단장은 "모두 건강하다"고 밝혔고, 이적료를 3,000만 유로로 낮춰 방출을 시사했다. 독일 팬 반응은 안타까움과 "팀을 위한 결정"으로 갈리고 있다.',
    content: `
## 상황 요약

김민재(29세)가 바이에른 뮌헨에서 입지가 크게 흔들리고 있다. 2월 8일 호펜하임전에서는 경기 스쿼드 명단 자체에서 제외되었고, 2월 12일 라이프치히와의 DFB 포칼 8강전에서는 벤치에만 앉아 경기를 마쳤다. 우파메카노와 레버쿠젠에서 이적한 요나탄 타가 주전 센터백 조합으로 굳어지며, 일본의 이토 히로키에게도 밀리는 상황이다.

## 해외 현지 반응 (AI 요약)

### Reddit r/fcbayern 반응
- **최다 추천 (1.6k)**: "Feel bad for Kim Min-Jae. He gave everything for this club but Upa-Tah partnership is just too good right now."
- **주요 반응 1**: "Unpopular opinion: Kim deserves better than being 3rd choice. He should move to a club where he starts every game."
- **주요 반응 2**: "The squad depth is insane but someone always gets hurt. Kim's time will come."
- **반대 의견**: "Kompany made the right call. Results speak for themselves — 6 clean sheets in the last 8 with Upa-Tah."

### 독일 현지 매체
- **Kicker**: "김민재의 바이에른 시대가 끝나가고 있다. 이적료 3,000만 유로면 많은 빅클럽이 관심을 보일 것."
- **Bild**: "김민재는 여전히 월드클래스 수비수다. 하지만 뮌헨의 현재 시스템에서 우파메카노-타 조합을 깨기 어려워 보인다."
- **Sport1**: "첼시, 맨유, 유벤투스 등 여러 클럽이 김민재에게 관심을 보이고 있다. 여름 이적 시장이 뜨거워질 전망."

## AI 분석 요약

김민재는 25/26 시즌 분데스리가에서 **15경기 출전(선발 11경기)**, **시즌 평균 평점 6.9**를 기록 중이다. 하지만 1월 14일 쾰른전 이후 선발 기회를 잡지 못하고 있으며, 바이에른은 이적료를 5,000만→3,000만 유로(약 470억원)로 낮추며 사실상 방출 의사를 시사했다. 북중미 월드컵을 앞두고 출전 시간 확보가 절실한 상황이다.
    `.trim(),
    playerName: 'Kim Min-Jae',
    playerNameKr: '김민재',
    team: 'Bayern München',
    league: 'Bundesliga',
    matchInfo: '분데스리가 25/26 | 김민재 2경기 연속 선발 제외',
    publishedAt: '2026-02-14T14:00:00Z',
    thumbnailUrl: '',
    tags: ['김민재', '바이에른뮌헨', '분데스리가', '이적설'],
    evidence: {
      charts: [
        {
          id: 'kim-minutes',
          title: '최근 10경기 출전 시간 (분)',
          type: 'bar',
          data: [
            { name: '14R', 출전시간: 90 },
            { name: '16R', 출전시간: 90 },
            { name: '18R', 출전시간: 45 },
            { name: '19R', 출전시간: 90 },
            { name: '20R', 출전시간: 0 },
            { name: '21R', 출전시간: 0 },
            { name: '22R', 출전시간: 15 },
            { name: '포칼', 출전시간: 0 },
          ],
          dataKeys: ['출전시간'],
          colors: ['#d90828'],
        },
        {
          id: 'kim-cb-compare',
          title: '바이에른 센터백 서열 비교 (시즌 평점)',
          type: 'bar',
          data: [
            { name: '우파메카노', 시즌평점: 7.3 },
            { name: '요나탄 타', 시즌평점: 7.1 },
            { name: '김민재', 시즌평점: 6.9 },
            { name: '이토 히로키', 시즌평점: 6.7 },
          ],
          dataKeys: ['시즌평점'],
          colors: ['#94a3b8'],
        },
        {
          id: 'kim-sentiment',
          title: '현지 여론 감성 분석',
          type: 'pie',
          data: [
            { name: '안타까움', value: 45, fill: '#3b82f6' },
            { name: '팀결정 지지', value: 30, fill: '#22c55e' },
            { name: '이적 권유', value: 18, fill: '#f59e0b' },
            { name: '부정', value: 7, fill: '#ef4444' },
          ],
          dataKeys: ['value'],
          colors: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'],
        },
      ],
      dataRows: [
        {
          label: '선발 제외 기간',
          value: '1월 14일 이후 5경기',
          interpretation:
            '쾰른전(1/14) 이후 5경기 연속 선발 명단에서 빠졌습니다. 이 중 2경기는 아예 스쿼드에서 제외되었으며, 콤파니 감독은 "모두 건강하다"고만 답했습니다.',
          source: 'Kicker / Bild',
        },
        {
          label: '이적료 인하',
          value: '5,000만 → 3,000만 유로',
          interpretation:
            '바이에른이 김민재의 이적료를 5,000만 유로에서 3,000만 유로(약 470억원)로 대폭 인하했습니다. 첼시, 맨유, 유벤투스 등이 관심을 보이고 있는 것으로 알려졌습니다.',
          source: 'SPOTV NEWS / Bild',
        },
        {
          label: '센터백 서열',
          value: '3순위 (우파메카노-타 뒤)',
          interpretation:
            '우파메카노-요나탄 타 조합이 최근 8경기에서 6회 클린시트를 기록하며 확고한 1순위로 자리잡았습니다. 김민재는 이토 히로키에게도 밀리며 사실상 4순위까지 내려간 상황입니다.',
          source: 'Kicker',
        },
        {
          label: '월드컵 영향',
          value: '2026 북중미 월드컵 4개월 전',
          interpretation:
            '북중미 월드컵 개막까지 약 4개월 남은 상황에서 출전 시간 부족은 대표팀 컨디션에도 영향을 미칠 수 있습니다. 김민재는 잔류를 선택했지만, 여름 이적 가능성이 높아지고 있습니다.',
          source: 'daum 스포츠',
        },
      ],
    },
    adCurations: [
      {
        id: 'ad-6',
        type: 'ott',
        title: '분데스리가 생중계',
        description: '바이에른 뮌헨과 분데스리가 전 경기 라이브.',
        imageUrl: '',
        ctaText: '무료 체험 시작',
        ctaUrl: '#',
        tag: 'OTT 중계',
      },
    ],
  },
  {
    id: '4',
    title: '"EPL 클럽들이 주목한다" 배준호, FA컵에서 EPL 상대로 득점포 — 스토크 시티 팬 열광',
    subtitle: 'FA Cup 5R: 스토크 시티 vs 브라이턴 (2-3 역전패, 배준호 득점)',
    summary:
      '배준호(22세)가 FA컵에서 EPL 소속 브라이턴을 상대로 시즌 첫 득점을 기록했다. 역전패에도 불구하고 r/StokeCityFC에서는 "Premier League quality"라며 빅리그 이적을 기대하는 반응이 폭발했다.',
    content: `
## 경기 요약

스토크 시티가 FA컵 5라운드에서 프리미어리그 소속 브라이턴과 맞대결했다. 배준호(22세, 등번호 10번)는 전반에 득점을 올리며 2-1 리드를 가져갔으나, 후반에 브라이턴이 역전하며 2-3으로 패했다. 아쉬운 패배에도 배준호의 활약은 EPL 클럽들의 이목을 끌기에 충분했다.

## 해외 현지 반응 (AI 요약)

### Reddit r/StokeCityFC 반응
- **최다 추천 (890)**: "Bae Jun-Ho vs Premier League opposition and he looked like the best player on the pitch. This kid is destined for the top flight."
- **주요 반응 1**: "Wearing the 10 shirt and living up to it. That goal was pure class."
- **주요 반응 2**: "I hate to say it but we won't be able to keep him. EPL clubs will come in big this summer."

### 영국 현지 매체
- **Stoke Sentinel**: "배준호의 FA컵 데뷔골. EPL급 퀄리티를 FA컵 무대에서 증명했다."
- **BBC Sport Championship 리뷰**: "스토크의 10번은 챔피언십에 머무르기엔 너무 좋은 선수다."
- **The Athletic**: "배준호는 2026 여름 이적 시장의 '히든 카드'가 될 수 있다. 대전 하나에서 스토크로, 이제 EPL로의 도약이 임박했다."

## AI 분석 요약

배준호는 이번 경기에서 **1골**, **드리블 성공 3회**, **키패스 2개**, **경기 평점 7.5**를 기록했다. 챔피언십에서 10번을 달고 핵심 선수로 활약하며, 빅리그 이적설이 본격화되고 있다.
    `.trim(),
    playerName: 'Bae Jun-Ho',
    playerNameKr: '배준호',
    team: 'Stoke City',
    league: 'Championship',
    matchInfo: 'FA Cup 5R | 스토크 시티 2-3 브라이턴',
    publishedAt: '2026-02-17T18:00:00Z',
    thumbnailUrl: '',
    tags: ['배준호', '스토크시티', 'FA컵', 'EPL이적설'],
    evidence: {
      charts: [
        {
          id: 'bae-match',
          title: 'FA컵 경기 주요 지표',
          type: 'bar',
          data: [
            { name: '슈팅', 배준호: 3, 경기평균: 1.8 },
            { name: '드리블 성공', 배준호: 3, 경기평균: 1.5 },
            { name: '키패스', 배준호: 2, 경기평균: 1.0 },
            { name: '볼 탈취', 배준호: 2, 경기평균: 1.3 },
          ],
          dataKeys: ['배준호', '경기평균'],
          colors: ['#d90828', '#94a3b8'],
        },
        {
          id: 'bae-season',
          title: '25/26 시즌 공격 포인트 누적',
          type: 'line',
          data: [
            { match: '10R', 공격포인트: 3 },
            { match: '15R', 공격포인트: 5 },
            { match: '20R', 공격포인트: 7 },
            { match: '25R', 공격포인트: 8 },
            { match: 'FA5R', 공격포인트: 9 },
          ],
          dataKeys: ['공격포인트'],
          colors: ['#d90828'],
        },
        {
          id: 'bae-radar',
          title: '종합 퍼포먼스',
          type: 'radar',
          data: [
            { stat: '드리블', value: 82 },
            { stat: '패스', value: 68 },
            { stat: '슈팅', value: 70 },
            { stat: '창의성', value: 75 },
            { stat: '수비기여', value: 55 },
            { stat: '체력', value: 80 },
          ],
          dataKeys: ['value'],
          colors: ['#d90828'],
        },
      ],
      dataRows: [
        {
          label: '경기 평점',
          value: '7.5 / 10.0',
          interpretation: 'EPL급 상대를 만나 팀 내 최고 평점을 기록했습니다. 패배에도 개인 평가는 높았습니다.',
          source: 'FotMob',
        },
        {
          label: 'EPL 상대 득점',
          value: '2026년 첫 골 (FA컵)',
          interpretation: '챔피언십이 아닌 프리미어리그 소속 팀을 상대로 득점하며 빅리그에서도 통할 수 있음을 증명했습니다.',
          source: '조선일보 스포츠',
        },
        {
          label: '이적 시장 관심',
          value: '복수의 EPL 클럽',
          interpretation: '영국 매체들은 배준호가 여름 이적 시장에서 EPL 클럽들의 관심을 받을 것으로 전망합니다. 10번을 달고 팀의 핵심으로 활약 중입니다.',
          source: 'The Athletic / Stoke Sentinel',
        },
      ],
    },
    adCurations: [
      {
        id: 'ad-7',
        type: 'ott',
        title: 'EFL Championship & FA컵 중계',
        description: '배준호의 승격 도전과 컵 대회를 실시간으로.',
        imageUrl: '',
        ctaText: '무료 체험 시작',
        ctaUrl: '#',
        tag: 'OTT 중계',
      },
    ],
  },
  {
    id: '5',
    title: '"또 부상…" 황희찬, 울버햄프턴 강등 위기 속 2주+ 결장 — 팬 반응은 안타까움',
    subtitle: 'EPL 25/26 25R: 울버햄프턴 1-3 첼시 (황희찬 전반 43분 교체)',
    summary:
      '황희찬이 첼시전에서 전반 43분 오른쪽 다리 근육 부상으로 교체되었다. 올 시즌 2번째 종아리 부상으로 최소 2주 결장이 예상되며, 울브스는 최하위(20위, 승점 8)에서 강등 위기에 처해 있다.',
    content: `
## 경기 요약

울버햄프턴이 홈에서 첼시에 1-3으로 패했다. 황희찬(30세)은 선발 출전했으나 전반 43분 오른쪽 다리 근육 통증을 호소하며 교체되었다. 울브스 감독은 경기 후 "최소 2주 이상 빠질 것으로 보인다"고 밝혔다.

## 해외 현지 반응 (AI 요약)

### Reddit r/WWFC 반응
- **최다 추천 (920)**: "Not Hwang again... He's genuinely our only threat going forward and we can't keep him fit. This season is cursed."
- **주요 반응 1**: "24 games, 2 goals, 3 assists — and that's our second-highest scorer. Says everything about this squad."
- **주요 반응 2**: "We're going down. Lost our best attacker for another 2+ weeks. What's even the point."
- **긍정적 의견**: "Hwang's workrate and intelligence are still there. He's one of the few who actually cares. Hope he comes back soon."

### 영국 현지 매체
- **Express & Star**: "황희찬의 부상은 울브스에게 치명타다. 팀 내 두 번째 공격 포인트 보유자의 이탈은 잔류 경쟁에서 큰 타격."
- **BBC Sport**: "울버햄프턴은 시즌 내내 부상에 시달리고 있다. 황희찬의 결장은 강등 확률을 더욱 높인다."
- **스포츠동아**: "울버햄프턴 감독은 '황희찬은 지능적 플레이와 정신력을 겸비한 선수'라며 아쉬움을 표했다."

## AI 분석 요약

황희찬은 25/26 시즌 **24경기 출전, 2골 3도움**을 기록 중이다. 팀 내 두 번째로 많은 공격 포인트지만, 이번 시즌에만 종아리 부상이 2회째다. 울버햄프턴은 20위(승점 8)로 최하위에 머물러 있으며, 에이스의 이탈로 잔류 가능성이 더욱 낮아지고 있다.
    `.trim(),
    playerName: 'Hwang Hee-Chan',
    playerNameKr: '황희찬',
    team: 'Wolverhampton Wanderers',
    league: 'Premier League',
    matchInfo: 'EPL 25/26 25R | 울브스 1-3 첼시',
    publishedAt: '2026-02-12T20:00:00Z',
    thumbnailUrl: '',
    tags: ['황희찬', '울버햄프턴', 'EPL', '부상'],
    evidence: {
      charts: [
        {
          id: 'hwang-season',
          title: '25/26 시즌 부상 타임라인',
          type: 'bar',
          data: [
            { name: '1~8R', 출전경기: 7 },
            { name: '9~12R (1차부상)', 출전경기: 1 },
            { name: '13~20R', 출전경기: 8 },
            { name: '21~24R', 출전경기: 4 },
            { name: '25R (2차부상)', 출전경기: 0.5 },
          ],
          dataKeys: ['출전경기'],
          colors: ['#d90828'],
        },
        {
          id: 'wolves-table',
          title: '울버햄프턴 시즌 성적 추이 (순위)',
          type: 'line',
          data: [
            { match: '5R', 순위: 18 },
            { match: '10R', 순위: 19 },
            { match: '15R', 순위: 20 },
            { match: '20R', 순위: 20 },
            { match: '25R', 순위: 20 },
          ],
          dataKeys: ['순위'],
          colors: ['#ef4444'],
        },
        {
          id: 'hwang-sentiment',
          title: '팬 반응 감성 분석',
          type: 'pie',
          data: [
            { name: '안타까움', value: 55, fill: '#3b82f6' },
            { name: '팀 전체 비판', value: 25, fill: '#ef4444' },
            { name: '회복 응원', value: 15, fill: '#22c55e' },
            { name: '기타', value: 5, fill: '#94a3b8' },
          ],
          dataKeys: ['value'],
          colors: ['#3b82f6', '#ef4444', '#22c55e', '#94a3b8'],
        },
      ],
      dataRows: [
        {
          label: '시즌 기록',
          value: '24경기 2골 3도움',
          interpretation:
            '올 시즌 5개 공격 포인트로 팀 내 2위입니다. 울버햄프턴 공격진 전체의 부진(리그 최소 득점) 속에서 그나마 활약한 선수입니다.',
          source: 'FotMob',
        },
        {
          label: '부상 결장',
          value: '최소 2주 (시즌 2번째 종아리 부상)',
          interpretation:
            '이번 시즌에만 종아리 부상이 2회째입니다. 울버햄프턴 감독은 "지능적 플레이와 정신력을 겸비한 선수라 이탈이 아쉽다"고 밝혔습니다.',
          source: '스포츠동아',
        },
        {
          label: '팀 상황',
          value: '20위 (승점 8) — 강등권',
          interpretation:
            '울버햄프턴은 25라운드 기준 20위(승점 8)로 최하위에 머물러 있습니다. 19위와의 승점 차도 벌어지며, 강등이 현실화되고 있습니다.',
          source: 'Premier League',
        },
        {
          label: '월드컵 영향',
          value: '2026 북중미 월드컵 4개월 전',
          interpretation:
            '반복되는 부상은 북중미 월드컵 대표팀 선발에도 영향을 미칠 수 있습니다. 빠른 회복과 출전 시간 확보가 급선무입니다.',
          source: '머니투데이 스포츠',
        },
      ],
    },
    adCurations: [
      {
        id: 'ad-9',
        type: 'ott',
        title: 'EPL 실시간 중계',
        description: '프리미어리그 전 경기 생중계. 울브스의 잔류 싸움을 지켜보세요.',
        imageUrl: '',
        ctaText: '무료 체험 시작',
        ctaUrl: '#',
        tag: 'OTT 중계',
      },
    ],
  },
];
