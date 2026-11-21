import type { ReadonlyDeep } from 'type-fest';
import type { DEIncomeTaxYearParamsV2027 } from './income-params.js';
import type { DESolidaritySurchargeYearParamsV2027 } from './solidarity-params.js';

export type DEIncomeTaxParametersV2027 = ReadonlyDeep<{
	version: 'V2027';
	income: DEIncomeTaxYearParamsV2027;
	solidarity: DESolidaritySurchargeYearParamsV2027;
}>;

export type DEIncomeTaxOptionsV2027 = { split?: boolean };

function freezeTaxParameters<const T extends Record<number, DEIncomeTaxParametersV2027>>(
	parameters: T
) {
	for (const year of Object.values(parameters)) {
		Object.freeze(year.income.firstProgression);
		Object.freeze(year.income.secondProgression);
		Object.freeze(year.income.firstLinear);
		Object.freeze(year.income.secondLinear);
		Object.freeze(year.income.thirdLinear);
		Object.freeze(year.income);
		Object.freeze(year.solidarity);
		Object.freeze(year);
	}
	return Object.freeze(parameters);
}

// Provisional government draft, BT-Drs. 21/8235, Articles 1-2. See docs/V2027.md.
export const deSupportedTaxParametersV2027 = freezeTaxParameters({
	2027: {
		version: 'V2027',
		income: {
			basicAllowance: 12564,
			firstProgression: {
				upperBoundary: 17799,
				quadraticCoefficient: 952.24,
				linearCoefficient: 1400
			},
			secondProgression: {
				upperBoundary: 70600,
				quadraticCoefficient: 170.74,
				linearCoefficient: 2397,
				constant: 993.86
			},
			firstLinear: { upperBoundary: 249999, rate: 0.42, subtrahend: 11241.73 },
			secondLinear: { upperBoundary: 279999, rate: 0.45, subtrahend: 18741.7 },
			thirdLinear: { rate: 0.47, subtrahend: 24341.68 }
		},
		solidarity: { exemption: 20350, rate: 0.055, mitigationRate: 0.119 }
	},
	2028: {
		version: 'V2027',
		income: {
			basicAllowance: 12900,
			firstProgression: {
				upperBoundary: 17799,
				quadraticCoefficient: 1017.55,
				linearCoefficient: 1400
			},
			secondProgression: {
				upperBoundary: 70600,
				quadraticCoefficient: 170.74,
				linearCoefficient: 2397,
				constant: 930.08
			},
			firstLinear: { upperBoundary: 249999, rate: 0.42, subtrahend: 11305.52 },
			secondLinear: { upperBoundary: 279999, rate: 0.45, subtrahend: 18805.49 },
			thirdLinear: { rate: 0.47, subtrahend: 24405.47 }
		},
		solidarity: { exemption: 20350, rate: 0.055, mitigationRate: 0.119 }
	}
} as const satisfies Record<number, DEIncomeTaxParametersV2027>);

export type DEIncomeTaxSupportedYearsV2027 = keyof typeof deSupportedTaxParametersV2027;
