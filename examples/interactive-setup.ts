/**
 * 대화형 .claude/ 폴더 설정
 *
 * 사용법:
 * 1. Claude Code에서 이 파일을 열기
 * 2. "이 스크립트 실행해줘" 요청
 * 3. 질문에 답변
 * 4. .claude/ 폴더 자동 생성!
 */

import * as path from 'path';
import { setupWithInterview } from '../src/setupWorkflow';

async function main() {
  const projectPath = process.cwd();
  const templatesPath = path.join(__dirname, '../templates');

  console.log('🎯 Interactive .claude/ Folder Setup\n');
  console.log('I will ask you a few questions to understand your project better.\n');
  console.log('Based on your answers, I will generate a customized .claude/ folder.\n');
  console.log('Press Ctrl+C to cancel at any time.\n');
  console.log('─'.repeat(60));
  console.log('\n');

  // Claude Code의 AskUserQuestion을 시뮬레이션하기 위한 함수
  // 실제로는 Claude가 질문을 할 것임
  const askQuestion = async (question: string, choices: string[]): Promise<string> => {
    console.log(`❓ ${question}`);
    choices.forEach((choice, idx) => {
      console.log(`   ${idx + 1}. ${choice}`);
    });
    console.log('\n');

    // 여기서는 플레이스홀더
    // Claude Code가 실제로 사용자에게 질문할 것임
    return choices[0]; // 기본값
  };

  await setupWithInterview(
    {
      projectPath,
      templatesPath,
    },
    askQuestion
  );
}

// 스크립트 직접 실행 시
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

export { main };
