#!/usr/bin/env node

/**
 * 새 프로젝트에서 setupWithAnswers 테스트
 *
 * 사용법:
 * node test-new-project.js /path/to/new/project
 */

const path = require('path');
const { setupWithAnswers } = require('./dist/src/setupWorkflow');

async function main() {
  const projectPath = process.argv[2];

  if (!projectPath) {
    console.error('❌ Error: Please provide project path');
    console.log('\nUsage: node test-new-project.js /path/to/project\n');
    console.log('Example: node test-new-project.js /tmp/my-test-project');
    process.exit(1);
  }

  const templatesPath = path.join(__dirname, 'templates');

  console.log(`Testing setupWithAnswers on: ${projectPath}\n`);

  // 테스트 답변들
  const answers = {
    projectType: 'web-app',
    mainTasks: 'Feature development',
    teamSize: 'solo',
    codingStyle: 'Standard practices',
    priority: 'Code quality'
  };

  console.log('Using answers:');
  console.log(JSON.stringify(answers, null, 2));
  console.log('\n' + '='.repeat(60) + '\n');

  await setupWithAnswers(
    {
      projectPath,
      templatesPath,
    },
    answers
  );
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
