#!/bin/bash

# claude-auto-setup-plugin installer
# ~/.claude/에 commands, agents, skills를 복사합니다

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DIR="$HOME/.claude"

echo "claude-auto-setup-plugin 설치"
echo "================================"
echo ""

# ~/.claude 디렉토리 확인
if [ ! -d "$CLAUDE_DIR" ]; then
    echo "~/.claude 디렉토리가 없습니다. 생성합니다..."
    mkdir -p "$CLAUDE_DIR"
fi

# commands 복사
mkdir -p "$CLAUDE_DIR/commands"
cp "$SCRIPT_DIR/commands/auto-setup.md" "$CLAUDE_DIR/commands/auto-setup.md"
echo "  commands/auto-setup.md 설치 완료"

# agents 복사
mkdir -p "$CLAUDE_DIR/agents"
for agent in "$SCRIPT_DIR"/agents/setup-*.md; do
    filename=$(basename "$agent")
    cp "$agent" "$CLAUDE_DIR/agents/$filename"
    echo "  agents/$filename 설치 완료"
done

# skills 복사
mkdir -p "$CLAUDE_DIR/skills/auto-setup"
cp "$SCRIPT_DIR/skills/auto-setup/SKILL.md" "$CLAUDE_DIR/skills/auto-setup/SKILL.md"
echo "  skills/auto-setup/SKILL.md 설치 완료"

echo ""
echo "================================"
echo "설치 완료!"
echo ""
echo "사용법:"
echo "  아무 프로젝트에서 Claude Code를 열고"
echo "  /auto-setup 을 실행하세요"
echo ""
