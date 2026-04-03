export type ProjectType = 'web-app' | 'api' | 'cli' | 'library' | 'mobile' | 'other';

export type ProgrammingLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'java'
  | 'go'
  | 'rust'
  | 'other';

export type Framework =
  | 'nextjs'
  | 'react'
  | 'vue'
  | 'angular'
  | 'express'
  | 'nestjs'
  | 'springboot'
  | 'django'
  | 'flask'
  | 'fastapi'
  | 'none'
  | 'other';

export type TeamSize = 'solo' | 'small' | 'large';

export interface ProjectProfile {
  projectType: ProjectType;
  language: ProgrammingLanguage;
  framework: Framework;
  mainTasks: string[];
  teamSize: TeamSize;
  codingStyle?: string;
}

export interface ProjectStructure {
  hasPackageJson: boolean;
  hasPomXml: boolean;
  hasRequirementsTxt: boolean;
  hasGoMod: boolean;
  hasCargoToml: boolean;
}

export interface TechStack {
  language: ProgrammingLanguage;
  framework?: Framework;
  packageManager?: string;
  testFramework?: string;
}

export interface ExistingFile {
  path: string;
  type: 'skill' | 'command' | 'agent' | 'rule' | 'settings' | 'other';
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface GenerateResult {
  action: 'created' | 'skipped';
  path: string;
  reason?: string;
}

export interface Metadata {
  name: string;
  description: string;
  [key: string]: unknown;
}

export interface TemplateVariables {
  [key: string]: string | boolean | undefined;
}

export interface FileGenerationOptions {
  overwrite?: boolean;
  skipExisting?: boolean;
}

export type FileType = 'skill' | 'command' | 'agent' | 'rule';
