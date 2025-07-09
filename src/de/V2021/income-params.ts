import { ReadonlyDeep } from 'type-fest';

// Parameters for progressive zones, e.g.:
// ESt = (972,87 * y + 1.400) * y; y = (zvE - 9.408) / 10.000
// ESt = (212,02 * z + 2.397) * z; z = (zvE - 14.532) / 10.000
export type DEIncomeTaxProgressionZoneParamsV2021 = {
	// y parameters, i.e. y = (zvE - 9.408) / 10.000
	subtractor: number;
	// ESt parameters, i.e. ESt = (972,87 * y + 1.400) * y
	progression: number;
	constant: number;
};

// Parameters for constant zones, e.g. ESt = 0,42 * zvE or ESt = 0,45 * zvE
export type DEIncomeTaxConstantZoneParamsV2021 = {
	percentage: number;
};

export type DEIncomeTaxYearParamsV2021 = {
	0: {
		boundary: number;
	};
	1: {
		boundary: number;
		params: DEIncomeTaxProgressionZoneParamsV2021;
	};
	2: {
		boundary: number;
		params: DEIncomeTaxProgressionZoneParamsV2021;
	};
	3: {
		boundary: number;
		params: DEIncomeTaxConstantZoneParamsV2021;
	};
	4: {
		params: DEIncomeTaxConstantZoneParamsV2021;
	};
};

type DEIncomeTaxAllYearsParamsV2021 = Record<number, DEIncomeTaxYearParamsV2021>;

const IncomeTaxSupportedYearsParamsV2021: DEIncomeTaxAllYearsParamsV2021 = {
	2021: {
		0: {
			boundary: 9744
		},
		1: {
			boundary: 14753,
			params: {
				subtractor: 9744,
				progression: 995.21,
				constant: 1400
			}
		},
		2: {
			boundary: 57918,
			params: {
				subtractor: 14753,
				progression: 208.85,
				constant: 2397
			}
		},
		3: {
			boundary: 274612,
			params: {
				percentage: 0.42
			}
		},
		4: {
			params: {
				percentage: 0.45
			}
		}
	}
};
export const DEIncomeTaxSupportedYearsParamsV2021: ReadonlyDeep<DEIncomeTaxAllYearsParamsV2021> =
	Object.freeze(IncomeTaxSupportedYearsParamsV2021);

export type DESolidaritySurchargeYearParamsV2021 = {
	// Threshold for solidarity surcharge, below this value it is not applied (= 0)
	zeroBoundary: number; // Inclusive boundary, "<="
	// Boundary for mitigation zone (milderungszone), where e.g. 11,9% is applied
	mitigationZoneBoundary: number; // Exclusive boundary, "<"
	mitigationZoneRate: number; // Rate for the mitigation zone, e.g. 11.9% = 0.119
};

type DESolidaritySurchargeAllYearsParamsV2021 = Record<
	number,
	DESolidaritySurchargeYearParamsV2021
>;
const SolidaritySurchargeSupportedYearsParamsV2021: DESolidaritySurchargeAllYearsParamsV2021 = {
	2021: {
		zeroBoundary: 16956,
		mitigationZoneBoundary: 31528,
		mitigationZoneRate: 0.119
	}
};
export const DESolidaritySurchargeSupportedYearsParamsV2021: ReadonlyDeep<DESolidaritySurchargeAllYearsParamsV2021> =
	Object.freeze(SolidaritySurchargeSupportedYearsParamsV2021);
