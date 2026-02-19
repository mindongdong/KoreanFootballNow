#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load env
if [ -f "$PROJECT_DIR/.env" ]; then
  export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
elif [ -f "$PROJECT_DIR/.env.local" ]; then
  export $(grep -v '^#' "$PROJECT_DIR/.env.local" | xargs)
fi

usage() {
  echo "KFN Newsletter Tool"
  echo ""
  echo "Usage:"
  echo "  ./newsletters/send.sh preview <file.md>           HTML 미리보기 (stdout)"
  echo "  ./newsletters/send.sh preview <file.md> out.html  HTML 파일 저장"
  echo "  ./newsletters/send.sh send <file.md>              발송 (로컬 서버)"
  echo ""
  echo "Environment:"
  echo "  API_URL                Production URL (default: http://localhost:3456)"
  echo "  NEWSLETTER_SEND_SECRET Bearer token for API auth"
}

if [ -z "$1" ] || [ -z "$2" ]; then
  usage
  exit 1
fi

ACTION="$1"
MD_FILE="$2"

cd "$PROJECT_DIR"

case "$ACTION" in
  preview)
    if [ -n "$3" ]; then
      npx tsx newsletters/build.ts "$MD_FILE" --out "$3"
    else
      npx tsx newsletters/build.ts "$MD_FILE"
    fi
    ;;
  send)
    npx tsx newsletters/build.ts "$MD_FILE" --send
    ;;
  *)
    usage
    exit 1
    ;;
esac
