import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerMiniCard from '@/components/common/PlayerMiniCard';
import { getUniqueLeagues } from '@/utils/csvParser';
import { filterData } from '@/utils/dataHelpers';
import { translateLeague } from '@/utils/translations';
import { cn } from '@/lib/utils';
import type { Player } from '@/types';

interface LeaguePlayersSectionProps {
  players: Player[];
}

const LeaguePlayersSection: React.FC<LeaguePlayersSectionProps> = ({ players }) => {
  const navigate = useNavigate();
  const [selectedLeague, setSelectedLeague] = useState('');

  const leagues = useMemo(() => getUniqueLeagues(players), [players]);

  const filteredPlayers = useMemo(() => {
    if (!selectedLeague) return players;
    return filterData(players, {
      leagues: [selectedLeague],
      position: '',
      injuredOnly: false,
    });
  }, [players, selectedLeague]);

  if (players.length === 0) return null;

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">리그별 선수</h2>

      {/* 리그 탭 */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6">
        <button
          onClick={() => setSelectedLeague('')}
          className={cn(
            'flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all',
            !selectedLeague
              ? 'bg-kfn-red text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          )}
        >
          전체
        </button>
        {leagues.map((league) => (
          <button
            key={league}
            onClick={() => setSelectedLeague(league)}
            className={cn(
              'flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap',
              selectedLeague === league
                ? 'bg-kfn-red text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            )}
          >
            {translateLeague(league)}
          </button>
        ))}
      </div>

      {/* 선수 카드 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPlayers.map((player) => (
          <PlayerMiniCard
            key={player.player_id}
            player={player}
            onClick={() => navigate(`/player/${player.player_id}`)}
          />
        ))}
      </div>
    </section>
  );
};

export default LeaguePlayersSection;
