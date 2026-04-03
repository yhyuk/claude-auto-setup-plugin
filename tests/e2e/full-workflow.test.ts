import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs-extra';
import { ProjectAnalyzer } from '../../src/core/projectAnalyzer';
import { Generator } from '../../src/core/generator';
import { Validator } from '../../src/core/validator';

describe('E2E: Full Workflow', () => {
  const testProjectPath = path.resolve(__dirname, '../fixtures/e2e-test-project');
  const templatesPath = path.resolve(__dirname, '../../templates');

  beforeEach(async () => {
    // Create a test project structure
    await fs.remove(testProjectPath);
    await fs.ensureDir(testProjectPath);

    // Create a package.json for testing
    await fs.writeJson(path.join(testProjectPath, 'package.json'), {
      name: 'e2e-test-project',
      version: '1.0.0',
      dependencies: {
        react: '^18.0.0',
        next: '^14.0.0',
      },
      devDependencies: {
        typescript: '^5.0.0',
        vitest: '^1.0.0',
      },
    });
  });

  afterEach(async () => {
    // Clean up
    await fs.remove(testProjectPath);
  });

  it('should analyze project and generate appropriate .claude/ structure', async () => {
    // Step 1: Analyze project
    const analyzer = new ProjectAnalyzer(testProjectPath);
    const projectType = await analyzer.detectProjectType();
    const techStack = await analyzer.analyzeTechStack();

    expect(projectType).toBe('web-app');
    expect(techStack.language).toBe('typescript');
    expect(techStack.framework).toBe('nextjs');

    // Step 2: Generate files
    const generator = new Generator(testProjectPath, templatesPath);

    const filesToGenerate = [
      {
        fileType: 'skill' as const,
        fileName: 'code-review',
        variables: {
          SKILL_NAME: 'code-review',
          SKILL_DESCRIPTION: 'Review code for quality and best practices',
          SKILL_PURPOSE: 'Ensure code quality in TypeScript/Next.js projects',
          WHEN_TO_USE: 'Before merging pull requests',
          EXAMPLE_USAGE: 'Run code review on changed files',
          ALLOWED_TOOLS: 'Read, Grep, Glob',
        },
      },
      {
        fileType: 'command' as const,
        fileName: 'build',
        variables: {
          COMMAND_DESCRIPTION: 'Build the Next.js application',
          COMMAND_BODY: 'npm run build',
        },
      },
      {
        fileType: 'agent' as const,
        fileName: 'typescript-helper',
        variables: {
          AGENT_NAME: 'typescript-helper',
          AGENT_DESCRIPTION: 'Assist with TypeScript-specific tasks',
          AGENT_ROLE: 'TypeScript specialist',
          AGENT_CAPABILITIES: 'Type checking, refactoring, best practices',
          USAGE_GUIDELINES: 'Use for TypeScript-related questions',
          MODEL: 'sonnet',
          TOOLS: 'Read, Edit, Grep',
        },
      },
    ];

    const results = await generator.generateBatch(filesToGenerate);

    expect(results).toHaveLength(3);
    expect(results.every((r) => r.action === 'created')).toBe(true);

    // Step 3: Validate generated files
    const validator = new Validator();

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const fileConfig = filesToGenerate[i];
      const content = await fs.readFile(result.path, 'utf-8');

      const yamlValidation = validator.validateYaml(content);
      if (!yamlValidation.valid) {
        console.log('YAML Validation failed for:', result.path);
        console.log('Errors:', yamlValidation.errors);
        console.log('Content:', content);
      }
      expect(yamlValidation.valid).toBe(true);

      const blogValidation = validator.validateBlogStandard(content, fileConfig.fileType);
      if (!blogValidation.valid) {
        console.log('Blog Validation failed for:', result.path);
        console.log('Errors:', blogValidation.errors);
        console.log('Content:', content);
      }
      expect(blogValidation.valid).toBe(true);
    }
  });

  it('should preserve existing .claude/ files', async () => {
    const generator = new Generator(testProjectPath, templatesPath);

    // Create initial file
    const firstResult = await generator.generateFile('command', 'test-command', {
      COMMAND_DESCRIPTION: 'Original description',
      COMMAND_BODY: 'Original body',
    });

    expect(firstResult.action).toBe('created');

    const originalContent = await fs.readFile(firstResult.path, 'utf-8');

    // Try to generate again (should skip)
    const secondResult = await generator.generateFile('command', 'test-command', {
      COMMAND_DESCRIPTION: 'Updated description',
      COMMAND_BODY: 'Updated body',
    });

    expect(secondResult.action).toBe('skipped');

    // Verify content is unchanged
    const currentContent = await fs.readFile(firstResult.path, 'utf-8');
    expect(currentContent).toBe(originalContent);
  });

  it('should handle Python projects correctly', async () => {
    // Update project to Python
    await fs.remove(path.join(testProjectPath, 'package.json'));
    await fs.writeFile(
      path.join(testProjectPath, 'requirements.txt'),
      'django==4.2.0\npytest==7.4.0'
    );

    const analyzer = new ProjectAnalyzer(testProjectPath);
    const projectType = await analyzer.detectProjectType();
    const techStack = await analyzer.analyzeTechStack();

    expect(projectType).toBe('api');
    expect(techStack.language).toBe('python');
    expect(techStack.framework).toBe('django');

    const generator = new Generator(testProjectPath, templatesPath);

    const result = await generator.generateFile('skill', 'django-helper', {
      SKILL_NAME: 'django-helper',
      SKILL_DESCRIPTION: 'Django-specific development assistance',
      SKILL_PURPOSE: 'Help with Django models, views, and migrations',
      WHEN_TO_USE: 'When working with Django components',
      EXAMPLE_USAGE: 'Create Django models',
    });

    expect(result.action).toBe('created');

    const validator = new Validator();
    const content = await fs.readFile(result.path, 'utf-8');
    expect(validator.validateYaml(content).valid).toBe(true);
  });

  it('should detect and scan existing .claude/ files', async () => {
    const generator = new Generator(testProjectPath, templatesPath);

    // Generate some files
    await generator.generateBatch([
      {
        fileType: 'skill',
        fileName: 'existing-skill',
        variables: {
          SKILL_NAME: 'existing-skill',
          SKILL_DESCRIPTION: 'Description',
          SKILL_PURPOSE: 'Purpose',
          WHEN_TO_USE: 'When',
          EXAMPLE_USAGE: 'Example',
        },
      },
      {
        fileType: 'command',
        fileName: 'existing-command',
        variables: {
          COMMAND_DESCRIPTION: 'Description',
          COMMAND_BODY: 'Body',
        },
      },
    ]);

    // Scan existing files
    const analyzer = new ProjectAnalyzer(testProjectPath);
    const existingFiles = await analyzer.scanExistingFiles();

    expect(existingFiles.length).toBeGreaterThanOrEqual(2);

    const skillFile = existingFiles.find((f) => f.type === 'skill');
    const commandFile = existingFiles.find((f) => f.type === 'command');

    expect(skillFile).toBeDefined();
    expect(commandFile).toBeDefined();
  });

  it('should validate generated files match blog standard', async () => {
    const generator = new Generator(testProjectPath, templatesPath);
    const validator = new Validator();

    const result = await generator.generateFile('agent', 'test-agent', {
      AGENT_NAME: 'test-agent',
      AGENT_DESCRIPTION: 'Test agent for validation',
      AGENT_ROLE: 'Testing',
      AGENT_CAPABILITIES: 'Validation',
      USAGE_GUIDELINES: 'Use for testing',
    });

    const content = await fs.readFile(result.path, 'utf-8');

    // Should have valid YAML frontmatter
    expect(content).toMatch(/^---\n[\s\S]*?\n---/);

    // Should pass blog standard validation
    const validation = validator.validateBlogStandard(content, 'agent');
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);

    // Should be loadable
    const relativePath = result.path.replace(testProjectPath + '/', '');
    const loadable = validator.validateLoadability({
      path: relativePath,
      content,
    });
    expect(loadable).toBe(true);
  });

  it('should handle incremental updates to existing .claude/ folder', async () => {
    const generator = new Generator(testProjectPath, templatesPath);

    // Initial generation
    const initialResults = await generator.generateBatch([
      {
        fileType: 'command',
        fileName: 'build',
        variables: {
          COMMAND_DESCRIPTION: 'Build project',
          COMMAND_BODY: 'npm run build',
        },
      },
    ]);

    expect(initialResults[0].action).toBe('created');

    // Add more files (incremental)
    const incrementalResults = await generator.generateBatch([
      {
        fileType: 'command',
        fileName: 'build', // Should skip
        variables: {
          COMMAND_DESCRIPTION: 'Updated build',
          COMMAND_BODY: 'npm run build --production',
        },
      },
      {
        fileType: 'command',
        fileName: 'test', // Should create
        variables: {
          COMMAND_DESCRIPTION: 'Run tests',
          COMMAND_BODY: 'npm test',
        },
      },
    ]);

    expect(incrementalResults[0].action).toBe('skipped'); // build already exists
    expect(incrementalResults[1].action).toBe('created'); // test is new

    // Verify .claude/ has both files
    const analyzer = new ProjectAnalyzer(testProjectPath);
    const existingFiles = await analyzer.scanExistingFiles();

    const commandFiles = existingFiles.filter((f) => f.type === 'command');
    expect(commandFiles).toHaveLength(2);
  });
});
