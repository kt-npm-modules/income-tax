/** Coefficients of (quadraticCoefficient * t + linearCoefficient) * t. */
export type DEIncomeTaxProgressionParamsV2027 = {
	quadraticCoefficient: number;
	linearCoefficient: number;
};

/** Coefficients of rate * x - subtrahend. */
export type DEIncomeTaxLinearParamsV2027 = { rate: number; subtrahend: number };

/** Draft six-zone annual tariff. All upper boundaries are inclusive. */
export type DEIncomeTaxYearParamsV2027 = {
	basicAllowance: number;
	firstProgression: DEIncomeTaxProgressionParamsV2027 & { upperBoundary: number };
	secondProgression: DEIncomeTaxProgressionParamsV2027 & {
		upperBoundary: number;
		constant: number;
	};
	firstLinear: DEIncomeTaxLinearParamsV2027 & { upperBoundary: number };
	secondLinear: DEIncomeTaxLinearParamsV2027 & { upperBoundary: number };
	thirdLinear: DEIncomeTaxLinearParamsV2027;
};
