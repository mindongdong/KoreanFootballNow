import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Article } from '@/types';

interface RelatedArticlesProps {
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

const RelatedArticles: React.FC<RelatedArticlesProps> = ({ articles }) => {
  if (articles.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-4">관련 기사</h2>
      <div className="space-y-2">
        {articles.slice(0, 5).map((article) => (
          <Link
            key={article.id}
            to={`/news/${article.id}`}
            className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors group"
          >
            <span className="px-2 py-0.5 rounded-full bg-kfn-red/10 text-kfn-red text-[10px] font-bold flex-shrink-0">
              {article.league}
            </span>
            <span className="flex-1 text-sm font-semibold text-gray-900 truncate group-hover:text-kfn-red transition-colors">
              {article.title}
            </span>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {formatRelativeDate(article.publishedAt)}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedArticles;
