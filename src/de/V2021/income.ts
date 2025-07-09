import Decimal from 'decimal.js';
import {
	DEIncomeTaxConstantZoneParamsV2021,
	DEIncomeTaxProgressionZoneParamsV2021,
	DEIncomeTaxYearParamsV2021
} from './income-params.js';

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

export function calculateIncomeTaxYear(
	income: number,
	params: DEIncomeTaxYearParamsV2021
): IncomeTax {
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
