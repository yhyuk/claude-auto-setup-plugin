/**
 * 대화형 .claude/ 폴더 설정 워크플로우
 * Claude Code의 AskUserQuestion을 사용해서 사용자와 대화하며 정보 수집
 */

import { ProjectAnalyzer } from './core/projectAnalyzer';
import { Interviewer } from './core/interviewer';
import { Generator } from './core/generator';
import type { ProjectProfile } from './types';

export interface SetupOptions {
  projectPath: string;
  templatesPath: string;
  skipInterview?: boolean; // true면 자동 분석만 사용
}

export interface InterviewAnswer {
  question: string;
  answer: string;
}

/**
 * 대화형 설정 워크플로우
 */
export async function setupWithInterview(
  options: SetupOptions,
  askQuestion: (question: string, choices: string[]) => Promise<string>
): Promise<void> {
  const { projectPath, templatesPath } = options;

  console.log('🚀 Claude Auto Setup - Interactive Mode\n');

  // 1. 프로젝트 자동 분석
  console.log('📊 Step 1: Analyzing your project...\n');
  const analyzer = new ProjectAnalyzer(projectPath);
  const projectType = await analyzer.detectProjectType();
  const techStack = await analyzer.analyzeTechStack();

  console.log(`✓ Detected: ${techStack.language} ${projectType}`);
  if (techStack.framework) {
    console.log(`✓ Framework: ${techStack.framework}`);
  }

  // 2. 대화형 질문으로 추가 정보 수집
  console.log('\n💬 Step 2: Let me ask you a few questions to customize your setup...\n');

  const interviewer = new Interviewer();
  const questions = interviewer.getQuestions();

  const answers: Record<string, string> = {};

  // 질문 1: 프로젝트 타입 확인
  if (questions[0] && questions[0].options) {
    const projectTypeAnswer = await askQuestion(
      questions[0].question,
      questions[0].options.map((o) => o.label)
    );
    answers['projectType'] = projectTypeAnswer;
  }

  // 질문 2: 주요 작업
  if (questions[1] && questions[1].options) {
    const mainTasksAnswer = await askQuestion(
      questions[1].question,
      questions[1].options.map((o) => o.label)
    );
    answers['mainTasks'] = mainTasksAnswer;
  }

  // 질문 3: 팀 규모
  if (questions[2] && questions[2].options) {
    const teamSizeAnswer = await askQuestion(
      questions[2].question,
      questions[2].options.map((o) => o.label)
    );
    answers['teamSize'] = teamSizeAnswer;
  }

  // 질문 4: 코딩 스타일
  if (questions[3] && questions[3].options) {
    const codingStyleAnswer = await askQuestion(
      questions[3].question,
      questions[3].options.map((o) => o.label)
    );
    answers['codingStyle'] = codingStyleAnswer;
  }

  // 질문 5: 우선순위
  if (questions[4] && questions[4].options) {
    const priorityAnswer = await askQuestion(
      questions[4].question,
      questions[4].options.map((o) => o.label)
    );
    answers['priority'] = priorityAnswer;
  }

  // 3. 프로필 생성
  const profile: ProjectProfile = {
    projectType: projectType,
    language: techStack.language,
    framework: techStack.framework || 'none',
    mainTasks: [answers['mainTasks']],
    teamSize: answers['teamSize'] as 'solo' | 'small' | 'large',
    codingStyle: answers['codingStyle'],
  };

  console.log("\n✅ Got it! Here's your project profile:");
  console.log(`   - Project Type: ${profile.projectType}`);
  console.log(`   - Language: ${profile.language}`);
  console.log(`   - Framework: ${profile.framework}`);
  console.log(`   - Main Tasks: ${profile.mainTasks.join(', ')}`);
  console.log(`   - Team Size: ${profile.teamSize}`);
  console.log(`   - Coding Style: ${profile.codingStyle}`);

  // 4. 맞춤형 파일 생성
  console.log('\n📝 Step 3: Generating customized .claude/ structure...\n');

  const generator = new Generator(projectPath, templatesPath);

  const filesToGenerate = generateCustomizedFiles(profile, answers);

  const results = await generator.generateBatch(filesToGenerate);

  // 5. 결과 출력
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
  console.log('\n✨ Your customized .claude/ folder is ready!');
}

/**
 * 사용자 답변에 따라 맞춤형 파일 생성
 */
