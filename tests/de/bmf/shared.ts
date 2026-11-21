import { describe, expect, it } from 'vitest';
import { deIncomeTax as fromSource } from '../../../src/de/index.js';
import { deIncomeTaxV2021 as v2021Source } from '../../../src/de/V2021/index.js';
import { deIncomeTaxV2027 as v2027Source } from '../../../src/de/V2027/index.js';
import {
	deIncomeTax as fromRoot,
	deIncomeTaxV2021 as v2021Root,
	deIncomeTaxV2027 as v2027Root,
	deSupportedTaxParametersV2021,
	deSupportedTaxParametersV2027
} from '@ktarmyshov/income-tax';
import {
	deIncomeTax as fromDE,
	deIncomeTaxV2021 as v2021DE,
	deIncomeTaxV2027 as v2027DE
} from '@ktarmyshov/income-tax/de';
import type { DEIncomeTaxSupportedYears } from '../../../src/de/types.js';
import { taxCases, isV2021Year } from './cases.js';
import type { TaxCase } from './cases.js';
import type { BmfExpected } from './client.js';
import { loadFixtures, verifyFixtureProvenance } from './fixtures.js';

type ExpectedProvider = (input: TaxCase) => BmfExpected | Promise<BmfExpected>;

/** Suites select their version's years; metadata alone enables official comparisons. */
export function registerOfficialFixtureTests(entry: {
	year: DEIncomeTaxSupportedYears;
	hasOfficialFixtures: boolean;
}) {
	const { year, hasOfficialFixtures } = entry;
	if (!hasOfficialFixtures) {
		it.skip(`${year}: no approved official BMF fixtures`);
		return;
	}
	it(`${year}: complete cases and response provenance`, () => {
		verifyFixtureProvenance(year, loadFixtures(year));
	});
	registerTaxCases(year, (input) => {
		const row = loadFixtures(year).fixture.records.find((row) => row.input.id === input.id);
		if (!row) throw new Error(`Missing BMF fixture: ${input.id}`);
		return row.expected;
	});
}

/** The identical assertions and inputs are used by both offline and live suites. */
export function registerTaxCases(year: DEIncomeTaxSupportedYears, expectedFor: ExpectedProvider) {
	describe(String(year), () => {
		it.each(taxCases.filter((input) => input.year === year))('$id', async (input) => {
			const expected = await expectedFor(input);
			const income = { taxable: input.taxable };
			const options = { split: input.split };
			const check = (result: BmfExpected, entryPoint: string) =>
				expect(result, entryPoint).toStrictEqual(expected);
			const parameters = isV2021Year(input.year)
				? deSupportedTaxParametersV2021[input.year]
				: deSupportedTaxParametersV2027[input.year];
			for (const [entryPoint, calculate] of Object.entries({ fromSource, fromRoot, fromDE })) {
				check(calculate(income, input.year, options), `${entryPoint}, year`);
				check(calculate(income, parameters, options), `${entryPoint}, parameters`);
			}
			// Narrow before calling a version-specific API, without broadening its public types.
			if (isV2021Year(input.year)) {
				for (const [entryPoint, calculate] of Object.entries({ v2021Source, v2021Root, v2021DE })) {
					check(calculate(income, input.year, options), `${entryPoint}, year`);
					check(
						calculate(income, deSupportedTaxParametersV2021[input.year], options),
						`${entryPoint}, parameters`
					);
				}
			} else {
				for (const [entryPoint, calculate] of Object.entries({ v2027Source, v2027Root, v2027DE })) {
					check(calculate(income, input.year, options), `${entryPoint}, year`);
					check(
						calculate(income, deSupportedTaxParametersV2027[input.year], options),
						`${entryPoint}, parameters`
					);
				}
			}
		});
	});
}
