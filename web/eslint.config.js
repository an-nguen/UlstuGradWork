import angularEslint from '@angular-eslint/eslint-plugin';
import angularEslintTemplate from '@angular-eslint/eslint-plugin-template';
import angularEslintTemplateParser from '@angular-eslint/template-parser';
import eslint from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';
import tsEslint from 'typescript-eslint';

const ANGULAR_PROJECT = './';

export default tsEslint.config(
  eslint.configs.recommended,
  ...tsEslint.configs.recommended,
  {
    files: [`${ANGULAR_PROJECT}/**/*.ts`],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      '@angular-eslint': angularEslint,
    },
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: ['element', 'attribute'],
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      'no-useless-space': ['off'],
    },
  },
  {
    files: [`${ANGULAR_PROJECT}/**/*.html`],
    languageOptions: {
      parser: angularEslintTemplateParser,
    },
    plugins: {
      '@angular-eslint/template': angularEslintTemplate,
      prettier,
    },
    rules: {
      ...angularEslintTemplate.configs['recommended'].rules,
      ...prettier.configs['recommended'].rules,
    },
  },
  {
    // plugins: {
    //   prettier,
    // },
    languageOptions: {
      parserOptions: {
        project: ['./packages/*/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    ignores: [
      'node_modules/',
      '**/node_modules/',
      '/**/node_modules/*',
      'out/',
      'dist/',
      'build/',
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': ['off'],
    },
  },
);
