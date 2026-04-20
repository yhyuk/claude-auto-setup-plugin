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

# 파일 복사 함수 (기존 파일 백업 후 복사)
install_file() {
    local src="$1"
    local dst="$2"
    local label="$3"

    if [ -f "$dst" ]; then
        cp "$dst" "${dst}.bak"
        echo "  백업 생성: ${dst}.bak"
    fi
    cp "$src" "$dst"
    echo "  $label 설치 완료"
}

# commands 복사
mkdir -p "$CLAUDE_DIR/commands"
install_file "$SCRIPT_DIR/commands/auto-setup.md" "$CLAUDE_DIR/commands/auto-setup.md" "commands/auto-setup.md"

# agents 복사
mkdir -p "$CLAUDE_DIR/agents"
for agent in "$SCRIPT_DIR"/agents/setup-*.md; do
    filename=$(basename "$agent")
    install_file "$agent" "$CLAUDE_DIR/agents/$filename" "agents/$filename"
done

# skills 복사
mkdir -p "$CLAUDE_DIR/skills/auto-setup"
install_file "$SCRIPT_DIR/skills/auto-setup/SKILL.md" "$CLAUDE_DIR/skills/auto-setup/SKILL.md" "skills/auto-setup/SKILL.md"

echo ""
echo "================================"
echo "설치 완료!"
echo ""
echo "사용법:"
echo "  아무 프로젝트에서 Claude Code를 열고"
echo "  /auto-setup 을 실행하세요"
echo ""
echo "기존 파일이 있었다면 .bak 파일로 백업되었습니다."
echo ""
