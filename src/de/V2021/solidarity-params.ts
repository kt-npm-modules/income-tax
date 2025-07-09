import { ReadonlyDeep } from 'type-fest';

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
