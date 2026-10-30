import type { DEIncome, DEIncomeTax } from './_common/types.js';
import type {
	DEIncomeTaxOptions,
	DEIncomeTaxParameters,
	DEIncomeTaxSupportedYears
} from './types.js';
import { deIncomeTaxV2021 } from './V2021/index.js';
import { deSupportedTaxParametersV2021 } from './V2021/types.js';

export { deIncomeTaxV2021 } from './V2021/index.js';
export { deSupportedTaxParametersV2021 };
export { defaultDETaxOptions } from './types.js';
export type { DEIncome, DEIncomeTaxRates, DEFederalLandCode } from './_common/types.js';
export type { DEIncomeTax, DEIncomeTaxOptions, DEIncomeTaxParameters, DEIncomeTaxSupportedYears };
export type {
	DEIncomeTaxOptionsV2021,
	DEIncomeTaxParametersV2021,
	DEIncomeTaxSupportedYearsV2021
} from './V2021/types.js';
export type {
	DEIncomeTaxYearParamsV2021,
	DEIncomeTaxProgressionParamsV2021,
	DEIncomeTaxLinearParamsV2021
} from './V2021/income-params.js';
export type { DESolidaritySurchargeYearParamsV2021 } from './V2021/solidarity-params.js';

/** Calculate annual German income tax from a supported year or versioned parameters. */
export function deIncomeTax(
	income: DEIncome,
	parameters: DEIncomeTaxSupportedYears | DEIncomeTaxParameters,
	options?: DEIncomeTaxOptions
): DEIncomeTax {
	if (parameters !== null && typeof parameters === 'object' && parameters.version === 'V2021') {
		return deIncomeTaxV2021(income, parameters, options);
	}
	if (typeof parameters === 'number' && Object.hasOwn(deSupportedTaxParametersV2021, parameters)) {
		return deIncomeTaxV2021(income, parameters, options);
	}
	throw new Error('Unsupported tax parameters version or year');
}
