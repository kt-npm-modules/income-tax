import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import type { TaxCase } from './cases.js';
import type { BmfExpected } from './client.js';

export type BmfFixture = {
	source: string;
	year: number;
	records: { input: TaxCase; expected: BmfExpected; retrievedAt: string }[];
};
const cache = new Map<number, { fixture: BmfFixture; html: Record<string, string> }>();
export function loadFixtures(year: number) {
	let result = cache.get(year);
	if (!result) {
		const fixture = JSON.parse(
			readFileSync(new URL(`./fixtures/${year}.json`, import.meta.url), 'utf8')
		) as BmfFixture;
		const html = JSON.parse(
			gunzipSync(
				readFileSync(new URL(`./fixtures/${year}.html.json.gz`, import.meta.url))
			).toString('utf8')
		) as Record<string, string>;
		result = { fixture, html };
		cache.set(year, result);
	}
	return result;
}
