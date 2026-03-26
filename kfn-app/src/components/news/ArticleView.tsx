import React from 'react';
import { ArrowLeft, Calendar, Tag, Brain, ExternalLink as ExternalLinkIcon } from 'lucide-react';
import type { Article } from '@/types';
import DataRowCard from './DataRowCard';
import SourcesList from './SourcesList';
import AdCurationSection from './AdCuration';
import { playerAdCurations } from '@/data/adCurations';

interface ArticleViewProps {
  article: Article;
  onBack: () => void;
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

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const combinedPattern = /(\[.+?\]\(https?:\/\/.+?\))|\*\*(.+?)\*\*/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = combinedPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`t${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>);
    }

    if (match[1]) {
      const linkMatch = match[1].match(/\[(.+?)\]\((https?:\/\/.+?)\)/);
      if (linkMatch) {
        parts.push(
          <a key={`l${match.index}`} href={linkMatch[2]} target="_blank" rel="noopener noreferrer"
             className="text-kfn-red hover:underline font-medium">
            {linkMatch[1]}
          </a>
        );
      }
    } else if (match[2]) {
      parts.push(
        <strong key={`b${match.index}`} className="font-semibold text-gray-900">{match[2]}</strong>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`t${lastIndex}`}>{text.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : [<span key="0">{text}</span>];
}

const ArticleView: React.FC<ArticleViewProps> = ({ article, onBack }) => {
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
              return (
                <div key={i} className="flex gap-3 mb-2 pl-1">
                  <span className="text-kfn-red mt-1.5 text-xs">&#9679;</span>
                  <p className="text-gray-700 leading-relaxed">{renderInlineMarkdown(text)}</p>
                </div>
              );
            }
            return (
              <p key={i} className="text-gray-700 leading-relaxed mb-4">
                {renderInlineMarkdown(line)}
              </p>
            );
          })}
        </div>

        {/* Evidence 인라인 */}
        {article.evidence && article.evidence.dataRows.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-6">
              <Brain className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">데이터 & AI 해석 논리</h2>
            </div>
            <div className="space-y-4">
              {article.evidence.dataRows.map((row, i) => (
                <DataRowCard key={i} row={row} index={i} />
              ))}
            </div>
          </div>
        )}

        {article.evidence?.sources && article.evidence.sources.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-6">
              <ExternalLinkIcon className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">참고 출처</h2>
            </div>
            <SourcesList sources={article.evidence.sources} />
          </div>
        )}

        {/* Ad Curation */}
        {(() => {
          const curations = playerAdCurations[article.playerNameKr] ?? [];
          return curations.length > 0 ? (
            <AdCurationSection curations={curations} playerNameKr={article.playerNameKr} />
          ) : null;
        })()}
      </article>
    </div>
  );
};

export default ArticleView;
