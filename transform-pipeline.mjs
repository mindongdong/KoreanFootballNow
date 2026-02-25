#!/usr/bin/env node
/**
 * n8n Pipeline Transformer: Option B
 * Reddit AI Agent Code node → n8n native LangChain Agent nodes
 *
 * Changes:
 * 1. Replace Reddit AI Agent (Code) → Reddit AI Agent (native agent v3.1)
 * 2. Add OpenAI Chat Model (Reddit) sub-node
 * 3. Add Arctic Shift 검색 tool (toolHttpRequest v1.1)
 * 4. Add Reddit 댓글 조회 tool (toolHttpRequest v1.1)
 * 5. Add Reddit 결과 변환 Code node (agent output parser)
 * 6. Modify 검색 프롬프트 빌드: add redditSystemPrompt, redditUserPrompt
 * 7. Modify 검색 결과 병합 파싱: reference Reddit 결과 변환
 * 8. Update all connections
 */

import { readFileSync, writeFileSync } from 'fs';

const INPUT_FILE = './n8n_opinion_pipeline.json';
const OUTPUT_FILE = './n8n_opinion_pipeline.json';

const workflow = JSON.parse(readFileSync(INPUT_FILE, 'utf-8'));

// ============================================================
// Step 1: Remove old Reddit AI Agent Code node
// ============================================================
const oldAgentIdx = workflow.nodes.findIndex(
  n => n.id === 'a1b2c3d4-0014-4000-a000-000000000014'
);
if (oldAgentIdx === -1) {
  throw new Error('Reddit AI Agent Code node not found');
}
console.log(`[1/8] Removing old Reddit AI Agent Code node at index ${oldAgentIdx}`);
workflow.nodes.splice(oldAgentIdx, 1);

// ============================================================
// Step 2: Add new native AI Agent node (v3.1)
// ============================================================
console.log('[2/8] Adding native Reddit AI Agent (langchain.agent v3.1)');
workflow.nodes.push({
  parameters: {
    promptType: 'define',
    text: '={{ $json.redditUserPrompt }}',
    options: {
      systemMessage: '={{ $json.redditSystemPrompt }}',
      maxIterations: 15,
      returnIntermediateSteps: true,
    },
  },
  type: '@n8n/n8n-nodes-langchain.agent',
  typeVersion: 3.1,
  position: [360, 300],
  id: 'a1b2c3d4-0014-4000-a000-000000000014',
  name: 'Reddit AI Agent',
  onError: 'continueRegularOutput',
});

// ============================================================
// Step 3: Add OpenAI Chat Model (Reddit) sub-node
// ============================================================
console.log('[3/8] Adding OpenAI Chat Model (Reddit) sub-node');
workflow.nodes.push({
  parameters: {
    model: {
      __rl: true,
      mode: 'list',
      value: 'gpt-4o',
    },
    options: {
      temperature: 0.7,
    },
  },
  type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
  typeVersion: 1.3,
  position: [260, 520],
  id: 'a1b2c3d4-0030-4000-a000-000000000030',
  name: 'OpenAI Chat Model (Reddit)',
  credentials: {
    openAiApi: {
      id: 'openai-api',
      name: 'OpenAI API',
    },
  },
});

