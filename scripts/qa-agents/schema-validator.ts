import type { Article, QAAgentResult, QAIssue } from '../lib/types.js';

const AGENT_NAME = 'schema-validator';

const REQUIRED_ARTICLE_FIELDS: (keyof Article)[] = [
  'id', 'title', 'subtitle', 'summary', 'content',
  'playerName', 'playerNameKr', 'team', 'league',
  'matchInfo', 'publishedAt', 'thumbnailUrl', 'tags',
];

const VALID_CHART_TYPES = ['bar', 'radar', 'line', 'pie'] as const;

export function validateSchema(article: Article): QAAgentResult {
  const issues: QAIssue[] = [];

  // 1. Required fields check
  for (const field of REQUIRED_ARTICLE_FIELDS) {
    const value = article[field];
    if (value === null || value === undefined) {
      issues.push({
        agent: AGENT_NAME,
        field,
        severity: 'critical',
        message: `필수 필드 "${field}"가 null/undefined`,
      });
    } else if (typeof value === 'string' && value.trim() === '' && field !== 'thumbnailUrl') {
      issues.push({
        agent: AGENT_NAME,
        field,
        severity: 'warning',
        message: `필수 필드 "${field}"가 빈 문자열`,
      });
    }
  }

  // 2. Charts structure validation
  const evidence = article.evidence;
  if (!evidence) {
    issues.push({
      agent: AGENT_NAME,
      field: 'evidence',
      severity: 'critical',
      message: 'evidence 필드 없음',
    });
  } else {
    const { charts, dataRows } = evidence;

    // Charts count: 1-4
    if (!charts || charts.length === 0) {
      issues.push({
        agent: AGENT_NAME,
        field: 'evidence.charts',
        severity: 'critical',
        message: 'charts가 비어있음 (1-4개 필요)',
      });
    } else if (charts.length > 4) {
      issues.push({
        agent: AGENT_NAME,
        field: 'evidence.charts',
        severity: 'warning',
        message: `charts가 ${charts.length}개 (최대 4개)`,
      });
    }

    // Validate each chart
    if (charts) {
      for (const chart of charts) {
        // Required chart fields
        if (!chart.id) {
          issues.push({
            agent: AGENT_NAME,
            field: 'chart.id',
            severity: 'critical',
            message: 'chart에 id 없음',
          });
        }
        if (!chart.title) {
          issues.push({
            agent: AGENT_NAME,
            field: 'chart.title',
            severity: 'critical',
            message: 'chart에 title 없음',
          });
        }
        if (!VALID_CHART_TYPES.includes(chart.type as typeof VALID_CHART_TYPES[number])) {
          issues.push({
            agent: AGENT_NAME,
            field: `chart.${chart.id}.type`,
            severity: 'critical',
            message: `잘못된 chart type: "${chart.type}" (허용: ${VALID_CHART_TYPES.join(', ')})`,
          });
        }
        if (!chart.data || chart.data.length === 0) {
          issues.push({
            agent: AGENT_NAME,
            field: `chart.${chart.id}.data`,
            severity: 'critical',
            message: `chart "${chart.id}" data가 비어있음`,
          });
        }
        if (!chart.dataKeys || chart.dataKeys.length === 0) {
          issues.push({
            agent: AGENT_NAME,
            field: `chart.${chart.id}.dataKeys`,
            severity: 'critical',
            message: `chart "${chart.id}" dataKeys가 비어있음`,
          });
        }
        if (!chart.colors || chart.colors.length === 0) {
          issues.push({
            agent: AGENT_NAME,
            field: `chart.${chart.id}.colors`,
            severity: 'critical',
            message: `chart "${chart.id}" colors가 비어있음`,
          });
        }

        // Type-specific validation
        if (chart.type === 'bar' || chart.type === 'line') {
          for (const item of chart.data) {
            const record = item as Record<string, unknown>;
            const nameKey = chart.type === 'bar' ? 'name' : Object.keys(record).find((k) => !chart.dataKeys.includes(k));
            if (!nameKey || !record[nameKey]) {
              // Check if there's at least a label key
              const hasLabel = Object.keys(record).some((k) => !chart.dataKeys.includes(k));
              if (!hasLabel) {
                issues.push({
                  agent: AGENT_NAME,
                  field: `chart.${chart.id}.data`,
                  severity: 'warning',
                  message: `bar/line chart 항목에 라벨 키 없음`,
                });
                break;
              }
            }
            for (const key of chart.dataKeys) {
              if (typeof record[key] !== 'number') {
                issues.push({
                  agent: AGENT_NAME,
                  field: `chart.${chart.id}.data`,
                  severity: 'critical',
                  message: `bar/line chart dataKey "${key}" 값이 숫자가 아님`,
                });
                break;
              }
            }
          }
        }

        if (chart.type === 'radar') {
          for (const item of chart.data) {
            const record = item as Record<string, unknown>;
            if (!record.stat) {
              issues.push({
                agent: AGENT_NAME,
                field: `chart.${chart.id}.data`,
                severity: 'critical',
                message: 'radar chart 항목에 "stat" 필드 없음',
              });
              break;
            }
            if (typeof record.value !== 'number' || record.value < 0 || record.value > 100) {
              issues.push({
                agent: AGENT_NAME,
                field: `chart.${chart.id}.data`,
                severity: 'critical',
                message: `radar chart value가 0-100 범위 밖: ${record.value}`,
              });
              break;
            }
          }
        }

        if (chart.type === 'pie') {
          for (const item of chart.data) {
            const record = item as Record<string, unknown>;
            if (!record.name) {
              issues.push({
                agent: AGENT_NAME,
                field: `chart.${chart.id}.data`,
                severity: 'critical',
                message: 'pie chart 항목에 "name" 없음',
              });
              break;
            }
            if (typeof record.value !== 'number') {
              issues.push({
                agent: AGENT_NAME,
                field: `chart.${chart.id}.data`,
                severity: 'critical',
                message: `pie chart value가 숫자가 아님: ${record.value}`,
              });
              break;
            }
            if (!record.fill || typeof record.fill !== 'string' || !record.fill.startsWith('#')) {
              issues.push({
                agent: AGENT_NAME,
                field: `chart.${chart.id}.data`,
                severity: 'critical',
                message: `pie chart fill이 hex 색상이 아님: ${record.fill}`,
              });
              break;
            }
          }
        }
      }
    }

    // DataRows: 2-5
    if (!dataRows || dataRows.length < 2) {
      issues.push({
        agent: AGENT_NAME,
        field: 'evidence.dataRows',
        severity: 'critical',
        message: `dataRows가 ${dataRows?.length ?? 0}개 (최소 2개)`,
      });
    } else if (dataRows.length > 5) {
      issues.push({
        agent: AGENT_NAME,
        field: 'evidence.dataRows',
        severity: 'warning',
        message: `dataRows가 ${dataRows.length}개 (최대 5개)`,
      });
    }

    // Validate each dataRow
    if (dataRows) {
      for (const row of dataRows) {
        if (!row.label) {
          issues.push({
            agent: AGENT_NAME,
            field: 'dataRow.label',
            severity: 'critical',
            message: 'dataRow에 label 없음',
          });
        }
        if (row.value === null || row.value === undefined) {
          issues.push({
            agent: AGENT_NAME,
            field: 'dataRow.value',
            severity: 'critical',
            message: `dataRow "${row.label}" value가 null/undefined`,
          });
        }
        if (!row.interpretation) {
          issues.push({
            agent: AGENT_NAME,
            field: 'dataRow.interpretation',
            severity: 'critical',
            message: `dataRow "${row.label}" interpretation 없음`,
          });
        }
      }
    }
  }

  // Null/undefined check in required fields
  const jsonStr = JSON.stringify(article);
  if (jsonStr.includes(':null') && !jsonStr.includes('"thumbnailUrl":""')) {
    // Check for actual null values in critical paths
    const nullMatches = jsonStr.match(/"[^"]+":null/g) || [];
    const filteredNulls = nullMatches.filter((m) => !m.includes('thumbnailUrl'));
    if (filteredNulls.length > 0) {
      issues.push({
        agent: AGENT_NAME,
        field: 'general',
        severity: 'warning',
        message: `null 값 발견: ${filteredNulls.join(', ')}`,
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
