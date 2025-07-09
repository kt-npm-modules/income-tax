import Decimal from 'decimal.js';
import { DESolidaritySurchargeYearParamsV2021 } from './solidarity-params.js';

export function calculateSolidaritySurcharge(
	incomeTax: number,
	params: DESolidaritySurchargeYearParamsV2021
): Decimal {
	if (incomeTax <= params.zeroBoundary) {
		return new Decimal(0); // No solidarity surcharge below the zero boundary
	} else if (incomeTax <= params.mitigationZoneBoundary) {
		return new Decimal(incomeTax).minus(params.zeroBoundary).mul(params.mitigationZoneRate); // Apply the mitigation zone rate
	} else {
		return new Decimal(incomeTax).mul(0.055); // Apply the standard rate of 5.5%
	}
}