// ============================================================
// Step 4: Add Arctic Shift 검색 tool
// ============================================================
console.log('[4/8] Adding Arctic Shift 검색 HTTP Request Tool');
workflow.nodes.push({
  parameters: {
    toolDescription:
      'Search for Reddit posts about Korean football players using the Arctic Shift historical Reddit archive. ' +
      'Use this to find posts by player name, team, or related keywords. ' +
      'Try multiple query variations: full name, last name only, team + name. ' +
      'Returns posts with id, title, score, subreddit, permalink, num_comments, and created_utc timestamp. ' +
      'Use the post id and subreddit from results to fetch comments with the other tool. ' +
      'Focus on posts with score > 5 or num_comments > 3 for quality discussions.',
    method: 'GET',
    url: 'https://arctic-shift.photon-reddit.com/api/posts/search',
    authentication: 'none',
    sendQuery: true,
    specifyQuery: 'keypair',
    parametersQuery: {
      values: [
        {
          name: 'query',
        },
        {
          name: 'subreddit',
        },
        {
          name: 'limit',
          valueProvider: 'fieldValue',
          value: '10',
        },
        {
          name: 'sort',
          valueProvider: 'fieldValue',
          value: 'score',
        },
      ],
    },
    sendHeaders: true,
    specifyHeaders: 'keypair',
    parametersHeaders: {
      values: [
        {
          name: 'User-Agent',
          valueProvider: 'fieldValue',
          value: 'KFN-Bot/1.0 (Korean Football Now)',
        },
      ],
    },
    sendBody: false,
    optimizeResponse: true,
  },
  type: '@n8n/n8n-nodes-langchain.toolHttpRequest',
  typeVersion: 1.1,
  position: [360, 520],
  id: 'a1b2c3d4-0031-4000-a000-000000000031',
  name: 'Arctic Shift 검색',
});

// ============================================================
// Step 5: Add Reddit 댓글 조회 tool
// ============================================================
console.log('[5/8] Adding Reddit 댓글 조회 HTTP Request Tool');
workflow.nodes.push({
  parameters: {
    toolDescription:
      'Fetch top comments from a specific Reddit post. ' +
      'Requires the subreddit name (without r/ prefix) and post_id from Arctic Shift search results. ' +
      'Returns the post data and top comments with author, score, body text, and author flair. ' +
      'IMPORTANT: Only fetch comments for ONE post at a time to avoid Reddit rate limiting. ' +
      'Wait between calls if fetching multiple posts.',
    method: 'GET',
    url: 'https://www.reddit.com/r/{subreddit}/comments/{post_id}.json',
    authentication: 'none',
    placeholderDefinitions: {
      values: [
        {
          name: 'subreddit',
          description: 'Subreddit name without r/ prefix, e.g. soccer, besiktas, fcbayern',
        },
        {
          name: 'post_id',
          description:
            'Reddit post ID from Arctic Shift search results (the id field of a post)',
        },
      ],
    },
    sendQuery: true,
    specifyQuery: 'keypair',
    parametersQuery: {
      values: [
        {
          name: 'limit',
          valueProvider: 'fieldValue',
          value: '20',
        },
        {
          name: 'sort',
          valueProvider: 'fieldValue',
          value: 'top',
        },
      ],
    },
    sendHeaders: true,
    specifyHeaders: 'keypair',
    parametersHeaders: {
      values: [
        {
          name: 'User-Agent',
          valueProvider: 'fieldValue',
          value: 'KFN-Bot/1.0 (Korean Football Now)',
        },
      ],
    },
    sendBody: false,
  },
  type: '@n8n/n8n-nodes-langchain.toolHttpRequest',
  typeVersion: 1.1,
  position: [460, 520],
  id: 'a1b2c3d4-0032-4000-a000-000000000032',
  name: 'Reddit 댓글 조회',
});

// ============================================================
// Step 6: Add Reddit 결과 변환 Code node
// ============================================================
console.log('[6/8] Adding Reddit 결과 변환 Code node');

