import React, { useState, useEffect, useMemo } from 'react';
import FilterPanel from './FilterPanel';
import StatsTable from './StatsTable';
import { PlayerProfileModal } from './PlayerProfileModal';
import { loadPlayerData, getUniqueLeagues, getUniquePositions } from '@/utils/csvParser';
import { sortData, filterData, validatePlayer } from '@/utils/dataHelpers';
import type { Player, SortConfig } from '@/types';

const StatsDashboard: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [injuredOnly, setInjuredOnly] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedPlayerName, setSelectedPlayerName] = useState<string>('');

  const leagues = useMemo(() => (players.length > 0 ? getUniqueLeagues(players) : []), [players]);
  const positions = useMemo(() => (players.length > 0 ? getUniquePositions(players) : []), [players]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await loadPlayerData('/example.csv');
        const validPlayers = data.filter(validatePlayer);
        setPlayers(validPlayers);
      } catch {
        setError('데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const displayedPlayers = useMemo(() => {
    const filtered = filterData(players, {
      leagues: selectedLeagues,
      position: selectedPosition,
      injuredOnly,
    });
    return sortData(filtered, sortConfig.key, sortConfig.direction);
  }, [players, selectedLeagues, selectedPosition, injuredOnly, sortConfig]);

  const handleSort = (columnKey: string) => {
    setSortConfig((prev) => ({
      key: columnKey,
      direction: prev.key === columnKey && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleResetFilters = () => {
    setSelectedLeagues([]);
    setSelectedPosition('');
    setInjuredOnly(false);
  };

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayerId(String(player.player_id));
    setSelectedPlayerName(player.player_name_kr || player.player_name);
  };

  const handleCloseModal = () => {
    setSelectedPlayerId(null);
    setSelectedPlayerName('');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-3 border-kfn-red/20 border-t-kfn-red rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <h2 className="text-lg font-bold text-gray-900">오류 발생</h2>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">시즌 타임라인 대시보드</h2>
        <p className="text-sm text-gray-400">해외파 한국 선수들의 주간 활약상을 한눈에 확인하세요</p>
      </div>

      <FilterPanel
        leagues={leagues}
        positions={positions}
        selectedLeagues={selectedLeagues}
        selectedPosition={selectedPosition}
        injuredOnly={injuredOnly}
        onLeagueChange={setSelectedLeagues}
        onPositionChange={setSelectedPosition}
        onInjuredToggle={setInjuredOnly}
        onResetFilters={handleResetFilters}
      />

      <StatsTable
        players={displayedPlayers}
        sortConfig={sortConfig}
        onSort={handleSort}
        onPlayerClick={handlePlayerClick}
      />

      <PlayerProfileModal
        playerId={selectedPlayerId}
        playerName={selectedPlayerName}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default StatsDashboard;
