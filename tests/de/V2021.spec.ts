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
					income: { taxable: 115838 },
					options: { split: true }
				},
				output: {
					income: 30378,
					solidarity: 0,
					total: 30378,
					rates: { incomeMarginal: 0.42, incomeAverage: 0.2622, solidarity: 0, total: 0.2622 }
				}
			},
			{
				input: {
					// Solidarity mitigation zone
					income: { taxable: 70000 }
				},
				output: {
					income: 20263,
					solidarity: 393.53,
					total: 20656.53,
					rates: {
						incomeMarginal: 0.42,
						incomeAverage: 0.2895,
						solidarity: 0.0056,
						total: 0.2951
					}
				}
			},
			{
				input: {
					// Middle of the third progression zone
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
					// Middle of the third progression zone
					income: { taxable: 332531 },
					options: { split: true }
				},
				output: {
					income: 121388,
					solidarity: 6676.34,
					total: 128064.34,
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
					income: { taxable: 549224 },
					options: { split: true }
				},
				output: {
					income: 212400,
					solidarity: 11682,
					total: 224082,
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
					income: { taxable: 549225 },
					options: { split: true }
				},
				output: {
					income: 212400,
					solidarity: 11682,
					total: 224082,
					rates: {
						incomeMarginal: 0.42,
						incomeAverage: 0.3867,
						solidarity: 0.0213,
						total: 0.408
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
					income: { taxable: 549226 },
					options: { split: true }
				},
				output: {
					income: 212400,
					solidarity: 11682,
					total: 224082,
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
			},
			{
				input: {
					income: { taxable: 1_000_000 },
					options: { split: true }
				},
				output: {
					income: 415250,
					solidarity: 22838.75,
					total: 438088.75,
					rates: {
						incomeMarginal: 0.45,
						incomeAverage: 0.4153,
						solidarity: 0.0228,
						total: 0.4381
					}
				}
			}
		]
	},
	2025: {
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
					income: { taxable: 12096 }
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
					income: { taxable: 24192 },
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
					income: { taxable: 24193 },
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
					income: { taxable: 12097 }
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
					income: { taxable: 24194 },
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
					income: { taxable: 12103 }
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
					income: { taxable: 24206 },
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
					income: { taxable: 12104 }
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
					income: { taxable: 24208 },
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
					income: { taxable: 14770 }
				},
				output: {
					income: 441,
					solidarity: 0,
					total: 441,
					rates: { incomeMarginal: 0.1898, incomeAverage: 0.0299, solidarity: 0, total: 0.0299 }
				}
			},
			{
				input: {
					// Middle of the first progression zone
					income: { taxable: 29540 },
					options: { split: true }
				},
				output: {
					income: 882,
					solidarity: 0,
					total: 882,
					rates: { incomeMarginal: 0.1898, incomeAverage: 0.0299, solidarity: 0, total: 0.0299 }
				}
			},
			{
				input: {
					income: { taxable: 17443 }
				},
				output: {
					income: 1015,
					solidarity: 0,
					total: 1015,
					rates: { incomeMarginal: 0.2397, incomeAverage: 0.0582, solidarity: 0, total: 0.0582 }
				}
			},
			{
				input: {
					income: { taxable: 34886 },
					options: { split: true }
				},
				output: {
					income: 2030,
					solidarity: 0,
					total: 2030,
					rates: { incomeMarginal: 0.2397, incomeAverage: 0.0582, solidarity: 0, total: 0.0582 }
				}
			},
			{
				input: {
					income: { taxable: 34887 },
					options: { split: true }
				},
				output: {
					income: 2030,
					solidarity: 0,
					total: 2030,
					rates: { incomeMarginal: 0.2397, incomeAverage: 0.0582, solidarity: 0, total: 0.0582 }
				}
			}
		],
		'zone 2': [
			{
				input: {
					income: { taxable: 17444 }
				},
				output: {
					income: 1015,
					solidarity: 0,
					total: 1015,
					rates: { incomeMarginal: 0.2397, incomeAverage: 0.0582, solidarity: 0, total: 0.0582 }
				}
			},
			{
				input: {
					income: { taxable: 34888 },
					options: { split: true }
				},
				output: {
					income: 2030,
					solidarity: 0,
					total: 2030,
					rates: { incomeMarginal: 0.2397, incomeAverage: 0.0582, solidarity: 0, total: 0.0582 }
				}
			},
			{
				input: {
					// Middle of the second progression zone
					income: { taxable: 42962 }
				},
				output: {
					income: 8282,
					solidarity: 0,
					total: 8282,
					rates: { incomeMarginal: 0.3298, incomeAverage: 0.1928, solidarity: 0, total: 0.1928 }
				}
			},
			{
				input: {
					// Middle of the second progression zone
					income: { taxable: 85924 },
					options: { split: true }
				},
				output: {
					income: 16564,
					solidarity: 0,
					total: 16564,
					rates: { incomeMarginal: 0.3298, incomeAverage: 0.1928, solidarity: 0, total: 0.1928 }
				}
			},
			{
				input: {
					income: { taxable: 68480 }
				},
				output: {
					income: 17849,
					solidarity: 0,
					total: 17849,
					rates: { incomeMarginal: 0.42, incomeAverage: 0.2606, solidarity: 0, total: 0.2606 }
				}
			},
			{
				input: {
					income: { taxable: 136960 },
					options: { split: true }
				},
				output: {
					income: 35698,
					solidarity: 0,
					total: 35698,
					rates: { incomeMarginal: 0.42, incomeAverage: 0.2606, solidarity: 0, total: 0.2606 }
				}
			},
			{
				input: {
					income: { taxable: 136961 },
					options: { split: true }
				},
				output: {
					income: 35698,
					solidarity: 0,
					total: 35698,
					rates: { incomeMarginal: 0.42, incomeAverage: 0.2606, solidarity: 0, total: 0.2606 }
				}
			}
		],
		'zone 3': [
			{
				input: {
					income: { taxable: 68481 }
				},
				output: {
					income: 17850,
					solidarity: 0,
					total: 17850,
					rates: { incomeMarginal: 0.42, incomeAverage: 0.2607, solidarity: 0, total: 0.2607 }
				}
			},
			{
				input: {
					income: { taxable: 136962 },
					options: { split: true }
				},
				output: {
					income: 35700,
					solidarity: 0,
					total: 35700,
					rates: { incomeMarginal: 0.42, incomeAverage: 0.2607, solidarity: 0, total: 0.2607 }
				}
			},
			{
				input: {
					// Solidarity mitigation zone
					income: { taxable: 80000 }
				},
				output: {
					income: 22688,
					solidarity: 325.82,
					total: 23013.82,
					rates: {
						incomeMarginal: 0.42,
						incomeAverage: 0.2836,
						solidarity: 0.0041,
						total: 0.2877
					}
				}
			},
			{
				input: {
					// Middle of the third progression zone
					income: { taxable: 173153 }
				},
				output: {
					income: 61812,
					solidarity: 3399.66,
					total: 65211.66,
					rates: {
						incomeMarginal: 0.42,
						incomeAverage: 0.357,
						solidarity: 0.0196,
						total: 0.3766
					}
				}
			},
			{
				input: {
					// Middle of the third progression zone
					income: { taxable: 346306 },
					options: { split: true }
				},
				output: {
					income: 123624,
					solidarity: 6799.32,
					total: 130423.32,
					rates: {
						incomeMarginal: 0.42,
						incomeAverage: 0.357,
						solidarity: 0.0196,
						total: 0.3766
					}
				}
			},
			{
				input: {
					income: { taxable: 277825 }
				},
				output: {
					income: 105774,
					solidarity: 5817.57,
					total: 111591.57,
					rates: {
						incomeMarginal: 0.42,
						incomeAverage: 0.3807,
						solidarity: 0.0209,
						total: 0.4016
					}
				}
			},
			{
				input: {
					income: { taxable: 555650 },
					options: { split: true }
				},
				output: {
					income: 211548,
					solidarity: 11635.14,
					total: 223183.14,
					rates: {
						incomeMarginal: 0.42,
						incomeAverage: 0.3807,
						solidarity: 0.0209,
						total: 0.4016
					}
				}
			},
			{
				input: {
					income: { taxable: 555651 },
					options: { split: true }
				},
				output: {
					income: 211548,
					solidarity: 11635.14,
					total: 223183.14,
					rates: {
						incomeMarginal: 0.42,
						incomeAverage: 0.3807,
						solidarity: 0.0209,
						total: 0.4016
					}
				}
			}
		],
		'zone 4': [
			{
				input: {
					income: { taxable: 277826 }
				},
				output: {
					income: 105775,
					solidarity: 5817.62,
					total: 111592.62,
					rates: {
						incomeMarginal: 0.45,
						incomeAverage: 0.3807,
						solidarity: 0.0209,
						total: 0.4016
					}
				}
			},
			{
				input: {
					income: { taxable: 555652 },
					options: { split: true }
				},
				output: {
					income: 211550,
					solidarity: 11635.25,
					total: 223185.25,
					rates: {
						incomeMarginal: 0.45,
						incomeAverage: 0.3807,
						solidarity: 0.0209,
						total: 0.4016
					}
				}
			},
			{
				input: {
					income: { taxable: 500000 }
				},
				output: {
					income: 205753,
					solidarity: 11316.41,
					total: 217069.41,
					rates: {
						incomeMarginal: 0.45,
						incomeAverage: 0.4115,
						solidarity: 0.0226,
						total: 0.4341
					}
				}
			},
			{
				input: {
					income: { taxable: 1_000_000 },
					options: { split: true }
				},
				output: {
					income: 411506,
					solidarity: 22632.83,
					total: 434138.83,
					rates: {
						incomeMarginal: 0.45,
						incomeAverage: 0.4115,
						solidarity: 0.0226,
						total: 0.4341
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