const redditResultParserCode = `// ============================================
// Reddit 결과 변환 (n8n AI Agent → redditAgentResult 형식)
// Agent 텍스트 출력 + intermediateSteps에서
// Reddit URL 추출 + 기존 데이터 패스스루
// ============================================

const promptData = $('검색 프롬프트 빌드').first().json;
const agentJson = $('Reddit AI Agent').first().json;

// Agent 최종 텍스트 출력 (빈 출력 방어)
const agentOutput = (agentJson.output || '').trim();
const intermediateSteps = agentJson.intermediateSteps || [];

// === Reddit URL 추출: intermediateSteps에서 ===
const collectedSources = [];
const seenUrls = new Set();

function addSource(url, title) {
  if (url && !seenUrls.has(url)) {
    seenUrls.add(url);
    collectedSources.push({ url, title: title || '', type: 'reddit' });
  }
}

for (const step of intermediateSteps) {
  const obs = step.observation || '';

  // 1) JSON 형식 파싱 시도 (Arctic Shift 응답: { data: [...] })
  try {
    const parsed = typeof obs === 'string' ? JSON.parse(obs) : obs;

    // Arctic Shift 응답
    if (parsed.data && Array.isArray(parsed.data)) {
      for (const post of parsed.data) {
        if (post.permalink) {
          addSource(
            'https://reddit.com' + post.permalink,
            post.title || ''
          );
        }
      }
    }

    // Reddit JSON API 응답 (댓글 조회 시 post 정보 포함)
    if (Array.isArray(parsed) && parsed.length >= 1) {
      const postData = parsed[0]?.data?.children?.[0]?.data;
      if (postData && postData.permalink) {
        addSource(
          'https://reddit.com' + postData.permalink,
          postData.title || ''
        );
      }
    }
  } catch (e) {
    // JSON 파싱 실패 → regex로 Reddit URL 추출
  }

  // 2) Regex fallback: 텍스트에서 Reddit URL 직접 추출
  const urlPattern = /https?:\\/\\/(?:www\\.)?reddit\\.com\\/r\\/\\w+\\/comments\\/\\w+[^\\s\\)"']*/g;
  const obsStr = typeof obs === 'string' ? obs : JSON.stringify(obs);
  const urlMatches = obsStr.match(urlPattern) || [];
  for (const url of urlMatches) {
    addSource(url, '');
  }
}

// === Agent 최종 텍스트에서도 URL 추출 ===
if (agentOutput) {
  const textUrlPattern = /https?:\\/\\/(?:www\\.)?reddit\\.com\\/r\\/\\w+\\/comments\\/\\w+[^\\s\\)"']*/g;
  const textUrls = agentOutput.match(textUrlPattern) || [];
  for (const url of textUrls) {
    addSource(url, '');
  }
}

// === 결과 구성 ===
const redditSummaryText = agentOutput || '(Reddit 검색 결과 없음)';

return [{
  json: {
    redditAgentResult: {
      text: redditSummaryText,
      sources: collectedSources,
      turns: intermediateSteps.length,
    },
    player: promptData.player,
    mediaSearchRequest: promptData.mediaSearchRequest,
    attempt: promptData.attempt,
    accumulated: promptData.accumulated,
  }
}];`;

workflow.nodes.push({
  parameters: {
    jsCode: redditResultParserCode,
  },
  type: 'n8n-nodes-base.code',
  typeVersion: 1,
  position: [500, 300],
  id: 'a1b2c3d4-0033-4000-a000-000000000033',
  name: 'Reddit 결과 변환',
});

// ============================================================
// Step 7: Modify 검색 프롬프트 빌드 — add prompt strings
// ============================================================
console.log('[7/8] Modifying 검색 프롬프트 빌드 to add prompt strings');

const promptBuildNode = workflow.nodes.find(
  n => n.id === 'a1b2c3d4-0013-4000-a000-000000000013'
);
if (!promptBuildNode) throw new Error('검색 프롬프트 빌드 node not found');

// Find the return statement in jsCode and add prompt string generation before it
const oldPromptCode = promptBuildNode.parameters.jsCode;

// Replace the return block to include redditSystemPrompt and redditUserPrompt
const returnBlockRegex =
  /return \[\{\s*json:\s*\{\s*player,\s*redditAgentConfig,\s*mediaSearchRequest,\s*attempt,\s*accumulated,\s*\}\s*\}\];/;

