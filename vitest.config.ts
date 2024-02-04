import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        '__tests__/__utils__/**',
        '__tests__/__data__/**',
        'docs',
        'src/api.ts',
        'release.config.cjs'
      ]
    }
  }
})
