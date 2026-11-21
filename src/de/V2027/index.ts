import assert from '@ktarmyshov/assert';
import { assessIncomeTax } from '../_common/assessment.js';
import type { DEIncome, DEIncomeTax } from '../_common/types.js';
import { defaultDETaxOptions } from '../types.js';
import { calculateIncomeTaxYear } from './income.js';
import {
	deSupportedTaxParametersV2027,
	type DEIncomeTaxOptionsV2027,
	type DEIncomeTaxParametersV2027,
	type DEIncomeTaxSupportedYearsV2027
} from './types.js';

function validateParameters(parameters: DEIncomeTaxParametersV2027): void {
	assert.ok(
		parameters?.version === 'V2027' && parameters.income && parameters.solidarity,
		'Expected V2027 income tax and solidarity parameters'
	);
	const { income, solidarity } = parameters;
	const {
		basicAllowance,
		firstProgression,
		secondProgression,
		firstLinear,
		secondLinear,
		thirdLinear
	} = income;
	for (const formula of [
		firstProgression,
		secondProgression,
		firstLinear,
		secondLinear,
		thirdLinear
	]) {
		assert.ok(formula && typeof formula === 'object', 'Missing income tax formula parameters');
	}
	const boundaries = [
		basicAllowance,
		firstProgression.upperBoundary,
		secondProgression.upperBoundary,
		firstLinear.upperBoundary,
		secondLinear.upperBoundary
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
		secondLinear.subtrahend,
		thirdLinear.subtrahend
	];
	assert.ok(
		coefficients.every((value) => Number.isFinite(value) && value >= 0),
		'Tariff coefficients, constants, and subtrahends must be finite non-negative numbers'
	);
	const rates = [
		firstLinear.rate,
		secondLinear.rate,
		thirdLinear.rate,
		solidarity.rate,
		solidarity.mitigationRate
	];
	assert.ok(
		rates.every((value) => Number.isFinite(value) && value >= 0 && value <= 1),
		'Tax and solidarity rates must be finite fractions between 0 and 1'
	);
	assert.ok(
		Number.isFinite(solidarity.exemption) && solidarity.exemption >= 0,
		'The solidarity exemption must be a finite non-negative number'
	);
}

/** Calculate annual German income tax using the provisional V2027 tariff model. */
export function deIncomeTaxV2027(
	income: DEIncome,
	parameters: DEIncomeTaxSupportedYearsV2027 | DEIncomeTaxParametersV2027,
	options?: DEIncomeTaxOptionsV2027
): DEIncomeTax {
	assert.ok(
		Number.isFinite(income?.taxable) &&
			income.taxable >= 0 &&
			income.taxable <= Number.MAX_SAFE_INTEGER,
		'Taxable income must be a finite non-negative number no greater than Number.MAX_SAFE_INTEGER'
	);
	if (typeof parameters === 'number') {
		assert.ok(
			Object.hasOwn(deSupportedTaxParametersV2027, parameters),
			`Unsupported tax year: ${parameters}`
		);
	}
	const taxParams =
		typeof parameters === 'number' ? deSupportedTaxParametersV2027[parameters] : parameters;
	validateParameters(taxParams);
	const opts = { ...defaultDETaxOptions, ...options };
	const split = opts.split ?? false;
	assert.ok(typeof split === 'boolean', 'The split option must be a boolean');
	return assessIncomeTax(income, taxParams.solidarity, split, (taxable) =>
		calculateIncomeTaxYear(taxable, taxParams.income)
	);
}