const newReturnBlock = `// === Reddit AI Agent 프롬프트 생성 ===
const subs = (player.subreddits || []).map(s => 'r/' + s).join(', ');
const previousRedditCount = redditAgentConfig.previousRedditCount || 0;
const previousSummary = redditAgentConfig.previousSummary || '';

let retryContext = '';
if (previousRedditCount > 0) {
  retryContext = '\\n\\nPREVIOUS ATTEMPT CONTEXT:\\n' +
    'Previous attempts found ' + previousRedditCount + ' Reddit sources.\\n' +
    (previousRedditCount < 3
      ? 'Need more. Try DIFFERENT queries, different subreddits, alternative name spellings.\\n'
      : 'Sufficient count, but search for higher-quality content with more comments.\\n') +
    (previousSummary ? 'Previous summary excerpt: ' + previousSummary.substring(0, 500) : '');
}

const redditSystemPrompt = 'You are a Reddit research agent specialized in Korean football.\\n' +
  'Your task: find Reddit discussions about ' + player.fotmobName + ' (' + player.nameKr + ') at ' + player.team + '.\\n\\n' +
  'STRATEGY:\\n' +
  '1. Start by searching in r/soccer and team subreddit (' + subs + ')\\n' +
  '2. Try multiple query variations: full name, last name + team, different romanization\\n' +
  '3. When you find relevant posts with score > 5 or comments > 3, fetch their comments\\n' +
  '4. Look for fan reactions, opinions, sentiment about the player\\n' +
  '5. Collect at least 3 Reddit sources with actual comment quotes\\n\\n' +
  'SEARCH QUERIES TO TRY:\\n' +
  '- Primary: ' + player.searchQueries.reddit + '\\n' +
  '- Team + surname: "' + player.team + ' ' + player.fotmobName.split(' ').pop() + '"\\n' +
  '- Short name: "' + player.fotmobName.split(' ').pop() + '"\\n' +
  '- Try both r/soccer and ' + subs + '\\n\\n' +
  'IMPORTANT RULES:\\n' +
  '- You MUST use the search tools. NEVER answer about Reddit content from memory.\\n' +
  '- ALWAYS search first, then analyze results, then search more if needed.\\n' +
  '- If one query returns no results, try a different query variation immediately.\\n' +
  '- Fetch comments only from posts that are actually about THIS player.\\n' +
  '- Only fetch comments for ONE post at a time (rate limiting).\\n\\n' +
  'OUTPUT FORMAT (when done):\\n' +
  'Provide a structured summary with:\\n' +
  '- List of found posts: title, full reddit URL, score, num_comments\\n' +
  '- Top comments with EXACT quotes (in original language), author username, upvotes, flair\\n' +
  '- Overall fan sentiment analysis (positive/neutral/negative percentage estimate)\\n' +
  '- If no results found after trying multiple queries, state clearly that no Reddit discussions were found.' +
  retryContext;

const redditUserPrompt = 'Find Reddit discussions about ' + player.fotmobName +
  ' (' + player.nameKr + ') at ' + player.team + ' in ' + player.league + '. ' +
  'Search adaptively using multiple query variations. ' +
  'Start with the primary search query, then try alternatives if needed.';

return [{
  json: {
    player,
    redditAgentConfig,
    redditSystemPrompt,
    redditUserPrompt,
    mediaSearchRequest,
    attempt,
    accumulated,
  }
}];`;

if (returnBlockRegex.test(oldPromptCode)) {
  promptBuildNode.parameters.jsCode = oldPromptCode.replace(
    returnBlockRegex,
    newReturnBlock
  );
} else {
  // Fallback: find the last return statement
  const lastReturnIdx = oldPromptCode.lastIndexOf('return [{');
  if (lastReturnIdx === -1) throw new Error('Cannot find return block in 검색 프롬프트 빌드');

  promptBuildNode.parameters.jsCode =
    oldPromptCode.substring(0, lastReturnIdx) + newReturnBlock;
}

// ============================================================
// Step 8: Modify 검색 결과 병합 파싱 — reference Reddit 결과 변환
// ============================================================
console.log('[8/8] Modifying 검색 결과 병합 파싱 to reference Reddit 결과 변환');

