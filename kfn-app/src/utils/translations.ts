const POSITION_TRANSLATIONS: Record<string, string> = {
  'striker': '스트라이커',
  'center back': '센터백',
  'attacking midfielder': '공격형 미드필더',
  'defensive midfielder': '수비형 미드필더',
  'central midfielder': '중앙 미드필더',
  'left back': '레프트백',
  'right back': '라이트백',
  'left winger': '왼쪽 윙어',
  'right winger': '오른쪽 윙어',
  'forward': '포워드',
  'midfielder': '미드필더',
  'left midfielder': '왼쪽 미드필더',
};

const LEAGUE_TRANSLATIONS: Record<string, string> = {
  'premier league': '프리미어리그',
  'championship': '챔피언십',
  'premier league 2': '프리미어리그 2',
  'bundesliga': '분데스리가',
  '2. bundesliga': '2. 분데스리가',
  'laliga2': '라리가2',
  'liga portugal': '리가 포르투갈',
  'liga portugal 2': '리가 포르투갈 2',
  'ligue 1': '리그 1',
  'eredivisie': '에레디비시',
  'belgian pro league': '벨기에 프로리그',
  'major league soccer': '메이저 리그 사커',
  'super lig': '슈퍼리그',
  'premiership': '프리미어십',
  'super league': '스위스 슈퍼리그',
  'superligaen': '슈퍼리가엔',
  'super liga': '슈퍼리가',
  'ekstraklasa': '엑스트라클라사',
  'eerste divisie': '에이르스터 디비시',
};

const TEAM_TRANSLATIONS: Record<string, string> = {
  'bayern münchen': '바이에른 뮌헨',
  'union berlin': '우니온 베를린',
  'mainz 05': '마인츠',
  'borussia mönchengladbach': '보루시아 묀헨글라트바흐',
  'kaiserslautern': '카이저슬라우테른',
  'paris saint-germain': '파리 생제르맹',
  'nantes': '낭트',
  'newcastle united': '뉴캐슬 유나이티드',
  'newcastle united u21': '뉴캐슬 유나이티드 U21',
  'wolverhampton wanderers': '울버햄프턴 원더러스',
  'birmingham city': '버밍엄 시티',
  'stoke city': '스토크 시티',
  'swansea city': '스완지 시티',
  'portsmouth': '포츠머스',
  'celtic': '셀틱',
  'feyenoord': '페예노르트',
  'excelsior': '엑셀시오르',
  'genk': '헹크',
  'arouca': '아로카',
  'portimonense': '포르티모넨스',
  'fc andorra': 'FC 안도라',
  'alanyaspor': '알란야스포르',
  'austria wien': '오스트리아 빈',
  'grasshopper': '그라스호퍼',
  'fc midtjylland': 'FC 미트윌란',
  'fk crvena zvezda': 'FK 츠르베나 즈베즈다',
  'górnik zabrze': '구르니크 자브제',
  'los angeles fc': 'LA FC',
  'minnesota united': '미네소타 유나이티드',
  'st. louis city': '세인트루이스 시티',
  'coventry city': '코번트리 시티',
  'karlsruher sc': '카를스루에 SC',
  'beşiktaş': '베식타시',
  'fc dordrecht': 'FC 도르드레흐트',
  'oxford united': '옥스퍼드 유나이티드',
  'first vienna fc': '피르스트 비엔나 FC',
};

const PREFERRED_FOOT_TRANSLATIONS: Record<string, string> = {
  'left': '왼발',
  'right': '오른발',
  'both': '양발',
};

export function translatePosition(position: string | null): string {
  if (!position) return '';
  return POSITION_TRANSLATIONS[position.toLowerCase()] || position;
}

export function translateLeague(league: string | null): string {
  if (!league) return '';
  return LEAGUE_TRANSLATIONS[league.toLowerCase()] || league;
}

export function translateTeam(team: string | null): string {
  if (!team) return '';
  return TEAM_TRANSLATIONS[team.toLowerCase()] || team;
}

export function translatePreferredFoot(foot: string | null): string {
  if (!foot) return '-';
  return PREFERRED_FOOT_TRANSLATIONS[foot.toLowerCase()] || foot;
}
