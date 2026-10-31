import { Decimal } from 'decimal.js';
import type { DEIncomeTaxYearParamsV2021 } from './income-params.js';

type IncomeTax = {
	tax: Decimal;
	marginalTaxRate: Decimal;
};

/** Evaluate the selected section 32a EStG formula without rounding its result. */
export function calculateIncomeTaxYear(
	income: number,
	params: DEIncomeTaxYearParamsV2021
): IncomeTax {
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
	if (x.lte(params.firstLinear.upperBoundary)) {
		return {
			tax: x.mul(params.firstLinear.rate).minus(params.firstLinear.subtrahend),
			marginalTaxRate: new Decimal(params.firstLinear.rate)
		};
	}
	return {
		tax: x.mul(params.secondLinear.rate).minus(params.secondLinear.subtrahend),
		marginalTaxRate: new Decimal(params.secondLinear.rate)
	};
}
