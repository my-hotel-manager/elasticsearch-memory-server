module.exports = {
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest'],
  extends: [
    'airbnb/base',
    'prettier',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
  ],
  settings: {
    'import/resolver': {
      'babel-module': {},
    },
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    quotes: [2, 'single', { avoidEscape: true }],
    camelcase: 0,
    '@typescript-eslint/camelcase': 0,
    'no-param-reassign': 0,
    'no-console': 0,
    'no-underscore-dangle': 0,
    'import/prefer-default-export': 0,
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
  },
};
