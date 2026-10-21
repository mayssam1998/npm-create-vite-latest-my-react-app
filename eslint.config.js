import js from '@eslint/js'
import globals from 'globals'
import boundaries from 'eslint-plugin-boundaries'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// state-management.md: Zustand is the one client-state library. Listed in every
// `no-restricted-imports` block below, because a later block replaces an earlier one.
// Lifting this ban is the user's decision — ask, never loosen it here.
const OTHER_STATE_LIBRARIES = {
  group: [
    'redux',
    'redux-*',
    '@reduxjs/*',
    'react-redux',
    'jotai',
    'jotai/*',
    'recoil',
    'mobx',
    'mobx-*',
    'valtio',
    'valtio/*',
    'xstate',
    '@xstate/*',
  ],
  message: 'Client state is Zustand only — ask before adding another library. See .claude/rules/state-management.md.',
}

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [OTHER_STATE_LIBRARIES] }],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // A table's columns.tsx exports column definitions (data) and keeps its small cell
    // renderers private beside them — the add-data-table skill's pattern. Editing it
    // triggers a full reload instead of a fast refresh, which is acceptable.
    files: ['**/columns.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },

  // Module boundaries — the import rules in CLAUDE.md and .claude/rules/architecture.md.
  // Imports are resolved through tsconfig, so `@/…` aliases and relative paths are
  // checked alike. Anything not explicitly allowed below is an error.
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.app.json' },
      },
      'boundaries/legacy-templates': false,
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app', partialMatch: false },
        { type: 'shared', pattern: 'src/shared', partialMatch: false },
        { type: 'feature', pattern: 'src/features/*', partialMatch: false, capture: ['feature'] },
        { type: 'mocks', pattern: 'src/mocks', partialMatch: false },
      ],
      'boundaries/files': [
        { category: 'entry', pattern: 'src/main.tsx' },
        { category: 'global-styles', pattern: 'src/*.css' },
        { category: 'ambient-types', pattern: 'src/vite-env.d.ts' },
        { category: 'api-function', pattern: 'src/features/*/api/*.api.ts' },
        { category: 'feature-ui', pattern: 'src/features/*/{components,pages,hooks}/**' },
      ],
    },
    rules: {
      'boundaries/no-unknown-files': 'error',
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          // Also check imports inside one element (needed for the api-layer policy) and
          // imports of local files outside every element.
          checkInternals: true,
          checkUnknownLocals: true,
          policies: [
            // main.tsx boots the app.
            {
              from: { file: { categories: 'entry' } },
              allow: [
                { to: { element: { type: 'app' } } },
                { to: { file: { categories: 'global-styles' } } },
              ],
            },
            // Rule 4: app/ may import anything (lazy routes deep-import feature pages).
            // Nothing else may import app/.
            {
              from: { element: { type: 'app' } },
              allow: {
                to: { element: { types: { anyOf: ['app', 'shared', 'feature', 'mocks'] } } },
              },
            },
            // Rule 1: shared/ never imports from features/.
            {
              from: { element: { type: 'shared' } },
              allow: { to: { element: { type: 'shared' } } },
            },
            // A feature may use shared/ and anything inside itself…
            {
              from: { element: { type: 'feature' } },
              allow: [
                { to: { element: { type: 'shared' } } },
                {
                  to: {
                    element: {
                      type: 'feature',
                      captured: { feature: '{{ from.element.captured.feature }}' },
                    },
                  },
                },
                // …and another feature only through its index.ts (rule 2).
                {
                  to: {
                    element: {
                      type: 'feature',
                      captured: { feature: '!{{ from.element.captured.feature }}' },
                      fileInternalPath: 'index.ts',
                    },
                  },
                },
              ],
            },
            // The in-browser mock server sits beside the API; it only needs shared/.
            {
              from: { element: { type: 'mocks' } },
              allow: { to: { element: { types: { anyOf: ['mocks', 'shared'] } } } },
            },
            // api-layer.md: components, pages and hooks import the query hooks (layer 3),
            // never the plain *.api.ts functions (layer 2).
            {
              from: { file: { categories: 'feature-ui' } },
              disallow: { to: { file: { categories: 'api-function' } } },
            },
          ],
        },
      ],
    },
  },

  // overlays.md: Radix is wrapped once in shared/ui; features never import it directly.
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            OTHER_STATE_LIBRARIES,
            {
              group: ['radix-ui', '@radix-ui/*'],
              message: 'Use the wrappers in @/shared/ui — features never import Radix directly.',
            },
          ],
        },
      ],
    },
  },
  // api-layer.md: *.api.ts files are plain async functions — no React.
  {
    files: ['src/features/*/api/*.api.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            OTHER_STATE_LIBRARIES,
            {
              group: ['react', 'react-dom', 'react/*', '@tanstack/react-query'],
              message: 'No React in *.api.ts — query hooks belong in *.queries.ts.',
            },
          ],
        },
      ],
    },
  },
  // api-layer.md: nothing but shared/lib/apiClient.ts calls fetch.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/shared/lib/apiClient.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'Call the API through @/shared/lib/apiClient.' },
      ],
    },
  },
])
