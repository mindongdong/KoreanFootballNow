import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { OUTPUT_DIR, QA_MAX_ITERATIONS, QA_PASS_SCORE } from './lib/constants.js';
import type { Article, PlayerCollectionResult, QAReport, QAAgentResult } from './lib/types.js';
import { validateData } from './qa-agents/data-validator.js';
import { validateKorean } from './qa-agents/korean-qa.js';
import { validateSchema } from './qa-agents/schema-validator.js';
import { reviewQuality } from './qa-agents/quality-reviewer.js';

function loadArticle(): Article {
  const path = join(OUTPUT_DIR, 'article-oh-draft.json');
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function loadCollectedData(): PlayerCollectionResult {
  const path = join(OUTPUT_DIR, 'collected-data-oh.json');
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function runQAIteration(article: Article, collected: PlayerCollectionResult): QAAgentResult[] {
  return [
    validateData(article, collected.collected),
    validateKorean(article),
    validateSchema(article),
    reviewQuality(article),
  ];
}

function printResults(results: QAAgentResult[], iteration: number): void {
  console.log(`\n--- QA Iteration ${iteration} ---`);
  for (const result of results) {
    const status = result.pass ? '  PASS' : '  FAIL';
    console.log(`${status} [${result.agent}] score: ${result.score}`);
    for (const issue of result.issues) {
      const icon =
        issue.severity === 'critical' ? '    !!!' :
        issue.severity === 'warning' ? '    !!' :
        '    i';
      console.log(`${icon} [${issue.field}] ${issue.message}`);
    }
  }
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('=== KFN QA 파이프라인 ===');

  const collected = loadCollectedData();
  const allReports: QAReport[] = [];

  for (let iteration = 1; iteration <= QA_MAX_ITERATIONS; iteration++) {
    const article = loadArticle();

    console.log(`\n========== Iteration ${iteration}/${QA_MAX_ITERATIONS} ==========`);
    console.log(`기사: "${article.title.substring(0, 50)}..."`);

    const results = runQAIteration(article, collected);
    printResults(results, iteration);

    const allPass = results.every((r) => r.pass);
    const totalScore = Math.round(
      results.reduce((sum, r) => sum + r.score, 0) / results.length,
    );

    const report: QAReport = {
      iteration,
      timestamp: new Date().toISOString(),
      results,
      allPass,
      totalScore,
    };
    allReports.push(report);

    console.log(`\n--- 종합 ---`);
    console.log(`전체 통과: ${allPass ? 'YES' : 'NO'}`);
    console.log(`평균 점수: ${totalScore}/100 (기준: ${QA_PASS_SCORE})`);

    if (allPass && totalScore >= QA_PASS_SCORE) {
      console.log(`\n=== QA 통과! (Iteration ${iteration}) ===`);

      // Save final article
      const finalPath = join(OUTPUT_DIR, 'article-oh-final.json');
      writeFileSync(finalPath, JSON.stringify(article, null, 2), 'utf-8');
      console.log(`최종 기사: ${finalPath}`);
      break;
    }

    if (iteration < QA_MAX_ITERATIONS) {
      console.log(`\n이슈가 발견되었습니다. 수정 후 다시 실행하세요.`);
      console.log(`(article-oh-draft.json을 수정한 뒤 다시 npx tsx scripts/qa-pipeline.ts 실행)`);

      // Log issues for correction guidance
      const allIssues = results.flatMap((r) => r.issues);
      const criticals = allIssues.filter((i) => i.severity === 'critical');
      const warnings = allIssues.filter((i) => i.severity === 'warning');

      if (criticals.length > 0) {
        console.log(`\n[CRITICAL 이슈 ${criticals.length}건 - 반드시 수정]`);
        for (const issue of criticals) {
          console.log(`  - [${issue.field}] ${issue.message}`);
        }
      }
      if (warnings.length > 0) {
        console.log(`\n[WARNING 이슈 ${warnings.length}건 - 권장 수정]`);
        for (const issue of warnings) {
          console.log(`  - [${issue.field}] ${issue.message}`);
        }
      }

      // In automated mode, just save report and break
      // (manual iteration: user fixes draft and re-runs)
      break;
    }
  }

  // Save QA report
  const reportPath = join(OUTPUT_DIR, 'qa-report-oh.json');
  writeFileSync(reportPath, JSON.stringify(allReports, null, 2), 'utf-8');
  console.log(`\nQA 리포트: ${reportPath}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
