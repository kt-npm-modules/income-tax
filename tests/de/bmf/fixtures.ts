import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { gunzipSync } from 'node:zlib';
import { taxCases, type TaxCase } from './cases.js';
import { BMF_URL, parseBmfResult } from './client.js';
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

/** Check the complete official input matrix and the provenance of every raw response. */
export function verifyFixtureProvenance(
	year: number,
	{ fixture, html }: ReturnType<typeof loadFixtures>
) {
	assert.equal(fixture.source, BMF_URL);
	assert.equal(fixture.year, year);
	assert.deepEqual(
		fixture.records.map((row) => row.input),
		taxCases.filter((input) => input.year === year)
	);
	assert.deepEqual(Object.keys(html).sort(), fixture.records.map((row) => row.input.id).sort());
	for (const row of fixture.records) {
		assert.ok(
			Number.isFinite(Date.parse(row.retrievedAt)),
			`Invalid BMF retrieval time: ${row.input.id}`
		);
		assert.deepEqual(parseBmfResult(html[row.input.id], row.input), row.expected);
	}
}
