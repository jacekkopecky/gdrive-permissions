import pluginJs from '@eslint/js';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import babelParser from '@babel/eslint-parser';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
      ecmaVersion: 2024,
      sourceType: 'module',
      parser: babelParser, // Set Babel as the parser
      parserOptions: {
        requireConfigFile: false, // Prevents needing a separate Babel config file
        babelOptions: {
          plugins: ['@babel/plugin-syntax-import-assertions'], // Ensure the plugin is enabled
        },
      },
    },
    rules: {
      // Your custom rules
    },
  },
  pluginJs.configs.recommended,
  eslintPluginPrettier, // Ensures Prettier runs as well
];
