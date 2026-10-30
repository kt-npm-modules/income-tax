import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['tests/**/*.spec.ts'],
		coverage: {
			provider: 'v8',
			reportsDirectory: './coverage-test',
			include: ['src/**/*.{js,ts}'],
			reporter: ['text', 'html', 'clover', 'json', 'lcov']
		}
	}
});
