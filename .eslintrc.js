module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    '@nuxtjs',
    'prettier',
    'prettier/vue',
    'plugin:prettier/recommended',
    'plugin:nuxt/recommended',
    '@nuxtjs/eslint-config-typescript',
  ],
  plugins: ['prettier', '@typescript-eslint'],
  // add your custom rules here
  rules: {
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'warn',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-undef': 'off',
    // Original
    'arrow-parens': ['warn', 'as-needed'],
    'space-before-function-paren': 'off',
    'comma-dangle': 'off',
    'no-empty-function': 'off',
    // Semicolon
    semi: ['error', 'always'],
    'semi-spacing': ['warn', { after: true, before: false }],
    'semi-style': ['warn', 'last'],
    'no-extra-semi': 'warn',
    'no-unexpected-multiline': 'warn',
    'no-unreachable': 'warn',
    // Space
    'object-curly-spacing': ['warn', 'always'],
    // '@typescript-eslint/no-empty-function': 'off',
  },
};
