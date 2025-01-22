import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      exclude: [
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
