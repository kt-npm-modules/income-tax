import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	ts.configs.recommended,
	prettier,
	{
		files: ['**/*.ts'],
		rules: {
			'@typescript-eslint/consistent-type-imports': 'error'
		}
	},
	{
		files: ['*.js', '*.ts'],
		languageOptions: {
			globals: {
				...globals.node
			}
		}
	}
);