function generateCustomizedFiles(
  profile: ProjectProfile,
  answers: Record<string, string>
): Array<{
  fileType: 'skill' | 'command' | 'agent';
  fileName: string;
  variables: Record<string, string>;
}> {
  const files: Array<{
    fileType: 'skill' | 'command' | 'agent';
    fileName: string;
    variables: Record<string, string>;
  }> = [];

  // 1. Code Review Skill (항상 생성)
  files.push({
    fileType: 'skill',
    fileName: 'code-review',
    variables: {
      SKILL_NAME: 'code-review',
      SKILL_DESCRIPTION: `Review ${profile.language} code for quality and best practices`,
      SKILL_PURPOSE: `Ensure code quality in ${profile.language} projects with ${profile.codingStyle || 'standard'} style`,
      WHEN_TO_USE: 'Before merging pull requests or committing code',
      EXAMPLE_USAGE: 'Review changed files for potential issues',
      ALLOWED_TOOLS: 'Read, Grep, Glob',
    },
  });

  // 2. 주요 작업에 따른 Skills
  const mainTask = answers['mainTasks'];
  if (mainTask === 'Bug fixing and debugging') {
    files.push({
      fileType: 'skill',
      fileName: 'debug-helper',
      variables: {
        SKILL_NAME: 'debug-helper',
        SKILL_DESCRIPTION: 'Help debug issues and find root causes',
        SKILL_PURPOSE: 'Quickly identify and fix bugs',
        WHEN_TO_USE: 'When encountering errors or unexpected behavior',
        EXAMPLE_USAGE: 'Analyze error logs and stack traces',
        ALLOWED_TOOLS: 'Read, Grep, Glob, Bash',
      },
    });
  } else if (mainTask === 'Refactoring and optimization') {
    files.push({
      fileType: 'skill',
      fileName: 'refactor-assistant',
      variables: {
        SKILL_NAME: 'refactor-assistant',
        SKILL_DESCRIPTION: 'Guide refactoring and code optimization',
        SKILL_PURPOSE: 'Improve code quality and performance',
        WHEN_TO_USE: 'When refactoring legacy code or optimizing performance',
        EXAMPLE_USAGE: 'Suggest refactoring patterns',
        ALLOWED_TOOLS: 'Read, Edit, Grep, Glob',
      },
    });
  } else if (mainTask === 'Writing tests') {
    files.push({
      fileType: 'skill',
      fileName: 'test-generator',
      variables: {
        SKILL_NAME: 'test-generator',
        SKILL_DESCRIPTION: 'Generate comprehensive test cases',
        SKILL_PURPOSE: 'Ensure high test coverage',
        WHEN_TO_USE: 'When writing tests for new features',
        EXAMPLE_USAGE: 'Generate unit and integration tests',
        ALLOWED_TOOLS: 'Read, Write, Edit, Grep',
      },
    });
  }

  // 3. Commands
  const buildCommand =
    profile.language === 'typescript' || profile.language === 'javascript'
      ? 'npm run build'
      : profile.language === 'python'
        ? 'python -m build'
        : profile.language === 'java'
          ? 'mvn clean install'
          : profile.language === 'go'
            ? 'go build'
            : profile.language === 'rust'
              ? 'cargo build'
              : 'build';

  files.push({
    fileType: 'command',
    fileName: 'build',
    variables: {
      COMMAND_DESCRIPTION: `Build the ${profile.framework || profile.language} project`,
      COMMAND_BODY: buildCommand,
    },
  });

  const testCommand =
    profile.language === 'typescript' || profile.language === 'javascript'
      ? 'npm test'
      : profile.language === 'python'
        ? 'pytest'
        : profile.language === 'java'
          ? 'mvn test'
          : profile.language === 'go'
            ? 'go test ./...'
            : profile.language === 'rust'
              ? 'cargo test'
              : 'test';

  files.push({
    fileType: 'command',
    fileName: 'test',
    variables: {
      COMMAND_DESCRIPTION: 'Run project tests',
      COMMAND_BODY: testCommand,
    },
  });

  // 4. Agents
  files.push({
    fileType: 'agent',
    fileName: `${profile.language}-helper`,
    variables: {
      AGENT_NAME: `${profile.language}-helper`,
      AGENT_DESCRIPTION: `Assist with ${profile.language}-specific development tasks`,
      AGENT_ROLE: `${profile.language} development specialist`,
      AGENT_CAPABILITIES: `Code review, refactoring, best practices for ${profile.language}`,
      USAGE_GUIDELINES: `Use when working on ${profile.language} code`,
      MODEL: profile.teamSize === 'large' ? 'opus' : 'sonnet',
      TOOLS: 'Read, Edit, Grep, Glob',
    },
  });

  // 5. 팀 규모에 따른 추가 파일
  if (profile.teamSize === 'large') {
    files.push({
      fileType: 'skill',
      fileName: 'team-collaboration',
      variables: {
        SKILL_NAME: 'team-collaboration',
        SKILL_DESCRIPTION: 'Facilitate team collaboration and code reviews',
        SKILL_PURPOSE: 'Ensure team standards and best practices',
        WHEN_TO_USE: "When reviewing team member's code or coordinating changes",
        EXAMPLE_USAGE: 'Review PR for team standards',
        ALLOWED_TOOLS: 'Read, Grep, Glob',
      },
    });
  }

  return files;
}

