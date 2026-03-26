import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import type { PlayerProfile } from '@/types/playerProfile';

interface SeasonStatsDetailProps {
  profile: PlayerProfile;
}

interface StatRow {
  label: string;
  value: number | string;
  percentile?: number;
  suffix?: string;
}

const TABS = [
  { key: 'attack', label: '공격' },
  { key: 'defense', label: '수비' },
  { key: 'passing', label: '패스' },
] as const;

type TabKey = typeof TABS[number]['key'];

function getStatsForTab(profile: PlayerProfile, tab: TabKey): StatRow[] {
  switch (tab) {
    case 'attack':
      return [
        { label: '골', value: profile.attack_goals, percentile: profile.goals_percentile },
        { label: '기대 골(xG)', value: profile.attack_expected_goals?.toFixed(1) ?? '-' },
        { label: '슈팅', value: profile.attack_shots },
        { label: '유효 슈팅', value: profile.attack_shots_on_target },
        { label: '슈팅 정확도', value: profile.attack_shooting_accuracy, suffix: '%' },
        { label: '드리블 성공', value: profile.attack_dribbles_succeeded },
        { label: '드리블 성공률', value: profile.attack_dribble_success_rate, suffix: '%' },
        { label: '박스 내 터치', value: profile.attack_touches_in_box },
      ];
    case 'defense':
      return [
        { label: '태클', value: profile.defense_tackles },
        { label: '태클 성공', value: profile.defense_tackles_successful },
        { label: '인터셉트', value: profile.defense_interceptions },
        { label: '클리어런스', value: profile.defense_clearances },
        { label: '듀얼 승리', value: profile.defense_duels_won },
        { label: '듀얼 성공률', value: profile.defense_duel_success_rate, suffix: '%' },
        { label: '공중 듀얼 승리', value: profile.defense_aerials_won },
        { label: '볼 회수', value: profile.defense_recoveries },
      ];
    case 'passing':
      return [
        { label: '도움', value: profile.passing_assists, percentile: profile.assists_percentile },
        { label: '기대 도움(xA)', value: profile.passing_expected_assists?.toFixed(1) ?? '-' },
        { label: '키패스', value: profile.passing_key_passes },
        { label: '찬스 생성', value: profile.passing_chances_created },
        { label: '패스 성공', value: profile.passing_successful_passes },
        { label: '패스 성공률', value: profile.passing_pass_accuracy, suffix: '%' },
        { label: '롱볼 정확도', value: profile.passing_long_ball_accuracy, suffix: '%' },
        { label: '크로스 정확도', value: profile.passing_cross_accuracy, suffix: '%' },
      ];
  }
}

function getPercentileLabel(percentile: number): string {
  if (percentile >= 90) return 'TOP 10%';
  if (percentile >= 80) return 'TOP 20%';
  if (percentile >= 70) return 'TOP 30%';
  if (percentile >= 50) return '상위 절반';
  return '';
}

const SeasonStatsDetail: React.FC<SeasonStatsDetailProps> = ({ profile }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('attack');
  const stats = getStatsForTab(profile, activeTab);

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-4">시즌 상세 스탯</h2>

      {/* 탭 */}
      <div className="flex gap-1 mb-6 border-b border-gray-100">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'px-4 py-2.5 text-sm font-semibold transition-all border-b-2',
              activeTab === key
                ? 'border-kfn-red text-kfn-red'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 스탯 행 */}
      <div className="space-y-3">
        {stats.map((stat) => {
          const numValue = typeof stat.value === 'number' ? stat.value : 0;
          const barWidth = stat.percentile
            ? Math.min(stat.percentile, 100)
            : Math.min(numValue * 2, 100);

          return (
            <div key={stat.label} className="flex items-center gap-4">
              <span className="text-sm text-gray-500 font-medium w-28 flex-shrink-0">
                {stat.label}
              </span>
              <span className="text-sm font-bold text-gray-900 w-16 text-right flex-shrink-0">
                {stat.value}{stat.suffix ?? ''}
              </span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-kfn-red rounded-full transition-all"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              {stat.percentile && stat.percentile >= 50 && (
                <span
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0',
                    stat.percentile >= 80
                      ? 'bg-red-50 text-kfn-red'
                      : 'bg-gray-100 text-gray-500'
                  )}
                >
                  {getPercentileLabel(stat.percentile)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SeasonStatsDetail;
