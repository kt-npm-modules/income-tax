import assert from '@ktarmyshov/assert';
import Decimal from 'decimal.js';
import { defaultDETaxOptions, DEIncome, DEIncomeTax, DETaxOptions } from '../types.js';
import { DEIncomeTaxSupportedYearsParamsV2021 } from './income-params.js';
import { calculateIncomeTaxYear } from './income.js';
import { DESolidaritySurchargeSupportedYearsParamsV2021 } from './solidarity-params.js';
import { calculateSolidaritySurcharge } from './solidarity.js';

export function deIncomeTaxV2021(
	year: number,
	income: DEIncome,
	options?: DETaxOptions
): DEIncomeTax {
	assert.ok(income.progression === undefined, 'Progression is not supported yet');
	assert.ok(options?.church === undefined, 'Church tax is not supported yet');

	// Validate inputs
	assert.ok(Number.isInteger(year), 'Year must be an integer');
	assert.ok(year >= 2021, 'Year must be 2021 or later');
	assert.ok(income.taxable >= 0, 'Income must be a non-negative number');

	// Prepare options
	const opts = { ...defaultDETaxOptions, ...options };
	// Calculate the income tax
	const yearParams = options?.incomeTaxParams ?? DEIncomeTaxSupportedYearsParamsV2021[year];
	assert.ok(yearParams, `Cannot find tax parameters for year ${year}`);
	// If split is true, divide the income by 2, TODO: handle progression income
	const incomeValue = opts.split ? income.taxable / 2 : income.taxable;
	const incomeTax = calculateIncomeTaxYear(incomeValue, yearParams);
	const incomeTaxRawValue = incomeTax.tax;
	const floorIncomeTaxRaw = incomeTaxRawValue.floor(); // Floor down the tax to the nearest integer
	const floorIncomeTax = opts.split ? floorIncomeTaxRaw.mul(2) : floorIncomeTaxRaw; // If split, multiply by 2
	const marginalTaxRate = incomeTax.marginalTaxRate; // Marginal tax rate is already calculated
	const averageTaxRate = floorIncomeTax.div(income.taxable); // Average tax rate is the total tax divided by the income
	// Calculate solidarity surcharge if applicable
	const solidarityParams =
		opts.solidaritySurchargeParams ?? DESolidaritySurchargeSupportedYearsParamsV2021[year];
	assert.ok(solidarityParams, `Cannot find solidarity surcharge parameters for year ${year}`);
	const solidaritySurchargeRaw = calculateSolidaritySurcharge(
		floorIncomeTaxRaw.toNumber(),
		solidarityParams
	);
	// Floor to the 2 decimal places
	const solidaritySurcharge = opts.split ? solidaritySurchargeRaw.mul(2) : solidaritySurchargeRaw;
	const floorSolidaritySurcharge = solidaritySurcharge.toDecimalPlaces(2, Decimal.ROUND_FLOOR); // Round down to 2 decimal places
	const solidarityRate = floorSolidaritySurcharge.div(income.taxable);

	// Calculate total tax
	const floorTotalTax = floorIncomeTax.plus(floorSolidaritySurcharge);
	const totalTaxRate = floorTotalTax.div(income.taxable);
	return {
		income: floorIncomeTax.toNumber(),
		rates: {
			// Floor to the 4th decimal place
			incomeMarginal: marginalTaxRate.toDecimalPlaces(4, Decimal.ROUND_FLOOR).toNumber(),
			// Round to the 4th decimal place
			incomeAverage: averageTaxRate.toDecimalPlaces(4).toNumber(),
			// Round to the 4th decimal place
			solidarity: solidarityRate.toDecimalPlaces(4).toNumber(),
			// Round to the 4th decimal place
			total: totalTaxRate.toDecimalPlaces(4).toNumber()
		},
		solidarity: floorSolidaritySurcharge.toNumber(),
		total: floorTotalTax.toNumber()
	};
}
