import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
      parser: tsparser,
      globals: {
        ...globals.node,
        ...globals.es2021,
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      'indent': ['error', 2, {
        SwitchCase: 1,
      }],
      'max-len': ['error', {
        code: 120,
        ignoreTemplateLiterals: true,
      }],
      'linebreak-style': ['warn', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'eqeqeq': 'error',
      'no-else-return': 'error',
      'no-useless-return': 'error',
      'no-useless-catch': 'error',
      'eol-last': ['error', 'always'],
      'curly': 'error',
      'no-return-await': 'error',
      'camelcase': 'warn',
      'dot-notation': 'error',
      'no-multi-spaces': 'warn',
      'require-await': 'warn',
      'keyword-spacing': ['error', {
        before: true,
        after: true,
      }],
      'func-call-spacing': ['error', 'never'],
      'object-curly-spacing': ['error', 'always', {
        arraysInObjects: true,
        objectsInObjects: true,
      }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/member-ordering': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-unsafe-function-type': 'off',
    }
  },
  {
    ignores: [
      'debug/**',
      'node_modules/**',
      '.git/**',
      '.vscode/**',
      'lib/**',
    ]
  }
];
