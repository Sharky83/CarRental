import js from '@eslint/js'
import globals from 'globals'

export default [
  { ignores: ['node_modules'] },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2025,
      globals: globals.node,
      parserOptions: {
        ecmaVersion: 2025,
        sourceType: 'module',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off', // Allow console.log in server
    },
  },
]
