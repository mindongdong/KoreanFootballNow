import React from 'react';
import { formatRating, formatStat, formatMinutes, formatMatchDate } from '@/utils/dataHelpers';
import { translateTeam } from '@/utils/translations';
import type { RecentMatch } from '@/types';

interface MatchTimelineProps {
  recentMatches: RecentMatch[];
}

const MatchTimeline: React.FC<MatchTimelineProps> = ({ recentMatches }) => {
  const matches = recentMatches.slice(0, 5);

  if (matches.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-4">경기별 타임라인</h2>
      <div className="relative space-y-4 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200">
        {matches.map((match, i) => {
          const rating = match.rating ? parseFloat(match.rating) : null;
          const isHighRating = rating !== null && rating >= 7.5;

          return (
            <div key={i} className="relative flex items-start gap-4">
              {/* 평점 원형 뱃지 */}
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm z-10 shadow-sm ${
                  isHighRating
                    ? 'bg-kfn-red text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {rating ? formatRating(rating) : '-'}
              </div>

              {/* 경기 정보 */}
              <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400 font-medium">
                    {formatMatchDate(match.date)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {match.is_home ? 'H' : 'A'} · {match.result ?? ''}
                  </span>
                </div>
                <p className="font-semibold text-gray-900 text-sm">
                  vs {translateTeam(match.opponent ?? '')}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  {(match.goals ?? 0) > 0 && (
                    <span className="font-semibold text-kfn-red">
                      {formatStat(match.goals)}골
                    </span>
                  )}
                  {(match.assists ?? 0) > 0 && (
                    <span className="font-semibold text-kfn-red">
                      {formatStat(match.assists)}도움
                    </span>
                  )}
                  <span>{formatMinutes(match.minutes)} 출전</span>
                  {match.is_motm && (
                    <span className="px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-700 text-[10px] font-bold">
                      MOM
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MatchTimeline;
