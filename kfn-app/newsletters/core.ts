/**
 * Newsletter Core Build Module
 *
 * Shared build logic for CLI (build.ts) and serverless (subscribe.ts).
 * All paths are passed as parameters — no import.meta.url dependency.
 */

import { readFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';

// ─── Frontmatter Parser ───

interface Frontmatter {
  subject: string;
  title: string;
  date: string;
  week: string;
  next_report: string;
  feedback_url?: string;
  unsubscribe_url?: string;
}

function parseFrontmatter(content: string): { meta: Frontmatter; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error('Invalid frontmatter: missing --- delimiters');

  const meta: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }

  return {
    meta: meta as unknown as Frontmatter,
    body: match[2].trim(),
  };
}

// ─── Section Parser ───

interface Section {
  name: string;
  content: string;
}

function parseSections(body: string): Section[] {
  const sections: Section[] = [];
  const parts = body.split(/^## /m);

  for (const part of parts.slice(1)) {
    const nl = part.indexOf('\n');
    sections.push({
      name: part.slice(0, nl).trim(),
      content: part.slice(nl + 1).trim(),
    });
  }

  return sections;
}

// ─── Section Renderers ───

function renderWelcome(content: string): string {
  const text = content.trim();
  return `
                    <tr>
                        <td style="padding: 28px 40px; background-color: #f0fdf4; border-bottom: 1px solid #f5f5f5;">
                            <p style="margin: 0 0 6px 0; font-size: 11px; color: #15803d; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">WELCOME</p>
                            <p style="margin: 0; font-size: 13px; color: #166534; line-height: 1.7;">${text}</p>
                        </td>
                    </tr>`;
}

function renderSnapshot(content: string): string {
  const lines = content.split('\n').filter((l) => l.trim());
  const stats: { label: string; value: string }[] = [];
  let note = '';

  for (const line of lines) {
    const tableMatch = line.match(/^\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/);
    if (tableMatch) {
      stats.push({ label: tableMatch[1].trim(), value: tableMatch[2].trim() });
    }
    if (line.startsWith('>')) {
      note = line.slice(1).trim();
    }
  }

  // Render stats in 2-column rows
  let statsHtml = '';
  for (let i = 0; i < stats.length; i += 2) {
    const left = stats[i];
    const right = stats[i + 1];
    if (right) {
      statsHtml += `
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <span style="font-size: 13px; color: #666666;">${left.label}</span>
                                        <span style="margin-left: 8px; font-size: 15px; font-weight: 600; color: #000000;">${left.value}</span>
                                    </td>
                                    <td style="padding: 8px 0;">
                                        <span style="font-size: 13px; color: #666666;">${right.label}</span>
                                        <span style="margin-left: 8px; font-size: 15px; font-weight: 600; color: #000000;">${right.value}</span>
                                    </td>
                                </tr>`;
    } else {
      statsHtml += `
                                <tr>
                                    <td colspan="2" style="padding: 8px 0;">
                                        <span style="font-size: 13px; color: #666666;">${left.label}</span>
                                        <span style="margin-left: 8px; font-size: 15px; font-weight: 600; color: #000000;">${left.value}</span>
                                    </td>
                                </tr>`;
    }
  }

  const noteHtml = note
    ? `\n                            <p style="margin: 16px 0 0 0; padding: 12px; background-color: #fafafa; font-size: 12px; color: #666666; line-height: 1.5; border-radius: 6px;">${note}</p>`
    : '';

  return `
                    <tr>
                        <td style="padding: 30px 40px; border-bottom: 1px solid #f5f5f5;">
                            <p style="margin: 0 0 12px 0; font-size: 11px; color: #999999; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">WEEKLY SNAPSHOT</p>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">${statsHtml}
                            </table>${noteHtml}
                        </td>
                    </tr>`;
}

interface PlayerData {
  rank: number;
  name: string;
  props: Record<string, string>;
}

function parsePlayerBlocks(content: string): PlayerData[] {
  const players: PlayerData[] = [];
  const blocks = content.split(/^### /m).filter((b) => b.trim());

  for (const block of blocks) {
    const lines = block.split('\n').filter((l) => l.trim());
    const header = lines[0].trim();
    const rankMatch = header.match(/^(\d+)\.\s*(.+)/);
    const name = rankMatch ? rankMatch[2].trim() : header;
    const rank = rankMatch ? parseInt(rankMatch[1]) : 0;

    const props: Record<string, string> = {};
    for (const line of lines.slice(1)) {
      const m = line.match(/^-\s*(.+?):\s*(.+)/);
      if (m) props[m[1].trim()] = m[2].trim();
    }

    players.push({ rank, name, props });
  }

  return players;
}

function renderTop3(content: string): string {
  const players = parsePlayerBlocks(content);
  const rankColors = ['#000000', '#666666', '#999999'];

  const cardsHtml = players
    .map((p, i) => {
      const isFirst = i === 0;
      const color = rankColors[i] || '#999999';
      const padding = isFirst ? '20px' : '18px';
      const border = isFirst ? '#e8e8e8' : '#f0f0f0';
      const nameSize = isFirst ? '16px' : '15px';
      const mvpSize = isFirst ? '24px' : '20px';
      const marginBottom = i < players.length - 1 ? 'margin-bottom: 20px;' : '';

      const team = p.props['소속'] || '';
      const mvp = p.props['MVP 점수'] || '';
      const season = p.props['시즌 누적'] || '';

      if (isFirst) {
        const matches = p.props['경기 / 시간'] || '';
        const goals = p.props['골 / 도움'] || '';
        const rating = p.props['평점'] || '';

        return `
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="${marginBottom}">
                                <tr>
                                    <td style="padding: ${padding}; border: 1px solid ${border}; background-color: #ffffff; border-radius: 8px;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td width="40" valign="top">
                                                    <div style="width: 32px; height: 32px; background-color: ${color}; color: #ffffff; text-align: center; line-height: 32px; font-size: 16px; font-weight: 700; border-radius: 6px;">${p.rank}</div>
                                                </td>
                                                <td style="padding-left: 15px;" valign="top">
                                                    <p style="margin: 0; font-size: ${nameSize}; font-weight: 700; color: #000000; letter-spacing: -0.3px;">${p.name}</p>
                                                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #666666;">${team}</p>
                                                </td>
                                                <td align="right" valign="top">
                                                    <p style="margin: 0; font-size: 11px; color: #999999;">MVP 점수</p>
                                                    <p style="margin: 2px 0 0 0; font-size: ${mvpSize}; font-weight: 300; color: #000000;">${mvp}</p>
                                                </td>
                                            </tr>
                                        </table>
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #f5f5f5;">
                                            <tr>
                                                <td width="33%" style="padding: 4px 0;">
                                                    <p style="margin: 0; font-size: 10px; color: #999999;">경기 / 시간</p>
                                                    <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 600; color: #000000;">${matches}</p>
                                                </td>
                                                <td width="33%" style="padding: 4px 0; text-align: center;">
                                                    <p style="margin: 0; font-size: 10px; color: #999999;">골 / 도움</p>
                                                    <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 600; color: #000000;">${goals}</p>
                                                </td>
                                                <td width="33%" style="padding: 4px 0; text-align: right;">
                                                    <p style="margin: 0; font-size: 10px; color: #999999;">평점</p>
                                                    <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 600; color: #000000;">${rating}</p>
                                                </td>
                                            </tr>
                                        </table>
                                        <p style="margin: 16px 0 0 0; padding: 10px; background-color: #fafafa; font-size: 11px; color: #666666; border-radius: 6px;">시즌 누적: ${season}</p>
                                    </td>
                                </tr>
                            </table>`;
      }

      // 2nd, 3rd place: compact card
      const matches = p.props['경기 / 시간'] || '';
      const goals = p.props['골 / 도움'] || '';
      const rating = p.props['평점'] || '';
      const summary = `${matches} · ${goals.replace(' / ', '골 ')}도움 · 평점 ${rating}`;

      return `
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="${marginBottom}">
                                <tr>
                                    <td style="padding: ${padding}; border: 1px solid ${border}; background-color: #ffffff; border-radius: 8px;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td width="40" valign="top">
                                                    <div style="width: 32px; height: 32px; background-color: ${color}; color: #ffffff; text-align: center; line-height: 32px; font-size: 16px; font-weight: 700; border-radius: 6px;">${p.rank}</div>
                                                </td>
                                                <td style="padding-left: 15px;" valign="top">
                                                    <p style="margin: 0; font-size: ${nameSize}; font-weight: 700; color: #000000;">${p.name}</p>
                                                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #666666;">${team}</p>
                                                </td>
                                                <td align="right" valign="top">
                                                    <p style="margin: 0; font-size: 11px; color: #999999;">MVP 점수</p>
                                                    <p style="margin: 2px 0 0 0; font-size: ${mvpSize}; font-weight: 300; color: #000000;">${mvp}</p>
                                                </td>
                                            </tr>
                                        </table>
                                        <p style="margin: 12px 0 0 0; font-size: 12px; color: #666666;">${summary}</p>
                                        <p style="margin: 8px 0 0 0; font-size: 11px; color: #999999;">시즌 누적: ${season}</p>
                                    </td>
                                </tr>
                            </table>`;
    })
    .join('');

  return `
                    <tr>
                        <td style="padding: 35px 40px 30px 40px; border-bottom: 1px solid #f5f5f5;">
                            <p style="margin: 0 0 20px 0; font-size: 11px; color: #999999; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">WEEKLY TOP 3</p>${cardsHtml}
                        </td>
                    </tr>`;
}

function renderPosition(content: string): string {
  const blocks = content.split(/^### /m).filter((b) => b.trim());

  const cardsHtml = blocks
    .map((block, idx) => {
      const lines = block.split('\n').filter((l) => l.trim());
      const header = lines[0].trim(); // "공격수: 손흥민"
      const [position, name] = header.split(':').map((s) => s.trim());

      let team = '';
      let season = '';
      const recentGames: { match: string; stats: string }[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        const propMatch = line.match(/^-\s*(.+?):\s*(.+)/);
        if (propMatch) {
          const key = propMatch[1].trim();
          const val = propMatch[2].trim();
          if (key === '소속') team = val;
          if (key === '시즌') season = val;
        }
        const recentMatch = line.match(/^\s*-\s*(.+?)\s*\|\s*(.+)/);
        if (recentMatch) {
          recentGames.push({ match: recentMatch[1].trim(), stats: recentMatch[2].trim() });
        }
      }

      const recentRows = recentGames
        .map(
          (g, gi) => `
                                                <tr${gi < recentGames.length - 1 ? ' style="border-bottom: 1px solid #f0f0f0;"' : ''}>
                                                    <td style="padding: 6px 0; color: #666666;">${g.match}</td>
                                                    <td align="right" style="padding: 6px 0; color: ${g.stats === '미출전' ? '#999999' : '#000000'};">${g.stats}</td>
                                                </tr>`
        )
        .join('');

      const marginBottom = idx < blocks.length - 1 ? 'margin-bottom: 16px; ' : '';

      // Parse season string to extract rating for bold
      const seasonBold = season.replace(/(평점\s*)([\d.]+)/, '$1<strong>$2</strong>');

      return `
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="${marginBottom}background-color: #ffffff; border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 12px 16px; background-color: #f8f8f8; border-bottom: 1px solid #f0f0f0;">
                                        <p style="margin: 0; font-size: 11px; font-weight: 600; color: #666666; letter-spacing: 0.5px;">${position}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 16px;">
                                        <p style="margin: 0; font-size: 15px; font-weight: 700; color: #000000;">${name}</p>
                                        <p style="margin: 4px 0 0 0; font-size: 12px; color: #666666;">${team}</p>
                                        <p style="margin: 10px 0; font-size: 12px; color: #000000;">시즌 ${seasonBold}</p>
                                        <div style="padding: 12px; background-color: #fafafa; border-radius: 6px; border-left: 2px solid #e0e0e0;">
                                            <p style="margin: 0 0 10px 0; font-size: 10px; font-weight: 600; color: #999999; letter-spacing: 0.5px;">최근 3경기</p>
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 11px;">${recentRows}
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            </table>`;
    })
    .join('');

  return `
                    <tr>
                        <td style="padding: 35px 40px 30px 40px; background-color: #fafafa; border-bottom: 1px solid #f5f5f5;">
                            <p style="margin: 0 0 20px 0; font-size: 11px; color: #999999; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">POSITION BEST</p>${cardsHtml}
                        </td>
                    </tr>`;
}

function renderForm(content: string): string {
  const blocks = content.split(/^### /m).filter((b) => b.trim());
  let html = '';

  for (const block of blocks) {
    const lines = block.split('\n').filter((l) => l.trim());
    const category = lines[0].trim(); // 상승세 or 하락세
    const isLast = block === blocks[blocks.length - 1];
    const marginBottom = isLast ? '' : 'margin-bottom: 20px;';

    // Check for blockquote (empty category message)
    const quoteLine = lines.find((l) => l.trim().startsWith('>'));
    if (quoteLine) {
      const quoteText = quoteLine.slice(quoteLine.indexOf('>') + 1).trim();
      html += `
                            <div style="${marginBottom}">
                                <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 600; color: #000000;">${category}</p>
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #f0f0f0; border-radius: 8px;">
                                    <tr>
                                        <td style="padding: 14px; text-align: center; border-radius: 8px;">
                                            <p style="margin: 0; font-size: 12px; color: #999999;">${quoteText}</p>
                                        </td>
                                    </tr>
                                </table>
                            </div>`;
      continue;
    }

    // Parse player entries: "- 이름 | 소속 | 통계"
    const players = lines.slice(1).filter((l) => l.trim().startsWith('-'));
    const playersHtml = players
      .map((line) => {
        const parts = line.replace(/^-\s*/, '').split('|').map((s) => s.trim());
        const name = parts[0] || '';
        const team = parts[1] || '';
        const stats = parts[2] || '';

        // Bold the numeric values in stats
        const statsBold = stats.replace(/([\d.]+)/g, '<strong>$1</strong>');

        return `
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fafafa; border: 1px solid #f0f0f0; border-radius: 8px; margin-bottom: 8px;">
                                    <tr>
                                        <td style="padding: 14px; border-left: 2px solid #e0e0e0; border-radius: 8px;">
                                            <p style="margin: 0; font-size: 13px; font-weight: 600; color: #000000;">${name}</p>
                                            <p style="margin: 4px 0; font-size: 11px; color: #666666;">${team}</p>
                                            <p style="margin: 8px 0 0 0; font-size: 12px; color: #000000;">${statsBold}</p>
                                        </td>
                                    </tr>
                                </table>`;
      })
      .join('');

    html += `
                            <div style="${marginBottom}">
                                <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 600; color: #000000;">${category}</p>${playersHtml}
                            </div>`;
  }

  return `
                    <tr>
                        <td style="padding: 35px 40px 30px 40px; border-bottom: 1px solid #f5f5f5;">
                            <p style="margin: 0 0 20px 0; font-size: 11px; color: #999999; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">FORM ANALYSIS</p>${html}
                        </td>
                    </tr>`;
}

function renderSpotlight(content: string): string {
  const blocks = content.split(/^### /m).filter((b) => b.trim());
  if (blocks.length === 0) return '';

  const block = blocks[0];
  const lines = block.split('\n').filter((l) => l.trim());
  const name = lines[0].trim();

  let team = '';
  let season = '';
  let status = '';
  let note = '';

  for (const line of lines.slice(1)) {
    const trimmed = line.trim();
    const propMatch = trimmed.match(/^-\s*(.+?):\s*(.+)/);
    if (propMatch) {
      const key = propMatch[1].trim();
      const val = propMatch[2].trim();
      if (key === '소속') team = val;
      if (key === '시즌') season = val;
      if (key === '상태') status = val;
    }
    if (trimmed.startsWith('>')) {
      note = trimmed.slice(1).trim();
    }
  }

  const statusHtml = status
    ? `
                                        <div style="margin-top: 16px; padding: 14px; background-color: #f8f8f8; border-radius: 6px; border-left: 2px solid #e0e0e0;">
                                            <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; color: #666666;">현재 상태</p>
                                            <p style="margin: 0; font-size: 13px; color: #000000;">${status}</p>
                                        </div>`
    : '';

  const noteHtml = note
    ? `
                                        <p style="margin: 16px 0 0 0; padding: 12px; background-color: #fafafa; font-size: 11px; color: #666666; line-height: 1.6; border: 1px solid #f0f0f0; border-radius: 6px;">${note}</p>`
    : '';

  return `
                    <tr>
                        <td style="padding: 35px 40px 30px 40px; background-color: #fafafa; border-bottom: 1px solid #f5f5f5;">
                            <p style="margin: 0 0 20px 0; font-size: 11px; color: #999999; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">SPOTLIGHT PLAYER</p>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid #e8e8e8; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 24px; border-radius: 8px;">
                                        <p style="margin: 0; font-size: 18px; font-weight: 700; color: #000000; letter-spacing: -0.3px;">${name}</p>
                                        <p style="margin: 6px 0 0 0; font-size: 12px; color: #666666;">${team}</p>
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px;">
                                            <tr>
                                                <td style="padding: 12px; background-color: #fafafa; border: 1px solid #f0f0f0; border-radius: 6px;">
                                                    <p style="margin: 0 0 4px 0; font-size: 10px; color: #999999; text-transform: uppercase; letter-spacing: 0.5px;">시즌 누적</p>
                                                    <p style="margin: 0; font-size: 13px; color: #000000;">${season}</p>
                                                </td>
                                            </tr>
                                        </table>${statusHtml}${noteHtml}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>`;
}

function renderInjuries(content: string): string {
  const lines = content
    .split('\n')
    .filter((l) => l.trim().startsWith('-'))
    .map((l) => l.replace(/^-\s*/, '').trim());

  if (lines.length === 0) return '';

  const injuryCards = lines
    .map((line) => {
      const parts = line.split('|').map((s) => s.trim());
      const name = parts[0] || '';
      const team = parts[1] || '';
      const injury = parts[2] || '';
      const returnDate = parts[3] || '';

      return `
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid #f0f0f0; border-radius: 6px; margin-bottom: 8px;">
                                            <tr>
                                                <td style="padding: 14px; border-left: 2px solid #e0e0e0; border-radius: 6px;">
                                                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #000000;">${name}</p>
                                                    <p style="margin: 4px 0; font-size: 11px; color: #666666;">${team}</p>
                                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 10px;">
                                                        <tr>
                                                            <td style="padding: 6px 10px; background-color: #fafafa; font-size: 11px; color: #666666; border-radius: 4px;">
                                                                상태: <strong style="color: #000000;">${injury}</strong>
                                                            </td>
                                                            <td style="padding: 6px 10px; background-color: #fafafa; font-size: 11px; color: #666666; border-radius: 4px;">
                                                                예상 복귀: <strong style="color: #000000;">${returnDate}</strong>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>`;
    })
    .join('');

  return `
                    <tr>
                        <td style="padding: 35px 40px 30px 40px; border-bottom: 1px solid #f5f5f5;">
                            <p style="margin: 0 0 20px 0; font-size: 11px; color: #999999; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">INJURY LIST</p>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fafafa; border: 1px solid #f0f0f0; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 16px; border-radius: 8px;">
                                        <p style="margin: 0 0 14px 0; font-size: 12px; color: #666666;">현재 부상 중인 선수: <strong style="color: #000000;">${lines.length}명</strong></p>${injuryCards}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>`;
}

// ─── Section Router ───

const renderers: Record<string, (content: string) => string> = {
  WELCOME: renderWelcome,
  SNAPSHOT: renderSnapshot,
  TOP3: renderTop3,
  POSITION: renderPosition,
  FORM: renderForm,
  SPOTLIGHT: renderSpotlight,
  INJURIES: renderInjuries,
};

// ─── Public API ───

/**
 * Find the latest newsletter .md file by YYYY-MM-DD filename sorting.
 * Returns the full path, or null if no .md files exist.
 */
export function findLatestNewsletter(newslettersDir: string): string | null {
  let files: string[];
  try {
    files = readdirSync(newslettersDir);
  } catch {
    return null;
  }

  const mdFiles = files
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .sort()
    .reverse();

  if (mdFiles.length === 0) return null;
  return join(newslettersDir, mdFiles[0]);
}

/**
 * Build a newsletter from a markdown file + template.html in newslettersDir.
 * Returns { subject, html }.
 */
export function buildNewsletter(mdPath: string, newslettersDir: string): { subject: string; html: string } {
  const templatePath = resolve(newslettersDir, 'template.html');

  const mdContent = readFileSync(resolve(mdPath), 'utf-8');
  const templateContent = readFileSync(templatePath, 'utf-8');

  const { meta, body } = parseFrontmatter(mdContent);
  const sections = parseSections(body);

  // Render all sections
  const sectionsHtml = sections
    .map((s) => {
      const renderer = renderers[s.name];
      if (!renderer) {
        console.warn(`Unknown section: ${s.name}, skipping`);
        return '';
      }
      return renderer(s.content);
    })
    .filter(Boolean)
    .join('\n');

  // Fill template
  const siteUrl = process.env.SITE_URL || 'https://koreanfootballnow.com';
  const html = templateContent
    .replace(/\{\{TITLE\}\}/g, meta.title)
    .replace(/\{\{DATE\}\}/g, meta.date)
    .replace(/\{\{WEEK\}\}/g, meta.week)
    .replace(/\{\{NEXT_REPORT\}\}/g, meta.next_report)
    .replace(/\{\{FEEDBACK_URL\}\}/g, '#')
    .replace(/\{\{UNSUBSCRIBE_URL\}\}/g, `${siteUrl}/api/unsubscribe`)
    .replace(/\{\{SECTIONS\}\}/g, sectionsHtml);

  return { subject: meta.subject, html };
}
