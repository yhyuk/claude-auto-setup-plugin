import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';
import type { ProjectType, TechStack, ProjectStructure, ExistingFile } from '../types';

export class ProjectAnalyzer {
  constructor(private projectPath: string) {}

  async detectProjectType(): Promise<ProjectType> {
    try {
      const packageJsonPath = path.join(this.projectPath, 'package.json');
      const pomXmlPath = path.join(this.projectPath, 'pom.xml');

      // Check for package.json (JavaScript/TypeScript projects)
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);

        // Check for bin field (CLI tools)
        if (packageJson.bin) {
          return 'cli';
        }

        // Check dependencies for framework clues
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

        if (deps.react || deps.next || deps.vue || deps['@angular/core']) {
          return 'web-app';
        }

        if (deps.express || deps.fastify || deps.koa || deps['@nestjs/core']) {
          return 'api';
        }

        // Check if it's a library (has types, no application frameworks)
        if (packageJson.types || packageJson.typings) {
          return 'library';
        }
      }

      // Check for Java projects
      if (await fs.pathExists(pomXmlPath)) {
        const pomContent = await fs.readFile(pomXmlPath, 'utf-8');
        if (pomContent.includes('spring-boot')) {
          return 'api';
        }
        return 'library';
      }

      // Check for Python projects
      const requirementsPath = path.join(this.projectPath, 'requirements.txt');
      if (await fs.pathExists(requirementsPath)) {
        const content = await fs.readFile(requirementsPath, 'utf-8');
        if (
          content.includes('django') ||
          content.includes('flask') ||
          content.includes('fastapi')
        ) {
          return 'api';
        }
      }

      return 'other';
    } catch (error) {
      console.error('Error detecting project type:', error);
      return 'other';
    }
  }

  async analyzeTechStack(): Promise<TechStack> {
    const stack: TechStack = {
      language: 'other',
    };

    try {
      // Check for package.json (Node.js projects)
      const packageJsonPath = path.join(this.projectPath, 'package.json');
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

        // Detect language
        if (deps.typescript || packageJson.devDependencies?.typescript) {
          stack.language = 'typescript';
        } else {
          stack.language = 'javascript';
        }

        // Detect framework
        if (deps.next) stack.framework = 'nextjs';
        else if (deps.react) stack.framework = 'react';
        else if (deps.vue) stack.framework = 'vue';
        else if (deps['@angular/core']) stack.framework = 'angular';
        else if (deps.express) stack.framework = 'express';
        else if (deps['@nestjs/core']) stack.framework = 'nestjs';
        else stack.framework = 'none';

        // Detect package manager
        if (await fs.pathExists(path.join(this.projectPath, 'pnpm-lock.yaml'))) {
          stack.packageManager = 'pnpm';
        } else if (await fs.pathExists(path.join(this.projectPath, 'yarn.lock'))) {
          stack.packageManager = 'yarn';
        } else {
          stack.packageManager = 'npm';
        }

        // Detect test framework
        if (deps.vitest) stack.testFramework = 'vitest';
        else if (deps.jest) stack.testFramework = 'jest';
        else if (deps.mocha) stack.testFramework = 'mocha';
      }

      // Check for Python
      const requirementsPath = path.join(this.projectPath, 'requirements.txt');
      if (await fs.pathExists(requirementsPath)) {
        stack.language = 'python';
        const content = await fs.readFile(requirementsPath, 'utf-8');

        if (content.includes('django')) stack.framework = 'django';
        else if (content.includes('flask')) stack.framework = 'flask';
        else if (content.includes('fastapi')) stack.framework = 'fastapi';

        if (content.includes('pytest')) stack.testFramework = 'pytest';
      }

      // Check for Java
      const pomXmlPath = path.join(this.projectPath, 'pom.xml');
      if (await fs.pathExists(pomXmlPath)) {
        stack.language = 'java';
        const pomContent = await fs.readFile(pomXmlPath, 'utf-8');
        if (pomContent.includes('spring-boot')) {
          stack.framework = 'springboot';
        }
        stack.packageManager = 'maven';
      }

      // Check for Go
      const goModPath = path.join(this.projectPath, 'go.mod');
      if (await fs.pathExists(goModPath)) {
        stack.language = 'go';
        stack.packageManager = 'go mod';
      }

      // Check for Rust
      const cargoTomlPath = path.join(this.projectPath, 'Cargo.toml');
      if (await fs.pathExists(cargoTomlPath)) {
        stack.language = 'rust';
        stack.packageManager = 'cargo';
      }

      return stack;
    } catch (error) {
      console.error('Error analyzing tech stack:', error);
      return stack;
    }
  }

  async scanExistingFiles(): Promise<ExistingFile[]> {
    const existingFiles: ExistingFile[] = [];
    const claudeDir = path.join(this.projectPath, '.claude');

    try {
      if (!(await fs.pathExists(claudeDir))) {
        return [];
      }

      // Scan for skills (skills are in subdirectories with SKILL.md)
      const skillsDir = path.join(claudeDir, 'skills');
      if (await fs.pathExists(skillsDir)) {
        const skillFiles = await glob('*/SKILL.md', { cwd: skillsDir });
        skillFiles.forEach((file) => {
          existingFiles.push({
            path: path.join('skills', file),
            type: 'skill',
          });
        });
      }

      // Scan for commands
      const commandsDir = path.join(claudeDir, 'commands');
      if (await fs.pathExists(commandsDir)) {
        const commandFiles = await glob('*.md', { cwd: commandsDir });
        commandFiles.forEach((file) => {
          existingFiles.push({
            path: path.join('commands', file),
            type: 'command',
          });
        });
      }

      // Scan for agents
      const agentsDir = path.join(claudeDir, 'agents');
      if (await fs.pathExists(agentsDir)) {
        const agentFiles = await glob('*.md', { cwd: agentsDir });
        agentFiles.forEach((file) => {
          existingFiles.push({
            path: path.join('agents', file),
            type: 'agent',
          });
        });
      }

      // Scan for rules
      const rulesDir = path.join(claudeDir, 'rules');
      if (await fs.pathExists(rulesDir)) {
        const ruleFiles = await glob('*.md', { cwd: rulesDir });
        ruleFiles.forEach((file) => {
          existingFiles.push({
            path: path.join('rules', file),
            type: 'rule',
          });
        });
      }

      // Check for settings.json
      const settingsPath = path.join(claudeDir, 'settings.json');
      if (await fs.pathExists(settingsPath)) {
        existingFiles.push({
          path: 'settings.json',
          type: 'settings',
        });
      }

      return existingFiles;
    } catch (error) {
      console.error('Error scanning existing files:', error);
      return [];
    }
  }

  async analyzeStructure(): Promise<ProjectStructure> {
    const structure: ProjectStructure = {
      hasPackageJson: false,
      hasPomXml: false,
      hasRequirementsTxt: false,
      hasGoMod: false,
      hasCargoToml: false,
    };

    try {
      structure.hasPackageJson = await fs.pathExists(path.join(this.projectPath, 'package.json'));
      structure.hasPomXml = await fs.pathExists(path.join(this.projectPath, 'pom.xml'));
      structure.hasRequirementsTxt = await fs.pathExists(
        path.join(this.projectPath, 'requirements.txt')
      );
      structure.hasGoMod = await fs.pathExists(path.join(this.projectPath, 'go.mod'));
      structure.hasCargoToml = await fs.pathExists(path.join(this.projectPath, 'Cargo.toml'));

      return structure;
    } catch (error) {
      console.error('Error analyzing project structure:', error);
      return structure;
    }
  }
}
