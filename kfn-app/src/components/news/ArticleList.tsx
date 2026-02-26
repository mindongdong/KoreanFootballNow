import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Clock, ChevronRight, TrendingUp } from 'lucide-react';
import type { Article } from '@/types';
import Pagination from '@/components/common/Pagination';

interface ArticleListProps {
  articles: Article[];
}

const ARTICLES_PER_PAGE = 10;

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

function ArticleCardGrid({ article }: { article: Article }) {
  return (
    <Link
      to={`/news/${article.id}`}
      className="group text-left rounded-xl border border-gray-100 bg-white p-6 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-0.5 block"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="px-2 py-0.5 rounded bg-kfn-red/10 text-kfn-red text-xs font-bold">
          {article.league}
        </span>
        <span className="text-xs text-gray-400">{formatRelativeDate(article.publishedAt)}</span>
      </div>
      <h4 className="font-bold text-gray-900 mb-2 group-hover:text-kfn-red transition-colors leading-snug line-clamp-2">
        {article.title}
      </h4>
      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
        {article.summary}
      </p>
      <div className="flex items-center gap-2">
        {article.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="px-2 py-0.5 rounded bg-gray-50 text-gray-400 text-xs font-medium">
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}

const ArticleList: React.FC<ArticleListProps> = ({ articles }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const totalPages = Math.max(1, Math.ceil(articles.length / ARTICLES_PER_PAGE));
  const currentPage = Math.min(Math.max(1, pageParam), totalPages);

  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const pageArticles = articles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page === 1) {
      searchParams.delete('page');
    } else {
      searchParams.set('page', String(page));
    }
    setSearchParams(searchParams);
    window.scrollTo(0, 0);
  };

  if (articles.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg">등록된 기사가 없습니다.</p>
      </div>
    );
  }

  const isFirstPage = currentPage === 1;
  const featured = isFirstPage ? pageArticles[0] : null;
  const gridArticles = isFirstPage ? pageArticles.slice(1) : pageArticles;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-kfn-red/10 text-kfn-red">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs font-bold tracking-wide uppercase">Latest</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">AI 여론 요약 기사</h2>
      </div>

      {/* Featured Article (first page only) */}
      {featured && (
        <Link
          to={`/news/${featured.id}`}
          className="group w-full text-left mb-8 rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-0.5 block"
        >
          <div className="p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2.5 py-1 rounded-md bg-kfn-red text-white text-xs font-bold">
                {featured.league}
              </span>
              <span className="text-xs text-gray-400 font-medium">{featured.matchInfo}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 group-hover:text-kfn-red transition-colors leading-tight">
              {featured.title}
            </h3>
            <p className="text-gray-500 text-base leading-relaxed mb-6 line-clamp-2">
              {featured.summary}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatRelativeDate(featured.publishedAt)}</span>
                </div>
                <div className="flex gap-2">
                  {featured.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded bg-gray-50 text-gray-500 text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1 text-kfn-red text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                <span>읽기</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Article Grid */}
      {gridArticles.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gridArticles.map((article) => (
            <ArticleCardGrid key={article.id} article={article} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ArticleList;
