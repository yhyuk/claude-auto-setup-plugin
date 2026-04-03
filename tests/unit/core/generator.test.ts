import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs-extra';
import { Generator } from '../../../src/core/generator';

describe('Generator', () => {
  let generator: Generator;
  const testProjectPath = path.resolve(__dirname, '../../fixtures/test-generation');
  const templatesPath = path.resolve(__dirname, '../../../templates');

  beforeEach(async () => {
    // Clean up test directory
    await fs.remove(testProjectPath);
    await fs.ensureDir(testProjectPath);

    generator = new Generator(testProjectPath, templatesPath);
  });

  afterEach(async () => {
    // Clean up after tests
    await fs.remove(testProjectPath);
  });

  describe('generateFile', () => {
    it('should generate a skill file with variables', async () => {
      const result = await generator.generateFile('skill', 'test-skill', {
        SKILL_NAME: 'test-skill',
        SKILL_DESCRIPTION: 'Test skill description',
        SKILL_PURPOSE: 'Test purpose',
        WHEN_TO_USE: 'When testing',
        EXAMPLE_USAGE: 'Example here',
        ALLOWED_TOOLS: 'Read, Write',
      });

      expect(result.action).toBe('created');
      expect(result.path).toContain('.claude/skills/test-skill/SKILL.md');

      const content = await fs.readFile(result.path, 'utf-8');
      expect(content).toContain('name: test-skill');
      expect(content).toContain('description: Test skill description');
      expect(content).toContain('allowed-tools: Read, Write');
    });

    it('should generate a command file', async () => {
      const result = await generator.generateFile('command', 'test-command', {
        COMMAND_DESCRIPTION: 'Test command description',
        COMMAND_BODY: 'Test command body content',
      });

      expect(result.action).toBe('created');
      expect(result.path).toContain('.claude/commands/test-command.md');

      const content = await fs.readFile(result.path, 'utf-8');
      expect(content).toContain('description: Test command description');
      expect(content).toContain('Test command body content');
    });

    it('should generate an agent file', async () => {
      const result = await generator.generateFile('agent', 'test-agent', {
        AGENT_NAME: 'test-agent',
        AGENT_DESCRIPTION: 'Test agent description',
        AGENT_ROLE: 'Test role',
        AGENT_CAPABILITIES: 'Test capabilities',
        USAGE_GUIDELINES: 'Test guidelines',
        MODEL: 'sonnet',
        TOOLS: 'Read, Grep',
      });

      expect(result.action).toBe('created');
      expect(result.path).toContain('.claude/agents/test-agent.md');

      const content = await fs.readFile(result.path, 'utf-8');
      expect(content).toContain('name: test-agent');
      expect(content).toContain('model: sonnet');
      expect(content).toContain('tools: Read, Grep');
    });

    it('should skip existing file by default', async () => {
      // Create file first
      await generator.generateFile('command', 'existing-command', {
        COMMAND_DESCRIPTION: 'Original description',
        COMMAND_BODY: 'Original body',
      });

      // Try to create again
      const result = await generator.generateFile('command', 'existing-command', {
        COMMAND_DESCRIPTION: 'New description',
        COMMAND_BODY: 'New body',
      });

      expect(result.action).toBe('skipped');
      expect(result.reason).toBe('File already exists');

      // Verify original content is preserved
      const content = await fs.readFile(result.path, 'utf-8');
      expect(content).toContain('Original description');
      expect(content).not.toContain('New description');
    });

    it('should overwrite file when overwrite option is true', async () => {
      // Create file first
      await generator.generateFile('command', 'test-overwrite', {
        COMMAND_DESCRIPTION: 'Original description',
        COMMAND_BODY: 'Original body',
      });

      // Overwrite
      const result = await generator.generateFile(
        'command',
        'test-overwrite',
        {
          COMMAND_DESCRIPTION: 'New description',
          COMMAND_BODY: 'New body',
        },
        { overwrite: true }
      );

      expect(result.action).toBe('created');

      const content = await fs.readFile(result.path, 'utf-8');
      expect(content).toContain('New description');
      expect(content).not.toContain('Original description');
    });

    it('should handle conditional blocks correctly', async () => {
      const result = await generator.generateFile('skill', 'conditional-test', {
        SKILL_NAME: 'conditional-test',
        SKILL_DESCRIPTION: 'Test description',
        SKILL_PURPOSE: 'Test purpose',
        WHEN_TO_USE: 'When testing',
        EXAMPLE_USAGE: 'Example here',
        // ALLOWED_TOOLS is not provided, so {{#if ALLOWED_TOOLS}} block should be removed
      });

      const content = await fs.readFile(result.path, 'utf-8');
      expect(content).not.toContain('allowed-tools:');
      expect(content).toContain('name: conditional-test');
    });

    it('should handle missing variables by replacing with empty string', async () => {
      const result = await generator.generateFile('command', 'missing-vars', {
        COMMAND_DESCRIPTION: 'Test description',
        // COMMAND_BODY is missing
      });

      const content = await fs.readFile(result.path, 'utf-8');
      expect(content).toContain('description: Test description');
      // Body should be empty
      expect(content.trim().endsWith('---')).toBe(true);
    });
  });

  describe('generateBatch', () => {
    it('should generate multiple files in batch', async () => {
      const results = await generator.generateBatch([
        {
          fileType: 'skill',
          fileName: 'batch-skill',
          variables: {
            SKILL_NAME: 'batch-skill',
            SKILL_DESCRIPTION: 'Batch skill',
            SKILL_PURPOSE: 'Test',
            WHEN_TO_USE: 'When testing',
            EXAMPLE_USAGE: 'Example',
          },
        },
        {
          fileType: 'command',
          fileName: 'batch-command',
          variables: {
            COMMAND_DESCRIPTION: 'Batch command',
            COMMAND_BODY: 'Batch body',
          },
        },
      ]);

      expect(results).toHaveLength(2);
      expect(results[0].action).toBe('created');
      expect(results[1].action).toBe('created');

      // Verify files exist
      expect(await fs.pathExists(results[0].path)).toBe(true);
      expect(await fs.pathExists(results[1].path)).toBe(true);
    });

    it('should handle mixed results (created and skipped)', async () => {
      // Create first file
      await generator.generateFile('command', 'existing', {
        COMMAND_DESCRIPTION: 'Existing',
        COMMAND_BODY: 'Body',
      });

      // Batch with one existing and one new
      const results = await generator.generateBatch([
        {
          fileType: 'command',
          fileName: 'existing',
          variables: {
            COMMAND_DESCRIPTION: 'Updated',
            COMMAND_BODY: 'New body',
          },
        },
        {
          fileType: 'command',
          fileName: 'new-file',
          variables: {
            COMMAND_DESCRIPTION: 'New',
            COMMAND_BODY: 'New body',
          },
        },
      ]);

      expect(results).toHaveLength(2);
      expect(results[0].action).toBe('skipped');
      expect(results[1].action).toBe('created');
    });
  });

  describe('error handling', () => {
    it('should throw error for unknown file type', async () => {
      await expect(
        generator.generateFile('unknown' as any, 'test', {})
      ).rejects.toThrow('Unknown file type');
    });

    it('should throw error if template does not exist', async () => {
      const badGenerator = new Generator(testProjectPath, '/nonexistent/path');

      await expect(
        badGenerator.generateFile('skill', 'test', {
          SKILL_NAME: 'test',
        })
      ).rejects.toThrow('Template not found');
    });
  });

  describe('file path generation', () => {
    it('should generate correct path for skill files', async () => {
      const result = await generator.generateFile('skill', 'my-skill', {
        SKILL_NAME: 'my-skill',
        SKILL_DESCRIPTION: 'Description',
        SKILL_PURPOSE: 'Purpose',
        WHEN_TO_USE: 'When',
        EXAMPLE_USAGE: 'Example',
      });

      expect(result.path).toBe(
        path.join(testProjectPath, '.claude/skills/my-skill/SKILL.md')
      );
    });

    it('should generate correct path for command files', async () => {
      const result = await generator.generateFile('command', 'my-command', {
        COMMAND_DESCRIPTION: 'Description',
        COMMAND_BODY: 'Body',
      });

      expect(result.path).toBe(
        path.join(testProjectPath, '.claude/commands/my-command.md')
      );
    });

    it('should generate correct path for agent files', async () => {
      const result = await generator.generateFile('agent', 'my-agent', {
        AGENT_NAME: 'my-agent',
        AGENT_DESCRIPTION: 'Description',
        AGENT_ROLE: 'Role',
        AGENT_CAPABILITIES: 'Capabilities',
        USAGE_GUIDELINES: 'Guidelines',
      });

      expect(result.path).toBe(
        path.join(testProjectPath, '.claude/agents/my-agent.md')
      );
    });
  });
});
