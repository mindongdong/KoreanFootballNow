import React from 'react';
import { ExternalLink, Tv, Ticket, ShoppingBag } from 'lucide-react';
import type { AdCuration } from '@/types';

interface AdCurationSectionProps {
  curations: AdCuration[];
  playerNameKr: string;
}

function getTypeIcon(type: AdCuration['type']) {
  switch (type) {
    case 'ott':
      return <Tv className="w-5 h-5" />;
    case 'ticket':
      return <Ticket className="w-5 h-5" />;
    case 'merchandise':
      return <ShoppingBag className="w-5 h-5" />;
  }
}

function getTypeBg(type: AdCuration['type']) {
  switch (type) {
    case 'ott':
      return 'bg-purple-50 text-purple-600 border-purple-100';
    case 'ticket':
      return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'merchandise':
      return 'bg-amber-50 text-amber-600 border-amber-100';
  }
}

const AdCurationSection: React.FC<AdCurationSectionProps> = ({ curations, playerNameKr }) => {
  return (
    <section className="mt-10 pt-8 border-t border-gray-100">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold text-gray-400 tracking-wide uppercase">Curated for you</span>
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-5">
        {playerNameKr} 관련 추천
      </h3>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {curations.map((curation) => (
          <a
            key={curation.id}
            href={curation.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col rounded-xl border border-gray-100 bg-white p-5 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border ${getTypeBg(curation.type)}`}>
                {getTypeIcon(curation.type)}
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">{curation.tag}</span>
                <h4 className="text-sm font-bold text-gray-900 group-hover:text-kfn-red transition-colors">
                  {curation.title}
                </h4>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">
              {curation.description}
            </p>
            <div className="flex items-center gap-1.5 text-kfn-red text-sm font-semibold">
              <span>{curation.ctaText}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default AdCurationSection;
