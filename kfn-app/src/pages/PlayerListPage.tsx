import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronDown, Loader2 } from 'lucide-react';
import PlayerMiniCard from '@/components/common/PlayerMiniCard';
import { loadPlayerData, getUniqueLeagues } from '@/utils/csvParser';
import { sortData, filterData, validatePlayer } from '@/utils/dataHelpers';
import { translateLeague } from '@/utils/translations';
import { cn } from '@/lib/utils';
import type { Player } from '@/types';

const SORT_OPTIONS = [
  { key: 'season_avg_rating', direction: 'desc' as const, label: '평점순' },
  { key: 'player_name_kr', direction: 'asc' as const, label: '이름순' },
  { key: 'season_goals', direction: 'desc' as const, label: '골순' },
  { key: 'season_matches', direction: 'desc' as const, label: '출전순' },
];

const PlayerListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const selectedLeague = searchParams.get('league') || '';
  const sortKey = searchParams.get('sort') || 'season_avg_rating';
  const currentSort = SORT_OPTIONS.find((o) => o.key === sortKey) || SORT_OPTIONS[0];

  const leagues = useMemo(
    () => (players.length > 0 ? getUniqueLeagues(players) : []),
    [players]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await loadPlayerData('/example.csv');
        setPlayers(data.filter(validatePlayer));
      } catch {
        setError('데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPlayers = useMemo(() => {
    const filtered = filterData(players, {
      leagues: selectedLeague ? [selectedLeague] : [],
      position: '',
      injuredOnly: false,
    });
    return sortData(filtered, currentSort.key, currentSort.direction);
  }, [players, selectedLeague, currentSort]);

  const handleLeagueChange = (league: string) => {
    const next = new URLSearchParams(searchParams);
    if (league) {
      next.set('league', league);
    } else {
      next.delete('league');
    }
    setSearchParams(next);
  };

  const handleSortChange = (key: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', key);
    setSearchParams(next);
    setSortMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-kfn-red animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold text-gray-900">해외파 한국 선수</h1>
          <span className="px-2.5 py-0.5 rounded-full bg-kfn-red/10 text-kfn-red text-sm font-bold">
            {filteredPlayers.length}명
          </span>
        </div>
        <p className="text-gray-500 text-sm mt-1">
          해외 리그에서 뛰고 있는 한국 선수들의 최신 스탯
        </p>
      </div>

      {/* 필터 + 정렬 */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {/* 리그 칩 */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar flex-1">
          <button
            onClick={() => handleLeagueChange('')}
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
              onClick={() => handleLeagueChange(league)}
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

        {/* 정렬 드롭다운 */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setSortMenuOpen(!sortMenuOpen)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            정렬: {currentSort.label}
            <ChevronDown className="w-4 h-4" />
          </button>
          {sortMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSortMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[120px]">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => handleSortChange(option.key)}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm transition-colors',
                      option.key === currentSort.key
                        ? 'text-kfn-red font-semibold bg-kfn-red/5'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 선수 카드 그리드 */}
      {filteredPlayers.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p>해당 리그에 선수가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPlayers.map((player) => (
            <PlayerMiniCard
              key={player.player_id}
              player={player}
              onClick={() => navigate(`/player/${player.player_id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerListPage;
