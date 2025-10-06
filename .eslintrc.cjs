const prettierConfig = require('./.prettierrc.json')

module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',

    ecmaVersion: 2020,
    sourceType: 'module'
  },
  plugins: ['import'],
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/one-component-per-file': 'off',
    'vue/v-on-event-hyphenation': 'off',
    'prettier/prettier': ['error', prettierConfig],
    'import/newline-after-import': ['error', { count: 1 }],
    'brace-style': ['error', '1tbs', { allowSingleLine: false }],
    "vue/attribute-hyphenation": ["error", "never", {
      "ignore": []
    }],
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index']
      }
    ],
    curly: ['error', 'all'],
    'vue/multiline-html-element-content-newline': [
      'error',
      {
        allowEmptyLines: false
      }
    ],

  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        'vue/multi-word-component-names': 'off'
      }
    }
  ]
}
