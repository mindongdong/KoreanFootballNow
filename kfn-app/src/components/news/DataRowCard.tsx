import React from 'react';
import { Brain } from 'lucide-react';
import type { DataRow } from '@/types';

interface DataRowCardProps {
  row: DataRow;
  index: number;
}

const DataRowCard: React.FC<DataRowCardProps> = ({ row, index }) => {
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between p-5 bg-white">
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-kfn-red/10 text-kfn-red text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <div>
            <span className="text-sm font-bold text-gray-900">{row.label}</span>
            {row.source && (
              row.sourceUrl ? (
                <a href={row.sourceUrl} target="_blank" rel="noopener noreferrer"
                   className="ml-2 text-xs text-kfn-red hover:underline">
                  ({row.source})
                </a>
              ) : (
                <span className="ml-2 text-xs text-gray-400">({row.source})</span>
              )
            )}
          </div>
        </div>
        <span className="text-lg font-bold text-kfn-red tabular-nums">{row.value}</span>
      </div>
      <div className="flex gap-3 p-5 bg-gray-50 border-t border-gray-100">
        <Brain className="w-4 h-4 text-kfn-red flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-600 leading-relaxed">{row.interpretation}</p>
      </div>
    </div>
  );
};

export default DataRowCard;
