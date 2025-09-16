// Flat config para ESLint 9+
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // Ignorados (sustituye a .eslintignore)
  {
    ignores: [
      "node_modules/",
      "dist/",
      "build/",
      "coverage/",
      ".husky/",
      "*.min.js",
    ],
  },

  // Base JS recomendada
  js.configs.recommended,

  // Config para archivos TS/TSX (app de navegador)
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        // ...globals.serviceworker, // si lo necesitas
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooks,
      import: importPlugin,
      "simple-import-sort": simpleImportSort,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      // TypeScript ya gestiona 'no-undef' y 'no-unused-vars'
      "no-undef": "off",
      "no-unused-vars": "off",

      // React 17+
      "react/react-in-jsx-scope": "off",

      // Orden de imports (autofix)
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",

      // TS
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",

      // Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Console permitido en app
      "no-console": "off",
    },
  },

  // Config para archivos de Node (configs, scripts, husky)
  {
    files: [
      "**/*.cjs",
      "**/*.mjs",
      "eslint.config.js",
      "vite.config.ts",
      "scripts/**/*.{js,ts}",
    ],
    languageOptions: {
      globals: { ...globals.node },
    },
  },

  // Desactiva reglas que chocan con Prettier
  eslintConfigPrettier,
];
