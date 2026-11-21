import { Decimal } from 'decimal.js';

/** Annual solidarity surcharge under sections 3-4 SolzG, without special tax bases. */
export type DESolidaritySurchargeYearParams = {
	/** Single-assessment exemption, doubled for splitting. */
	exemption: number;
	rate: number;
	mitigationRate: number;
};

export function calculateSolidaritySurcharge(
	incomeTax: number,
	params: DESolidaritySurchargeYearParams,
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
