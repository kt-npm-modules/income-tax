import assert from '@ktarmyshov/assert';
import Decimal from 'decimal.js';
import { defaultDETaxOptions, DEIncome, DEIncomeTax, DETaxOptions } from '../types';
import {
	DEIncomeTaxConstantZoneParamsV2021,
	DEIncomeTaxProgressionZoneParamsV2021,
	DEIncomeTaxSupportedYearsParamsV2021,
	DEIncomeTaxYearParamsV2021,
	DESolidaritySurchargeSupportedYearsParamsV2021,
	DESolidaritySurchargeYearParamsV2021
} from './income-params';

type IncomeTax = {
	tax: Decimal;
	marginalTaxRate: Decimal;
};

function calculateIncomeTaxProgressionZone(
	income: number,
	params: DEIncomeTaxProgressionZoneParamsV2021
): IncomeTax {
	// Calculate the progressive tax based on the parameters
	// y = (income - subtractor) / 10000
	const y = new Decimal(income).minus(params.subtractor).dividedBy(10000);
	// tax = (progression * y + constant) * y
	const tax = new Decimal(params.progression).mul(y).plus(params.constant).mul(y);
	// marginalTaxRate = (progression * 2 * y + constant) / 10000
	const marginalTaxRate = new Decimal(params.progression)
		.mul(2)
		.mul(y)
		.plus(params.constant)
		.dividedBy(10000);
	return {
		tax: tax,
		marginalTaxRate: marginalTaxRate
	};
}

function calculateIncomeTaxConstantZone(
	income: number,
	params: DEIncomeTaxConstantZoneParamsV2021
): IncomeTax {
	// Calculate the constant tax based on the percentage
	const tax = new Decimal(income).mul(params.percentage);
	const marginalTaxRate = new Decimal(params.percentage); // Marginal tax rate is constant in this zone
	return {
		tax: tax,
		marginalTaxRate: marginalTaxRate
	};
}

function calculateIncomeTaxYear(income: number, params: DEIncomeTaxYearParamsV2021): IncomeTax {
	// Determine the zone based on the income
	if (income <= params[0].boundary) {
		// No tax for income below the first boundary
		return {
			tax: new Decimal(0),
			marginalTaxRate: new Decimal(0)
		};
	} else if (income <= params[1].boundary) {
		return calculateIncomeTaxProgressionZone(income, params[1].params);
	} else if (income <= params[2].boundary) {
		const zoneTax = calculateIncomeTaxProgressionZone(income, params[2].params);
		const restTax = calculateIncomeTaxYear(params[1].boundary, params);
		return {
			tax: zoneTax.tax.plus(restTax.tax),
			marginalTaxRate: zoneTax.marginalTaxRate
		};
	} else if (income <= params[3].boundary) {
		const zoneTax = calculateIncomeTaxConstantZone(income - params[2].boundary, params[3].params);
		const restTax = calculateIncomeTaxYear(params[2].boundary, params);
		return {
			tax: zoneTax.tax.plus(restTax.tax),
			marginalTaxRate: zoneTax.marginalTaxRate
		};
	} else {
		const zoneTax = calculateIncomeTaxConstantZone(income - params[3].boundary, params[4].params);
		const restTax = calculateIncomeTaxYear(params[3].boundary, params);
		return {
			tax: zoneTax.tax.plus(restTax.tax),
			marginalTaxRate: zoneTax.marginalTaxRate
		};
	}
}

function calculateSolidaritySurcharge(
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

export function deIncomeTaxV2021(
	year: number,
	income: DEIncome,
	options?: DETaxOptions
): DEIncomeTax {
	assert.ok(income.progression === undefined, 'Progression is not supported in this version');
	assert.ok(options?.church === undefined, 'Church tax is not supported yet');

	// Validate inputs
	assert.ok(Number.isInteger(year), 'Year must be an integer');
	assert.ok(year >= 2021, 'Year must be 2021 or later');
	assert.ok(income.taxable >= 0, 'Income must be a non-negative number');

	// Prepare options
	const opts = { ...defaultDETaxOptions, ...options };
	// Get the tax parameters for the specified year
	const yearParams = options?.incomeTaxParams ?? DEIncomeTaxSupportedYearsParamsV2021[year];
	assert.ok(yearParams, `Cannot find tax parameters for year ${year}`);
	// Calculate the income tax
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
