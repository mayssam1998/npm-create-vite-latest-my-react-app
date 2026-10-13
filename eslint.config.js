import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
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
])
