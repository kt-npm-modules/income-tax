import assert from '@ktarmyshov/assert';
import Decimal from 'decimal.js';
import { defaultDETaxOptions, DEIncome, DEIncomeTax, DETaxOptions } from '../types.js';
import { deIncomeTaxSupportedYearsParamsV2021 } from './income-params.js';
import { calculateIncomeTaxYear } from './income.js';
import { deSolidaritySurchargeSupportedYearsParamsV2021 } from './solidarity-params.js';
import { calculateSolidaritySurcharge } from './solidarity.js';

export { deIncomeTaxSupportedYearsParamsV2021 } from './income-params.js';
export { deSolidaritySurchargeSupportedYearsParamsV2021 } from './solidarity-params.js';

/**
 * Calculate the income tax for Germany for the year 2021.
 * @param year - The year for which to calculate the income tax.
 * @param income - The income object containing taxable income and other properties.
 * @param options - Optional parameters for the tax calculation.
 * @returns An object containing the calculated taxes, rates, solidarity surcharge, and total tax.
 */
export function deIncomeTaxV2021(
	year: number,
	income: DEIncome,
	options?: DETaxOptions
): DEIncomeTax {
	// assert.ok(income.progression === undefined, 'Progression is not supported yet');
	// assert.ok(options?.church === undefined, 'Church tax is not supported yet');

	// Validate inputs
	assert.ok(Number.isInteger(year), 'Year must be an integer');
	assert.ok(year >= 2021, 'Year must be 2021 or later');
	assert.ok(income.taxable >= 0, 'Income must be a non-negative number');

	// Prepare options
	const opts = { ...defaultDETaxOptions, ...options };
	// Calculate the income tax
	const yearParams = options?.incomeTaxParams ?? deIncomeTaxSupportedYearsParamsV2021[year];
	assert.ok(yearParams, `Cannot find income tax parameters for year ${year}`);
	// If split is true, divide the income by 2, TODO: handle progression income
	const incomeValue = new Decimal(opts.split ? income.taxable / 2 : income.taxable).floor(); // Floor down the income to the nearest integer
	const incomeTax = calculateIncomeTaxYear(incomeValue.toNumber(), yearParams);
	const incomeTaxRawValue = incomeTax.tax;
	const floorIncomeTaxRaw = incomeTaxRawValue.floor(); // Floor down the tax to the nearest integer
	const floorIncomeTax = opts.split ? floorIncomeTaxRaw.mul(2) : floorIncomeTaxRaw; // If split, multiply by 2
	const marginalTaxRate = incomeTax.marginalTaxRate; // Marginal tax rate is already calculated
	const outMarginalTaxRate = marginalTaxRate.toDecimalPlaces(4, Decimal.ROUND_FLOOR); // Round down to 4 decimal places
	const averageTaxRate = income.taxable > 0 ? floorIncomeTax.div(income.taxable) : new Decimal(0); // Average tax rate is the total tax divided by the income
	const outAverageTaxRate = averageTaxRate.toDecimalPlaces(4); // Round to 4 decimal places
	// Calculate solidarity surcharge if applicable
	const solidarityParams =
		opts.solidaritySurchargeParams ?? deSolidaritySurchargeSupportedYearsParamsV2021[year];
	assert.ok(solidarityParams, `Cannot find solidarity surcharge parameters for year ${year}`);
	const solidaritySurchargeRaw = calculateSolidaritySurcharge(
		floorIncomeTaxRaw.toNumber(),
		solidarityParams
	);
	// Floor to the 2 decimal places
	const solidaritySurcharge = opts.split ? solidaritySurchargeRaw.mul(2) : solidaritySurchargeRaw;
	const floorSolidaritySurcharge = solidaritySurcharge.toDecimalPlaces(2, Decimal.ROUND_FLOOR); // Round down to 2 decimal places
	const solidarityRate =
		income.taxable > 0 ? floorSolidaritySurcharge.div(income.taxable) : new Decimal(0);
	const outSolidarityRate = solidarityRate.toDecimalPlaces(4); // Round to 4 decimal places

	// Calculate total tax
	const floorTotalTax = floorIncomeTax.plus(floorSolidaritySurcharge);
	const outTotalTaxRate = averageTaxRate.plus(outSolidarityRate).toDecimalPlaces(4); // Round to 4 decimal places
	return {
		income: floorIncomeTax.toNumber(),
		rates: {
			// Floor to the 4th decimal place
			incomeMarginal: outMarginalTaxRate.toNumber(),
			// Round to the 4th decimal place
			incomeAverage: outAverageTaxRate.toNumber(),
			// Round to the 4th decimal place
			solidarity: outSolidarityRate.toNumber(),
			// Round to the 4th decimal place
			total: outTotalTaxRate.toNumber()
		},
		solidarity: floorSolidaritySurcharge.toNumber(),
		total: floorTotalTax.toNumber()
	};
}
