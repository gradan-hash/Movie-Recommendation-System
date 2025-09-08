import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      globals: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov'],
        exclude: [
          'node_modules/',
          'dist/',
          '**/*.d.ts',
          'src/main.ts',
          '**/*.{test,spec}.{js,ts,jsx,tsx}',
        ],
      },
      include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
      setupFiles: ['./src/test/setup.ts'],
      deps: {
        optimizer: {
          web: {
            include: ['@vue', 'pinia'],
          },
        },
      },
      outputFile: {
        json: 'coverage/test-output.json',
        'vitest-sonar-reporter': 'coverage/test-report.xml',
      },
      reporters: ['json', 'verbose', 'vitest-sonar-reporter'],
      watch: false,
      testTimeout: 10000,
      maxConcurrency: 5,
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  })
)
