import type { Article, CollectedData, QAAgentResult, QAIssue } from '../lib/types.js';

const AGENT_NAME = 'data-validator';

export function validateData(
  article: Article,
  collected: CollectedData,
): QAAgentResult {
  const issues: QAIssue[] = [];

  // 1. Reddit quote verification: check that English quotes in content exist in collected data
  // Use full comment bodies for matching
  const allCommentBodies = collected.reddit.flatMap((p) =>
    p.comments.map((c) => c.body),
  );
  const allPostTitles = collected.reddit.map((p) => p.title);
  const allPostBodies = collected.reddit.map((p) => p.body);
  const allSourceTexts = [...allCommentBodies, ...allPostTitles, ...allPostBodies]
    .map((t) => t.toLowerCase());

  const quoteRegex = /"([^"]{10,})"/g;
  const contentQuotes: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = quoteRegex.exec(article.content)) !== null) {
    const quote = match[1];
    // Only check purely English quotes (skip Korean-translated or mixed-language text)
    const englishWords = quote.split(/\s+/).filter((w) => /^[a-zA-Z'.,!?]+$/.test(w));
    if (englishWords.length >= 3 && !/[\uAC00-\uD7AF]/.test(quote)) {
      contentQuotes.push(quote);
    }
  }

  for (const quote of contentQuotes) {
    // Fuzzy matching: extract significant words and check overlap
    const quoteWords = quote.toLowerCase().split(/\s+/)
      .filter((w) => w.length > 2)
      .slice(0, 8);

    const found = allSourceTexts.some((source) => {
      const matchedWords = quoteWords.filter((w) => source.includes(w));
      return matchedWords.length >= Math.min(3, quoteWords.length * 0.5);
    });

    if (!found) {
      issues.push({
        agent: AGENT_NAME,
        field: 'content',
        severity: 'warning',
        message: `영문 인용 출처 미확인: "${quote.substring(0, 60)}..."`,
      });
    }
  }

  // 2. Reddit score verification
  const scoreRegex = /\((\d[\d,]*)\s*추천\)/g;
  while ((match = scoreRegex.exec(article.content)) !== null) {
    const reportedScore = parseInt(match[1].replace(/,/g, ''), 10);
    const allScores = [
      ...collected.reddit.map((p) => p.score),
      ...collected.reddit.flatMap((p) => p.comments.map((c) => c.score)),
    ];
    const closeMatch = allScores.some(
      (s) => Math.abs(s - reportedScore) / Math.max(s, 1) <= 0.05,
    );
    if (!closeMatch && reportedScore > 0) {
      // Allow approximate matches
      const anyMatch = allScores.some(
        (s) => Math.abs(s - reportedScore) <= 5,
      );
      if (!anyMatch) {
        issues.push({
          agent: AGENT_NAME,
          field: 'content',
          severity: 'info',
          message: `Reddit score ${reportedScore} 수집 데이터와 불일치 (±5% 초과)`,
        });
      }
    }
  }

  // 3. News source verification
  const newsOutlets = collected.googleNews.map((n) => n.source.toLowerCase());
  const evidence = article.evidence;
  if (evidence) {
    for (const row of evidence.dataRows) {
      if (row.source) {
        const sources = row.source.split(/[\/,&]/).map((s) => s.trim().toLowerCase());
        for (const src of sources) {
          if (src && src !== 'fotmob' && src !== 'reddit') {
            // Check if source exists in news or is a well-known outlet
            const knownSources = [
              'reddit', 'r/soccer', 'r/besiktas', 'sofascore',
              'fotmob', 'transfermarkt', 'whoscored',
              'chosunbiz', 'türkiye today', 'turkiye today',
            ];
            const isKnown = knownSources.some((k) => src.includes(k) || k.includes(src));
            const isRedditSource = /^reddit\s*r\//.test(src);
            const isInNews = newsOutlets.some((o) => o.includes(src) || src.includes(o));
            if (isRedditSource) continue; // Reddit sources are always valid
            if (!isKnown && !isInNews) {
              // Just info, not critical
              issues.push({
                agent: AGENT_NAME,
                field: `dataRow.source`,
                severity: 'info',
                message: `출처 "${row.source}"가 수집 데이터에서 직접 확인되지 않음`,
              });
            }
          }
        }
      }
    }
  }

  // 4. Sentiment pie chart value sum = 100
  if (evidence) {
    for (const chart of evidence.charts) {
      if (chart.type === 'pie') {
        const sum = chart.data.reduce(
          (acc, d) => acc + ((d as Record<string, number>).value || 0),
          0,
        );
        if (sum !== 100) {
          issues.push({
            agent: AGENT_NAME,
            field: `chart.${chart.id}`,
            severity: 'critical',
            message: `Pie chart "${chart.title}" value 합계 = ${sum} (100이어야 함)`,
          });
        }
      }
    }
  }

  // 5. publishedAt validation
  const pubDate = new Date(article.publishedAt);
  if (isNaN(pubDate.getTime())) {
    issues.push({
      agent: AGENT_NAME,
      field: 'publishedAt',
      severity: 'critical',
      message: `publishedAt이 유효한 ISO 8601이 아님: ${article.publishedAt}`,
    });
  } else {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (pubDate < sevenDaysAgo) {
      issues.push({
        agent: AGENT_NAME,
        field: 'publishedAt',
        severity: 'warning',
        message: `publishedAt이 7일 이전: ${article.publishedAt}`,
      });
    }
  }

  // 6. Source fields not empty
  if (evidence) {
    for (const row of evidence.dataRows) {
      if (!row.source || row.source.trim() === '') {
        issues.push({
          agent: AGENT_NAME,
          field: 'dataRow.source',
          severity: 'warning',
          message: `dataRow "${row.label}"의 source가 비어있음`,
        });
      }
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
