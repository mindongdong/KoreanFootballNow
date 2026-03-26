import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { SourceItem } from '@/types';

interface SourcesListProps {
  sources: SourceItem[];
}

const SourcesList: React.FC<SourcesListProps> = ({ sources }) => {
  if (sources.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
      {sources.map((src, i) => (
        <a
          key={i}
          href={src.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
        >
          <span
            className={`px-2 py-0.5 rounded text-xs font-bold ${
              src.type === 'reddit'
                ? 'bg-orange-100 text-orange-700'
                : src.type === 'data'
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {src.type === 'reddit' ? 'Reddit' : src.type === 'data' ? 'Data' : 'News'}
          </span>
          <span className="text-sm text-gray-700 flex-1 truncate">{src.title}</span>
          <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        </a>
      ))}
    </div>
  );
};

export default SourcesList;
