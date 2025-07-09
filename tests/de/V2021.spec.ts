import { describe, expect, it } from 'vitest';
import { deIncomeTaxV2021 } from '../../src/de/V2021/index.js';
import { DEIncome, DEIncomeTax, DETaxOptions } from '../../src/de/types.js';

type ZoneTestCase = {
	input: {
		income: DEIncome;
		options?: DETaxOptions;
	};
	output: DEIncomeTax;
};
type YearTestCases = Record<string, ZoneTestCase[]>;
type TestCases = Record<number, YearTestCases>;

const testCases: TestCases = {
	2021: {
		'zone 0': [
			{
				input: {
					income: { taxable: 1 }
				},
				output: {
					income: 0,
					solidarity: 0,
					total: 0,
					rates: { incomeMarginal: 0, incomeAverage: 0, solidarity: 0, total: 0 }
				}
			},
			{
				input: {
					income: { taxable: 9744 }
				},
				output: {
					income: 0,
					solidarity: 0,
					total: 0,
					rates: { incomeMarginal: 0, incomeAverage: 0, solidarity: 0, total: 0 }
				}
			}
		],
		'zone 1': [
			{
				input: {
					income: { taxable: 9745 }
				},
				output: {
					income: 0,
					solidarity: 0,
					total: 0,
					rates: { incomeMarginal: 0.14, incomeAverage: 0, solidarity: 0, total: 0 }
				}
			},
			{
				input: {
					income: { taxable: 9751 }
				},
				output: {
					income: 0,
					solidarity: 0,
					total: 0,
					rates: { incomeMarginal: 0.1401, incomeAverage: 0, solidarity: 0, total: 0 }
				}
			},
			{
				input: {
					income: { taxable: 9752 }
				},
				output: {
					income: 1,
					solidarity: 0,
					total: 1,
					rates: { incomeMarginal: 0.1401, incomeAverage: 0.0001, solidarity: 0, total: 0.0001 }
				}
			},
			{
				input: {
					// Middle of the first progression zone
					income: { taxable: 12249 }
				},
				output: {
					income: 413,
					solidarity: 0,
					total: 413,
					rates: { incomeMarginal: 0.1898, incomeAverage: 0.0337, solidarity: 0, total: 0.0337 }
				}
			},
			{
				input: {
					income: { taxable: 14753 }
				},
				output: {
					income: 950,
					solidarity: 0,
					total: 950,
					rates: { incomeMarginal: 0.2397, incomeAverage: 0.0644, solidarity: 0, total: 0.0644 }
				}
			}
		],
		// 'zone 2': [],
		'zone 3': [
			{
				input: {
					income: { taxable: 63000 }
				},
				output: {
					income: 17323,
					solidarity: 43.67,
					total: 17366.67,
					rates: {
						incomeMarginal: 0.42,
						incomeAverage: 0.275,
						solidarity: 0.0007,
						total: 0.2757
					}
				}
			},
			{
				input: {
					income: { taxable: 100000 }
				},
				output: {
					income: 32863,
					solidarity: 1807.46,
					total: 34670.46,
					rates: {
						incomeMarginal: 0.42,
						incomeAverage: 0.3286,
						solidarity: 0.0181,
						total: 0.3467
					}
				}
			},
			{
				input: {
					income: { taxable: 200000 },
					options: { split: true }
				},
				output: {
					income: 65726,
					solidarity: 3614.93,
					total: 69340.93,
					rates: {
						incomeMarginal: 0.42,
						incomeAverage: 0.3286,
						solidarity: 0.0181,
						total: 0.3467
					}
				}
			}
		]
	}
};

function formatTestCaseName(income: DEIncome, options?: DETaxOptions) {
	const splitName = options?.split ? '(split)' : '(single)';
	const incomeValue = income.taxable.toLocaleString('de-DE', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
	return `${incomeValue} ${splitName}`;
}

const testYears = Object.keys(testCases).map(Number).sort();

for (const year of testYears) {
	describe(`${year}`, () => {
		const zones = Object.keys(testCases[year]).sort();
		for (const zone of zones) {
			describe(zone, () => {
				for (const testCase of testCases[year][zone]) {
					const testCaseName = formatTestCaseName(testCase.input.income, testCase.input.options);
					it(testCaseName, () => {
						const income = testCase.input.income;
						const options = testCase.input.options;
						const expected = testCase.output;
						const _result = deIncomeTaxV2021(year, income, options);
						expect(_result).toStrictEqual(expected);
					});
				}
			});
		}
	});
}
