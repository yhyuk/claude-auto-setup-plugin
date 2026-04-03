# 대화형 .claude/ 폴더 설정 가이드

## 🎯 개요

대화형 질문을 통해 프로젝트에 맞는 맞춤형 `.claude/` 폴더를 생성합니다.

---

## 🚀 사용 방법

### 방법 1: Claude Code에서 직접 요청 (추천)

Claude Code 채팅창에 다음과 같이 요청하세요:

```
doguri 프로젝트에 대화형으로 .claude/ 폴더를 설정하고 싶어.
다음 질문들에 답변할게:

1. 프로젝트 타입은? → Web Application
2. 주요 작업은? → Feature development
3. 팀 규모는? → Solo developer
4. 코딩 스타일은? → Standard practices
5. 우선순위는? → Code quality

이 정보를 바탕으로 .claude/ 폴더를 생성해줘.
```

### 방법 2: 단계별 대화

```
나: doguri 프로젝트 분석해줘

Claude:
✓ Project Type: web-app
✓ Language: typescript
✓ Framework: react

나: 이제 몇 가지 질문할게

Claude: 네, 말씀하세요!

나:
1. 프로젝트에서 주로 하는 작업은?
   → Feature development

2. 팀 규모는?
   → Solo developer

3. 중요하게 생각하는 것은?
   → Code quality and testing

Claude: 알겠습니다. 입력하신 정보를 바탕으로 맞춤형 .claude/ 폴더를 생성하겠습니다.

[파일 생성...]

✨ 완료! 다음 파일들이 생성되었습니다:
- code-review skill (TypeScript 특화)
- test-generator skill (테스트 중시)
- build/test commands
- typescript-helper agent
```

---

## 📋 질문 목록

### 1. 프로젝트 타입
- Web Application
- API/Backend Service
- CLI Tool
- Library/Package
- Mobile App
- Desktop Application
- Other

### 2. 주요 작업
- Feature development (새 기능 개발)
- Bug fixing and debugging (버그 수정)
- Refactoring and optimization (리팩토링)
- Writing tests (테스트 작성)
- Documentation (문서 작성)
- Code review (코드 리뷰)

### 3. 팀 규모
- Solo developer (혼자)
- Small team (2-5명)
- Large team (6명 이상)

### 4. 코딩 스타일
- Standard practices (표준)
- Strict and thorough (엄격)
- Pragmatic and flexible (유연)
- Experimental (실험적)

### 5. 우선순위
- Code quality (코드 품질)
- Development speed (개발 속도)
- Testing coverage (테스트 커버리지)
- Documentation (문서화)
- Performance (성능)

---

## 💡 답변에 따라 생성되는 파일

### 모든 프로젝트 (기본)
- ✅ `code-review` skill
- ✅ `build` command
- ✅ `test` command
- ✅ `{language}-helper` agent

### Feature development 선택 시
- ✅ `feature-scaffold` skill (기능 스캐폴딩)

### Bug fixing 선택 시
- ✅ `debug-helper` skill (디버깅 도움)

### Refactoring 선택 시
- ✅ `refactor-assistant` skill (리팩토링 가이드)

### Writing tests 선택 시
- ✅ `test-generator` skill (테스트 생성)

### Large team 선택 시
- ✅ `team-collaboration` skill (팀 협업)
- ✅ Agent model을 `opus`로 업그레이드

---

## 🎨 예시

### 예시 1: 솔로 개발자의 웹 앱

**입력:**
```
1. Project Type: Web Application
2. Main Task: Feature development
3. Team Size: Solo developer
4. Coding Style: Standard practices
5. Priority: Development speed
```

**생성 파일:**
```
.claude/
├── skills/
│   └── code-review/
│       └── SKILL.md
├── commands/
│   ├── build.md
│   └── test.md
└── agents/
    └── typescript-helper.md
```

### 예시 2: 대형 팀의 API 서비스

**입력:**
```
1. Project Type: API/Backend Service
2. Main Task: Bug fixing and debugging
3. Team Size: Large team
4. Coding Style: Strict and thorough
5. Priority: Code quality
```

**생성 파일:**
```
.claude/
├── skills/
│   ├── code-review/
│   │   └── SKILL.md
│   ├── debug-helper/
│   │   └── SKILL.md
│   └── team-collaboration/
│       └── SKILL.md
├── commands/
│   ├── build.md
│   └── test.md
└── agents/
    └── typescript-helper.md  (model: opus)
```

---

## 🔧 커스터마이징

생성된 파일들은 자유롭게 수정 가능합니다:

1. `.claude/skills/` - 스킬 추가/수정
2. `.claude/commands/` - 커맨드 추가/수정
3. `.claude/agents/` - 에이전트 추가/수정

---

## 💬 빠른 명령어

### 현재 프로젝트에 대화형 설정

```
.claude/ 폴더를 대화형으로 설정해줘
```

### 특정 설정으로 바로 생성

```
Feature development 중심의 .claude/ 폴더 생성해줘
```

### 기존 .claude/ 보강

```
기존 .claude/ 폴더에 debug-helper skill 추가해줘
```

---

## ❓ FAQ

### Q: 기존 .claude/ 폴더가 있으면?
A: 기존 파일은 보존되고, 새 파일만 추가됩니다.

### Q: 생성된 파일이 마음에 안 들면?
A: 언제든지 수정하거나 삭제할 수 있습니다. 재생성도 가능합니다.

### Q: 다른 프로젝트에도 사용할 수 있나요?
A: 네! 각 프로젝트마다 맞춤형으로 생성됩니다.

---

## 📞 문의

문제가 있거나 제안사항이 있으면 GitHub Issues에 등록해주세요.