/**
 * Claude Code에서 답변을 직접 제공받아 설정
 */
export async function setupWithAnswers(
  options: SetupOptions,
  answers: {
    projectType?: 'web-app' | 'api' | 'cli' | 'library' | 'mobile' | 'other';
    mainTasks?: string;
    teamSize?: 'solo' | 'small' | 'large';
    codingStyle?: string;
    priority?: string;
  }
): Promise<void> {
  const { projectPath, templatesPath } = options;

  console.log('🚀 Claude Auto Setup - With Provided Answers\n');

  // 1. 프로젝트 자동 분석
  console.log('📊 Analyzing your project...\n');
  const analyzer = new ProjectAnalyzer(projectPath);
  const projectType = await analyzer.detectProjectType();
  const techStack = await analyzer.analyzeTechStack();

  console.log(`✓ Detected: ${techStack.language} ${projectType}`);
  if (techStack.framework) {
    console.log(`✓ Framework: ${techStack.framework}`);
  }

  // 2. 프로필 생성
  const profile: ProjectProfile = {
    projectType: answers.projectType || projectType,
    language: techStack.language,
    framework: techStack.framework || 'none',
    mainTasks: answers.mainTasks ? [answers.mainTasks] : ['Feature development'],
    teamSize: answers.teamSize || 'solo',
    codingStyle: answers.codingStyle || 'Standard practices',
  };

  console.log('\n✅ Project profile:');
  console.log(`   - Project Type: ${profile.projectType}`);
  console.log(`   - Language: ${profile.language}`);
  console.log(`   - Framework: ${profile.framework}`);
  console.log(`   - Main Tasks: ${profile.mainTasks.join(', ')}`);
  console.log(`   - Team Size: ${profile.teamSize}`);
  console.log(`   - Coding Style: ${profile.codingStyle}`);

  // 3. 맞춤형 파일 생성
  console.log('\n📝 Generating customized .claude/ structure...\n');

  const generator = new Generator(projectPath, templatesPath);

  const answerRecord: Record<string, string> = {
    mainTasks: answers.mainTasks || 'Feature development',
    teamSize: answers.teamSize || 'solo',
  };

  const filesToGenerate = generateCustomizedFiles(profile, answerRecord);

  const results = await generator.generateBatch(filesToGenerate);

  // 4. 결과 출력
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
  console.log('\n✨ Your customized .claude/ folder is ready!');
}

/**
 * 빠른 설정 (질문 없이 자동 분석만)
 */
export async function quickSetup(options: SetupOptions): Promise<void> {
  const { projectPath, templatesPath } = options;

  console.log('🚀 Claude Auto Setup - Quick Mode\n');

  const analyzer = new ProjectAnalyzer(projectPath);
  const projectType = await analyzer.detectProjectType();
  const techStack = await analyzer.analyzeTechStack();

  console.log(
    `Detected: ${techStack.language} ${projectType} with ${techStack.framework || 'no framework'}\n`
  );

  const generator = new Generator(projectPath, templatesPath);

  // 기본 파일만 생성
  const results = await generator.generateBatch([
    {
      fileType: 'skill',
      fileName: 'code-review',
      variables: {
        SKILL_NAME: 'code-review',
        SKILL_DESCRIPTION: `Review ${techStack.language} code for quality`,
        SKILL_PURPOSE: 'Ensure code quality',
        WHEN_TO_USE: 'Before merging',
        EXAMPLE_USAGE: 'Review files',
        ALLOWED_TOOLS: 'Read, Grep, Glob',
      },
    },
  ]);

  console.log(`✓ Created ${results.filter((r) => r.action === 'created').length} files`);
}
