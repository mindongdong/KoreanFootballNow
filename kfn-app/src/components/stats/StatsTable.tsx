import React, { useRef } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Accordion } from '@/components/ui/accordion';
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useScrollShadow } from '@/hooks/useScrollShadow';
import { formatRating, formatStat, formatMinutes, formatCollectionDate } from '@/utils/dataHelpers';
import { translateTeam, translateLeague, translatePosition } from '@/utils/translations';
import type { Player, SortConfig } from '@/types';
import PlayerCard from './PlayerCard';
import { cn } from '@/lib/utils';

interface StatsTableProps {
  players: Player[];
  totalCount?: number;
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  onPlayerClick: (player: Player) => void;
  collectionDate: string | null;
  onMobileSort: (key: string) => void;
}

interface Column {
  key: string;
  label: string;
  sortable: boolean;
  className?: string;
}

const StatsTable: React.FC<StatsTableProps> = ({ players, totalCount, sortConfig, onSort, onPlayerClick, collectionDate, onMobileSort }) => {
  const displayTotal = totalCount ?? players.length;
  const isMobile = useMediaQuery('(max-width: 768px)');
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const { scrolled, scrolledEnd } = useScrollShadow(tableWrapperRef);

  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const columns: Column[] = [
    { key: 'player_name_kr', label: '선수명', sortable: true, className: 'min-w-[180px] sticky left-0 bg-white z-10' },
    { key: 'team', label: '소속팀', sortable: true },
    { key: 'league', label: '리그', sortable: true },
    { key: 'position', label: '포지션', sortable: true },
    { key: 'recent_rating', label: '최근 평점', sortable: true },
    { key: 'recent_minutes', label: '최근 출전', sortable: true },
    { key: 'recent_goals', label: '최근 골', sortable: true },
    { key: 'recent_assists', label: '최근 AS', sortable: true },
    { key: 'season_avg_rating', label: '시즌 평점', sortable: true },
    { key: 'season_goals', label: '시즌 골', sortable: true },
    { key: 'season_assists', label: '시즌 AS', sortable: true },
  ];

  if (isMobile) {
    const formattedDate = formatCollectionDate(collectionDate);
    return (
      <div className="w-full py-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400">
            총 <span className="font-semibold text-gray-900">{displayTotal}</span>명의 선수
          </p>
          <select
            value={sortConfig.key ?? ''}
            onChange={(e) => onMobileSort(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-kfn-red/20 focus:border-kfn-red"
          >
            <option value="">정렬 기준</option>
            <option value="player_name_kr">선수명</option>
            <option value="recent_rating">최근 평점</option>
            <option value="recent_goals">최근 골</option>
            <option value="recent_assists">최근 AS</option>
            <option value="recent_minutes">최근 출전</option>
            <option value="season_avg_rating">시즌 평점</option>
            <option value="season_goals">시즌 골</option>
            <option value="season_assists">시즌 AS</option>
          </select>
        </div>
        {players.length === 0 ? (
          <div className="text-center py-12 text-gray-400">필터 조건에 맞는 선수가 없습니다</div>
        ) : (
          <Accordion type="multiple" className="w-full">
            {players.map((player, index) => (
              <PlayerCard key={`${player.player_id}-${index}`} player={player} index={index} onViewProfile={onPlayerClick} />
            ))}
          </Accordion>
        )}
        {formattedDate && (
          <p className="text-xs text-gray-400 mt-4 text-center">
            총 {displayTotal}명의 선수 · FotMob 기준 · {formattedDate} 업데이트
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        ref={tableWrapperRef}
        className={cn(
          'relative w-full overflow-x-auto rounded-xl border bg-white',
          scrolled && 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-10 before:bg-gradient-to-r before:from-white before:to-transparent before:pointer-events-none before:z-20',
          !scrolledEnd && 'after:absolute after:right-0 after:top-0 after:bottom-0 after:w-10 after:bg-gradient-to-l after:from-white after:to-transparent after:pointer-events-none after:z-20'
        )}
      >
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(col.sortable && 'cursor-pointer select-none hover:bg-gray-50', col.className)}
                  onClick={col.sortable ? () => onSort(col.key) : undefined}
                >
                  <div className="flex items-center">
                    {col.label}
                    {col.sortable && getSortIcon(col.key)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  필터 조건에 맞는 선수가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              players.map((player, index) => (
                <TableRow
                  key={`${player.player_id}-${index}`}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => onPlayerClick(player)}
                >
                  <TableCell className="font-medium sticky left-0 bg-white z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-kfn-red font-semibold">{player.player_name_kr}</span>
                      {player.is_injured === 'Yes' && (
                        <span className="w-2 h-2 rounded-full bg-red-400" title="부상" />
                      )}
                      <a
                        href={player.fotmob_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-40 hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>{translateTeam(player.team) || '-'}</TableCell>
                  <TableCell>{translateLeague(player.league) || '-'}</TableCell>
                  <TableCell>{translatePosition(player.position) || '-'}</TableCell>
                  <TableCell className="font-semibold">
                    {player.recent_match?.rating ? formatRating(parseFloat(player.recent_match.rating)) : '-'}
                  </TableCell>
                  <TableCell>
                    {player.recent_match?.minutes ? formatMinutes(player.recent_match.minutes) : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {player.recent_match?.goals !== undefined ? formatStat(player.recent_match.goals) : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {player.recent_match?.assists !== undefined ? formatStat(player.recent_match.assists) : '-'}
                  </TableCell>
                  <TableCell className="font-medium">{formatRating(player.season_avg_rating)}</TableCell>
                  <TableCell className="text-center">{formatStat(player.season_goals)}</TableCell>
                  <TableCell className="text-center">{formatStat(player.season_assists)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-400">
          총 <span className="font-semibold text-gray-900">{displayTotal}</span>명의 선수
          {collectionDate && (
            <> · FotMob 기준 · {formatCollectionDate(collectionDate)} 업데이트</>
          )}
        </p>
      </div>
    </div>
  );
};

export default StatsTable;
