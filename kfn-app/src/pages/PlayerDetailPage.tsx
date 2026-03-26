import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import PlayerHeader from '@/components/player/PlayerHeader';
import RecentFormSection from '@/components/player/RecentFormSection';
import OpinionTemperature from '@/components/player/OpinionTemperature';
import MatchTimeline from '@/components/player/MatchTimeline';
import SeasonStatsDetail from '@/components/player/SeasonStatsDetail';
import RelatedArticles from '@/components/player/RelatedArticles';
import { loadPlayerData } from '@/utils/csvParser';
import { loadPlayerProfile } from '@/utils/profileParser';
import { parseRecentMatches, validatePlayer } from '@/utils/dataHelpers';
import { loadArticles } from '@/utils/articleLoader';
import type { Player } from '@/types';
import type { PlayerProfile } from '@/types/playerProfile';
import type { Article } from '@/types';

const PlayerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [player, setPlayer] = useState<Player | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const articles = loadArticles();

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [players, profileData] = await Promise.all([
          loadPlayerData('/example.csv'),
          loadPlayerProfile(id),
        ]);

        const found = players
          .filter(validatePlayer)
          .find((p) => String(p.player_id) === id);

        if (!found) {
          setError('선수를 찾을 수 없습니다.');
          return;
        }

        setPlayer(found);
        setProfile(profileData);
      } catch {
        setError('데이터를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-kfn-red animate-spin" />
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-8">
        <div className="text-center py-20 text-gray-400">
          <p>{error || '선수를 찾을 수 없습니다.'}</p>
          <button
            onClick={() => navigate('/players')}
            className="mt-4 text-sm text-kfn-red hover:underline"
          >
            선수 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const recentMatches = parseRecentMatches(player.recent_matches_json ?? null);
  const playerName = player.player_name_kr || player.player_name;
  const relatedArticles = articles.filter(
    (a: Article) => a.playerNameKr === playerName
  );

  return (
    <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      <PlayerHeader
        player={player}
        onBack={() => navigate('/players')}
      />

      <RecentFormSection
        recentMatches={recentMatches}
        profile={profile}
      />

      <OpinionTemperature />

      <MatchTimeline recentMatches={recentMatches} />

      {profile && <SeasonStatsDetail profile={profile} />}

      <RelatedArticles articles={relatedArticles} />
    </div>
  );
};

export default PlayerDetailPage;
