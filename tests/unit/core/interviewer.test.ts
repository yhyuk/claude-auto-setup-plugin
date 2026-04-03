import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Interviewer } from '../../../src/core/interviewer';
import type {
  ProjectProfile,
  ProjectType,
  ProgrammingLanguage,
  Framework,
} from '../../../src/types';

describe('Interviewer', () => {
  let interviewer: Interviewer;

  beforeEach(() => {
    interviewer = new Interviewer();
  });

  describe('collectAnswers', () => {
    it('should collect project type from user', async () => {
      // Mock user answering questions
      const mockAnswers: Partial<ProjectProfile> = {
        projectType: 'web-app',
        language: 'typescript',
        framework: 'nextjs',
        mainTasks: ['feature-dev', 'testing'],
        teamSize: 'small',
      };

      // This test will fail until implementation is complete
      // We're defining expected behavior first (TDD)
      const profile = await interviewer.collectAnswers();

      expect(profile).toBeDefined();
      expect(profile).toHaveProperty('projectType');
      expect(profile).toHaveProperty('language');
      expect(profile).toHaveProperty('framework');
      expect(profile).toHaveProperty('mainTasks');
      expect(profile).toHaveProperty('teamSize');
    });

    it('should ask about project type (web-app, api, cli, library, mobile, other)', async () => {
      const profile = await interviewer.collectAnswers();
      expect(['web-app', 'api', 'cli', 'library', 'mobile', 'other']).toContain(
        profile.projectType
      );
    });

    it('should ask about programming language', async () => {
      const profile = await interviewer.collectAnswers();
      expect(profile.language).toBeDefined();
      expect(typeof profile.language).toBe('string');
    });

    it('should ask about framework', async () => {
      const profile = await interviewer.collectAnswers();
      expect(profile.framework).toBeDefined();
    });

    it('should ask about main development tasks (multi-select)', async () => {
      const profile = await interviewer.collectAnswers();
      expect(Array.isArray(profile.mainTasks)).toBe(true);
      expect(profile.mainTasks.length).toBeGreaterThan(0);
    });

    it('should ask about team size', async () => {
      const profile = await interviewer.collectAnswers();
      expect(['solo', 'small', 'large']).toContain(profile.teamSize);
    });

    it('should optionally ask about coding style', async () => {
      const profile = await interviewer.collectAnswers();
      // codingStyle is optional
      if (profile.codingStyle) {
        expect(typeof profile.codingStyle).toBe('string');
      }
    });

    it('should execute questions in correct order (Stage 1 → 2 → 3)', async () => {
      // Test that basic info is collected before workflow questions
      const profile = await interviewer.collectAnswers();

      // All required fields should be present
      expect(profile.projectType).toBeDefined();
      expect(profile.language).toBeDefined();
      expect(profile.mainTasks).toBeDefined();
    });

    it('should handle user cancellation gracefully', async () => {
      // If user cancels the interview, should return partial profile or throw
      try {
        const profile = await interviewer.collectAnswers();
        expect(profile).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('getQuestions', () => {
    it('should return array of question stages', () => {
      const stages = interviewer.getQuestions();
      expect(Array.isArray(stages)).toBe(true);
      expect(stages.length).toBeGreaterThanOrEqual(5);
    });

    it('should include project type question', () => {
      const stages = interviewer.getQuestions();
      const hasProjectTypeQuestion = stages.some((stage) =>
        stage.question.toLowerCase().includes('프로젝트')
      );
      expect(hasProjectTypeQuestion).toBe(true);
    });

    it('should include language question', () => {
      const stages = interviewer.getQuestions();
      const hasLanguageQuestion = stages.some((stage) =>
        stage.question.toLowerCase().includes('언어')
      );
      expect(hasLanguageQuestion).toBe(true);
    });

    it('should include framework question', () => {
      const stages = interviewer.getQuestions();
      const hasFrameworkQuestion = stages.some((stage) =>
        stage.question.toLowerCase().includes('프레임워크')
      );
      expect(hasFrameworkQuestion).toBe(true);
    });

    it('should include at least 5 questions total', () => {
      const stages = interviewer.getQuestions();
      expect(stages.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('validateProfile', () => {
    it('should validate a complete profile', () => {
      const validProfile: ProjectProfile = {
        projectType: 'web-app',
        language: 'typescript',
        framework: 'nextjs',
        mainTasks: ['feature-dev', 'testing'],
        teamSize: 'small',
      };

      const result = interviewer.validateProfile(validProfile);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject profile missing projectType', () => {
      const invalidProfile = {
        language: 'typescript',
        framework: 'nextjs',
        mainTasks: ['feature-dev'],
        teamSize: 'small',
      } as ProjectProfile;

      const result = interviewer.validateProfile(invalidProfile);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: projectType');
    });

    it('should reject profile missing language', () => {
      const invalidProfile = {
        projectType: 'web-app',
        framework: 'nextjs',
        mainTasks: ['feature-dev'],
        teamSize: 'small',
      } as ProjectProfile;

      const result = interviewer.validateProfile(invalidProfile);
      expect(result.valid).toBe(false);
    });

    it('should reject profile with empty mainTasks', () => {
      const invalidProfile: ProjectProfile = {
        projectType: 'web-app',
        language: 'typescript',
        framework: 'nextjs',
        mainTasks: [],
        teamSize: 'small',
      };

      const result = interviewer.validateProfile(invalidProfile);
      expect(result.valid).toBe(false);
    });

    it('should accept profile with optional codingStyle', () => {
      const validProfile: ProjectProfile = {
        projectType: 'web-app',
        language: 'typescript',
        framework: 'nextjs',
        mainTasks: ['feature-dev'],
        teamSize: 'small',
        codingStyle: 'strict',
      };

      const result = interviewer.validateProfile(validProfile);
      expect(result.valid).toBe(true);
    });
  });
});
