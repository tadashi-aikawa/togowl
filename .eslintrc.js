module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended',
    'plugin:prettier/recommended',
    '@nuxtjs/eslint-config-typescript',
    'prettier',
    'prettier/vue',
  ],
  plugins: ['prettier', '@typescript-eslint'],
  // add your custom rules here
  rules: {
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'warn',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-undef': 'off',
    // '@typescript-eslint/no-empty-function': 'off',
    // Original
    'no-empty-function': 'off',
    'no-unreachable': 'warn',

    // Prettier should not be error
    'prettier/prettier': 'warn',
    // eslint-config-prettier disables below
    // 'arrow-parens': ['warn', 'as-needed'],
    // 'space-before-function-paren': 'off',
    // 'comma-dangle': 'off',
    // semi: ['warn', 'always'],
    // 'semi-spacing': ['warn', { after: true, before: false }],
    // 'semi-style': ['warn', 'last'],
    // 'no-extra-semi': 'warn',
    // 'no-unexpected-multiline': 'warn',
    // 'object-curly-spacing': ['warn', 'always'],
  },
};
