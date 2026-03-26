import React, { useState } from 'react';
import { formatRating, formatStat } from '@/utils/dataHelpers';
import { translateTeam, translateLeague } from '@/utils/translations';
import { cn } from '@/lib/utils';
import type { Player } from '@/types';

interface PlayerMiniCardProps {
  player: Player;
  onClick?: () => void;
  className?: string;
}

const PlayerMiniCard: React.FC<PlayerMiniCardProps> = ({ player, onClick, className }) => {
  const [imageError, setImageError] = useState(false);

  const recentRating = player.recent_match?.rating
    ? parseFloat(player.recent_match.rating)
    : null;

  const playerInitial = (player.player_name_kr || player.player_name)?.charAt(0) || '?';

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer',
        className
      )}
    >
      {/* 상단: 프로필 + 선수 정보 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-shrink-0 w-12 h-12">
          {!imageError ? (
            <img
              src={`https://images.fotmob.com/image_resources/playerimages/${player.player_id}.png`}
              alt={player.player_name_kr || player.player_name}
              className="w-full h-full rounded-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-kfn-red to-red-800 flex items-center justify-center text-white text-lg font-bold">
              {playerInitial}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base text-gray-900 truncate">
            {player.player_name_kr || player.player_name}
          </h3>
          <p className="text-xs text-gray-500 font-medium truncate">
            {translateTeam(player.team)} · {translateLeague(player.league)}
          </p>
        </div>
      </div>

      {/* 중앙: 최근 평점 */}
      <div className="mb-4">
        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
          최근 평점
        </span>
        <div className="text-3xl font-black text-kfn-red leading-tight">
          {recentRating ? formatRating(recentRating) : '-'}
        </div>
      </div>

      {/* 하단: 시즌 누적 */}
      <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between text-sm">
        <div>
          <span className="text-gray-400 text-xs">시즌</span>
          <p className="font-semibold text-gray-900">
            {formatStat(player.season_goals)}골 {formatStat(player.season_assists)}도움
          </p>
        </div>
        <div className="text-right">
          <span className="text-gray-400 text-xs">출전</span>
          <p className="font-semibold text-gray-900">
            {formatStat(player.season_matches)}경기
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlayerMiniCard;
