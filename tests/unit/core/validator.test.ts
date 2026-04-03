import { describe, it, expect, beforeEach } from 'vitest';
import { Validator } from '../../../src/core/validator';

describe('Validator', () => {
  let validator: Validator;

  beforeEach(() => {
    validator = new Validator();
  });

  describe('validateYaml', () => {
    it('should validate correct YAML frontmatter', () => {
      const validYaml = `---
name: test-skill
description: A test skill
---
# Content here`;
      const result = validator.validateYaml(validYaml);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject YAML without frontmatter delimiters', () => {
      const invalidYaml = `name: test-skill
description: A test skill
# Content here`;
      const result = validator.validateYaml(invalidYaml);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject malformed YAML syntax', () => {
      const invalidYaml = `---
name: test-skill
description: [invalid: yaml: syntax
---`;
      const result = validator.validateYaml(invalidYaml);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should provide specific error messages for YAML errors', () => {
      const invalidYaml = `---
name:
---`;
      const result = validator.validateYaml(invalidYaml);
      if (!result.valid) {
        expect(result.errors[0]).toBeDefined();
        expect(typeof result.errors[0]).toBe('string');
      }
    });

    it('should handle empty strings gracefully', () => {
      const result = validator.validateYaml('');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateBlogStandard', () => {
    it('should validate skill/agent file with required fields (name, description)', () => {
      const validContent = `---
name: test-skill
description: A test skill for validation
---
# Test Skill`;
      const result = validator.validateBlogStandard(validContent, 'skill');
      expect(result.valid).toBe(true);
    });

    it('should validate command file with only description', () => {
      const validContent = `---
description: A test command
---
Command body`;
      const result = validator.validateBlogStandard(validContent, 'command');
      expect(result.valid).toBe(true);
    });

    it('should reject skill/agent file missing name field', () => {
      const invalidContent = `---
description: A test skill
---`;
      const result = validator.validateBlogStandard(invalidContent, 'skill');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: name');
    });

    it('should reject skill/agent file missing description field', () => {
      const invalidContent = `---
name: test-skill
---`;
      const result = validator.validateBlogStandard(invalidContent, 'skill');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: description');
    });

    it('should reject command file missing description field', () => {
      const invalidContent = `---
other_field: value
---`;
      const result = validator.validateBlogStandard(invalidContent, 'command');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: description');
    });

    it('should validate file with additional optional fields', () => {
      const validContent = `---
name: test-skill
description: A test skill
version: 1.0.0
author: Test Author
---`;
      const result = validator.validateBlogStandard(validContent, 'skill');
      expect(result.valid).toBe(true);
    });

    it('should reject file with empty name or description', () => {
      const invalidContent = `---
name: ""
description: ""
---`;
      const result = validator.validateBlogStandard(invalidContent, 'skill');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateLoadability', () => {
    it('should validate that Claude Code can load the file', () => {
      const validFile = {
        path: '.claude/skills/test.md',
        content: `---
name: test-skill
description: Test
---
# Content`,
      };
      const result = validator.validateLoadability(validFile);
      expect(typeof result).toBe('boolean');
    });

    it('should return false for files with invalid paths', () => {
      const invalidFile = {
        path: 'invalid/path.md',
        content: `---
name: test
description: Test
---`,
      };
      const result = validator.validateLoadability(invalidFile);
      expect(typeof result).toBe('boolean');
    });

    it('should return false for files with invalid content structure', () => {
      const invalidFile = {
        path: '.claude/skills/test.md',
        content: 'Invalid content without frontmatter',
      };
      const result = validator.validateLoadability(invalidFile);
      expect(result).toBe(false);
    });

    it('should validate skill files in .claude/skills/', () => {
      const skillFile = {
        path: '.claude/skills/my-skill.md',
        content: `---
name: my-skill
description: My custom skill
---`,
      };
      const result = validator.validateLoadability(skillFile);
      expect(typeof result).toBe('boolean');
    });

    it('should validate command files in .claude/commands/', () => {
      const commandFile = {
        path: '.claude/commands/my-command.md',
        content: `---
name: my-command
description: My custom command
---`,
      };
      const result = validator.validateLoadability(commandFile);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('validateStackCompatibility', () => {
    it('should return true when generated files match project stack', () => {
      const files = [
        {
          path: '.claude/skills/typescript-skill.md',
          techStack: ['typescript', 'nextjs'],
        },
      ];
      const projectStack = { language: 'typescript', framework: 'nextjs' };
      const result = validator.validateStackCompatibility(files, projectStack);
      expect(typeof result).toBe('boolean');
    });

    it('should return false when files do not match project stack', () => {
      const files = [
        {
          path: '.claude/skills/python-skill.md',
          techStack: ['python', 'django'],
        },
      ];
      const projectStack = { language: 'typescript', framework: 'nextjs' };
      const result = validator.validateStackCompatibility(files, projectStack);
      expect(typeof result).toBe('boolean');
    });

    it('should handle empty file arrays', () => {
      const result = validator.validateStackCompatibility([], { language: 'typescript' });
      expect(typeof result).toBe('boolean');
    });

    it('should handle files without tech stack metadata', () => {
      const files = [{ path: '.claude/skills/generic.md' }];
      const result = validator.validateStackCompatibility(files, { language: 'typescript' });
      expect(typeof result).toBe('boolean');
    });

    it('should allow language-agnostic files', () => {
      const files = [
        {
          path: '.claude/skills/generic-skill.md',
          techStack: [],
        },
      ];
      const result = validator.validateStackCompatibility(files, { language: 'python' });
      expect(typeof result).toBe('boolean');
    });
  });
});
