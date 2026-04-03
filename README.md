# Claude Auto Setup Plugin

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-81%20passed-brightgreen.svg)]()

> Automatically generate `.claude/` folder structure for Claude Code based on intelligent project analysis

[한국어 문서](./README.ko.md)

## Overview

Claude Auto Setup Plugin is a powerful automation tool that analyzes your project and automatically generates an optimized `.claude/` folder structure tailored to your tech stack, project type, and development workflow.

Instead of manually creating skills, commands, and agents for each project, this plugin intelligently detects your project's characteristics and generates the appropriate Claude Code configuration files following the [official blog standard](https://blog.dailydoseofds.com/p/anatomy-of-the-claude-folder).

## Features

- **Intelligent Project Analysis**: Automatically detects project type (web-app, api, cli, library, mobile)
- **Multi-Language Support**: Supports TypeScript, JavaScript, Python, Java, Go, Rust, and more
- **Framework Detection**: Recognizes popular frameworks (Next.js, React, Django, Spring Boot, etc.)
- **Template-Based Generation**: Uses professional templates for skills, commands, and agents
- **Incremental Updates**: Preserves existing `.claude/` files, only adds new ones
- **YAML Validation**: Ensures all generated files follow the correct frontmatter format
- **Blog Standard Compliance**: Adheres to the official Claude Code folder structure standard
- **Type-Safe**: Written in TypeScript with full type definitions

## Installation

```bash
npm install claude-auto-setup-plugin
```

Or using yarn:

```bash
yarn add claude-auto-setup-plugin
```

## Quick Start

### Basic Usage

```typescript
import { ProjectAnalyzer, Generator, Validator } from 'claude-auto-setup-plugin';
import * as path from 'path';

// 1. Analyze your project
const analyzer = new ProjectAnalyzer('/path/to/your/project');
const projectType = await analyzer.detectProjectType();
const techStack = await analyzer.analyzeTechStack();

console.log(`Detected: ${techStack.language} ${projectType} with ${techStack.framework}`);

// 2. Generate .claude/ structure
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
      SKILL_DESCRIPTION: 'Review code for quality and best practices',
      SKILL_PURPOSE: `Ensure code quality in ${techStack.language} projects`,
      WHEN_TO_USE: 'Before merging pull requests',
      EXAMPLE_USAGE: 'Run code review on changed files',
      ALLOWED_TOOLS: 'Read, Grep, Glob',
    },
  },
  {
    fileType: 'command',
    fileName: 'build',
    variables: {
      COMMAND_DESCRIPTION: `Build the ${techStack.framework} application`,
      COMMAND_BODY: 'npm run build',
    },
  },
]);

console.log(`Generated ${results.length} files`);
```

### CLI Usage (Coming Soon)

```bash
# Interactive setup
claude-setup init

# Analyze current project
claude-setup analyze

# Generate files based on project type
claude-setup generate --type web-app --framework nextjs
```

## Project Structure

```
claude-auto-setup-plugin/
├── src/
│   ├── core/
│   │   ├── projectAnalyzer.ts    # Project type & tech stack detection
│   │   ├── generator.ts          # Template-based file generation
│   │   ├── validator.ts          # YAML & blog standard validation
│   │   └── interviewer.ts        # Interactive project profiling
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   └── index.ts                  # Main entry point
├── templates/
│   ├── skill-template.md         # Skill file template
│   ├── command-template.md       # Command file template
│   └── agent-template.md         # Agent file template
├── tests/
│   ├── unit/                     # Unit tests
│   └── e2e/                      # End-to-end tests
└── dist/                         # Compiled output
```

## Supported Project Types

### Languages
- TypeScript
- JavaScript
- Python
- Java
- Go
- Rust
- Others (generic support)

### Frameworks
- **JavaScript/TypeScript**: Next.js, React, Vue, Angular, Express, NestJS
- **Python**: Django, Flask, FastAPI
- **Java**: Spring Boot
- And more...

### Project Types
- `web-app`: Frontend applications
- `api`: Backend APIs and services
- `cli`: Command-line tools
- `library`: Reusable libraries
- `mobile`: Mobile applications
- `other`: Generic projects

## Generated File Examples

### Skill File (`.claude/skills/code-review/SKILL.md`)

