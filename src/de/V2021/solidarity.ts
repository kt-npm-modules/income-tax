import { Decimal } from 'decimal.js';
import type { DESolidaritySurchargeYearParamsV2021 } from './solidarity-params.js';

export function calculateSolidaritySurcharge(
	incomeTax: number,
	params: DESolidaritySurchargeYearParamsV2021,
	split = false
): Decimal {
	const tax = new Decimal(incomeTax);
	const exemption = new Decimal(params.exemption).mul(split ? 2 : 1);
	if (tax.lte(exemption)) {
		return new Decimal(0);
	}
	// SolzG section 4 caps the surcharge; no rounded crossover boundary is needed.
	return Decimal.min(tax.mul(params.rate), tax.minus(exemption).mul(params.mitigationRate));
}
