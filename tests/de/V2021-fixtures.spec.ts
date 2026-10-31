import { describe, expect, it } from 'vitest';
import {
	deIncomeTax,
	deIncomeTaxV2021,
	deSupportedTaxParametersV2021
} from '../../src/de/index.js';
import type {
	DEIncomeTaxParametersV2021,
	DEIncomeTaxSupportedYearsV2021
} from '@ktarmyshov/income-tax';
import { taxCases, yearBoundaries } from './bmf/cases.js';
import { BMF_URL, parseBmfResult } from './bmf/client.js';
import { loadFixtures } from './bmf/fixtures.js';
import { registerTaxCases } from './bmf/shared.js';

describe('BMF annual income-tax fixtures', () => {
	for (const { year } of yearBoundaries.filter((entry) => entry.hasOfficialFixtures)) {
		it(`${year}: complete cases and response provenance`, () => {
			const { fixture, html } = loadFixtures(year);
			expect(fixture.source).toBe(BMF_URL);
			expect(fixture.year).toBe(year);
			expect(fixture.records.map((row) => row.input)).toStrictEqual(
				taxCases.filter((input) => input.year === year)
			);
			expect(Object.keys(html).sort()).toStrictEqual(
				fixture.records.map((row) => row.input.id).sort()
			);
			for (const row of fixture.records) {
				expect(Number.isFinite(Date.parse(row.retrievedAt))).toBe(true);
				expect(parseBmfResult(html[row.input.id], row.input)).toStrictEqual(row.expected);
			}
		});
		registerTaxCases(year, (input) => {
			const row = loadFixtures(year).fixture.records.find((row) => row.input.id === input.id);
			if (!row) throw new Error(`Missing BMF fixture: ${input.id}`);
			return row.expected;
		});
	}
});

describe('API validation and immutable built-in parameters', () => {
	for (const calculate of [deIncomeTax, deIncomeTaxV2021]) {
		it('defaults omitted or undefined splitting to single assessment', () => {
			const row = loadFixtures(2026).fixture.records.find(
				(row) => row.input.id === '2026-single-50000.00'
			);
			if (!row) throw new Error('Missing default-options reference');
			expect(calculate({ taxable: 50000 }, 2026)).toStrictEqual(row.expected);
			expect(calculate({ taxable: 50000 }, 2026, { split: undefined })).toStrictEqual(row.expected);
		});
		it.each([-1, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1])(
			'rejects taxable income %s',
			(taxable) => {
				expect(() => calculate({ taxable }, 2026)).toThrow();
			}
		);
		it.each([2020, 2029, 2025.5, NaN])('rejects unsupported year %s', (year) => {
			expect(() => calculate({ taxable: 50000 }, year as DEIncomeTaxSupportedYearsV2021)).toThrow();
		});
		it('rejects missing or invalid custom parameters', () => {
			for (const parameters of [
				null,
				{},
				{ version: 'other' },
				{ ...deSupportedTaxParametersV2021[2026], income: {} }
			]) {
				expect(() =>
					calculate({ taxable: 50000 }, parameters as DEIncomeTaxParametersV2021)
				).toThrow();
			}
		});
		it('rejects invalid coefficients, boundaries, rates and options', () => {
			const parameters = deSupportedTaxParametersV2021[2026];
			for (const income of [
				{ ...parameters.income, basicAllowance: -1 },
				{
					...parameters.income,
					firstProgression: { ...parameters.income.firstProgression, upperBoundary: 1 }
				},
				{
					...parameters.income,
					secondProgression: { ...parameters.income.secondProgression, constant: NaN }
				},
				{ ...parameters.income, firstLinear: { ...parameters.income.firstLinear, rate: 2 } }
			])
				expect(() => calculate({ taxable: 50000 }, { ...parameters, income })).toThrow();
			expect(() =>
				calculate(
					{ taxable: 50000 },
					{ ...parameters, solidarity: { ...parameters.solidarity, exemption: -1 } }
				)
			).toThrow();
			expect(() =>
				calculate({ taxable: 50000 }, 2026, { split: 'yes' as unknown as boolean })
			).toThrow();
		});
	}
	it.each([2027, 2028])('V2021 still rejects year %s', (year) => {
		expect(() =>
			deIncomeTaxV2021({ taxable: 50000 }, year as DEIncomeTaxSupportedYearsV2021)
		).toThrow(/Unsupported tax year/);
	});
	it('freezes all nested parameter objects', () => {
		expect(Object.isFrozen(deSupportedTaxParametersV2021)).toBe(true);
		for (const p of Object.values(deSupportedTaxParametersV2021)) {
			for (const object of [
				p,
				p.income,
				p.solidarity,
				p.income.firstProgression,
				p.income.secondProgression,
				p.income.firstLinear,
				p.income.secondLinear
			])
				expect(Object.isFrozen(object)).toBe(true);
		}
	});
});

describe('BMF response validation', () => {
	it('rejects missing results, mismatched echoed inputs and inconsistent totals', () => {
		const input = taxCases[0];
		const html = loadFixtures(input.year).html[input.id];
		expect(() => parseBmfResult('<html>Service unavailable</html>', input)).toThrow();
		expect(() => parseBmfResult(html, { ...input, year: 2026 })).toThrow(/echoed/);
		expect(() => parseBmfResult(html, { ...input, taxable: 1 })).toThrow(/echoed/);
		expect(() => parseBmfResult(html, { ...input, split: true })).toThrow(/echoed/);
		const corrupted = html.replace(
			/(headers="ekst_best_table_summe ekst_best_table_betrag">\s*<strong>)[^<]+/,
			'$11,00 Euro'
		);
		expect(() => parseBmfResult(corrupted, input)).toThrow(/total/);
	});
});
