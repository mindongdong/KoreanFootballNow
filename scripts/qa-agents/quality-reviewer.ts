import type { Article, QAAgentResult, QAIssue } from '../lib/types.js';
import {
  MIN_CONTENT_LENGTH,
  MIN_INTERPRETATION_LENGTH,
  MIN_CHART_TYPES,
  BRAND_RED,
} from '../lib/constants.js';

const AGENT_NAME = 'quality-reviewer';

export function reviewQuality(article: Article): QAAgentResult {
  const issues: QAIssue[] = [];

  // 1. Title quality: should include player name and key stat or reaction quote
  if (!article.title.includes('오현규') && !article.title.includes('Oh')) {
    issues.push({
      agent: AGENT_NAME,
      field: 'title',
      severity: 'warning',
      message: '제목에 선수명 없음',
    });
  }
  const hasQuoteOrStat = /[""].*[""]/.test(article.title) || /\d/.test(article.title);
  if (!hasQuoteOrStat) {
    issues.push({
      agent: AGENT_NAME,
      field: 'title',
      severity: 'warning',
      message: '제목에 인용 반응 또는 핵심 수치 없음',
    });
  }

  // 2. Content length: >= 500 chars
  if (article.content.length < MIN_CONTENT_LENGTH) {
    issues.push({
      agent: AGENT_NAME,
      field: 'content',
      severity: 'critical',
      message: `content 길이 ${article.content.length}자 (최소 ${MIN_CONTENT_LENGTH}자)`,
    });
  }

  // 3. Each section should have meaningful content
  // Sections with bullet points (### subsections + - items) count as content blocks
  const sections = article.content.split(/^## /m).filter(Boolean);
  for (const section of sections) {
    const sectionTitle = section.split('\n')[0].trim();
    // Count paragraphs OR bullet-point blocks OR subsections as content units
    const contentLines = section.split('\n').filter(
      (line) => line.trim().length > 10 &&
        !line.trim().startsWith('##') &&
        !line.trim().startsWith('###'),
    );
    const subsections = (section.match(/^### /gm) || []).length;
    const bulletItems = (section.match(/^- \*\*/gm) || []).length;
    const contentUnits = Math.max(contentLines.length, subsections + bulletItems);

    if (contentUnits < 2) {
      issues.push({
        agent: AGENT_NAME,
        field: 'content',
        severity: 'warning',
        message: `"${sectionTitle}" 섹션의 콘텐츠가 부족함 (${contentUnits}개 항목)`,
      });
    }
  }

  // 4. "해외 현지 반응" format check
  const opinionSection = article.content.split('## 해외 현지 반응')[1]?.split('## AI')[0] || '';
  const hasRedditSubsection = /### Reddit r\/\w+/.test(opinionSection);
  const hasMediaSubsection = /### .*(매체|미디어|Today|Sofascore)/.test(opinionSection);
  if (!hasRedditSubsection) {
    issues.push({
      agent: AGENT_NAME,
      field: 'content',
      severity: 'warning',
      message: '"해외 현지 반응" 섹션에 ### Reddit r/{sub} 반응 하위 섹션 없음',
    });
  }
  if (!hasMediaSubsection) {
    issues.push({
      agent: AGENT_NAME,
      field: 'content',
      severity: 'info',
      message: '"해외 현지 반응" 섹션에 매체 반응 하위 섹션 없음',
    });
  }

  // 5. Chart type diversity: >= 2 types
  const evidence = article.evidence;
  if (evidence && evidence.charts) {
    const chartTypes = new Set(evidence.charts.map((c) => c.type));
    if (chartTypes.size < MIN_CHART_TYPES) {
      issues.push({
        agent: AGENT_NAME,
        field: 'evidence.charts',
        severity: 'warning',
        message: `차트 타입 ${chartTypes.size}종 (최소 ${MIN_CHART_TYPES}종)`,
      });
    }

    // 6. Sentiment pie chart required
    const hasSentimentPie = evidence.charts.some(
      (c) =>
        c.type === 'pie' &&
        c.data.some((d) => {
          const record = d as Record<string, unknown>;
          return (
            record.name === '긍정' ||
            record.name === '중립' ||
            record.name === '부정'
          );
        }),
    );
    if (!hasSentimentPie) {
      issues.push({
        agent: AGENT_NAME,
        field: 'evidence.charts',
        severity: 'warning',
        message: '감성 분석 pie chart (긍정/중립/부정) 없음',
      });
    }

    // 7. Brand color usage
    const allColors = evidence.charts.flatMap((c) => [
      ...c.colors,
      ...c.data.flatMap((d) => {
        const record = d as Record<string, unknown>;
        return record.fill ? [record.fill as string] : [];
      }),
    ]);
    if (!allColors.includes(BRAND_RED)) {
      issues.push({
        agent: AGENT_NAME,
        field: 'evidence.charts.colors',
        severity: 'warning',
        message: `브랜드 컬러 ${BRAND_RED} 미사용`,
      });
    }
  }

  // 8. Interpretation quality: each >= 30 chars with context
  if (evidence && evidence.dataRows) {
    for (const row of evidence.dataRows) {
      if (row.interpretation && row.interpretation.length < MIN_INTERPRETATION_LENGTH) {
        issues.push({
          agent: AGENT_NAME,
          field: 'dataRow.interpretation',
          severity: 'warning',
          message: `"${row.label}" interpretation ${row.interpretation.length}자 (최소 ${MIN_INTERPRETATION_LENGTH}자)`,
        });
      }
    }
  }

  // 9. Summary quality: 1-2 sentences with key stat and English reaction
  if (article.summary) {
    const hasNumber = /\d/.test(article.summary);
    const hasEnglish = /[a-zA-Z]{3,}/.test(article.summary);
    if (!hasNumber) {
      issues.push({
        agent: AGENT_NAME,
        field: 'summary',
        severity: 'info',
        message: 'summary에 핵심 수치 없음',
      });
    }
    if (!hasEnglish) {
      issues.push({
        agent: AGENT_NAME,
        field: 'summary',
        severity: 'info',
        message: 'summary에 영문 반응 인용 없음',
      });
    }
  }

  const criticalCount = issues.filter((i) => i.severity === 'critical').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const score = Math.max(0, 100 - criticalCount * 30 - warningCount * 10 - issues.length * 2);

  return {
    agent: AGENT_NAME,
    pass: criticalCount === 0 && score >= 80,
    score,
    issues,
  };
}
