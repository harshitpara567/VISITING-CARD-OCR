import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ...js.configs.recommended,
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',  // Treat files using import/export as ES modules
      globals: {
        ...globals.node,
        console: 'readonly',
        strapi: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'warn',  // You can turn this off for specific files later if needed
      'no-undef': 'off', 
    }
  }
]);
