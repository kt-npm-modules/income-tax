import { describe, expect, it } from 'vitest';
import { deIncomeTax as fromSource } from '../../../src/de/index.js';
import { deIncomeTaxV2021 as versionFromSource } from '../../../src/de/V2021/index.js';
import {
	deIncomeTax as fromRoot,
	deIncomeTaxV2021 as versionFromRoot,
	deSupportedTaxParametersV2021
} from '@ktarmyshov/income-tax';
import {
	deIncomeTax as fromDE,
	deIncomeTaxV2021 as versionFromDE
} from '@ktarmyshov/income-tax/de';
import type { DEIncomeTaxSupportedYearsV2021 } from '../../../src/de/V2021/types.js';
import { taxCases } from './cases.js';
import type { TaxCase } from './cases.js';
import type { BmfExpected } from './client.js';

type ExpectedProvider = (input: TaxCase) => BmfExpected | Promise<BmfExpected>;

/** The identical assertions and inputs are used by both offline and live suites. */
export function registerTaxCases(
	year: DEIncomeTaxSupportedYearsV2021,
	expectedFor: ExpectedProvider
) {
	describe(String(year), () => {
		it.each(taxCases.filter((input) => input.year === year))('$id', async (input) => {
			const expected = await expectedFor(input);
			for (const [entryPoint, calculate] of Object.entries({
				fromSource,
				versionFromSource,
				fromRoot,
				fromDE,
				versionFromRoot,
				versionFromDE
			})) {
				for (const parameters of [input.year, deSupportedTaxParametersV2021[input.year]]) {
					const result = calculate({ taxable: input.taxable }, parameters, { split: input.split });
					expect(
						result,
						`${entryPoint}, ${typeof parameters === 'number' ? 'year' : 'parameters'}`
					).toStrictEqual(expected);
				}
			}
		});
	});
}
