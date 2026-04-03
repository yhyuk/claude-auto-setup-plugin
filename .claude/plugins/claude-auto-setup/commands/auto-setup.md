---
name: setup
description: Interactive .claude/ folder setup with deep interview questions
---

# Interactive .claude/ Folder Setup

You will help the user set up their `.claude/` folder through an interactive question-based workflow.

## Workflow

### Step 1: Analyze Project

First, analyze the current project to detect:
- Project type (web-app, api, cli, library, mobile, other)
- Programming language (check for package.json, requirements.txt, go.mod, Cargo.toml, pom.xml)
- Framework (react, nextjs, vue, express, django, springboot, etc.)
- Existing .claude/ files

Use these tools:
- `Glob` to find configuration files
- `Read` to check package.json or other config files

Show the user what you detected:
```
✓ Detected: typescript web-app
✓ Framework: react
```

### Step 2: Ask Questions

Use the `AskUserQuestion` tool to ask 5 questions. For each question, provide clear options.

**Question 1: Project Type**
```
What type of project is this?
Options:
- Web Application
- API/Backend Service
- CLI Tool
- Library/Package
- Mobile App
- Desktop Application
- Other
```

**Question 2: Main Tasks**
```
What is your main development focus?
Options:
- Feature development (새 기능 개발)
- Bug fixing and debugging (버그 수정)
- Refactoring and optimization (리팩토링)
- Writing tests (테스트 작성)
- Documentation (문서 작성)
- Code review (코드 리뷰)
```

**Question 3: Team Size**
```
What is your team size?
Options:
- Solo developer (혼자)
- Small team (2-5명)
- Large team (6명 이상)
```

**Question 4: Coding Style**
```
What coding style do you prefer?
Options:
- Standard practices (표준)
- Strict and thorough (엄격)
- Pragmatic and flexible (유연)
- Experimental (실험적)
```

**Question 5: Priority**
```
What is your top priority?
Options:
- Code quality (코드 품질)
- Development speed (개발 속도)
- Testing coverage (테스트 커버리지)
- Documentation (문서화)
- Performance (성능)
```

### Step 3: Generate Files

Based on the answers, generate customized `.claude/` folder structure using the `Write` tool.

#### Always Generate:

1. **Code Review Skill** (`.claude/skills/code-review/SKILL.md`)
```markdown
---
name: code-review
description: Review {LANGUAGE} code for quality and best practices
allowed-tools: Read, Grep, Glob
---

# code-review

## Purpose
Ensure code quality in {LANGUAGE} projects with {CODING_STYLE} style

## When to Use
Before merging pull requests or committing code

## Example Usage
Review changed files for potential issues

## Tech Stack Specific Notes
- Language: {LANGUAGE}
- Framework: {FRAMEWORK}
```

2. **Build Command** (`.claude/commands/build.md`)
```markdown
Build the {FRAMEWORK or LANGUAGE} project

Use the appropriate build command:
- npm/yarn/pnpm: `npm run build`
- maven: `mvn clean install`
- cargo: `cargo build`
- go: `go build`
```

3. **Test Command** (`.claude/commands/test.md`)
```markdown
Run project tests

Use the appropriate test command:
- npm: `npm test`
- pytest: `pytest`
- maven: `mvn test`
- go: `go test ./...`
- cargo: `cargo test`
```

4. **Language Helper Agent** (`.claude/agents/{language}-helper.md`)
```markdown
---
name: {language}-helper
description: Assist with {LANGUAGE}-specific development tasks
model: sonnet
allowed-tools: Read, Edit, Grep, Glob
---

# {LANGUAGE} Development Helper

## Role
{LANGUAGE} development specialist

## Capabilities
- Code review
- Refactoring
- Best practices for {LANGUAGE}

## Usage Guidelines
Use when working on {LANGUAGE} code
```

#### Conditional Generation:

**If Main Task = "Bug fixing and debugging":**
- Generate `debug-helper` skill

**If Main Task = "Refactoring and optimization":**
- Generate `refactor-assistant` skill

**If Main Task = "Writing tests":**
- Generate `test-generator` skill

**If Team Size = "Large team":**
- Generate `team-collaboration` skill
- Upgrade agent model to `opus`

### Step 4: Summary

Show the user what was created:
```
✨ Your customized .claude/ folder is ready!

Created files:
✓ .claude/skills/code-review/SKILL.md
✓ .claude/skills/debug-helper/SKILL.md (because: Bug fixing focus)
✓ .claude/commands/build.md
✓ .claude/commands/test.md
✓ .claude/agents/typescript-helper.md

Skipped files:
⊘ .claude/skills/code-review/SKILL.md (already exists)
```

## Important Notes

- **Preserve existing files**: Check if files exist before creating. Skip if already present.
- **Use proper YAML frontmatter**: All skills/agents/commands must have valid frontmatter
- **Use Korean descriptions** when appropriate for Korean-speaking users
- **Validate structure**: Ensure all files follow the blog standard from https://blog.dailydoseofds.com/p/anatomy-of-the-claude-folder

## Template Variables

Replace these placeholders in templates:
- `{LANGUAGE}`: typescript, python, java, go, rust, etc.
- `{FRAMEWORK}`: react, nextjs, django, springboot, etc.
- `{CODING_STYLE}`: Standard practices, Strict and thorough, etc.
- `{MAIN_TASK}`: Feature development, Bug fixing, etc.
- `{TEAM_SIZE}`: solo, small, large

Start by analyzing the project now!
