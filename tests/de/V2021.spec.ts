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
					income: { taxable: 2 },
					options: { split: true }
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
			},
			{
				input: {
					income: { taxable: 19488 },
					options: { split: true }
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
					income: { taxable: 19489 },
					options: { split: true }
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
					income: { taxable: 19490 },
					options: { split: true }
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
					income: { taxable: 19503 },
					options: { split: true }
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
					income: { taxable: 19504 },
					options: { split: true }
				},
				output: {
					income: 2,
					solidarity: 0,
					total: 2,
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
					// Middle of the first progression zone
					income: { taxable: 24498 },
					options: { split: true }
				},
				output: {
					income: 826,
					solidarity: 0,
					total: 826,
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
			},
			{
				input: {
					income: { taxable: 29506 },
					options: { split: true }
				},
				output: {
					income: 1900,
					solidarity: 0,
					total: 1900,
					rates: { incomeMarginal: 0.2397, incomeAverage: 0.0644, solidarity: 0, total: 0.0644 }
				}
			},
			{
				input: {
					income: { taxable: 29507 },
					options: { split: true }
				},
				output: {
					income: 1900,
					solidarity: 0,
					total: 1900,
					rates: { incomeMarginal: 0.2397, incomeAverage: 0.0644, solidarity: 0, total: 0.0644 }
				}
			}
		],
		'zone 2': [
			{
				input: {
					income: { taxable: 14754 }
				},
				output: {
					income: 951,
					solidarity: 0,
					total: 951,
					rates: { incomeMarginal: 0.2397, incomeAverage: 0.0645, solidarity: 0, total: 0.0645 }
				}
			},
			{
				input: {
					income: { taxable: 29508 },
					options: { split: true }
				},
				output: {
					income: 1902,
					solidarity: 0,
					total: 1902,
					rates: { incomeMarginal: 0.2397, incomeAverage: 0.0645, solidarity: 0, total: 0.0645 }
				}
			},
			{
				input: {
					// Middle of the second progression zone
					income: { taxable: 36336 }
				},
				output: {
					income: 7097,
					solidarity: 0,
					total: 7097,
					rates: { incomeMarginal: 0.3298, incomeAverage: 0.1953, solidarity: 0, total: 0.1953 }
				}
			},
			{
				input: {
					// Middle of the second progression zone
					income: { taxable: 72672 },
					options: { split: true }
				},
				output: {
					income: 14194,
					solidarity: 0,
					total: 14194,
					rates: { incomeMarginal: 0.3298, incomeAverage: 0.1953, solidarity: 0, total: 0.1953 }
				}
			},
			{
				input: {
					income: { taxable: 57918 }
				},
				output: {
					income: 15188,
					solidarity: 0,
					total: 15188,
					rates: { incomeMarginal: 0.42, incomeAverage: 0.2622, solidarity: 0, total: 0.2622 }
				}
			},
			{
				input: {
					income: { taxable: 115836 },
					options: { split: true }
				},
				output: {
					income: 30376,
					solidarity: 0,
					total: 30376,
					rates: { incomeMarginal: 0.42, incomeAverage: 0.2622, solidarity: 0, total: 0.2622 }
				}
			},
			{
				input: {
					income: { taxable: 115837 },
					options: { split: true }
				},
				output: {
					income: 30376,
					solidarity: 0,
					total: 30376,
					rates: { incomeMarginal: 0.42, incomeAverage: 0.2622, solidarity: 0, total: 0.2622 }
				}
			}
		],
		'zone 3': [
			{
				input: {
					income: { taxable: 57919 }
				},
				output: {
					income: 15189,
					solidarity: 0,
					total: 15189,
					rates: { incomeMarginal: 0.42, incomeAverage: 0.2622, solidarity: 0, total: 0.2622 }
				}
			},
			{
				input: {
					income: { taxable: 166265 }
				},
				output: {
					income: 60694,
					solidarity: 3338.17,
					total: 64032.17,
					rates: {
						incomeMarginal: 0.42,
						incomeAverage: 0.365,
						solidarity: 0.0201,
						total: 0.3851
					}
				}
			},
			{
				input: {
					income: { taxable: 274612 }
				},
				output: {
					income: 106200,
					solidarity: 5841,
					total: 112041,
					rates: {
						incomeMarginal: 0.42,
						incomeAverage: 0.3867,
						solidarity: 0.0213,
						total: 0.408
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
		],
		'zone 4': [
			{
				input: {
					income: { taxable: 274613 }
				},
				output: {
					income: 106200,
					solidarity: 5841,
					total: 112041,
					rates: {
						incomeMarginal: 0.45,
						incomeAverage: 0.3867,
						solidarity: 0.0213,
						total: 0.408
					}
				}
			},
			{
				input: {
					income: { taxable: 500000 }
				},
				output: {
					income: 207625,
					solidarity: 11419.37,
					total: 219044.37,
					rates: {
						incomeMarginal: 0.45,
						incomeAverage: 0.4153,
						solidarity: 0.0228,
						total: 0.4381
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
