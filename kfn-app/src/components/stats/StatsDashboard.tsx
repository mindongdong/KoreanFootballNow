import React, { useState, useEffect, useMemo } from 'react';
import FilterPanel from './FilterPanel';
import StatsTable from './StatsTable';
import { PlayerProfileModal } from './PlayerProfileModal';
import { loadPlayerData, getUniqueLeagues, getUniquePositions } from '@/utils/csvParser';
import { sortData, filterData, validatePlayer, formatCollectionDate } from '@/utils/dataHelpers';
import type { Player, SortConfig } from '@/types';

const StatsDashboard: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [injuredOnly, setInjuredOnly] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'player_name_kr', direction: 'asc' });

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedPlayerName, setSelectedPlayerName] = useState<string>('');
  const [selectedPlayerMatchesJson, setSelectedPlayerMatchesJson] = useState<string | null>(null);

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

  const numericSortKeys = new Set([
    'recent_rating', 'recent_minutes', 'recent_goals', 'recent_assists',
    'season_avg_rating', 'season_goals', 'season_assists', 'season_matches',
  ]);

  const handleMobileSort = (columnKey: string) => {
    if (!columnKey) {
      setSortConfig({ key: 'player_name_kr', direction: 'asc' });
      return;
    }
    const direction = numericSortKeys.has(columnKey) ? 'desc' : 'asc';
    setSortConfig({ key: columnKey, direction });
  };

  const collectionDate = players[0]?.collection_date ?? null;

  const handleResetFilters = () => {
    setSelectedLeagues([]);
    setSelectedPosition('');
    setInjuredOnly(false);
  };

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayerId(String(player.player_id));
    setSelectedPlayerName(player.player_name_kr || player.player_name);
    setSelectedPlayerMatchesJson(player.recent_matches_json ?? null);
  };

  const handleCloseModal = () => {
    setSelectedPlayerId(null);
    setSelectedPlayerName('');
    setSelectedPlayerMatchesJson(null);
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
        <div className="border-t border-gray-100 pt-2 mt-2 space-y-0.5">
          <p className="text-xs text-gray-400">※ 최근 지표는 가장 최근 1경기(리그·컵·대항전 포함) 기준이며, 선수 프로필에서 최근 5경기 상세를 확인할 수 있습니다</p>
          <p className="text-xs text-gray-400">※ 유럽: 2025-26 시즌 / MLS: 2026 시즌 기준</p>
        </div>
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
        collectionDate={collectionDate}
        onMobileSort={handleMobileSort}
      />

      <PlayerProfileModal
        playerId={selectedPlayerId}
        playerName={selectedPlayerName}
        onClose={handleCloseModal}
        recentMatchesJson={selectedPlayerMatchesJson}
      />
    </div>
  );
};

export default StatsDashboard;