const mergeParseNode = workflow.nodes.find(
  n => n.id === 'a1b2c3d4-0015-4000-a000-000000000015'
);
if (!mergeParseNode) throw new Error('검색 결과 병합 파싱 node not found');

// Replace $('Reddit AI Agent') → $('Reddit 결과 변환')
mergeParseNode.parameters.jsCode = mergeParseNode.parameters.jsCode.replace(
  /\$\('Reddit AI Agent'\)/g,
  "$('Reddit 결과 변환')"
);

// ============================================================
// Step 9: Update connections
// ============================================================
console.log('[9] Updating connections');

const conn = workflow.connections;

// Remove old 검색 프롬프트 빌드 → Reddit AI Agent connection
// and set new: 검색 프롬프트 빌드 → Reddit AI Agent (main)
conn['검색 프롬프트 빌드'] = {
  main: [
    [
      {
        node: 'Reddit AI Agent',
        type: 'main',
        index: 0,
      },
    ],
  ],
};

// Add Reddit AI Agent → Reddit 결과 변환 (main)
conn['Reddit AI Agent'] = {
  main: [
    [
      {
        node: 'Reddit 결과 변환',
        type: 'main',
        index: 0,
      },
    ],
  ],
};

// Add Reddit 결과 변환 → OpenAI 매체 검색 (main)
conn['Reddit 결과 변환'] = {
  main: [
    [
      {
        node: 'OpenAI 매체 검색',
        type: 'main',
        index: 0,
      },
    ],
  ],
};

// Add AI sub-node connections (reversed direction: sub-node → agent)
conn['OpenAI Chat Model (Reddit)'] = {
  ai_languageModel: [
    [
      {
        node: 'Reddit AI Agent',
        type: 'ai_languageModel',
        index: 0,
      },
    ],
  ],
};

conn['Arctic Shift 검색'] = {
  ai_tool: [
    [
      {
        node: 'Reddit AI Agent',
        type: 'ai_tool',
        index: 0,
      },
    ],
  ],
};

conn['Reddit 댓글 조회'] = {
  ai_tool: [
    [
      {
        node: 'Reddit AI Agent',
        type: 'ai_tool',
        index: 0,
      },
    ],
  ],
};

// Verify OpenAI 매체 검색 → 검색 결과 병합 파싱 still exists
if (!conn['OpenAI 매체 검색']) {
  conn['OpenAI 매체 검색'] = {
    main: [
      [
        {
          node: '검색 결과 병합 파싱',
          type: 'main',
          index: 0,
        },
      ],
    ],
  };
}

// ============================================================
// Write output
// ============================================================
writeFileSync(OUTPUT_FILE, JSON.stringify(workflow, null, 2), 'utf-8');
console.log(`\n✅ Pipeline transformed successfully → ${OUTPUT_FILE}`);
console.log(`   Nodes: ${workflow.nodes.length}`);
console.log(`   Connections: ${Object.keys(conn).length} entries`);

// Summary of changes
console.log('\n--- Changes Summary ---');
console.log('✅ Replaced: Reddit AI Agent (Code) → native langchain.agent v3.1');
console.log('✅ Added: OpenAI Chat Model (Reddit) — lmChatOpenAi v1.3');
console.log('✅ Added: Arctic Shift 검색 — toolHttpRequest v1.1');
console.log('✅ Added: Reddit 댓글 조회 — toolHttpRequest v1.1');
console.log('✅ Added: Reddit 결과 변환 — Code node (agent output parser)');
console.log('✅ Modified: 검색 프롬프트 빌드 — added redditSystemPrompt/redditUserPrompt');
console.log('✅ Modified: 검색 결과 병합 파싱 — references Reddit 결과 변환');
console.log('✅ Updated: All connections (main + ai_languageModel + ai_tool)');
console.log('\n⚠️  After import: map "OpenAI API" credential to your openAiApi credential in n8n UI');
