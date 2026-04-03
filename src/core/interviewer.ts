import type { ProjectProfile, ValidationResult } from '../types';

interface QuestionStage {
  question: string;
  field: keyof ProjectProfile;
  options?: Array<{ label: string; value: string }>;
  multiSelect?: boolean;
}

export class Interviewer {
  private stages: QuestionStage[] = [
    {
      question: '이 프로젝트의 주요 목적은 무엇입니까?',
      field: 'projectType',
      options: [
        { label: '웹 애플리케이션', value: 'web-app' },
        { label: 'API 서버', value: 'api' },
        { label: 'CLI 도구', value: 'cli' },
        { label: '라이브러리', value: 'library' },
        { label: '모바일 앱', value: 'mobile' },
      ],
    },
    {
      question: '주로 사용하는 프로그래밍 언어는 무엇입니까?',
      field: 'language',
      options: [
        { label: 'TypeScript', value: 'typescript' },
        { label: 'JavaScript', value: 'javascript' },
        { label: 'Python', value: 'python' },
        { label: 'Java', value: 'java' },
        { label: 'Go', value: 'go' },
        { label: 'Rust', value: 'rust' },
      ],
    },
    {
      question: '사용 중인 프레임워크가 있습니까?',
      field: 'framework',
      options: [
        { label: 'Next.js', value: 'nextjs' },
        { label: 'React', value: 'react' },
        { label: 'Vue', value: 'vue' },
        { label: 'Express', value: 'express' },
        { label: 'NestJS', value: 'nestjs' },
        { label: 'Spring Boot', value: 'springboot' },
        { label: 'Django', value: 'django' },
        { label: 'Flask', value: 'flask' },
        { label: 'FastAPI', value: 'fastapi' },
        { label: '없음', value: 'none' },
      ],
    },
    {
      question: '주요 개발 작업은 무엇입니까? (복수 선택)',
      field: 'mainTasks',
      multiSelect: true,
      options: [
        { label: '기능 개발', value: 'feature-dev' },
        { label: '버그 수정', value: 'bug-fix' },
        { label: '테스트 작성', value: 'testing' },
        { label: '문서화', value: 'documentation' },
        { label: '리팩토링', value: 'refactoring' },
      ],
    },
    {
      question: '팀 규모는 어떻게 되나요?',
      field: 'teamSize',
      options: [
        { label: '개인 프로젝트', value: 'solo' },
        { label: '소규모 팀 (2-5명)', value: 'small' },
        { label: '대규모 팀 (6명 이상)', value: 'large' },
      ],
    },
  ];

  async collectAnswers(): Promise<ProjectProfile> {
    // In a real Claude Code plugin context, this would use AskUserQuestion tool
    // For now, we'll create a mock profile for testing
    const profile: ProjectProfile = {
      projectType: 'web-app',
      language: 'typescript',
      framework: 'nextjs',
      mainTasks: ['feature-dev', 'testing'],
      teamSize: 'small',
    };

    return profile;
  }

  getQuestions(): QuestionStage[] {
    return this.stages;
  }

  validateProfile(profile: ProjectProfile): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
    };

    // Check required fields
    if (!profile.projectType) {
      result.valid = false;
      result.errors.push('Missing required field: projectType');
    }

    if (!profile.language) {
      result.valid = false;
      result.errors.push('Missing required field: language');
    }

    if (!profile.framework) {
      result.valid = false;
      result.errors.push('Missing required field: framework');
    }

    if (!profile.mainTasks || profile.mainTasks.length === 0) {
      result.valid = false;
      result.errors.push('Missing required field: mainTasks (must have at least one)');
    }

    if (!profile.teamSize) {
      result.valid = false;
      result.errors.push('Missing required field: teamSize');
    }

    return result;
  }
}
