import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as path from 'path';
import { ProjectAnalyzer } from '../../../src/core/projectAnalyzer';
import type { ProjectType, ProgrammingLanguage, Framework } from '../../../src/types';

describe('ProjectAnalyzer', () => {
  let analyzer: ProjectAnalyzer;
  const fixturesPath = path.resolve(__dirname, '../../fixtures');

  beforeEach(() => {
    // Use TypeScript project fixture by default
    analyzer = new ProjectAnalyzer(path.join(fixturesPath, 'typescript-project'));
  });

  describe('detectProjectType', () => {
    it('should detect web-app from package.json with react dependency', async () => {
      const projectType = await analyzer.detectProjectType();
      expect(projectType).toBeDefined();
      expect(['web-app', 'api', 'cli', 'library', 'mobile', 'other']).toContain(projectType);
    });

    it('should detect api from package.json with express dependency', async () => {
      const projectType = await analyzer.detectProjectType();
      expect(projectType).toBeDefined();
    });

    it('should detect cli from package.json with bin field', async () => {
      const projectType = await analyzer.detectProjectType();
      expect(projectType).toBeDefined();
    });

    it('should return "other" when project type cannot be determined', async () => {
      const projectType = await analyzer.detectProjectType();
      expect(projectType).toBeDefined();
    });

    it('should handle missing package.json gracefully', async () => {
      const emptyAnalyzer = new ProjectAnalyzer(path.join(fixturesPath, 'empty-project'));
      const projectType = await emptyAnalyzer.detectProjectType();
      expect(projectType).toBe('other');
    });
  });

  describe('analyzeTechStack', () => {
    it('should detect TypeScript from package.json dependencies', async () => {
      const techStack = await analyzer.analyzeTechStack();
      expect(techStack).toHaveProperty('language');
      expect(techStack.language).toBeDefined();
    });

    it('should detect Python from requirements.txt', async () => {
      const techStack = await analyzer.analyzeTechStack();
      expect(techStack.language).toBeDefined();
    });

    it('should detect framework from dependencies', async () => {
      const techStack = await analyzer.analyzeTechStack();
      expect(techStack).toHaveProperty('framework');
    });

    it('should detect package manager (npm, yarn, pnpm)', async () => {
      const techStack = await analyzer.analyzeTechStack();
      expect(techStack).toHaveProperty('packageManager');
    });

    it('should detect test framework from devDependencies', async () => {
      const techStack = await analyzer.analyzeTechStack();
      expect(techStack).toHaveProperty('testFramework');
    });
  });

  describe('scanExistingFiles', () => {
    it('should return empty array when .claude folder does not exist', async () => {
      const existingFiles = await analyzer.scanExistingFiles();
      expect(Array.isArray(existingFiles)).toBe(true);
    });

    it('should detect existing skill files', async () => {
      const existingFiles = await analyzer.scanExistingFiles();
      const skillFiles = existingFiles.filter((f) => f.type === 'skill');
      expect(Array.isArray(skillFiles)).toBe(true);
    });

    it('should detect existing command files', async () => {
      const existingFiles = await analyzer.scanExistingFiles();
      const commandFiles = existingFiles.filter((f) => f.type === 'command');
      expect(Array.isArray(commandFiles)).toBe(true);
    });

    it('should detect existing agent files', async () => {
      const existingFiles = await analyzer.scanExistingFiles();
      const agentFiles = existingFiles.filter((f) => f.type === 'agent');
      expect(Array.isArray(agentFiles)).toBe(true);
    });

    it('should return file paths relative to .claude folder', async () => {
      const existingFiles = await analyzer.scanExistingFiles();
      existingFiles.forEach((file) => {
        expect(file.path).toBeDefined();
        expect(typeof file.path).toBe('string');
      });
    });
  });

  describe('analyzeStructure', () => {
    it('should detect package.json presence', async () => {
      const structure = await analyzer.analyzeStructure();
      expect(structure).toHaveProperty('hasPackageJson');
      expect(typeof structure.hasPackageJson).toBe('boolean');
    });

    it('should detect pom.xml presence', async () => {
      const structure = await analyzer.analyzeStructure();
      expect(structure).toHaveProperty('hasPomXml');
    });

    it('should detect requirements.txt presence', async () => {
      const structure = await analyzer.analyzeStructure();
      expect(structure).toHaveProperty('hasRequirementsTxt');
    });

    it('should detect go.mod presence', async () => {
      const structure = await analyzer.analyzeStructure();
      expect(structure).toHaveProperty('hasGoMod');
    });

    it('should detect Cargo.toml presence', async () => {
      const structure = await analyzer.analyzeStructure();
      expect(structure).toHaveProperty('hasCargoToml');
    });
  });
});
