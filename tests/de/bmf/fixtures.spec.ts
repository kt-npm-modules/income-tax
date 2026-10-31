import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadFixtures } from './fixtures.js';

vi.mock('node:fs', () => ({ readFileSync: vi.fn() }));
afterEach(() => vi.resetAllMocks());

describe('Approved official fixture files must be readable and valid', () => {
	it('fails a missing approved-year JSON file', () => {
		vi.mocked(readFileSync).mockImplementation(() => {
			throw new Error('ENOENT: missing 2021.json');
		});
		expect(() => loadFixtures(2021)).toThrow('ENOENT');
	});
	it('fails corrupt approved-year JSON rather than treating it as unavailable', () => {
		vi.mocked(readFileSync).mockReturnValueOnce('{broken JSON');
		expect(() => loadFixtures(2021)).toThrow(SyntaxError);
	});
	it('fails a missing compressed raw-response file', () => {
		vi.mocked(readFileSync)
			.mockReturnValueOnce('{}')
			.mockImplementationOnce(() => {
				throw new Error('ENOENT: missing 2021.html.json.gz');
			});
		expect(() => loadFixtures(2021)).toThrow('ENOENT');
	});
	it('fails corrupt compressed raw responses', () => {
		vi.mocked(readFileSync).mockReturnValueOnce('{}').mockReturnValueOnce(Buffer.from('not gzip'));
		expect(() => loadFixtures(2021)).toThrow();
	});
});
