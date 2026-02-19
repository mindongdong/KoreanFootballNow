import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { formatRating, formatStat, formatMinutes } from '@/utils/dataHelpers';
import { translateTeam, translateLeague, translatePosition } from '@/utils/translations';
import type { Player } from '@/types';

interface PlayerCardProps {
  player: Player;
  index: number;
  onViewProfile: (player: Player) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, index, onViewProfile }) => {
  return (
    <AccordionItem value={`player-${player.player_id}-${index}`} className="border rounded-lg mb-2">
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex items-center justify-between w-full text-left">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base">{player.player_name_kr}</span>
              {player.is_injured === 'Yes' && (
                <span className="w-2 h-2 rounded-full bg-red-400" title="부상" />
              )}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {translateTeam(player.team)} · {translateLeague(player.league)}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 mr-2">
            <span className="text-sm font-medium">
              평점 {player.recent_match?.rating ? formatRating(parseFloat(player.recent_match.rating)) : '-'}
            </span>
            <span className="text-xs text-gray-400">
              {player.recent_match?.goals !== undefined ? formatStat(player.recent_match.goals) : '-'}G /{' '}
              {player.recent_match?.assists !== undefined ? formatStat(player.recent_match.assists) : '-'}A
            </span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2 text-kfn-red">최근 경기 기록</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">출전시간:</span>
                <span className="font-medium">
                  {player.recent_match?.minutes ? formatMinutes(player.recent_match.minutes) : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">평점:</span>
                <span className="font-medium">
                  {player.recent_match?.rating ? formatRating(parseFloat(player.recent_match.rating)) : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">골:</span>
                <span className="font-medium">
                  {player.recent_match?.goals !== undefined ? formatStat(player.recent_match.goals) : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">어시스트:</span>
                <span className="font-medium">
                  {player.recent_match?.assists !== undefined ? formatStat(player.recent_match.assists) : '-'}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2 text-gray-600">시즌 누적</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">평점:</span>
                <span className="font-medium">{formatRating(player.season_avg_rating)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">포지션:</span>
                <span className="font-medium">{translatePosition(player.position)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">골:</span>
                <span className="font-medium">{formatStat(player.season_goals)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">어시스트:</span>
                <span className="font-medium">{formatStat(player.season_assists)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="default" size="sm" className="flex-1 bg-kfn-red hover:bg-kfn-red/90" onClick={() => onViewProfile(player)}>
              프로필 보기
            </Button>
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <a href={player.fotmob_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                FotMob <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default PlayerCard;
