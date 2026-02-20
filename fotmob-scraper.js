#!/usr/bin/env node
const { chromium } = require('playwright-core');
const fs = require('fs');

async function main() {
  let players;
  if (process.argv[2]) {
    players = JSON.parse(fs.readFileSync(process.argv[2], 'utf-8'));
  } else {
    players = JSON.parse(fs.readFileSync('/dev/stdin', 'utf-8'));
  }

  const results = [];

  const browser = await chromium.launch({
    executablePath: '/usr/lib/chromium/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
  });

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'ko-KR',
      timezoneId: 'Asia/Seoul'
    });

    for (const player of players) {
      const startTime = Date.now();
      const page = await context.newPage();

      try {
        await page.goto(`https://www.fotmob.com/players/${player.id}`, {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        });

        // __NEXT_DATA__에서 SSR 데이터 추출 (API intercept 대신)
        const apiData = await page.evaluate(() => {
          const el = document.getElementById('__NEXT_DATA__');
          if (!el) return null;
          const parsed = JSON.parse(el.textContent);
          return parsed.props.pageProps.data || null;
        });

        results.push({
          playerInfo: player,
          apiResponse: apiData || null,
          success: !!apiData,
          timestamp: new Date().toISOString(),
          duration: parseFloat(((Date.now() - startTime) / 1000).toFixed(2)),
          team: apiData?.primaryTeam?.teamName || 'Unknown',
          league: apiData?.mainLeague?.leagueName || 'Unknown',
          error: apiData ? null : '__NEXT_DATA__ 파싱 실패'
        });

      } catch (error) {
        results.push({
          playerInfo: player,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      } finally {
        await page.close();
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
      }
    }

    await context.close();
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(results));
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
