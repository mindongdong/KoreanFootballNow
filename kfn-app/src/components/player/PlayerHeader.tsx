import React, { useState } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { translateTeam, translateLeague, translatePosition } from '@/utils/translations';
import type { Player } from '@/types';

interface PlayerHeaderProps {
  player: Player;
  onBack: () => void;
}

const PlayerHeader: React.FC<PlayerHeaderProps> = ({ player, onBack }) => {
  const [imageError, setImageError] = useState(false);
  const playerName = player.player_name_kr || player.player_name;
  const playerInitial = playerName?.charAt(0) || '?';

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>목록으로</span>
      </button>

      <div className="flex items-center gap-5">
        <div className="flex-shrink-0 w-24 h-24 md:w-28 md:h-28">
          {!imageError ? (
            <img
              src={`https://images.fotmob.com/image_resources/playerimages/${player.player_id}.png`}
              alt={playerName}
              className="w-full h-full rounded-2xl object-cover shadow-md"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-kfn-red to-red-800 flex items-center justify-center text-white text-3xl font-bold shadow-md">
              {playerInitial}
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1">
            {playerName}
          </h1>
          <p className="text-gray-500 text-lg font-medium">
            {translateTeam(player.team)} · {translateLeague(player.league)} · {translatePosition(player.position)}
          </p>
          {player.fotmob_url && (
            <a
              href={player.fotmob_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:underline"
            >
              FotMob 프로필 보기
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerHeader;
