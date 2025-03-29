import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import stylisticTs from '@stylistic/eslint-plugin-ts'

export default tseslint.config(
  { ignores: ['dist', '__mocks__'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        console: 'readonly',
        process: 'readonly',
        module: 'readonly',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@stylistic/ts': stylisticTs,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'semi': ['error', 'never'],
      '@stylistic/ts/semi': ['error', 'never'],
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        console: 'readonly',
        process: 'readonly',
        module: 'readonly',
      },
    },
  }
)
