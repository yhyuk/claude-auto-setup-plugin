import * as fs from 'fs-extra';
import * as path from 'path';
import type { FileType, TemplateVariables, FileGenerationOptions, GenerateResult } from '../types';

export class Generator {
  constructor(
    private projectPath: string,
    private templatesPath: string
  ) {}

  /**
   * Generate a file from template
   */
  async generateFile(
    fileType: FileType,
    fileName: string,
    variables: TemplateVariables,
    options: FileGenerationOptions = {}
  ): Promise<GenerateResult> {
    const { skipExisting = true, overwrite = false } = options;

    // Determine target path
    const targetPath = this.getTargetPath(fileType, fileName);

    // Check if file already exists
    if (await fs.pathExists(targetPath)) {
      if (skipExisting && !overwrite) {
        return {
          action: 'skipped',
          path: targetPath,
          reason: 'File already exists',
        };
      }
    }

    // Load template
    const template = await this.loadTemplate(fileType);

    // Process template
    const content = this.processTemplate(template, variables);

    // Ensure directory exists
    await fs.ensureDir(path.dirname(targetPath));

    // Write file
    await fs.writeFile(targetPath, content, 'utf-8');

    return {
      action: 'created',
      path: targetPath,
    };
  }

  /**
   * Generate multiple files in batch
   */
  async generateBatch(
    files: Array<{
      fileType: FileType;
      fileName: string;
      variables: TemplateVariables;
    }>,
    options: FileGenerationOptions = {}
  ): Promise<GenerateResult[]> {
    const results: GenerateResult[] = [];

    for (const file of files) {
      const result = await this.generateFile(file.fileType, file.fileName, file.variables, options);
      results.push(result);
    }

    return results;
  }

  /**
   * Load template file
   */
  private async loadTemplate(fileType: FileType): Promise<string> {
    const templatePath = path.join(this.templatesPath, `${fileType}-template.md`);

    if (!(await fs.pathExists(templatePath))) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    return await fs.readFile(templatePath, 'utf-8');
  }

  /**
   * Process template with variables
   */
  private processTemplate(template: string, variables: TemplateVariables): string {
    let result = template;

    // Process conditional blocks ({{#if VAR}}...{{/if}})
    result = this.processConditionals(result, variables);

    // Replace variables ({{VAR}})
    result = this.replaceVariables(result, variables);

    return result;
  }

  /**
   * Process conditional blocks
   */
  private processConditionals(template: string, variables: TemplateVariables): string {
    const conditionalRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;

    return template.replace(conditionalRegex, (_match, varName, content) => {
      const value = variables[varName];

      // If variable is truthy, include the content
      if (value) {
        return content;
      }

      // Otherwise, remove the block
      return '';
    });
  }

  /**
   * Replace template variables
   */
  private replaceVariables(template: string, variables: TemplateVariables): string {
    const variableRegex = /\{\{(\w+)\}\}/g;

    return template.replace(variableRegex, (_match, varName) => {
      const value = variables[varName];

      if (value === undefined || value === null) {
        return '';
      }

      return String(value);
    });
  }

  /**
   * Get target file path based on file type
   */
  private getTargetPath(fileType: FileType, fileName: string): string {
    const claudeDir = path.join(this.projectPath, '.claude');

    switch (fileType) {
      case 'skill':
        // Skills are stored in .claude/skills/[skill-name]/SKILL.md
        return path.join(claudeDir, 'skills', fileName, 'SKILL.md');

      case 'command':
        // Commands are stored in .claude/commands/[command-name].md
        return path.join(claudeDir, 'commands', `${fileName}.md`);

      case 'agent':
        // Agents are stored in .claude/agents/[agent-name].md
        return path.join(claudeDir, 'agents', `${fileName}.md`);

      case 'rule':
        // Rules are stored in .claude/rules/[rule-name].md
        return path.join(claudeDir, 'rules', `${fileName}.md`);

      default:
        throw new Error(`Unknown file type: ${fileType}`);
    }
  }
}
