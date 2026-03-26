import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Article } from '@/types';

interface NewsHeadlinesSectionProps {
  articles: Article[];
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return '방금 전';
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

const NewsHeadlinesSection: React.FC<NewsHeadlinesSectionProps> = ({ articles }) => {
  const latestArticles = articles.slice(0, 5);

  if (latestArticles.length === 0) return null;

  return (
    <section>
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">주요 헤드라인</h2>
        <Link
          to="/news"
          className="flex items-center gap-1 text-sm font-semibold text-kfn-red hover:underline"
        >
          더보기
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-1">
        {latestArticles.map((article) => (
          <Link
            key={article.id}
            to={`/news/${article.id}`}
            className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors group"
          >
            <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-[10px] font-bold uppercase min-w-[60px] text-center">
              {article.league}
            </span>
            <h3 className="flex-1 text-sm font-semibold text-gray-900 truncate group-hover:text-kfn-red transition-colors">
              {article.title}
            </h3>
            <span className="flex-shrink-0 text-xs text-gray-400">
              {formatRelativeDate(article.publishedAt)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default NewsHeadlinesSection;
