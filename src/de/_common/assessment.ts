import { Decimal } from 'decimal.js';
import type { DEIncome, DEIncomeTax } from './types.js';
import {
	calculateSolidaritySurcharge,
	type DESolidaritySurchargeYearParams
} from './solidarity.js';

export type TariffResult = { tax: Decimal; marginalTaxRate: Decimal };

/** Shared assessment only; callers validate inputs and select their versioned tariff. */
export function assessIncomeTax(
	income: DEIncome,
	solidarityParameters: DESolidaritySurchargeYearParams,
	split: boolean,
	evaluate: (income: number) => TariffResult
): DEIncomeTax {
	const taxable = new Decimal(income.taxable);
	// Section 32a EStG: floor the tariff income and tax before doubling for splitting.
	const tariffIncome = taxable.div(split ? 2 : 1).floor();
	const incomeTax = evaluate(tariffIncome.toNumber());
	const assessedIncomeTax = incomeTax.tax.floor().mul(split ? 2 : 1);
	const solidarity = calculateSolidaritySurcharge(
		assessedIncomeTax.toNumber(),
		solidarityParameters,
		split
	).toDecimalPlaces(2, Decimal.ROUND_FLOOR);
	const total = assessedIncomeTax.plus(solidarity);
	const rate = (amount: Decimal): number =>
		taxable.isZero() ? 0 : amount.div(taxable).toDecimalPlaces(4, Decimal.ROUND_HALF_UP).toNumber();
	const incomeAverage = rate(assessedIncomeTax);
	const solidarityRate = rate(solidarity);
	// Match BMF's displayed total: add the rounded component rates exactly.
	const totalRate = new Decimal(incomeAverage).plus(solidarityRate).toNumber();
	return {
		income: assessedIncomeTax.toNumber(),
		solidarity: solidarity.toNumber(),
		total: total.toNumber(),
		rates: {
			incomeMarginal: incomeTax.marginalTaxRate.toDecimalPlaces(4, Decimal.ROUND_FLOOR).toNumber(),
			incomeAverage,
			solidarity: solidarityRate,
			total: totalRate
		}
	};
}
