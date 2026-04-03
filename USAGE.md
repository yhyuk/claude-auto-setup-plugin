# 사용 가이드

Claude Auto Setup Plugin을 실제로 사용하는 방법을 설명합니다.

## 설치 방법

### 1. 프로젝트 클론 및 설치

```bash
cd /Users/imform-mm-2101/workspace/PERSONAL/claude-auto-setup-plugin
npm install
npm run build
```

### 2. 글로벌 설치 (선택사항)

```bash
npm link
```

이제 어디서든 `claude-setup` 명령어를 사용할 수 있습니다.

## 사용 방법

### 방법 1: npm 스크립트 사용 (개발 중)

프로젝트 디렉토리에서:

```bash
# 프로젝트 분석만 하기
npm run cli:analyze

# .claude/ 폴더 생성하기
npm run cli:generate
```

### 방법 2: 직접 실행 (빌드 후)

```bash
# 빌드
npm run build

# 분석하고 싶은 프로젝트로 이동
cd /path/to/your/project

# 프로젝트 분석
/Users/imform-mm-2101/workspace/PERSONAL/claude-auto-setup-plugin/dist/bin/cli.js analyze

# .claude/ 구조 생성
/Users/imform-mm-2101/workspace/PERSONAL/claude-auto-setup-plugin/dist/bin/cli.js generate
```

### 방법 3: 글로벌 설치 후 사용

```bash
# 글로벌 설치 (한 번만)
cd /Users/imform-mm-2101/workspace/PERSONAL/claude-auto-setup-plugin
npm link

# 이제 어느 프로젝트에서든
cd /path/to/your/project
claude-setup analyze
claude-setup generate
```

### 방법 4: TypeScript로 직접 작성

`setup-claude.ts` 파일 생성:

```typescript
import * as path from 'path';
import { ProjectAnalyzer, Generator, Validator } from 'claude-auto-setup-plugin';

async function setupClaudeFolder() {
  const projectPath = process.cwd();
  const templatesPath = path.join(__dirname, 'node_modules/claude-auto-setup-plugin/templates');

  console.log('Analyzing project...');
  const analyzer = new ProjectAnalyzer(projectPath);
  const projectType = await analyzer.detectProjectType();
  const techStack = await analyzer.analyzeTechStack();

  console.log(`Detected: ${techStack.language} ${projectType}`);

  console.log('Generating .claude/ structure...');
  const generator = new Generator(projectPath, templatesPath);

  const results = await generator.generateBatch([
    {
      fileType: 'skill',
      fileName: 'code-review',
      variables: {
        SKILL_NAME: 'code-review',
        SKILL_DESCRIPTION: 'Review code for quality',
        SKILL_PURPOSE: 'Ensure code quality',
        WHEN_TO_USE: 'Before merging',
        EXAMPLE_USAGE: 'Review files',
        ALLOWED_TOOLS: 'Read, Grep, Glob',
      },
    },
  ]);

  console.log(`Generated ${results.filter(r => r.action === 'created').length} files`);
}

setupClaudeFolder();
```

실행:
```bash
ts-node setup-claude.ts
```

## 실제 사용 예시

### 1. 새 프로젝트에 .claude/ 폴더 생성

```bash
# Next.js 프로젝트 생성
npx create-next-app@latest my-project
cd my-project

# .claude/ 폴더 자동 생성
claude-setup generate
```

결과:
```
🚀 Claude Auto Setup Plugin
📁 Project path: /Users/imform-mm-2101/workspace/my-project

📝 Generating .claude/ structure...

Detected: typescript web-app with nextjs

Generating files...

✓ Created: /Users/imform-mm-2101/workspace/my-project/.claude/skills/code-review/SKILL.md
✓ Created: /Users/imform-mm-2101/workspace/my-project/.claude/commands/build.md
✓ Created: /Users/imform-mm-2101/workspace/my-project/.claude/commands/test.md
✓ Created: /Users/imform-mm-2101/workspace/my-project/.claude/agents/typescript-helper.md

📊 Summary: 4 created, 0 skipped

🔍 Validating generated files...
✓ All 4 files are valid!

✨ Done! Your .claude/ folder is ready.
```

### 2. 기존 프로젝트 분석

```bash
cd /path/to/existing/project
claude-setup analyze
```

결과:
```
🚀 Claude Auto Setup Plugin
📁 Project path: /path/to/existing/project

📊 Analyzing project...

✓ Project Type: web-app
✓ Language: typescript
✓ Framework: nextjs
✓ Package Manager: npm
✓ Test Framework: vitest

📂 Scanning existing .claude/ files...
  No existing .claude/ files found

📋 Project Structure:
  - package.json: ✓
  - pom.xml: ✗
  - requirements.txt: ✗
  - go.mod: ✗
  - Cargo.toml: ✗
```

### 3. Python 프로젝트에서 사용

```bash
cd /path/to/python/project
claude-setup generate
```

자동으로 Python 프로젝트에 맞는 파일 생성:
- `.claude/skills/code-review/SKILL.md` (Python 특화)
- `.claude/commands/test.md` (pytest 사용)
- `.claude/agents/python-helper.md`

## 생성되는 파일 구조

```
your-project/
├── .claude/
│   ├── skills/
│   │   └── code-review/
│   │       └── SKILL.md
│   ├── commands/
│   │   ├── build.md
│   │   └── test.md
│   └── agents/
│       └── typescript-helper.md  (또는 python-helper.md 등)
├── src/
├── package.json
└── ...
```

## 생성된 파일 예시

### `.claude/skills/code-review/SKILL.md`

```markdown
---
name: code-review
description: Review typescript code for quality and best practices
allowed-tools: Read, Grep, Glob
---

# code-review

## Purpose
Ensure code quality in typescript projects

## When to Use
Before merging pull requests or committing code

## Example Usage
Review changed files for potential issues
```

### `.claude/commands/build.md`

```markdown
---
description: Build the nextjs project
---

npm run build
```

### `.claude/agents/typescript-helper.md`

```markdown
---
name: typescript-helper
description: Assist with typescript-specific development tasks
model: sonnet
tools: Read, Edit, Grep, Glob
---

# typescript-helper

## Role
typescript development specialist

## Capabilities
Code review, refactoring, best practices for typescript

## Usage Guidelines
Use when working on typescript code
```

## 트러블슈팅

### "command not found: claude-setup"

글로벌 설치를 다시 시도:
```bash
cd /Users/imform-mm-2101/workspace/PERSONAL/claude-auto-setup-plugin
npm run build
npm link
```

### "Cannot find module"

의존성 재설치:
```bash
npm install
npm run build
```

### Permission 오류

실행 권한 부여:
```bash
chmod +x dist/bin/cli.js
```

## 개발자용 팁

### 템플릿 커스터마이징

`templates/` 디렉토리의 템플릿 파일을 수정하여 원하는 형식으로 변경 가능:

```bash
# 템플릿 위치
templates/
├── skill-template.md
├── command-template.md
└── agent-template.md
```

### 다른 프로젝트에서 라이브러리로 사용

```typescript
import { ProjectAnalyzer, Generator } from 'claude-auto-setup-plugin';

// 커스텀 로직 구현
const analyzer = new ProjectAnalyzer(myPath);
// ...
```

## 다음 단계

1. 생성된 `.claude/` 폴더를 확인
2. Claude Code에서 프로젝트 열기
3. 생성된 스킬/커맨드/에이전트 사용해보기
4. 필요에 따라 파일 수정 또는 추가

## 문의

문제가 있거나 제안사항이 있으면 GitHub Issues에 등록해주세요.
