import { readFileSync } from 'node:fs';
import type * as NodeFS from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type * as Vitest from 'vitest';
import type * as Cases from './cases.js';
import { loadFixtures, verifyFixtureProvenance, type BmfFixture } from './fixtures.js';
import { taxCases, yearBoundaries } from './cases.js';

vi.mock('node:fs', () => ({ readFileSync: vi.fn() }));
afterEach(() => {
	vi.doUnmock('vitest');
	vi.doUnmock('./cases.js');
	vi.resetModules();
	vi.resetAllMocks();
});

describe('Approved official fixture files must be readable and valid', () => {
	it.each([2021, 2027, 2028])('fails a missing approved-year JSON file for %s', (year) => {
		vi.mocked(readFileSync).mockImplementation(() => {
			throw new Error(`ENOENT: missing ${year}.json`);
		});
		expect(() => loadFixtures(year)).toThrow('ENOENT');
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

describe('Shared official fixture provenance assertions', () => {
	it('retains all 902 official historical inputs and approved-year metadata', () => {
		expect(taxCases.filter((input) => input.year <= 2026)).toHaveLength(902);
		expect(
			yearBoundaries
				.filter((entry) => entry.year <= 2026 && entry.hasOfficialFixtures)
				.map((entry) => entry.year)
		).toStrictEqual([2021, 2022, 2023, 2024, 2025, 2026]);
	});
	it('preserves complete historical provenance and rejects incomplete or corrupt references', async () => {
		const fs = await vi.importActual<typeof NodeFS>('node:fs');
		const fixture = JSON.parse(
			fs.readFileSync(new URL('./fixtures/2026.json', import.meta.url), 'utf8')
		) as BmfFixture;
		const html = JSON.parse(
			gunzipSync(
				fs.readFileSync(new URL('./fixtures/2026.html.json.gz', import.meta.url))
			).toString('utf8')
		) as Record<string, string>;
		expect(() => verifyFixtureProvenance(2026, { fixture, html })).not.toThrow();
		for (const corrupt of [
			{ ...fixture, source: 'wrong source' },
			{ ...fixture, year: 2027 },
			{ ...fixture, records: fixture.records.slice(1) },
			{ ...fixture, records: [...fixture.records, fixture.records[0]] },
			{
				...fixture,
				records: fixture.records.map((row, index) =>
					index === 0 ? { ...row, retrievedAt: 'not a date' } : row
				)
			},
			{
				...fixture,
				records: fixture.records.map((row, index) =>
					index === 0
						? { ...row, expected: { ...row.expected, income: row.expected.income + 1 } }
						: row
				)
			}
		])
			expect(() => verifyFixtureProvenance(2026, { fixture: corrupt, html })).toThrow();
		expect(() => verifyFixtureProvenance(2026, { fixture, html: {} })).toThrow();
		expect(() =>
			verifyFixtureProvenance(2026, {
				fixture,
				html: { ...html, [fixture.records[0].input.id]: '<html>Broken</html>' }
			})
		).toThrow();
		for (const year of [2027, 2028])
			expect(() =>
				verifyFixtureProvenance(year, { fixture: { ...fixture, year, records: [] }, html: {} })
			).toThrow();
	});
});

/** Mock only registration, never generate or store official reference results. */
async function mockFixtureRegistration() {
	const vitest = await vi.importActual<typeof Vitest>('vitest');
	const test = vi.fn();
	const skip = vi.fn();
	const each = vi
		.fn<(inputs: readonly unknown[]) => ReturnType<typeof vi.fn>>()
		.mockReturnValue(vi.fn());
	vi.resetModules();
	vi.doMock('vitest', () => ({
		...vitest,
		describe: (_name: string, body: () => void) => body(),
		it: Object.assign(test, { skip, each })
	}));
	return { test, skip, each };
}

describe('Official fixture registration policy', () => {
	it.each([2027, 2028] as const)('does not load or compare unapproved year %s', async (year) => {
		const registration = await mockFixtureRegistration();
		const { registerOfficialFixtureTests } = await import('./shared.js');
		registerOfficialFixtureTests({ year, hasOfficialFixtures: false });
		expect(registration.skip).toHaveBeenCalledWith(`${year}: no approved official BMF fixtures`);
		expect(registration.test).not.toHaveBeenCalled();
		expect(registration.each).not.toHaveBeenCalled();
		expect(readFileSync).not.toHaveBeenCalled();
	});
	it.each([2027, 2028] as const)(
		'registers complete comparisons and provenance once year %s is approved',
		async (year) => {
			const registration = await mockFixtureRegistration();
			const { registerOfficialFixtureTests } = await import('./shared.js');
			registerOfficialFixtureTests({ year, hasOfficialFixtures: true });
			expect(registration.skip).not.toHaveBeenCalled();
			expect(registration.test).toHaveBeenCalledWith(
				`${year}: complete cases and response provenance`,
				expect.any(Function)
			);
			expect(registration.each).toHaveBeenCalledExactlyOnceWith(
				taxCases.filter((input) => input.year === year)
			);
			// Missing approved data fails the registered provenance test; it cannot become a skip.
			vi.mocked(readFileSync).mockImplementation(() => {
				throw new Error('Missing approved fixtures');
			});
			expect(registration.test.mock.calls[0][1]).toThrow('Missing approved fixtures');
		}
	);
	it('V2027 suite activates from metadata without registering historical years', async () => {
		const registration = await mockFixtureRegistration();
		const cases = await vi.importActual<typeof Cases>('./cases.js');
		vi.doMock('./cases.js', () => ({
			...cases,
			yearBoundaries: cases.yearBoundaries.map((entry) => ({
				...entry,
				hasOfficialFixtures: entry.year >= 2027 ? entry.year === 2027 : entry.hasOfficialFixtures
			}))
		}));
		await import('../V2027-fixtures.spec.js');
		const comparisons = registration.each.mock.calls
			.map(([inputs]) => inputs)
			.filter((inputs) => {
				const first = inputs[0];
				return first !== null && typeof first === 'object' && 'id' in first;
			});
		// Approved 2027 adds official comparisons without replacing either year's draft matrix.
		expect(comparisons).toStrictEqual([
			taxCases.filter((input) => input.year === 2027),
			taxCases.filter((input) => input.year === 2027),
			taxCases.filter((input) => input.year === 2028)
		]);
		expect(registration.test).toHaveBeenCalledWith(
			'2027: complete cases and response provenance',
			expect.any(Function)
		);
		expect(registration.skip).toHaveBeenCalledExactlyOnceWith(
			'2028: no approved official BMF fixtures'
		);
	});
});
