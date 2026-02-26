import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate, useParams, Routes, Route } from 'react-router-dom';
import FilterPanel from './FilterPanel';
import StatsTable from './StatsTable';
import { PlayerProfileModal } from './PlayerProfileModal';
import Pagination from '@/components/common/Pagination';
import { loadPlayerData, getUniqueLeagues, getUniquePositions } from '@/utils/csvParser';
import { sortData, filterData, validatePlayer } from '@/utils/dataHelpers';
import type { Player, SortConfig } from '@/types';

const PLAYERS_PER_PAGE = 20;

const numericSortKeys = new Set([
  'recent_rating', 'recent_minutes', 'recent_goals', 'recent_assists',
  'season_avg_rating', 'season_goals', 'season_assists', 'season_matches',
]);

function parseSortParam(param: string | null): SortConfig {
  if (!param) return { key: 'player_name_kr', direction: 'asc' };
  const [key, dir] = param.split(':');
  return {
    key: key || 'player_name_kr',
    direction: dir === 'desc' ? 'desc' : 'asc',
  };
}

function formatSortParam(config: SortConfig): string {
  return `${config.key}:${config.direction}`;
}

function PlayerProfileRoute({ players }: { players: Player[] }) {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();

  const player = players.find((p) => String(p.player_id) === playerId);
  const playerName = player ? (player.player_name_kr || player.player_name) : '';
  const recentMatchesJson = player?.recent_matches_json ?? null;

  return (
    <PlayerProfileModal
      playerId={playerId ?? null}
      playerName={playerName}
      onClose={() => navigate('/stats' + window.location.search)}
      recentMatchesJson={recentMatchesJson}
    />
  );
}

const StatsDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Read filter/sort/page state from URL
  const selectedLeagues = useMemo(() => {
    const param = searchParams.get('leagues');
    return param ? param.split(',').filter(Boolean) : [];
  }, [searchParams]);

  const selectedPosition = searchParams.get('position') || '';
  const injuredOnly = searchParams.get('injured') === 'true';
  const sortConfig = useMemo(() => parseSortParam(searchParams.get('sort')), [searchParams]);
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

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

  const allFilteredPlayers = useMemo(() => {
    const filtered = filterData(players, {
      leagues: selectedLeagues,
      position: selectedPosition,
      injuredOnly,
    });
    return sortData(filtered, sortConfig.key, sortConfig.direction);
  }, [players, selectedLeagues, selectedPosition, injuredOnly, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(allFilteredPlayers.length / PLAYERS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, pageParam), totalPages);
  const startIndex = (currentPage - 1) * PLAYERS_PER_PAGE;
  const displayedPlayers = allFilteredPlayers.slice(startIndex, startIndex + PLAYERS_PER_PAGE);

  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === '') {
        next.delete(k);
      } else {
        next.set(k, v);
      }
    }
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleLeagueChange = useCallback((leagues: string[]) => {
    updateParams({
      leagues: leagues.length > 0 ? leagues.join(',') : null,
      page: null,
    });
  }, [updateParams]);

  const handlePositionChange = useCallback((position: string) => {
    updateParams({ position: position || null, page: null });
  }, [updateParams]);

  const handleInjuredToggle = useCallback((checked: boolean) => {
    updateParams({ injured: checked ? 'true' : null, page: null });
  }, [updateParams]);

  const handleResetFilters = useCallback(() => {
    updateParams({ leagues: null, position: null, injured: null, page: null, sort: null });
  }, [updateParams]);

  const handleSort = useCallback((columnKey: string) => {
    const newDirection = sortConfig.key === columnKey && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    const newSort: SortConfig = { key: columnKey, direction: newDirection };
    updateParams({ sort: formatSortParam(newSort), page: null });
  }, [sortConfig, updateParams]);

  const handleMobileSort = useCallback((columnKey: string) => {
    if (!columnKey) {
      updateParams({ sort: null, page: null });
      return;
    }
    const direction = numericSortKeys.has(columnKey) ? 'desc' : 'asc';
    updateParams({ sort: formatSortParam({ key: columnKey, direction }), page: null });
  }, [updateParams]);

  const handlePageChange = useCallback((page: number) => {
    updateParams({ page: page === 1 ? null : String(page) });
    window.scrollTo(0, 0);
  }, [updateParams]);

  const handlePlayerClick = useCallback((player: Player) => {
    navigate(`/stats/player/${player.player_id}${window.location.search}`);
  }, [navigate]);

  const collectionDate = players[0]?.collection_date ?? null;

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
        onLeagueChange={handleLeagueChange}
        onPositionChange={handlePositionChange}
        onInjuredToggle={handleInjuredToggle}
        onResetFilters={handleResetFilters}
      />

      <StatsTable
        players={displayedPlayers}
        totalCount={allFilteredPlayers.length}
        sortConfig={sortConfig}
        onSort={handleSort}
        onPlayerClick={handlePlayerClick}
        collectionDate={collectionDate}
        onMobileSort={handleMobileSort}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <Routes>
        <Route path="player/:playerId" element={<PlayerProfileRoute players={players} />} />
      </Routes>
    </div>
  );
};

export default StatsDashboard;
