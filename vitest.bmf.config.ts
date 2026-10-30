import { defineConfig } from 'vitest/config';
import config from './vitest.config.js';

export default defineConfig({
	...config,
	test: {
		...config.test,
		include: ['tests/de/*-live.spec.ts'],
		exclude: [],
		fileParallelism: false,
		testTimeout: 100000
	}
});
