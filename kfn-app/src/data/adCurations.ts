import type { AdCuration } from '@/types/article';

/**
 * 선수별 광고 큐레이션 중앙 관리
 * - ott: 해당 리그 국내 중계 플랫폼 (없으면 항목 자체를 생략)
 * - merchandise: 소속 클럽 공식 온라인 스토어
 *
 * 기사 JSON에 포함하지 않음. ArticleView에서 playerNameKr로 자동 조회.
 * 선수 이적 시 이 파일만 수정하면 해당 선수 전체 기사에 반영됨.
 *
 * 국내 중계 현황 (2025-26 시즌):
 *   Apple TV+  — MLS 전 세계 독점
 *   쿠팡플레이 — EPL, 분데스리가, 리그앙, EFL 챔피언십, 라리가(1·2부) 독점
 *   미중계     — 에레디비지에(+하위 디비전), 덴마크 슈퍼리가, 쉬페르리그, 세르비아·스코틀랜드·
 *                벨기에·오스트리아·포르투갈·스위스·폴란드 리그
 */
export const playerAdCurations: Record<string, AdCuration[]> = {

  // ── MLS ─────────────────────────────────────────────────────────────────

  손흥민: [
    {
      id: 'ad-손흥민-ott',
      type: 'ott',
      title: 'Apple TV+ MLS Season Pass',
      description: '손흥민의 LAFC 전 경기 생중계. MLS 공식 독점 스트리밍.',
      imageUrl: '',
      ctaText: '지금 시청하기',
      ctaUrl: 'https://tv.apple.com/kr/sports',
      tag: 'OTT 중계',
    },
    {
      id: 'ad-손흥민-shop',
      type: 'merchandise',
      title: 'LAFC 공식 온라인 스토어',
      description: '손흥민 마킹 LAFC 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://www.mlsstore.com/en/lafc/jerseys/t-14459150+d-92661937+z-985-140885874',
      tag: '공식 스토어',
    },
  ],

  정상빈: [
    {
      id: 'ad-정상빈-ott',
      type: 'ott',
      title: 'Apple TV+ MLS Season Pass',
      description: '정상빈의 St. Louis City 전 경기 생중계. MLS 공식 독점 스트리밍.',
      imageUrl: '',
      ctaText: '지금 시청하기',
      ctaUrl: 'https://tv.apple.com/kr/sports',
      tag: 'OTT 중계',
    },
    {
      id: 'ad-정상빈-shop',
      type: 'merchandise',
      title: 'St. Louis City SC 공식 온라인 스토어',
      description: '정상빈 마킹 St. Louis City 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://store.stlouiscitysc.com',
      tag: '공식 스토어',
    },
  ],

  정호연: [
    {
      id: 'ad-정호연-ott',
      type: 'ott',
      title: 'Apple TV+ MLS Season Pass',
      description: '정호연의 Minnesota United 전 경기 생중계. MLS 공식 독점 스트리밍.',
      imageUrl: '',
      ctaText: '지금 시청하기',
      ctaUrl: 'https://tv.apple.com/kr/sports',
      tag: 'OTT 중계',
    },
    {
      id: 'ad-정호연-shop',
      type: 'merchandise',
      title: 'Minnesota United 공식 온라인 스토어',
      description: '정호연 마킹 Minnesota United 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://store.mnufc.com',
      tag: '공식 스토어',
    },
  ],

  // ── Premier League ───────────────────────────────────────────────────────

  황희찬: [
    {
      id: 'ad-황희찬-ott',
      type: 'ott',
      title: '쿠팡플레이 프리미어리그 생중계',
      description: '황희찬의 울버햄프턴 전 경기 생중계. EPL 국내 독점 스트리밍.',
      imageUrl: '',
      ctaText: '지금 시청하기',
      ctaUrl: 'https://www.coupangplay.com/sports',
      tag: 'OTT 중계',
    },
    {
      id: 'ad-황희찬-shop',
      type: 'merchandise',
      title: '울버햄프턴 공식 온라인 스토어',
      description: '황희찬 마킹 울버햄프턴 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://shop.wolves.co.uk',
      tag: '공식 스토어',
    },
  ],

  // ── EFL Championship ─────────────────────────────────────────────────────

  배준호: [
    {
      id: 'ad-배준호-ott',
      type: 'ott',
      title: '쿠팡플레이 EFL 챔피언십 생중계',
      description: '배준호의 스토크 시티 전 경기 생중계. 챔피언십 국내 독점 스트리밍.',
      imageUrl: '',
      ctaText: '지금 시청하기',
      ctaUrl: 'https://www.coupangplay.com/sports',
      tag: 'OTT 중계',
    },
    {
      id: 'ad-배준호-shop',
      type: 'merchandise',
      title: '스토크 시티 공식 온라인 스토어',
      description: '배준호 마킹 스토크 시티 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://store.stokecityfc.com',
      tag: '공식 스토어',
    },
  ],

  양민혁: [
    {
      id: 'ad-양민혁-ott',
      type: 'ott',
      title: '쿠팡플레이 EFL 챔피언십 생중계',
      description: '양민혁의 코번트리 시티 전 경기 생중계. 챔피언십 국내 독점 스트리밍.',
      imageUrl: '',
      ctaText: '지금 시청하기',
      ctaUrl: 'https://www.coupangplay.com/sports',
      tag: 'OTT 중계',
    },
    {
      id: 'ad-양민혁-shop',
      type: 'merchandise',
      title: '코번트리 시티 공식 온라인 스토어',
      description: '양민혁 마킹 코번트리 시티 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://shop.ccfc.co.uk',
      tag: '공식 스토어',
    },
  ],

  백승호: [
    {
      id: 'ad-백승호-ott',
      type: 'ott',
      title: '쿠팡플레이 EFL 챔피언십 생중계',
      description: '백승호의 버밍엄 시티 전 경기 생중계. 챔피언십 국내 독점 스트리밍.',
      imageUrl: '',
      ctaText: '지금 시청하기',
      ctaUrl: 'https://www.coupangplay.com/sports',
      tag: 'OTT 중계',
    },
    {
      id: 'ad-백승호-shop',
      type: 'merchandise',
      title: '버밍엄 시티 공식 온라인 스토어',
      description: '백승호 마킹 버밍엄 시티 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://shop.bcfc.com',
      tag: '공식 스토어',
    },
  ],

  엄지성: [
    {
      id: 'ad-엄지성-ott',
      type: 'ott',
      title: '쿠팡플레이 EFL 챔피언십 생중계',
      description: '엄지성의 스완지 시티 전 경기 생중계. 챔피언십 국내 독점 스트리밍.',
      imageUrl: '',
      ctaText: '지금 시청하기',
      ctaUrl: 'https://www.coupangplay.com/sports',
      tag: 'OTT 중계',
    },
    {
      id: 'ad-엄지성-shop',
      type: 'merchandise',
      title: '스완지 시티 공식 온라인 스토어',
      description: '엄지성 마킹 스완지 시티 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://shop.swanseacity.com',
      tag: '공식 스토어',
    },
  ],

  전진우: [
    {
      id: 'ad-전진우-ott',
      type: 'ott',
      title: '쿠팡플레이 EFL 챔피언십 생중계',
      description: '전진우의 옥스퍼드 유나이티드 전 경기 생중계. 챔피언십 국내 독점 스트리밍.',
      imageUrl: '',
      ctaText: '지금 시청하기',
      ctaUrl: 'https://www.coupangplay.com/sports',
      tag: 'OTT 중계',
    },
    {
      id: 'ad-전진우-shop',
      type: 'merchandise',
      title: '옥스퍼드 유나이티드 공식 온라인 스토어',
      description: '전진우 마킹 옥스퍼드 유나이티드 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://shop.oufc.co.uk',
      tag: '공식 스토어',
    },
  ],

  // ── Bundesliga ───────────────────────────────────────────────────────────

  김민재: [
    {
      id: 'ad-김민재-ott',
      type: 'ott',
      title: '쿠팡플레이 분데스리가 생중계',
      description: '김민재의 바이에른 뮌헨 전 경기 생중계. 국내 유일 분데스리가 독점 스트리밍.',
      imageUrl: '',
      ctaText: '지금 시청하기',
      ctaUrl: 'https://www.coupangplay.com/sports',
      tag: 'OTT 중계',
    },
    {
      id: 'ad-김민재-shop',
      type: 'merchandise',
      title: 'FC 바이에른 뮌헨 공식 온라인 스토어',
      description: '김민재 마킹 바이에른 뮌헨 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://fcbayern.com/store/en-zz',
      tag: '공식 스토어',
    },
  ],

  이재성: [
    {
      id: 'ad-이재성-ott',
      type: 'ott',
      title: '쿠팡플레이 분데스리가 생중계',
      description: '이재성의 마인츠 전 경기 생중계. 국내 유일 분데스리가 독점 스트리밍.',
      imageUrl: '',
      ctaText: '지금 시청하기',
      ctaUrl: 'https://www.coupangplay.com/sports',
      tag: 'OTT 중계',
    },
    {
      id: 'ad-이재성-shop',
      type: 'merchandise',
      title: '마인츠 05 공식 온라인 스토어',
      description: '이재성 마킹 마인츠 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://fanshop.mainz05.de',
      tag: '공식 스토어',
    },
  ],

  '옌스 카스트로프': [
    {
      id: 'ad-카스트로프-ott',
      type: 'ott',
      title: '쿠팡플레이 분데스리가 생중계',
      description: '옌스 카스트로프의 묀헨글라트바흐 전 경기 생중계. 국내 유일 분데스리가 독점 스트리밍.',
      imageUrl: '',
      ctaText: '지금 시청하기',
      ctaUrl: 'https://www.coupangplay.com/sports',
      tag: 'OTT 중계',
    },
    {
      id: 'ad-카스트로프-shop',
      type: 'merchandise',
      title: 'Borussia Mönchengladbach 공식 온라인 스토어',
      description: '묀헨글라트바흐 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://shop.borussia.de',
      tag: '공식 스토어',
    },
  ],

  정우영: [
    {
      id: 'ad-정우영-ott',
      type: 'ott',
      title: '쿠팡플레이 분데스리가 생중계',
      description: '정우영의 우니온 베를린 전 경기 생중계. 국내 유일 분데스리가 독점 스트리밍.',
      imageUrl: '',
      ctaText: '지금 시청하기',
      ctaUrl: 'https://www.coupangplay.com/sports',
      tag: 'OTT 중계',
    },
    {
      id: 'ad-정우영-shop',
      type: 'merchandise',
      title: '우니온 베를린 공식 온라인 스토어',
      description: '정우영 마킹 우니온 베를린 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://shop.union-berlin.de',
      tag: '공식 스토어',
    },
  ],

  // ── 2. Bundesliga ─────────────────────────────────────────────────────────

  김지수: [
    {
      id: 'ad-김지수-ott',
      type: 'ott',
      title: '쿠팡플레이 2. 분데스리가 생중계',
      description: '김지수의 카이저슬라우테른 전 경기 생중계.',
      imageUrl: '',
      ctaText: '지금 시청하기',
      ctaUrl: 'https://www.coupangplay.com/sports',
      tag: 'OTT 중계',
    },
    {
      id: 'ad-김지수-shop',
      type: 'merchandise',
      title: '카이저슬라우테른 공식 온라인 스토어',
      description: '김지수 마킹 FCK 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://shop.fck.de',
      tag: '공식 스토어',
    },
  ],

  권혁규: [
    {
      id: 'ad-권혁규-ott',
      type: 'ott',
      title: '쿠팡플레이 2. 분데스리가 생중계',
      description: '권혁규의 카를스루에 SC 전 경기 생중계.',
      imageUrl: '',
      ctaText: '지금 시청하기',
      ctaUrl: 'https://www.coupangplay.com/sports',
      tag: 'OTT 중계',
    },
    {
      id: 'ad-권혁규-shop',
      type: 'merchandise',
      title: '카를스루에 SC 공식 온라인 스토어',
      description: '권혁규 마킹 카를스루에 SC 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://shop.ksc.de',
      tag: '공식 스토어',
    },
  ],

  // ── Ligue 1 ──────────────────────────────────────────────────────────────

  이강인: [
    {
      id: 'ad-이강인-ott',
      type: 'ott',
      title: '쿠팡플레이 Ligue 1 생중계',
      description: '이강인의 PSG 전 경기 생중계. 국내 유일 리그앙 독점 스트리밍.',
      imageUrl: '',
      ctaText: '지금 시청하기',
      ctaUrl: 'https://www.coupangplay.com/sports',
      tag: 'OTT 중계',
    },
    {
      id: 'ad-이강인-shop',
      type: 'merchandise',
      title: 'PSG 공식 온라인 스토어',
      description: '이강인 마킹 PSG 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://store.psg.fr/en/',
      tag: '공식 스토어',
    },
  ],

  // ── LaLiga 2 ─────────────────────────────────────────────────────────────

  김민수: [
    {
      id: 'ad-김민수-ott',
      type: 'ott',
      title: '쿠팡플레이 라리가 생중계',
      description: '김민수의 FC 안도라 전 경기 생중계.',
      imageUrl: '',
      ctaText: '지금 시청하기',
      ctaUrl: 'https://www.coupangplay.com/sports',
      tag: 'OTT 중계',
    },
    {
      id: 'ad-김민수-shop',
      type: 'merchandise',
      title: 'FC Andorra 공식 온라인 스토어',
      description: '김민수 마킹 FC 안도라 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://www.fcandorra.com/tienda',
      tag: '공식 스토어',
    },
  ],

  // ── 국내 중계 없음 ────────────────────────────────────────────────────────

  홍현석: [
    {
      id: 'ad-홍현석-shop',
      type: 'merchandise',
      title: 'KAA 헨트 공식 온라인 스토어',
      description: '홍현석 마킹 헨트 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://shop.kaagent.be',
      tag: '공식 스토어',
    },
  ],

  황인범: [
    {
      id: 'ad-황인범-shop',
      type: 'merchandise',
      title: '페예노르트 공식 온라인 스토어',
      description: '황인범 마킹 페예노르트 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://shop.feyenoord.nl',
      tag: '공식 스토어',
    },
  ],

  조규성: [
    {
      id: 'ad-조규성-shop',
      type: 'merchandise',
      title: 'FC 미트윌란 공식 온라인 스토어',
      description: '조규성 마킹 FC 미트윌란 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://shop.fcm.dk',
      tag: '공식 스토어',
    },
  ],

  황의조: [
    {
      id: 'ad-황의조-shop',
      type: 'merchandise',
      title: '알라냐스포르 공식 온라인 스토어',
      description: '황의조 마킹 알라냐스포르 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://www.alanyaspor.org.tr',
      tag: '공식 스토어',
    },
  ],

  설영우: [
    {
      id: 'ad-설영우-shop',
      type: 'merchandise',
      title: 'FK 츠르베나 즈베즈다 공식 스토어',
      description: '설영우 마킹 레드스타 베오그라드 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://www.crvenazvezdafk.com',
      tag: '공식 스토어',
    },
  ],

  양현준: [
    {
      id: 'ad-양현준-shop',
      type: 'merchandise',
      title: '셀틱 공식 온라인 스토어',
      description: '양현준 마킹 셀틱 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://www.celticfc.com/store',
      tag: '공식 스토어',
    },
  ],

  오현규: [
    {
      id: 'ad-오현규-shop',
      type: 'merchandise',
      title: '베식타스 공식 온라인 스토어',
      description: '오현규 마킹 베식타스 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://www.besiktasshop.com/tr/',
      tag: '공식 스토어',
    },
  ],

  윤도영: [
    {
      id: 'ad-윤도영-shop',
      type: 'merchandise',
      title: 'FC 도르드레흐트 공식 온라인 스토어',
      description: '윤도영 마킹 FC 도르드레흐트 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://www.fcdordrecht.nl/fanshop',
      tag: '공식 스토어',
    },
  ],

  박승수: [
    {
      id: 'ad-박승수-shop',
      type: 'merchandise',
      title: '뉴캐슬 유나이티드 공식 온라인 스토어',
      description: '박승수 마킹 뉴캐슬 유나이티드 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://store.nufc.co.uk',
      tag: '공식 스토어',
    },
  ],

  이한범: [
    {
      id: 'ad-이한범-shop',
      type: 'merchandise',
      title: 'FC 미트윌란 공식 온라인 스토어',
      description: '이한범 마킹 FC 미트윌란 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://shop.fcm.dk',
      tag: '공식 스토어',
    },
  ],

  이태석: [
    {
      id: 'ad-이태석-shop',
      type: 'merchandise',
      title: 'FK 아우스트리아 빈 공식 온라인 스토어',
      description: '이태석 마킹 아우스트리아 빈 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://shop.fk-austria.at',
      tag: '공식 스토어',
    },
  ],

  이현주: [
    {
      id: 'ad-이현주-shop',
      type: 'merchandise',
      title: 'FC 아루카 공식 온라인 스토어',
      description: '이현주 마킹 아루카 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://www.fc-arouca.pt',
      tag: '공식 스토어',
    },
  ],

  이영준: [
    {
      id: 'ad-이영준-shop',
      type: 'merchandise',
      title: 'Grasshopper Club 공식 온라인 스토어',
      description: '이영준 마킹 그래스호퍼 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://shop.gcb.ch',
      tag: '공식 스토어',
    },
  ],

  고영준: [
    {
      id: 'ad-고영준-shop',
      type: 'merchandise',
      title: 'Górnik Zabrze 공식 온라인 스토어',
      description: '고영준 마킹 고르니크 자브제 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://sklep.gornikzabrze.pl',
      tag: '공식 스토어',
    },
  ],

  김용학: [
    {
      id: 'ad-김용학-shop',
      type: 'merchandise',
      title: 'Portimonense 공식 온라인 스토어',
      description: '김용학 마킹 포르티모넨시 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://www.portimonense.pt',
      tag: '공식 스토어',
    },
  ],

  서종민: [
    {
      id: 'ad-서종민-shop',
      type: 'merchandise',
      title: 'First Vienna FC 공식 온라인 스토어',
      description: '서종민 마킹 퍼스트 비엔나 정품 유니폼 및 공식 굿즈.',
      imageUrl: '',
      ctaText: '공식 스토어 바로가기',
      ctaUrl: 'https://www.firstvienna.at',
      tag: '공식 스토어',
    },
  ],
};
