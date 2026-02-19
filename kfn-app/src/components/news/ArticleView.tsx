import React from 'react';
import { ArrowLeft, Eye, Calendar, Tag } from 'lucide-react';
import type { Article } from '@/types';
import AdCurationSection from './AdCuration';

interface ArticleViewProps {
  article: Article;
  onBack: () => void;
  onShowEvidence: () => void;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const ArticleView: React.FC<ArticleViewProps> = ({ article, onBack, onShowEvidence }) => {
  const contentParagraphs = article.content.split('\n').filter((line) => line.trim());

  return (
    <div className="max-w-[860px] mx-auto px-6 py-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>기사 목록으로</span>
      </button>

      {/* Article Header */}
      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-md bg-kfn-red text-white text-xs font-bold">
              {article.league}
            </span>
            <span className="text-sm text-gray-400 font-medium">{article.matchInfo}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
            {article.title}
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-6">{article.subtitle}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(article.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <div className="flex gap-1.5">
                {article.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded bg-gray-50 text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Article Body */}
        <div className="prose-kfn mb-10">
          {contentParagraphs.map((line, i) => {
            if (line.startsWith('## ')) {
              return (
                <h2 key={i} className="text-xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b border-gray-100">
                  {line.replace('## ', '')}
                </h2>
              );
            }
            if (line.startsWith('### ')) {
              return (
                <h3 key={i} className="text-base font-bold text-kfn-red mt-6 mb-3">
                  {line.replace('### ', '')}
                </h3>
              );
            }
            if (line.startsWith('- ')) {
              const text = line.replace('- ', '');
              const boldMatch = text.match(/\*\*(.+?)\*\*/);
              if (boldMatch) {
                const parts = text.split(/\*\*.+?\*\*/);
                return (
                  <div key={i} className="flex gap-3 mb-2 pl-1">
                    <span className="text-kfn-red mt-1.5 text-xs">&#9679;</span>
                    <p className="text-gray-700 leading-relaxed">
                      {parts[0]}
                      <strong className="font-semibold text-gray-900">{boldMatch[1]}</strong>
                      {parts[1]}
                    </p>
                  </div>
                );
              }
              return (
                <div key={i} className="flex gap-3 mb-2 pl-1">
                  <span className="text-kfn-red mt-1.5 text-xs">&#9679;</span>
                  <p className="text-gray-700 leading-relaxed">{text}</p>
                </div>
              );
            }
            return (
              <p key={i} className="text-gray-700 leading-relaxed mb-4">
                {line.split(/\*\*(.+?)\*\*/).map((part, j) =>
                  j % 2 === 1 ? (
                    <strong key={j} className="font-semibold text-gray-900">{part}</strong>
                  ) : (
                    <span key={j}>{part}</span>
                  )
                )}
              </p>
            );
          })}
        </div>

        {/* Evidence CTA */}
        {article.evidence && (
          <div className="mb-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-kfn-dark to-gray-900 text-white">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-kfn-red/20 flex items-center justify-center">
                <Eye className="w-6 h-6 text-kfn-red" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">데이터 근거 보기</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  이 기사의 바탕이 된 실제 경기 스탯과 AI의 해석 논리를 차트와 함께 확인하세요.
                </p>
                <button
                  onClick={onShowEvidence}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-kfn-red hover:bg-kfn-red/90 text-white rounded-lg font-semibold text-sm transition-all hover:shadow-lg hover:shadow-kfn-red/25 active:scale-[0.98]"
                >
                  <Eye className="w-4 h-4" />
                  근거 보기 (Evidence View)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ad Curation */}
        {article.adCurations && article.adCurations.length > 0 && (
          <AdCurationSection curations={article.adCurations} playerNameKr={article.playerNameKr} />
        )}
      </article>
    </div>
  );
};

export default ArticleView;
