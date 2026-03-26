import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import PlayerMiniCard from '@/components/common/PlayerMiniCard';
import type { Player } from '@/types';

interface HotPlayersSectionProps {
  players: Player[];
}

const HotPlayersSection: React.FC<HotPlayersSectionProps> = ({ players }) => {
  const navigate = useNavigate();

  // 최근 평점 기준 상위 3~5명
  const hotPlayers = [...players]
    .filter((p) => p.recent_match?.rating)
    .sort((a, b) => {
      const rA = parseFloat(a.recent_match?.rating ?? '0');
      const rB = parseFloat(b.recent_match?.rating ?? '0');
      return rB - rA;
    })
    .slice(0, 5);

  if (hotPlayers.length === 0) return null;

  return (
    <section>
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">이번 라운드 활약 선수</h2>
        <Link
          to="/players"
          className="flex items-center gap-1 text-sm font-semibold text-kfn-red hover:underline"
        >
          더보기
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 데스크톱: 그리드, 모바일: 가로 스크롤 */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        {hotPlayers.slice(0, 3).map((player) => (
          <PlayerMiniCard
            key={player.player_id}
            player={player}
            onClick={() => navigate(`/player/${player.player_id}`)}
          />
        ))}
      </div>

      <div className="md:hidden flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory -mx-6 px-6">
        {hotPlayers.map((player) => (
          <div key={player.player_id} className="min-w-[280px] snap-start">
            <PlayerMiniCard
              player={player}
              onClick={() => navigate(`/player/${player.player_id}`)}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default HotPlayersSection;
