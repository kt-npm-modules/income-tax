import assert from '@ktarmyshov/assert';
import { Decimal } from 'decimal.js';
import type { DEIncome, DEIncomeTax } from '../_common/types.js';
import { defaultDETaxOptions } from '../types.js';
import { calculateIncomeTaxYear } from './income.js';
import { calculateSolidaritySurcharge } from './solidarity.js';
import {
	deSupportedTaxParametersV2021,
	type DEIncomeTaxOptionsV2021,
	type DEIncomeTaxParametersV2021,
	type DEIncomeTaxSupportedYearsV2021
} from './types.js';

function validateParameters(parameters: DEIncomeTaxParametersV2021): void {
	assert.ok(
		parameters && parameters.version === 'V2021' && parameters.income && parameters.solidarity,
		'Expected V2021 income tax and solidarity parameters'
	);
	const { income, solidarity } = parameters;
	const { basicAllowance, firstProgression, secondProgression, firstLinear, secondLinear } = income;
	for (const formula of [firstProgression, secondProgression, firstLinear, secondLinear]) {
		assert.ok(formula && typeof formula === 'object', 'Missing income tax formula parameters');
	}
	const boundaries = [
		basicAllowance,
		firstProgression.upperBoundary,
		secondProgression.upperBoundary,
		firstLinear.upperBoundary
	];
	assert.ok(
		boundaries.every(
			(value, index) =>
				Number.isSafeInteger(value) && value >= 0 && (index === 0 || value > boundaries[index - 1])
		),
		'Tariff boundaries must be increasing non-negative safe integers'
	);
	const coefficients = [
		firstProgression.quadraticCoefficient,
		firstProgression.linearCoefficient,
		secondProgression.quadraticCoefficient,
		secondProgression.linearCoefficient,
		secondProgression.constant,
		firstLinear.subtrahend,
		secondLinear.subtrahend
	];
	assert.ok(
		coefficients.every((value) => Number.isFinite(value) && value >= 0),
		'Tariff coefficients, constants, and subtrahends must be finite non-negative numbers'
	);
	const rates = [firstLinear.rate, secondLinear.rate, solidarity.rate, solidarity.mitigationRate];
	assert.ok(
		rates.every((value) => Number.isFinite(value) && value >= 0 && value <= 1),
		'Tax and solidarity rates must be finite fractions between 0 and 1'
	);
	assert.ok(
		Number.isFinite(solidarity.exemption) && solidarity.exemption >= 0,
		'The solidarity exemption must be a finite non-negative number'
	);
}

/**
 * Calculate annual German income tax using the V2021 tariff model.
 * @param income - Annual taxable income (zvE) in euros; combined income for splitting.
 * @param parameters - A supported year or a complete set of V2021 tariff parameters.
 * @param options - Assessment options, including joint assessment via splitting.
 */
export function deIncomeTaxV2021(
	income: DEIncome,
	parameters: DEIncomeTaxSupportedYearsV2021 | DEIncomeTaxParametersV2021,
	options?: DEIncomeTaxOptionsV2021
): DEIncomeTax {
	assert.ok(
		Number.isFinite(income?.taxable) &&
			income.taxable >= 0 &&
			income.taxable <= Number.MAX_SAFE_INTEGER,
		'Taxable income must be a finite non-negative number no greater than Number.MAX_SAFE_INTEGER'
	);
	if (typeof parameters === 'number') {
		assert.ok(
			Object.hasOwn(deSupportedTaxParametersV2021, parameters),
			`Unsupported tax year: ${parameters}`
		);
	}
	const taxParams =
		typeof parameters === 'number' ? deSupportedTaxParametersV2021[parameters] : parameters;
	validateParameters(taxParams);
	const opts = { ...defaultDETaxOptions, ...options };
	const split = opts.split ?? false;
	assert.ok(typeof split === 'boolean', 'The split option must be a boolean');

	const taxable = new Decimal(income.taxable);
	// Section 32a EStG: apply the tariff to whole-euro income; floor the tax
	// before doubling it for joint assessment.
	const tariffIncome = taxable.div(split ? 2 : 1).floor();
	const incomeTax = calculateIncomeTaxYear(tariffIncome.toNumber(), taxParams.income);
	const assessedIncomeTax = incomeTax.tax.floor().mul(split ? 2 : 1);
	// Apply SolzG to the full assessment with the matching single/joint exemption.
	// Fractions of a cent are discarded only after calculating the surcharge.
	const solidarity = calculateSolidaritySurcharge(
		assessedIncomeTax.toNumber(),
		taxParams.solidarity,
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
			// Analytic income-tax marginal rate, truncated to four decimal places.
			incomeMarginal: incomeTax.marginalTaxRate.toDecimalPlaces(4, Decimal.ROUND_FLOOR).toNumber(),
			incomeAverage,
			solidarity: solidarityRate,
			total: totalRate
		}
	};
}
