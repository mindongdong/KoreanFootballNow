/**
 * Newsletter Build Script (CLI wrapper)
 *
 * Usage:
 *   npx tsx newsletters/build.ts newsletters/2025-11-17.md              # HTML 출력 (미리보기)
 *   npx tsx newsletters/build.ts newsletters/2025-11-17.md --send       # HTML 생성 + API 발송
 *   npx tsx newsletters/build.ts newsletters/2025-11-17.md --out out.html  # 파일로 저장
 */

import { writeFileSync } from 'fs';
import { dirname } from 'path';
import { buildNewsletter } from './core.js';

async function main() {
  const args = process.argv.slice(2);
  const mdPath = args.find((a) => !a.startsWith('--'));
  const shouldSend = args.includes('--send');
  const outIdx = args.indexOf('--out');
  const outPath = outIdx >= 0 ? args[outIdx + 1] : null;

  if (!mdPath) {
    console.error('Usage: npx tsx newsletters/build.ts <file.md> [--send] [--out file.html]');
    process.exit(1);
  }

  const newslettersDir = dirname(new URL(import.meta.url).pathname);
  const { subject, html } = buildNewsletter(mdPath, newslettersDir);

  if (outPath) {
    writeFileSync(outPath, html, 'utf-8');
    console.log(`HTML saved to ${outPath}`);
  }

  if (shouldSend) {
    const apiUrl = process.env.API_URL || 'http://localhost:3456';
    const secret = process.env.NEWSLETTER_SEND_SECRET;

    if (!secret) {
      console.error('NEWSLETTER_SEND_SECRET is required for sending');
      process.exit(1);
    }

    console.log(`Sending "${subject}" via ${apiUrl}/api/send-newsletter ...`);

    const res = await fetch(`${apiUrl}/api/send-newsletter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ subject, html }),
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`Sent to ${data.sent} subscribers`);
    } else {
      console.error('Send failed:', data);
      process.exit(1);
    }
  }

  if (!outPath && !shouldSend) {
    // Print to stdout for preview
    process.stdout.write(html);
  }
}

main();
