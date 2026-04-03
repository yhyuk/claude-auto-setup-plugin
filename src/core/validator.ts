import * as YAML from 'yaml';
import type { ValidationResult } from '../types';

interface GeneratedFile {
  path: string;
  content: string;
  techStack?: string[];
}

interface TechStackInfo {
  language: string;
  framework?: string;
}

export class Validator {
  validateYaml(content: string): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
    };

    try {
      // Check for empty content
      if (!content || content.trim().length === 0) {
        result.valid = false;
        result.errors.push('Content is empty');
        return result;
      }

      // Check for frontmatter delimiters
      if (!content.includes('---')) {
        result.valid = false;
        result.errors.push('Missing YAML frontmatter delimiters (---)');
        return result;
      }

      // Extract frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) {
        result.valid = false;
        result.errors.push('Invalid YAML frontmatter structure');
        return result;
      }

      const frontmatter = frontmatterMatch[1];

      // Try to parse YAML
      try {
        YAML.parse(frontmatter);
      } catch (yamlError) {
        result.valid = false;
        if (yamlError instanceof Error) {
          result.errors.push(`YAML syntax error: ${yamlError.message}`);
        } else {
          result.errors.push('YAML syntax error');
        }
      }

      return result;
    } catch (error) {
      result.valid = false;
      if (error instanceof Error) {
        result.errors.push(`Validation error: ${error.message}`);
      } else {
        result.errors.push('Unknown validation error');
      }
      return result;
    }
  }

  validateBlogStandard(
    content: string,
    fileType?: 'skill' | 'command' | 'agent' | 'rule'
  ): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
    };

    try {
      // First, validate YAML structure
      const yamlResult = this.validateYaml(content);
      if (!yamlResult.valid) {
        return yamlResult;
      }

      // Extract and parse frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) {
        result.valid = false;
        result.errors.push('No frontmatter found');
        return result;
      }

      const frontmatter = YAML.parse(frontmatterMatch[1]);

      // Check for required fields based on file type
      if (fileType === 'command') {
        // Commands only require 'description'
        if (!frontmatter.description || frontmatter.description.trim() === '') {
          result.valid = false;
          result.errors.push('Missing required field: description');
        }
      } else {
        // Skills, agents, and rules require both 'name' and 'description'
        if (!frontmatter.name || frontmatter.name.trim() === '') {
          result.valid = false;
          result.errors.push('Missing required field: name');
        }

        if (!frontmatter.description || frontmatter.description.trim() === '') {
          result.valid = false;
          result.errors.push('Missing required field: description');
        }
      }

      return result;
    } catch (error) {
      result.valid = false;
      if (error instanceof Error) {
        result.errors.push(`Blog standard validation error: ${error.message}`);
      } else {
        result.errors.push('Blog standard validation error');
      }
      return result;
    }
  }

  validateLoadability(file: GeneratedFile): boolean {
    try {
      // Check if path is valid for Claude Code
      const validPaths = [
        '.claude/skills/',
        '.claude/commands/',
        '.claude/agents/',
        '.claude/rules/',
      ];

      const isValidPath = validPaths.some((validPath) => file.path.startsWith(validPath));
      if (!isValidPath) {
        return false;
      }

      // Infer file type from path
      let fileType: 'skill' | 'command' | 'agent' | 'rule' | undefined;
      if (file.path.startsWith('.claude/skills/')) {
        fileType = 'skill';
      } else if (file.path.startsWith('.claude/commands/')) {
        fileType = 'command';
      } else if (file.path.startsWith('.claude/agents/')) {
        fileType = 'agent';
      } else if (file.path.startsWith('.claude/rules/')) {
        fileType = 'rule';
      }

      // Check if content has valid structure
      const yamlResult = this.validateYaml(file.content);
      if (!yamlResult.valid) {
        return false;
      }

      // Check if blog standard is met
      const blogResult = this.validateBlogStandard(file.content, fileType);
      if (!blogResult.valid) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating loadability:', error);
      return false;
    }
  }

  validateStackCompatibility(
    files: Array<{ path: string; techStack?: string[] }>,
    projectStack: TechStackInfo
  ): boolean {
    try {
      // If no files, return true
      if (files.length === 0) {
        return true;
      }

      // Check each file
      for (const file of files) {
        // If file has no tech stack metadata, it's language-agnostic (valid)
        if (!file.techStack || file.techStack.length === 0) {
          continue;
        }

        // Check if file's tech stack matches project
        const matchesLanguage = file.techStack.includes(projectStack.language);
        const matchesFramework =
          !projectStack.framework || file.techStack.includes(projectStack.framework);

        // At least language should match OR file should be generic
        // If framework is specified, it should also match
        if (!matchesLanguage && file.techStack.length > 0) {
          return false;
        }
        if (projectStack.framework && !matchesFramework) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error validating stack compatibility:', error);
      return false;
    }
  }
}
