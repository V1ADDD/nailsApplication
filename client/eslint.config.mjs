import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import nx from '@nx/eslint-plugin';
import tseslint from 'typescript-eslint';

const scopes = ['shared', 'web', 'mobile'];
const coreNames = ['core', 'common'];

const moduleNames = [
  ...new Set(
    scopes.flatMap((scope) => {
      try {
        return readdirSync(join(import.meta.dirname, 'libs', scope), { withFileTypes: true })
          .filter((entry) => entry.isDirectory() && !coreNames.includes(entry.name))
          .map((entry) => entry.name);
      } catch {
        return [];
      }
    })
  )
];

const typeScriptFiles = ['**/*.ts'];

const moduleConstraints = moduleNames.map((name) => ({
  sourceTag: `name:${name}`,
  onlyDependOnLibsWithTags: [`name:${name}`, 'name:core', 'name:common', 'type:contracts']
}));

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  ...[...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked].map((config) => ({
    ...config,
    files: typeScriptFiles
  })),
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  {
    files: typeScriptFiles,
    languageOptions: {
      parserOptions: {
        projectService: {
          defaultProject: 'tsconfig.base.json'
        },
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
      '@typescript-eslint/unbound-method': 'off',
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/prefer-signals': 'error'
    }
  },
  {
    files: ['libs/shared/core/data-access/src/lib/api/schema.ts'],
    rules: {
      '@typescript-eslint/consistent-indexed-object-style': 'off'
    }
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      globals: {
        process: 'readonly'
      }
    }
  },
  {
    ignores: ['**/dist', '**/node_modules', '**/.nx', '**/tmp', '**/.angular']
  },
  {
    files: ['**/*.ts', '**/*.js', '**/*.cjs', '**/*.mjs'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
            { sourceTag: 'scope:web', onlyDependOnLibsWithTags: ['scope:web', 'scope:shared'] },
            { sourceTag: 'scope:mobile', onlyDependOnLibsWithTags: ['scope:mobile', 'scope:shared'] },
            { sourceTag: 'type:util', onlyDependOnLibsWithTags: ['type:util'] },
            { sourceTag: 'type:contracts', onlyDependOnLibsWithTags: ['type:contracts', 'type:util'] },
            { sourceTag: 'type:ui', onlyDependOnLibsWithTags: ['type:ui', 'type:util'] },
            {
              sourceTag: 'type:data-access',
              onlyDependOnLibsWithTags: ['type:data-access', 'type:contracts', 'type:util']
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: ['type:feature', 'type:ui', 'type:data-access', 'type:contracts', 'type:util']
            },
            { sourceTag: 'type:app', onlyDependOnLibsWithTags: ['*'] },
            { sourceTag: 'name:common', onlyDependOnLibsWithTags: ['name:common'] },
            { sourceTag: 'name:core', onlyDependOnLibsWithTags: ['name:core', 'name:common'] },
            ...moduleConstraints
          ]
        }
      ],
      'no-console': 'error'
    }
  },
  {
    files: ['libs/shared/**/*.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        'window',
        'document',
        'navigator',
        'location',
        'localStorage',
        'sessionStorage'
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@angular/material', '@angular/material/*', '@angular/cdk', '@angular/cdk/*'],
              message: 'libs/shared is used by every platform; components live in libs/web and libs/mobile.'
            },
            {
              group: ['@angular/router', '@angular/forms', '@angular/platform-browser'],
              message:
                'libs/shared holds data and logic only; screens, forms and routing live in libs/web and libs/mobile.'
            }
          ]
        }
      ]
    }
  }
];
