import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      exclude: [
        '*.mjs',
        '*.mts',
        '__tests__/__utils__/**',
        'docker',
        'bin',
        'certs',
        'docs',
        'lib'
      ]
    }
  }
})
