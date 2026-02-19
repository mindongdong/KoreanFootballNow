import { useEffect, useState } from 'react';
import { ExternalLink, Award, Medal, Trophy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip } from '@/components/ui/tooltip';
import { PlayerProfile } from '@/types/playerProfile';
import { loadPlayerProfile, formatDecimal, formatSuccessRate } from '@/utils/profileParser';
import { translateTeam, translateLeague, translatePosition, translatePreferredFoot } from '@/utils/translations';
import { formatStat } from '@/utils/dataHelpers';

interface PlayerProfileModalProps {
  playerId: string | null;
  playerName: string;
  onClose: () => void;
}

type TabType = 'overview' | 'attack' | 'passing' | 'defense';

export function PlayerProfileModal({ playerId, playerName, onClose }: PlayerProfileModalProps) {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!playerId) return;
    setLoading(true);
    setImageError(false);
    loadPlayerProfile(playerId)
      .then((data) => { setProfile(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [playerId]);

  if (!playerId) return null;

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: '개요' },
    { id: 'attack', label: '공격' },
    { id: 'passing', label: '패스' },
    { id: 'defense', label: '수비' },
  ];

  const getPercentileRank = (percentile: number) => {
    const rank = 100 - percentile;
    if (rank < 1) return '상위 1%';
    if (rank < 5) return `상위 ${Math.ceil(rank)}%`;
    if (rank < 10) return `상위 ${Math.round(rank)}%`;
    return `상위 ${Math.round(rank / 5) * 5}%`;
  };

  const getPercentileIcon = (percentile: number) => {
    if (percentile >= 90) return <Trophy className="w-3 h-3" />;
    if (percentile >= 70) return <Medal className="w-3 h-3" />;
    return <Award className="w-3 h-3" />;
  };

  const renderStatWithPercentile = (label: string, value: number | null, percentile?: number | null, unit = '') => {
    const pVal = percentile ?? 0;
    const isHigh = pVal >= 70;
    const tooltipContent = profile
      ? `${translateLeague(profile.league)} ${translatePosition(profile.position)} 선수 중 ${getPercentileRank(pVal)}`
      : '';

    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-500">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">{formatStat(value)}{unit}</span>
          {percentile != null && pVal >= 50 && (
            <Tooltip content={tooltipContent}>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${isHigh ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                {getPercentileIcon(pVal)}
                {getPercentileRank(pVal)}
              </span>
            </Tooltip>
          )}
        </div>
      </div>
    );
  };

  const renderStat = (label: string, value: number | string | null, unit = '') => (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-lg font-bold text-gray-900">{formatStat(value)}{unit}</span>
    </div>
  );

  return (
    <Dialog open={!!playerId} onOpenChange={onClose}>
      <DialogContent className="p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{playerName} 프로필</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-10 h-10 border-3 border-kfn-red/20 border-t-kfn-red rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">선수 정보를 불러오는 중...</p>
          </div>
        ) : !profile ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-gray-400">선수 정보를 찾을 수 없습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 p-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
              <div className="flex-shrink-0 w-20 h-20">
                {!imageError ? (
                  <img
                    src={`https://images.fotmob.com/image_resources/playerimages/${playerId}.png`}
                    alt={profile.player_name_kr || profile.player_name}
                    className="w-full h-full rounded-full object-cover shadow-md"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-kfn-red to-red-800 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                    {(profile.player_name_kr || profile.player_name)?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {profile.player_name_kr || profile.player_name}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-kfn-red/10 text-kfn-red text-xs font-bold">
                    {translateTeam(profile.team)}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-bold">
                    {translateLeague(profile.league)}
                  </span>
                  {profile.is_injured === 'Yes' && (
                    <span className="px-2.5 py-1 rounded-md bg-red-50 text-red-600 text-xs font-bold">부상</span>
                  )}
                </div>
              </div>
              {profile.fotmob_url && (
                <a
                  href={profile.fotmob_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-kfn-red/10 text-kfn-red rounded-lg text-sm font-semibold hover:bg-kfn-red hover:text-white transition-all"
                >
                  FotMob <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-xl">
              <div><span className="text-xs text-gray-400 uppercase font-semibold">포지션</span><p className="text-sm font-semibold">{translatePosition(profile.position)}</p></div>
              <div><span className="text-xs text-gray-400 uppercase font-semibold">나이</span><p className="text-sm font-semibold">{profile.age}세</p></div>
              <div><span className="text-xs text-gray-400 uppercase font-semibold">키</span><p className="text-sm font-semibold">{profile.height || '-'}</p></div>
              <div><span className="text-xs text-gray-400 uppercase font-semibold">주발</span><p className="text-sm font-semibold">{translatePreferredFoot(profile.preferred_foot)}</p></div>
              <div><span className="text-xs text-gray-400 uppercase font-semibold">시장가치</span><p className="text-sm font-semibold">{profile.market_value}</p></div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-fit px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-kfn-red text-white'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
              {activeTab === 'overview' && (
                <>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b-2 border-kfn-red/20">시즌 기록</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {renderStatWithPercentile('경기 수', profile.matches, profile.matches_percentile)}
                      {renderStatWithPercentile('선발 출전', profile.started, profile.started_percentile)}
                      {renderStatWithPercentile('출전 시간', profile.minutes_played, profile.minutes_played_percentile, '분')}
                      {renderStatWithPercentile('평점', profile.rating, profile.rating_percentile)}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b-2 border-kfn-red/20">공격 포인트</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {renderStatWithPercentile('골', profile.goals, profile.goals_percentile)}
                      {renderStatWithPercentile('도움', profile.assists, profile.assists_percentile)}
                      {renderStat('골 (90분당)', formatDecimal(profile.goals_per90))}
                      {renderStat('도움 (90분당)', formatDecimal(profile.assists_per90))}
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'attack' && (
                <>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b-2 border-kfn-red/20">득점 & 기대 골</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {renderStat('골', profile.attack_goals)}
                      {renderStat('기대 골 (xG)', formatDecimal(profile.attack_expected_goals))}
                      {renderStat('논페널티 xG', formatDecimal(profile.attack_non_penalty_xg))}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b-2 border-kfn-red/20">슈팅 & 드리블</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {renderStat('총 슈팅', profile.shot_total_shots)}
                      {renderStat('유효 슈팅', profile.shot_on_target)}
                      {renderStat('골 전환율', formatSuccessRate(profile.attack_conversion_rate))}
                      {renderStat('드리블 성공', profile.attack_dribbles_succeeded)}
                      {renderStat('드리블 성공률', formatSuccessRate(profile.attack_dribble_success_rate))}
                      {renderStat('박스 내 터치', profile.attack_touches_in_box)}
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'passing' && (
                <>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b-2 border-kfn-red/20">어시스트 & 찬스 창출</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {renderStat('도움', profile.passing_assists)}
                      {renderStat('기대 도움 (xA)', formatDecimal(profile.passing_expected_assists))}
                      {renderStat('찬스 창출', profile.passing_chances_created)}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b-2 border-kfn-red/20">패스 정확도</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {renderStat('성공한 패스', profile.passing_successful_passes)}
                      {renderStat('패스 성공률', formatSuccessRate(profile.passing_pass_accuracy))}
                      {renderStat('롱볼 성공', profile.passing_long_balls_accurate)}
                      {renderStat('크로스 성공률', formatSuccessRate(profile.passing_cross_accuracy))}
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'defense' && (
                <>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b-2 border-kfn-red/20">태클 & 인터셉트</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {renderStat('태클', profile.defense_tackles)}
                      {renderStat('인터셉트', profile.defense_interceptions)}
                      {renderStat('슈팅 차단', profile.defense_blocked_shots)}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b-2 border-kfn-red/20">경합 & 반칙</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {renderStat('경합 승리', profile.defense_duels_won)}
                      {renderStat('경합 승률', formatSuccessRate(profile.defense_duel_success_rate))}
                      {renderStat('공중볼 승', profile.defense_aerials_won)}
                      {renderStat('볼 리커버리', profile.defense_recoveries)}
                      {renderStat('옐로카드', profile.discipline_yellow_cards)}
                      {renderStat('레드카드', profile.discipline_red_cards)}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
