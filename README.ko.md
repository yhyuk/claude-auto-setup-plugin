# Claude Auto Setup Plugin

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-81%20passed-brightgreen.svg)]()

> 지능형 프로젝트 분석을 기반으로 Claude Code의 `.claude/` 폴더 구조를 자동으로 생성합니다

[English Documentation](./README.md)

## 개요

Claude Auto Setup Plugin은 프로젝트를 분석하여 기술 스택, 프로젝트 타입, 개발 워크플로우에 맞춤화된 최적의 `.claude/` 폴더 구조를 자동으로 생성하는 강력한 자동화 도구입니다.

각 프로젝트마다 스킬, 커맨드, 에이전트를 수동으로 만드는 대신, 이 플러그인은 프로젝트의 특성을 지능적으로 감지하고 [공식 블로그 표준](https://blog.dailydoseofds.com/p/anatomy-of-the-claude-folder)을 준수하는 적절한 Claude Code 설정 파일을 생성합니다.

## 주요 기능

- **지능형 프로젝트 분석**: 프로젝트 타입 자동 감지 (web-app, api, cli, library, mobile)
- **다중 언어 지원**: TypeScript, JavaScript, Python, Java, Go, Rust 등 지원
- **프레임워크 감지**: 인기 있는 프레임워크 인식 (Next.js, React, Django, Spring Boot 등)
- **템플릿 기반 생성**: 전문적인 스킬, 커맨드, 에이전트 템플릿 사용
- **점진적 업데이트**: 기존 `.claude/` 파일 보존, 새 파일만 추가
- **YAML 검증**: 모든 생성된 파일이 올바른 frontmatter 형식을 따르도록 보장
- **블로그 표준 준수**: 공식 Claude Code 폴더 구조 표준 준수
- **타입 안전성**: 완전한 타입 정의를 갖춘 TypeScript로 작성

## 설치

```bash
npm install claude-auto-setup-plugin
```

또는 yarn 사용:

```bash
yarn add claude-auto-setup-plugin
```

## 빠른 시작

### 기본 사용법

```typescript
import { ProjectAnalyzer, Generator, Validator } from 'claude-auto-setup-plugin';
import * as path from 'path';

// 1. 프로젝트 분석
const analyzer = new ProjectAnalyzer('/path/to/your/project');
const projectType = await analyzer.detectProjectType();
const techStack = await analyzer.analyzeTechStack();

console.log(`감지됨: ${techStack.language} ${projectType} with ${techStack.framework}`);

// 2. .claude/ 구조 생성
const generator = new Generator(
  '/path/to/your/project',
  path.join(__dirname, 'templates')
);

const results = await generator.generateBatch([
  {
    fileType: 'skill',
    fileName: 'code-review',
    variables: {
      SKILL_NAME: 'code-review',
      SKILL_DESCRIPTION: '품질 및 모범 사례에 대한 코드 검토',
      SKILL_PURPOSE: `${techStack.language} 프로젝트의 코드 품질 보장`,
      WHEN_TO_USE: '풀 리퀘스트 병합 전',
      EXAMPLE_USAGE: '변경된 파일에 대한 코드 리뷰 실행',
      ALLOWED_TOOLS: 'Read, Grep, Glob',
    },
  },
  {
    fileType: 'command',
    fileName: 'build',
    variables: {
      COMMAND_DESCRIPTION: `${techStack.framework} 애플리케이션 빌드`,
      COMMAND_BODY: 'npm run build',
    },
  },
]);

console.log(`${results.length}개 파일 생성됨`);
```

### CLI 사용법 (출시 예정)

```bash
# 대화형 설정
claude-setup init

# 현재 프로젝트 분석
claude-setup analyze

# 프로젝트 타입 기반 파일 생성
claude-setup generate --type web-app --framework nextjs
```

## 프로젝트 구조

```
claude-auto-setup-plugin/
├── src/
│   ├── core/
│   │   ├── projectAnalyzer.ts    # 프로젝트 타입 & 기술 스택 감지
│   │   ├── generator.ts          # 템플릿 기반 파일 생성
│   │   ├── validator.ts          # YAML & 블로그 표준 검증
│   │   └── interviewer.ts        # 대화형 프로젝트 프로파일링
│   ├── types/
│   │   └── index.ts              # TypeScript 타입 정의
│   └── index.ts                  # 메인 진입점
├── templates/
│   ├── skill-template.md         # 스킬 파일 템플릿
│   ├── command-template.md       # 커맨드 파일 템플릿
│   └── agent-template.md         # 에이전트 파일 템플릿
├── tests/
│   ├── unit/                     # 단위 테스트
│   └── e2e/                      # E2E 테스트
└── dist/                         # 컴파일된 출력
```

## 지원 프로젝트 타입

### 언어
- TypeScript
- JavaScript
- Python
- Java
- Go
- Rust
- 기타 (일반 지원)

### 프레임워크
- **JavaScript/TypeScript**: Next.js, React, Vue, Angular, Express, NestJS
- **Python**: Django, Flask, FastAPI
- **Java**: Spring Boot
- 그 외 다수...

### 프로젝트 타입
- `web-app`: 프론트엔드 애플리케이션
- `api`: 백엔드 API 및 서비스
- `cli`: 명령줄 도구
- `library`: 재사용 가능한 라이브러리
- `mobile`: 모바일 애플리케이션
- `other`: 일반 프로젝트

## 생성된 파일 예시

### 스킬 파일 (`.claude/skills/code-review/SKILL.md`)

```markdown
---
name: code-review
description: 품질 및 모범 사례에 대한 코드 검토
allowed-tools: Read, Grep, Glob
---

# code-review

## Purpose
TypeScript 프로젝트의 코드 품질 보장

## When to Use
풀 리퀘스트 병합 전

## Example Usage
변경된 파일에 대한 코드 리뷰 실행
```

### 커맨드 파일 (`.claude/commands/build.md`)

```markdown
---
description: Next.js 애플리케이션 빌드
---

npm run build
```

### 에이전트 파일 (`.claude/agents/typescript-helper.md`)

```markdown
---
name: typescript-helper
description: TypeScript 관련 작업 지원
model: sonnet
tools: Read, Edit, Grep
---

# typescript-helper

## Role
TypeScript 전문가

## Capabilities
타입 체킹, 리팩토링, 모범 사례
```

## API 참조

### ProjectAnalyzer

프로젝트 구조를 분석하고 기술 스택을 감지합니다.

```typescript
class ProjectAnalyzer {
  constructor(projectPath: string);

  // 프로젝트 타입 감지 (web-app, api, cli 등)
  async detectProjectType(): Promise<ProjectType>;

  // 기술 스택 분석 (언어, 프레임워크, 패키지 매니저)
  async analyzeTechStack(): Promise<TechStack>;

  // 기존 .claude/ 파일 스캔
  async scanExistingFiles(): Promise<ExistingFile[]>;

  // 프로젝트 구조 분석
  async analyzeStructure(): Promise<ProjectStructure>;
}
```

### Generator

템플릿에서 파일을 생성합니다.

```typescript
class Generator {
  constructor(projectPath: string, templatesPath: string);

  // 단일 파일 생성
  async generateFile(
    fileType: FileType,
    fileName: string,
    variables: TemplateVariables,
    options?: FileGenerationOptions
  ): Promise<GenerateResult>;

  // 여러 파일 일괄 생성
  async generateBatch(
    files: Array<{
      fileType: FileType;
      fileName: string;
      variables: TemplateVariables;
    }>,
    options?: FileGenerationOptions
  ): Promise<GenerateResult[]>;
}
```

### Validator

YAML frontmatter 및 블로그 표준을 검증합니다.

```typescript
class Validator {
  // YAML frontmatter 구조 검증
  validateYaml(content: string): ValidationResult;

  // 블로그 표준 검증
  validateBlogStandard(
    content: string,
    fileType?: 'skill' | 'command' | 'agent' | 'rule'
  ): ValidationResult;

  // Claude Code 로드 가능성 검증
  validateLoadability(file: GeneratedFile): boolean;

  // 기술 스택 호환성 검증
  validateStackCompatibility(
    files: Array<{ path: string; techStack?: string[] }>,
    projectStack: TechStackInfo
  ): boolean;
}
```

## 개발

### 설정

```bash
# 저장소 클론
git clone https://github.com/yourusername/claude-auto-setup-plugin.git
cd claude-auto-setup-plugin

# 의존성 설치
npm install

# 테스트 실행
npm test

# 타입 체킹
npm run typecheck

# 빌드
npm run build
```

### 테스트

```bash
# 모든 테스트 실행
npm test

# Watch 모드
npm run test:watch

# 커버리지 리포트
npm run test:coverage
```

현재 테스트 커버리지: **81개 테스트, 100% 통과율**

### 프로젝트 스크립트

```bash
npm run build          # TypeScript 컴파일
npm run test           # 테스트 실행
npm run test:watch     # Watch 모드로 테스트 실행
npm run test:coverage  # 커버리지 리포트 생성
npm run lint           # 코드 린트
npm run format         # Prettier로 코드 포맷
npm run typecheck      # 타입 체크 (출력 없음)
```

## 기여하기

기여를 환영합니다! 다음 단계를 따라주세요:

1. 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 열기

### 개발 가이드라인

- 기존 코드 스타일 준수 (ESLint 및 Prettier로 강제)
- 새로운 기능에 대한 테스트 작성
- 80% 이상의 테스트 커버리지 유지
- 필요에 따라 문서 업데이트
- 관례적 커밋 메시지 사용

## 아키텍처

### 핵심 컴포넌트

1. **ProjectAnalyzer**: 프로젝트 파일을 스캔하여 언어, 프레임워크 및 프로젝트 타입 감지
2. **Generator**: 변수 치환을 통해 템플릿에서 파일 생성
3. **Validator**: 생성된 파일이 품질 표준을 충족하는지 확인
4. **Interviewer**: (향후) 사용자 정의 설정을 위한 대화형 질문

### 템플릿 시스템

템플릿은 간단한 변수 치환 구문을 사용합니다:

- `{{VARIABLE}}`: 변수 값으로 교체
- `{{#if VARIABLE}}...{{/if}}`: 조건부 블록

### 파일 생성 흐름

```
프로젝트 분석 → 템플릿 선택 → 변수 채우기 → 검증 → 파일 작성
```

## 로드맵

- [ ] 명령줄 사용을 위한 CLI 도구
- [ ] 대화형 심층 인터뷰 모드
- [ ] 프로젝트별 권장사항
- [ ] 사용자 정의 템플릿 지원
- [ ] VSCode 확장 통합
- [ ] 프로젝트 변경 사항에 따른 기존 파일 자동 업데이트
- [ ] 다중 언어 템플릿 지원

## 라이선스

MIT © [Your Name]

## 감사의 말

- [Claude Code 공식 문서](https://docs.claude.com/claude-code)에서 영감을 받음
- [Daily Dose of DS](https://blog.dailydoseofds.com/p/anatomy-of-the-claude-folder)의 블로그 표준 참조
- TypeScript, Vitest, ESLint로 구축

## 지원

- GitHub Issues: [버그 보고 또는 기능 요청](https://github.com/yourusername/claude-auto-setup-plugin/issues)
- 문서: [전체 문서](https://github.com/yourusername/claude-auto-setup-plugin/wiki)

---

Claude Code 커뮤니티를 위해 ❤️ 를 담아 제작
