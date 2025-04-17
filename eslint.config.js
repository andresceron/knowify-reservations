// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const prettier = require("eslint-config-prettier");
const prettierPlugin = require("eslint-plugin-prettier");
const esLintPluginTemplate = require("@angular-eslint/eslint-plugin-template");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
      },
    },
    rules: {
      ...prettier.rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@angular-eslint/directive-selector": [
        "error",
        { type: "attribute", prefix: "app", style: "camelCase" },
      ],
      "@angular-eslint/component-selector": [
        "error",
        { type: "element", prefix: "app", style: "kebab-case" },
      ],
      "array-element-newline": [
        "error",
        "consistent"
      ],
      "array-bracket-newline": [
        "error",
        {
          "multiline": true
        }
      ],
      "array-bracket-spacing": [
        "error",
        "never"
      ],
    },
    processor: angular.processInlineTemplates,
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
      prettier,
    ],
    rules: {}
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
      prettier,
    ],
    plugins: {
      '@angular-eslint/template': esLintPluginTemplate,
      prettier: prettierPlugin
    },
    rules: {
      'prettier/prettier': ['error', { parser: 'angular' }]
    }
  }
);
