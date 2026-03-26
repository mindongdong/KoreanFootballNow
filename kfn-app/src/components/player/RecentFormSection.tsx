import React from 'react';
import { formatRating, formatStat, computeRecentAggregate } from '@/utils/dataHelpers';
import type { RecentMatch } from '@/types';
import type { PlayerProfile } from '@/types/playerProfile';

interface RecentFormSectionProps {
  recentMatches: RecentMatch[];
  profile: PlayerProfile | null;
}

const RecentFormSection: React.FC<RecentFormSectionProps> = ({ recentMatches, profile }) => {
  const aggregate = computeRecentAggregate(recentMatches, 5);
  const ratings = recentMatches
    .slice(0, 5)
    .map((m) => (m.rating ? parseFloat(m.rating) : 0))
    .reverse();

  const maxRating = Math.max(...ratings, 1);

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-4">최근 폼</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 좌측: 평균 평점 + 스파크라인 */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
            최근 {aggregate?.matchCount ?? 0}경기 평균 평점
          </span>
          <div className="text-5xl font-black text-kfn-red leading-tight mt-1 mb-4">
            {aggregate?.avgRating ? formatRating(aggregate.avgRating) : '-'}
          </div>

          {/* 스파크라인 */}
          {ratings.length > 0 && (
            <div className="flex items-end gap-1.5 h-12">
              {ratings.map((rating, i) => {
                const height = Math.max((rating / maxRating) * 100, 10);
                const isMax = rating === Math.max(...ratings);
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-md transition-all ${
                      isMax ? 'bg-kfn-red' : 'bg-gray-200'
                    }`}
                    style={{ height: `${height}%` }}
                    title={`${formatRating(rating)}`}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* 우측: 시즌 핵심 스탯 */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
            시즌 핵심 스탯
          </span>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <StatItem
              label="골"
              value={formatStat(profile?.goals ?? aggregate?.totalGoals)}
            />
            <StatItem
              label="도움"
              value={formatStat(profile?.assists ?? aggregate?.totalAssists)}
            />
            <StatItem
              label="패스 성공률"
              value={profile?.passing_pass_accuracy ? `${profile.passing_pass_accuracy}%` : '-'}
            />
            <StatItem
              label="키패스"
              value={formatStat(profile?.passing_key_passes)}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <span className="text-xs text-gray-400">{label}</span>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default RecentFormSection;
