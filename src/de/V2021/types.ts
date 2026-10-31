import type { ReadonlyDeep } from 'type-fest';
import type { DEIncomeTaxYearParamsV2021 } from './income-params.js';
import type { DESolidaritySurchargeYearParamsV2021 } from './solidarity-params.js';

export type DEIncomeTaxParametersV2021 = ReadonlyDeep<{
	version: 'V2021';
	income: DEIncomeTaxYearParamsV2021;
	solidarity: DESolidaritySurchargeYearParamsV2021;
}>;

export type DEIncomeTaxOptionsV2021 = {
	split?: boolean;
};

function freezeTaxParameters<const T extends Record<number, DEIncomeTaxParametersV2021>>(
	parameters: T
) {
	for (const year of Object.values(parameters)) {
		Object.freeze(year.income.firstProgression);
		Object.freeze(year.income.secondProgression);
		Object.freeze(year.income.firstLinear);
		Object.freeze(year.income.secondLinear);
		Object.freeze(year.income);
		Object.freeze(year.solidarity);
		Object.freeze(year);
	}
	return Object.freeze(parameters);
}

// Final annual tariffs under section 32a EStG, including the retroactive
// allowance increases for 2022 and 2024. Source links: docs/plan.md.
export const deSupportedTaxParametersV2021 = freezeTaxParameters({
	2021: {
		version: 'V2021',
		income: {
			basicAllowance: 9744,
			firstProgression: {
				upperBoundary: 14753,
				quadraticCoefficient: 995.21,
				linearCoefficient: 1400
			},
			secondProgression: {
				upperBoundary: 57918,
				quadraticCoefficient: 208.85,
				linearCoefficient: 2397,
				constant: 950.96
			},
			firstLinear: { upperBoundary: 274612, rate: 0.42, subtrahend: 9136.63 },
			secondLinear: { rate: 0.45, subtrahend: 17374.99 }
		},
		solidarity: { exemption: 16956, rate: 0.055, mitigationRate: 0.119 }
	},
	2022: {
		version: 'V2021',
		income: {
			basicAllowance: 10347,
			firstProgression: {
				upperBoundary: 14926,
				quadraticCoefficient: 1088.67,
				linearCoefficient: 1400
			},
			secondProgression: {
				upperBoundary: 58596,
				quadraticCoefficient: 206.43,
				linearCoefficient: 2397,
				constant: 869.32
			},
			firstLinear: { upperBoundary: 277825, rate: 0.42, subtrahend: 9336.45 },
			secondLinear: { rate: 0.45, subtrahend: 17671.2 }
		},
		solidarity: { exemption: 16956, rate: 0.055, mitigationRate: 0.119 }
	},
	2023: {
		version: 'V2021',
		income: {
			basicAllowance: 10908,
			firstProgression: {
				upperBoundary: 15999,
				quadraticCoefficient: 979.18,
				linearCoefficient: 1400
			},
			secondProgression: {
				upperBoundary: 62809,
				quadraticCoefficient: 192.59,
				linearCoefficient: 2397,
				constant: 966.53
			},
			firstLinear: { upperBoundary: 277825, rate: 0.42, subtrahend: 9972.98 },
			secondLinear: { rate: 0.45, subtrahend: 18307.73 }
		},
		solidarity: { exemption: 17543, rate: 0.055, mitigationRate: 0.119 }
	},
	2024: {
		version: 'V2021',
		income: {
			basicAllowance: 11784,
			firstProgression: {
				upperBoundary: 17005,
				quadraticCoefficient: 954.8,
				linearCoefficient: 1400
			},
			secondProgression: {
				upperBoundary: 66760,
				quadraticCoefficient: 181.19,
				linearCoefficient: 2397,
				constant: 991.21
			},
			firstLinear: { upperBoundary: 277825, rate: 0.42, subtrahend: 10636.31 },
			secondLinear: { rate: 0.45, subtrahend: 18971.06 }
		},
		solidarity: { exemption: 18130, rate: 0.055, mitigationRate: 0.119 }
	},
	2025: {
		version: 'V2021',
		income: {
			basicAllowance: 12096,
			firstProgression: {
				upperBoundary: 17443,
				quadraticCoefficient: 932.3,
				linearCoefficient: 1400
			},
			secondProgression: {
				upperBoundary: 68480,
				quadraticCoefficient: 176.64,
				linearCoefficient: 2397,
				constant: 1015.13
			},
			firstLinear: { upperBoundary: 277825, rate: 0.42, subtrahend: 10911.92 },
			secondLinear: { rate: 0.45, subtrahend: 19246.67 }
		},
		solidarity: { exemption: 19950, rate: 0.055, mitigationRate: 0.119 }
	},
	2026: {
		version: 'V2021',
		income: {
			basicAllowance: 12348,
			firstProgression: {
				upperBoundary: 17799,
				quadraticCoefficient: 914.51,
				linearCoefficient: 1400
			},
			secondProgression: {
				upperBoundary: 69878,
				quadraticCoefficient: 173.1,
				linearCoefficient: 2397,
				constant: 1034.87
			},
			firstLinear: { upperBoundary: 277825, rate: 0.42, subtrahend: 11135.63 },
			secondLinear: { rate: 0.45, subtrahend: 19470.38 }
		},
		solidarity: { exemption: 20350, rate: 0.055, mitigationRate: 0.119 }
	}
} as const satisfies Record<number, DEIncomeTaxParametersV2021>);

export type DEIncomeTaxSupportedYearsV2021 = keyof typeof deSupportedTaxParametersV2021;
