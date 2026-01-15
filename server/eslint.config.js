const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-shadow': 'error',
      'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
      'require-await': 'error',
    },
    ignores: ['dist/', 'node_modules/', 'coverage/'],
  },
];
