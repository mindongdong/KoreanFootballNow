import type { Article, QAAgentResult, QAIssue } from '../lib/types.js';

const AGENT_NAME = 'korean-qa';

const REQUIRED_SECTIONS = [
  '## 경기 요약',
  '## 해외 현지 반응 (AI 요약)',
  '## AI 분석 요약',
];

export function validateKorean(article: Article): QAAgentResult {
  const issues: QAIssue[] = [];

  // 1. Section headers exact match
  for (const section of REQUIRED_SECTIONS) {
    if (!article.content.includes(section)) {
      issues.push({
        agent: AGENT_NAME,
        field: 'content',
        severity: 'critical',
        message: `필수 섹션 누락: "${section}"`,
      });
    }
  }

  // 2. Player name consistency
  // Korean name check
  if (!article.content.includes('오현규') && !article.title.includes('오현규')) {
    issues.push({
      agent: AGENT_NAME,
      field: 'content',
      severity: 'critical',
      message: '한글 선수명 "오현규"가 기사에 없음',
    });
  }

  // English name check - should use "Hyeon-Gyu Oh", NOT "Hyun Gyu Oh"
  if (article.content.includes('Hyun Gyu Oh') || article.title.includes('Hyun Gyu Oh')) {
    issues.push({
      agent: AGENT_NAME,
      field: 'content',
      severity: 'critical',
      message: '잘못된 영문명 "Hyun Gyu Oh" 사용됨 (정확: "Hyeon-Gyu Oh")',
    });
  }

  if (article.playerName !== 'Hyeon-Gyu Oh') {
    issues.push({
      agent: AGENT_NAME,
      field: 'playerName',
      severity: 'warning',
      message: `playerName이 "Hyeon-Gyu Oh"가 아님: "${article.playerName}"`,
    });
  }

  if (article.playerNameKr !== '오현규') {
    issues.push({
      agent: AGENT_NAME,
      field: 'playerNameKr',
      severity: 'critical',
      message: `playerNameKr이 "오현규"가 아님: "${article.playerNameKr}"`,
    });
  }

  // 3. Chart/data labels should be Korean
  const evidence = article.evidence;
  if (evidence) {
    for (const chart of evidence.charts) {
      if (!/[\uAC00-\uD7AF]/.test(chart.title)) {
        issues.push({
          agent: AGENT_NAME,
          field: `chart.${chart.id}.title`,
          severity: 'warning',
          message: `차트 제목이 한글이 아님: "${chart.title}"`,
        });
      }
    }

    for (const row of evidence.dataRows) {
      if (!/[\uAC00-\uD7AF]/.test(row.label)) {
        issues.push({
          agent: AGENT_NAME,
          field: 'dataRow.label',
          severity: 'warning',
          message: `dataRow 라벨이 한글이 아님: "${row.label}"`,
        });
      }
    }
  }

  // 4. Tags check
  if (!article.tags.includes('오현규')) {
    issues.push({
      agent: AGENT_NAME,
      field: 'tags',
      severity: 'critical',
      message: '태그에 "오현규" 없음',
    });
  }
  if (!article.tags.includes('베식타스')) {
    issues.push({
      agent: AGENT_NAME,
      field: 'tags',
      severity: 'warning',
      message: '태그에 "베식타스" 없음',
    });
  }

  // 5. Encoding check - broken Korean characters
  const brokenChars = /[\ufffd\ufffe\uffff]/;
  const allText = `${article.title}${article.subtitle}${article.summary}${article.content}`;
  if (brokenChars.test(allText)) {
    issues.push({
      agent: AGENT_NAME,
      field: 'content',
      severity: 'critical',
      message: '깨진 한글 문자 발견',
    });
  }

  // 6. Incomplete sentences check
  const sentences = allText.split(/[.!?。]\s*/);
  const incompleteSentences = sentences.filter(
    (s) => s.trim().length > 0 && s.trim().length < 5 && !/^[#\-*>|]/.test(s.trim()),
  );
  if (incompleteSentences.length > 3) {
    issues.push({
      agent: AGENT_NAME,
      field: 'content',
      severity: 'warning',
      message: `미완성 문장 ${incompleteSentences.length}개 발견`,
    });
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
