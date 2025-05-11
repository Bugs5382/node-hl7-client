import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      exclude: [
        '*.mts',
        '*.mjs',
        '**/__tests__/**/**',
        '**/docker/**',
        '**/bin/**',
        '**/certs/**',
        '**/docs/**',
        '**/lib/**'
      ]
    }
  }
})
