KFN 여론 수집 + AI 기사 생성 파이프라인을 실행합니다.

## 실행 전 준비

아래 reference 파일들을 Read 도구로 읽어 컨텍스트를 확보하세요:

1. `.claude/skills/opinion-pipeline/SKILL.md` — 전체 워크플로우 + 기사 생성 프롬프트
2. `.claude/skills/opinion-pipeline/references/player-registry.md` — 30명 선수 레지스트리
3. `.claude/skills/opinion-pipeline/references/article-schema.md` — Article JSON 스키마 + 골든 예시
4. `.claude/skills/opinion-pipeline/references/league-media.md` — 리그별 매체 목록

## 실행

SKILL.md의 9단계 파이프라인을 순서대로 실행하세요:

1. **선수 선택**: $ARGUMENTS에서 선수명/티어 파싱 → player-registry.md에서 매칭
2. **뉴스 수집**: WebSearch로 현지 매체 기사 수집
3. **Reddit 수집**: WebFetch → Arctic Shift API (포스트 + 댓글 모두 Arctic Shift 사용, Tier 1-2만)
4. **스탯 보강**: WebFetch → KFN API (player-profile, player-stats)
5. **데이터 충분성 평가**: 티어별 최소 기준 체크, 부족 시 재검색
6. **기사 본문 생성**: SKILL.md 기사 생성 프롬프트에 따라 content + 메타데이터 생성
6.5. **Evidence 생성**: 데이터 분석가 관점으로 charts, dataRows, sources 별도 생성
7. **QA 검증**: `node .claude/skills/opinion-pipeline/scripts/validate-article.mjs` 실행
8. **파일 출력**: `kfn-app/src/data/articles/opinion-{playerNameKr}-{timestamp}.json` 저장

## 인자 형식

- 선수명: `/opinion-pipeline 손흥민` 또는 `/opinion-pipeline 손흥민 김민재`
- 티어: `/opinion-pipeline --tier 1` (해당 티어 이하 전원)
- 드라이런: `/opinion-pipeline --dry-run 손흥민` (수집만, 기사 생성 스킵)
