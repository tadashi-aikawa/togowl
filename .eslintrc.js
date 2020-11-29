module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    "@nuxtjs",
    "plugin:nuxt/recommended",
    "@nuxtjs/eslint-config-typescript",
    "prettier",
    "prettier/vue",
  ],
  plugins: ["@typescript-eslint"],
  // add your custom rules here
  rules: {
    "no-useless-constructor": "off",
    "@typescript-eslint/no-useless-constructor": "warn",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "no-unused-expressions": "off",
    "@typescript-eslint/no-unused-expressions": "warn",
    "no-undef": "off",
    "no-empty-function": "off",
    "no-unreachable": "warn",
    "no-console": "off",

    // Allow v-html
    "vue/no-v-html": "off",

  },
};
