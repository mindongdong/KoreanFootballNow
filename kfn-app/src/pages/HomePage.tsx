import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import HotPlayersSection from '@/components/home/HotPlayersSection';
import NewsHeadlinesSection from '@/components/home/NewsHeadlinesSection';
import OpinionGapSection from '@/components/home/OpinionGapSection';
import LeaguePlayersSection from '@/components/home/LeaguePlayersSection';
import UpcomingMatchesSection from '@/components/home/UpcomingMatchesSection';
import { loadPlayerData } from '@/utils/csvParser';
import { validatePlayer } from '@/utils/dataHelpers';
import { loadArticles } from '@/utils/articleLoader';
import type { Player } from '@/types';

const HomePage: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const articles = loadArticles();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await loadPlayerData('/example.csv');
        setPlayers(data.filter(validatePlayer));
      } catch {
        setError('데이터를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
    <div className="max-w-[1400px] mx-auto px-6 py-8 md:py-12 space-y-12 md:space-y-16">
      <HotPlayersSection players={players} />

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-12">
        <div className="lg:col-span-4">
          <NewsHeadlinesSection articles={articles} />
        </div>
        <div className="lg:col-span-6">
          <OpinionGapSection />
        </div>
      </div>

      <LeaguePlayersSection players={players} />

      <UpcomingMatchesSection />
    </div>
  );
};

export default HomePage;