```markdown
---
name: code-review
description: Review code for quality and best practices
allowed-tools: Read, Grep, Glob
---

# code-review

## Purpose
Ensure code quality in TypeScript projects

## When to Use
Before merging pull requests

## Example Usage
Run code review on changed files
```

### Command File (`.claude/commands/build.md`)

```markdown
---
description: Build the Next.js application
---

npm run build
```

### Agent File (`.claude/agents/typescript-helper.md`)

```markdown
---
name: typescript-helper
description: Assist with TypeScript-specific tasks
model: sonnet
tools: Read, Edit, Grep
---

# typescript-helper

## Role
TypeScript specialist

## Capabilities
Type checking, refactoring, best practices
```

## API Reference

### ProjectAnalyzer

Analyzes project structure and detects tech stack.

```typescript
class ProjectAnalyzer {
  constructor(projectPath: string);

  // Detect project type (web-app, api, cli, etc.)
  async detectProjectType(): Promise<ProjectType>;

  // Analyze tech stack (language, framework, package manager)
  async analyzeTechStack(): Promise<TechStack>;

  // Scan existing .claude/ files
  async scanExistingFiles(): Promise<ExistingFile[]>;

  // Analyze project structure
  async analyzeStructure(): Promise<ProjectStructure>;
}
```

### Generator

Generates files from templates.

```typescript
class Generator {
  constructor(projectPath: string, templatesPath: string);

  // Generate a single file
  async generateFile(
    fileType: FileType,
    fileName: string,
    variables: TemplateVariables,
    options?: FileGenerationOptions
  ): Promise<GenerateResult>;

  // Generate multiple files in batch
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

Validates YAML frontmatter and blog standards.

```typescript
class Validator {
  // Validate YAML frontmatter structure
  validateYaml(content: string): ValidationResult;

  // Validate against blog standard
  validateBlogStandard(
    content: string,
    fileType?: 'skill' | 'command' | 'agent' | 'rule'
  ): ValidationResult;

  // Validate Claude Code loadability
  validateLoadability(file: GeneratedFile): boolean;

  // Validate tech stack compatibility
  validateStackCompatibility(
    files: Array<{ path: string; techStack?: string[] }>,
    projectStack: TechStackInfo
  ): boolean;
}
```

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/claude-auto-setup-plugin.git
cd claude-auto-setup-plugin

# Install dependencies
npm install

# Run tests
npm test

# Type checking
npm run typecheck

# Build
npm run build
```

### Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Current test coverage: **81 tests, 100% pass rate**

### Project Scripts

```bash
npm run build          # Compile TypeScript
npm run test           # Run tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report
npm run lint           # Lint code
npm run format         # Format code with Prettier
npm run typecheck      # Type check without emitting
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style (enforced by ESLint and Prettier)
- Write tests for new features
- Maintain 80%+ test coverage
- Update documentation as needed
- Use conventional commit messages

## Architecture

### Core Components

1. **ProjectAnalyzer**: Scans project files to detect language, framework, and project type
2. **Generator**: Creates files from templates with variable substitution
3. **Validator**: Ensures generated files meet quality standards
4. **Interviewer**: (Future) Interactive questionnaire for custom setups

### Template System

Templates use a simple variable substitution syntax:

- `{{VARIABLE}}`: Replace with variable value
- `{{#if VARIABLE}}...{{/if}}`: Conditional blocks

### File Generation Flow

```
Project Analysis → Template Selection → Variable Population → Validation → File Writing
```

## Roadmap

- [ ] CLI tool for command-line usage
- [ ] Interactive deep interview mode
- [ ] Project-specific recommendations
- [ ] Custom template support
- [ ] VSCode extension integration
- [ ] Auto-update existing files based on project changes
- [ ] Multi-language template support

## License

MIT © yhyuk

## Acknowledgments

- Inspired by the [Claude Code official documentation](https://docs.claude.com/claude-code)
- Blog standard from [Daily Dose of DS](https://blog.dailydoseofds.com/p/anatomy-of-the-claude-folder)
- Built with TypeScript, Vitest, and ESLint

## Support

- GitHub Issues: [Report bugs or request features](https://github.com/yourusername/claude-auto-setup-plugin/issues)
- Documentation: [Full documentation](https://github.com/yourusername/claude-auto-setup-plugin/wiki)

---

Made with for the Claude Code community
