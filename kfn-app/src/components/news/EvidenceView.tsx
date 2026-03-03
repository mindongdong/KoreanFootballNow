import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ArrowLeft, Database, Brain, BarChart3, Info, ExternalLink } from 'lucide-react';
import type { Article, ChartData, DataRow } from '@/types';

interface EvidenceViewProps {
  article: Article;
  onBack: () => void;
}

const chartColors = {
  grid: '#f1f5f9',
  text: '#64748b',
  tooltip: '#0f172a',
};

function renderChart(chart: ChartData) {
  switch (chart.type) {
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chart.data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: chartColors.text }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: chartColors.text }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: chartColors.tooltip,
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '13px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {chart.dataKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={chart.colors[i]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );

    case 'radar':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={chart.data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke={chartColors.grid} />
            <PolarAngleAxis dataKey="stat" tick={{ fontSize: 12, fill: chartColors.text }} />
            <PolarRadiusAxis tick={{ fontSize: 10, fill: chartColors.text }} domain={[0, 100]} />
            {chart.dataKeys.map((key, i) => (
              <Radar key={key} dataKey={key} stroke={chart.colors[i]} fill={chart.colors[i]} fillOpacity={0.2} strokeWidth={2} />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      );

    case 'line':
      return (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chart.data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
            <XAxis dataKey="match" tick={{ fontSize: 12, fill: chartColors.text }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: chartColors.text }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: chartColors.tooltip,
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '13px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {chart.dataKeys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={chart.colors[i]}
                strokeWidth={2.5}
                dot={{ fill: chart.colors[i], strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );

    case 'pie':
      return (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chart.data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
              label={({ name, value }) => `${name} ${value}%`}
              labelLine={{ stroke: chartColors.text, strokeWidth: 1 }}
            >
              {chart.data.map((entry, i) => (
                <Cell key={i} fill={(entry as Record<string, unknown>).fill as string || chart.colors[i]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: chartColors.tooltip,
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '13px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      );

    default:
      return null;
  }
}

function DataRowCard({ row, index }: { row: DataRow; index: number }) {
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden">
      {/* Data Row */}
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
      {/* Interpretation Row */}
      <div className="flex gap-3 p-5 bg-gray-50 border-t border-gray-100">
        <Brain className="w-4 h-4 text-kfn-red flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-600 leading-relaxed">{row.interpretation}</p>
      </div>
    </div>
  );
}

const EvidenceView: React.FC<EvidenceViewProps> = ({ article, onBack }) => {
  const evidence = article.evidence;

  if (!evidence) {
    return (
      <div className="max-w-[860px] mx-auto px-6 py-8">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span>기사로 돌아가기</span>
        </button>
        <div className="text-center py-20 text-gray-400">
          <p>근거 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>기사로 돌아가기</span>
      </button>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-5 h-5 text-kfn-red" />
          <span className="text-xs font-bold text-kfn-red tracking-wide uppercase">Evidence View</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-2">
          데이터 근거 보기
        </h1>
        <p className="text-gray-500 text-sm">
          {article.playerNameKr} — {article.matchInfo}
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100 mb-10">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700 leading-relaxed">
          아래 데이터는 공개된 퍼블릭 소스(FotMob, Reddit, 현지 매체 등)에서 자동 수집되었으며, AI의 해석 논리(Reasoning)와 함께 제공됩니다.
        </p>
      </div>

      {/* Charts Section */}
      {evidence.charts.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-bold text-gray-900">데이터 시각화</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {evidence.charts.map((chart) => (
              <div key={chart.id} className="rounded-xl border border-gray-100 bg-white p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-4">{chart.title}</h3>
                {renderChart(chart)}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Data + Interpretation Rows */}
      {evidence.dataRows.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Brain className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-bold text-gray-900">데이터 & AI 해석 논리</h2>
          </div>
          <div className="space-y-4">
            {evidence.dataRows.map((row, i) => (
              <DataRowCard key={i} row={row} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Sources Section */}
      {evidence.sources && evidence.sources.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <ExternalLink className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-bold text-gray-900">참고 출처</h2>
          </div>
          <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
            {evidence.sources.map((src, i) => (
              <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  src.type === 'reddit' ? 'bg-orange-100 text-orange-700' :
                  src.type === 'data' ? 'bg-green-100 text-green-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {src.type === 'reddit' ? 'Reddit' : src.type === 'data' ? 'Data' : 'News'}
                </span>
                <span className="text-sm text-gray-700 flex-1 truncate">{src.title}</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default EvidenceView;
