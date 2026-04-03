#!/usr/bin/env node

import * as path from 'path';
import * as readline from 'readline';
import { ProjectAnalyzer } from '../src/core/projectAnalyzer';
import { Generator } from '../src/core/generator';
import { Validator } from '../src/core/validator';
import { setupWithInterview, quickSetup } from '../src/setupWorkflow';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'analyze';

  // 현재 작업 디렉토리
  const projectPath = process.cwd();
  // 빌드 후 __dirname은 dist/bin이므로 ../../templates로 이동
  const templatesPath = path.join(__dirname, '../../templates');

  console.log('🚀 Claude Auto Setup Plugin');
  console.log(`📁 Project path: ${projectPath}\n`);

  const analyzer = new ProjectAnalyzer(projectPath);
  const validator = new Validator();

  if (command === 'analyze') {
    console.log('📊 Analyzing project...\n');

    // 프로젝트 타입 감지
    const projectType = await analyzer.detectProjectType();
    console.log(`✓ Project Type: ${projectType}`);

    // 기술 스택 분석
    const techStack = await analyzer.analyzeTechStack();
    console.log(`✓ Language: ${techStack.language}`);
    if (techStack.framework) {
      console.log(`✓ Framework: ${techStack.framework}`);
    }
    if (techStack.packageManager) {
      console.log(`✓ Package Manager: ${techStack.packageManager}`);
    }
    if (techStack.testFramework) {
      console.log(`✓ Test Framework: ${techStack.testFramework}`);
    }

    // 기존 파일 스캔
    console.log('\n📂 Scanning existing .claude/ files...');
    const existingFiles = await analyzer.scanExistingFiles();
    if (existingFiles.length > 0) {
      console.log(`✓ Found ${existingFiles.length} existing files:`);
      existingFiles.forEach((file) => {
        console.log(`  - [${file.type}] ${file.path}`);
      });
    } else {
      console.log('  No existing .claude/ files found');
    }

    // 구조 분석
    const structure = await analyzer.analyzeStructure();
    console.log('\n📋 Project Structure:');
    console.log(`  - package.json: ${structure.hasPackageJson ? '✓' : '✗'}`);
    console.log(`  - pom.xml: ${structure.hasPomXml ? '✓' : '✗'}`);
    console.log(`  - requirements.txt: ${structure.hasRequirementsTxt ? '✓' : '✗'}`);
    console.log(`  - go.mod: ${structure.hasGoMod ? '✓' : '✗'}`);
    console.log(`  - Cargo.toml: ${structure.hasCargoToml ? '✓' : '✗'}`);
  } else if (command === 'generate') {
    console.log('📝 Generating .claude/ structure...\n');

    // 프로젝트 분석
    const projectType = await analyzer.detectProjectType();
    const techStack = await analyzer.analyzeTechStack();

    console.log(
      `Detected: ${techStack.language} ${projectType} with ${techStack.framework || 'no framework'}\n`
    );

    const generator = new Generator(projectPath, templatesPath);

    // 기본 파일 생성
    const filesToGenerate = [];

    // 1. Code review skill
    filesToGenerate.push({
      fileType: 'skill' as const,
      fileName: 'code-review',
      variables: {
        SKILL_NAME: 'code-review',
        SKILL_DESCRIPTION: `Review ${techStack.language} code for quality and best practices`,
        SKILL_PURPOSE: `Ensure code quality in ${techStack.language} projects`,
        WHEN_TO_USE: 'Before merging pull requests or committing code',
        EXAMPLE_USAGE: 'Review changed files for potential issues',
        ALLOWED_TOOLS: 'Read, Grep, Glob',
      },
    });

    // 2. Build command
    const buildCommand =
      techStack.packageManager === 'npm'
        ? 'npm run build'
        : techStack.packageManager === 'yarn'
          ? 'yarn build'
          : techStack.packageManager === 'pnpm'
            ? 'pnpm build'
            : techStack.packageManager === 'maven'
              ? 'mvn clean install'
              : techStack.packageManager === 'cargo'
                ? 'cargo build'
                : 'npm run build';

    filesToGenerate.push({
      fileType: 'command' as const,
      fileName: 'build',
      variables: {
        COMMAND_DESCRIPTION: `Build the ${techStack.framework || techStack.language} project`,
        COMMAND_BODY: buildCommand,
      },
    });

    // 3. Test command
    const testCommand =
      techStack.testFramework === 'vitest'
        ? 'npm test'
        : techStack.testFramework === 'jest'
          ? 'npm test'
          : techStack.testFramework === 'pytest'
            ? 'pytest'
            : techStack.testFramework === 'mocha'
              ? 'npm test'
              : 'npm test';

    filesToGenerate.push({
      fileType: 'command' as const,
      fileName: 'test',
      variables: {
        COMMAND_DESCRIPTION: 'Run project tests',
        COMMAND_BODY: testCommand,
      },
    });

    // 4. Language-specific helper agent
    filesToGenerate.push({
      fileType: 'agent' as const,
      fileName: `${techStack.language}-helper`,
      variables: {
        AGENT_NAME: `${techStack.language}-helper`,
        AGENT_DESCRIPTION: `Assist with ${techStack.language}-specific development tasks`,
        AGENT_ROLE: `${techStack.language} development specialist`,
        AGENT_CAPABILITIES: `Code review, refactoring, best practices for ${techStack.language}`,
        USAGE_GUIDELINES: `Use when working on ${techStack.language} code`,
        MODEL: 'sonnet',
        TOOLS: 'Read, Edit, Grep, Glob',
      },
    });

    // 파일 생성
    console.log('Generating files...\n');
    const results = await generator.generateBatch(filesToGenerate);

    // 결과 출력
    let created = 0;
    let skipped = 0;

    results.forEach((result) => {
      if (result.action === 'created') {
        console.log(`✓ Created: ${result.path}`);
        created++;
      } else {
        console.log(`⊘ Skipped: ${result.path} (${result.reason})`);
        skipped++;
      }
    });

    console.log(`\n📊 Summary: ${created} created, ${skipped} skipped`);

    // 검증
    console.log('\n🔍 Validating generated files...');
    let validCount = 0;
    let invalidCount = 0;

    for (const result of results) {
      if (result.action === 'created') {
        const fs = await import('fs-extra');
        const content = await fs.readFile(result.path, 'utf-8');
        const relativePath = result.path.replace(projectPath + '/', '');

        const isValid = validator.validateLoadability({
          path: relativePath,
          content,
        });

        if (isValid) {
          validCount++;
        } else {
          invalidCount++;
          console.log(`  ✗ Invalid: ${relativePath}`);
        }
      }
    }

    if (invalidCount === 0) {
      console.log(`✓ All ${validCount} files are valid!`);
    } else {
      console.log(`⚠ ${invalidCount} files failed validation`);
    }

    console.log('\n✨ Done! Your .claude/ folder is ready.');
  } else if (command === 'interactive' || command === '-i') {
    // 대화형 모드
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const askQuestion = (question: string, choices: string[]): Promise<string> => {
      return new Promise((resolve) => {
        console.log(`\n${question}`);
        choices.forEach((choice, idx) => {
          console.log(`  ${idx + 1}. ${choice}`);
        });
        rl.question('\nYour choice (number): ', (answer) => {
          const choiceIndex = parseInt(answer) - 1;
          if (choiceIndex >= 0 && choiceIndex < choices.length) {
            resolve(choices[choiceIndex]);
          } else {
            console.log('Invalid choice, using first option as default.');
            resolve(choices[0]);
          }
        });
      });
    };

    await setupWithInterview(
      {
        projectPath,
        templatesPath,
      },
      askQuestion
    );

    rl.close();
  } else if (command === 'quick' || command === '-q') {
    // 빠른 모드 (질문 없이)
    await quickSetup({
      projectPath,
      templatesPath,
    });
  } else if (command === 'help' || command === '--help' || command === '-h') {
    console.log(`
Usage: claude-setup [command]

Commands:
  analyze      Analyze current project (default)
  generate     Generate .claude/ folder structure (basic)
  interactive  Interactive setup with questions (recommended)
  quick        Quick setup without questions
  help         Show this help message

Aliases:
  -i           Short for 'interactive'
  -q           Short for 'quick'

Examples:
  claude-setup                    # Analyze project
  claude-setup interactive        # Interactive setup with questions
  claude-setup -i                 # Same as above
  claude-setup quick              # Quick setup
  claude-setup generate           # Basic generation

Recommended:
  Use 'claude-setup interactive' for best results.
  Or ask Claude Code directly in the chat!
`);
  } else {
    console.error(`❌ Unknown command: ${command}`);
    console.log('Run "claude-setup help" for usage information');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
