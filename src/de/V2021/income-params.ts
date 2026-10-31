/** Coefficients of (quadraticCoefficient * t + linearCoefficient) * t. */
export type DEIncomeTaxProgressionParamsV2021 = {
	quadraticCoefficient: number;
	linearCoefficient: number;
};

/** Coefficients of rate * x - subtrahend; the subtrahend is positive. */
export type DEIncomeTaxLinearParamsV2021 = {
	rate: number;
	subtrahend: number;
};

/**
 * Annual tariff under section 32a(1) EStG.
 * x = taxable income rounded down to whole euros.
 * y = (x - basicAllowance) / 10000.
 * z = (x - firstProgression.upperBoundary) / 10000.
 * All upper boundaries are inclusive. The resulting tax is rounded down
 * to whole euros before applying the splitting multiplier.
 */
export type DEIncomeTaxYearParamsV2021 = {
	basicAllowance: number;
	/** (quadraticCoefficient * y + linearCoefficient) * y */
	firstProgression: DEIncomeTaxProgressionParamsV2021 & {
		upperBoundary: number;
	};
	/** (quadraticCoefficient * z + linearCoefficient) * z + constant */
	secondProgression: DEIncomeTaxProgressionParamsV2021 & {
		upperBoundary: number;
		constant: number;
	};
	/** rate * x - subtrahend */
	firstLinear: DEIncomeTaxLinearParamsV2021 & {
		upperBoundary: number;
	};
	/** rate * x - subtrahend, above firstLinear.upperBoundary */
	secondLinear: DEIncomeTaxLinearParamsV2021;
};
