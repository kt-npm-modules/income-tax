import { Decimal } from 'decimal.js';
import type { TariffResult } from '../_common/assessment.js';
import type { DEIncomeTaxYearParamsV2027 } from './income-params.js';

/** Evaluate the selected draft statutory formula without rounding its result. */
export function calculateIncomeTaxYear(
	income: number,
	params: DEIncomeTaxYearParamsV2027
): TariffResult {
	const x = new Decimal(income).floor();
	if (x.lte(params.basicAllowance)) {
		return { tax: new Decimal(0), marginalTaxRate: new Decimal(0) };
	}
	if (x.lte(params.firstProgression.upperBoundary)) {
		const y = x.minus(params.basicAllowance).div(10000);
		const { quadraticCoefficient, linearCoefficient } = params.firstProgression;
		return {
			tax: new Decimal(quadraticCoefficient).mul(y).plus(linearCoefficient).mul(y),
			marginalTaxRate: new Decimal(quadraticCoefficient)
				.mul(2)
				.mul(y)
				.plus(linearCoefficient)
				.div(10000)
		};
	}
	if (x.lte(params.secondProgression.upperBoundary)) {
		const z = x.minus(params.firstProgression.upperBoundary).div(10000);
		const { quadraticCoefficient, linearCoefficient, constant } = params.secondProgression;
		return {
			tax: new Decimal(quadraticCoefficient).mul(z).plus(linearCoefficient).mul(z).plus(constant),
			marginalTaxRate: new Decimal(quadraticCoefficient)
				.mul(2)
				.mul(z)
				.plus(linearCoefficient)
				.div(10000)
		};
	}
	const formula = x.lte(params.firstLinear.upperBoundary)
		? params.firstLinear
		: x.lte(params.secondLinear.upperBoundary)
			? params.secondLinear
			: params.thirdLinear;
	return {
		tax: x.mul(formula.rate).minus(formula.subtrahend),
		marginalTaxRate: new Decimal(formula.rate)
	};
}
