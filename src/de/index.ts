import type { DEIncome, DEIncomeTax } from './_common/types.js';
import type {
	DEIncomeTaxOptions,
	DEIncomeTaxParameters,
	DEIncomeTaxSupportedYears
} from './types.js';
import { deIncomeTaxV2021 } from './V2021/index.js';
import { deSupportedTaxParametersV2021 } from './V2021/types.js';
import { deIncomeTaxV2027 } from './V2027/index.js';
import { deSupportedTaxParametersV2027 } from './V2027/types.js';

export { deIncomeTaxV2021 } from './V2021/index.js';
export { deSupportedTaxParametersV2021 };
export { deIncomeTaxV2027, deSupportedTaxParametersV2027 };
export type {
	DEIncomeTaxOptionsV2027,
	DEIncomeTaxParametersV2027,
	DEIncomeTaxSupportedYearsV2027
} from './V2027/types.js';
export type {
	DEIncomeTaxYearParamsV2027,
	DEIncomeTaxProgressionParamsV2027,
	DEIncomeTaxLinearParamsV2027
} from './V2027/income-params.js';
export type { DESolidaritySurchargeYearParamsV2027 } from './V2027/solidarity-params.js';
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
		return deIncomeTaxV2021(
			income,
			parameters as keyof typeof deSupportedTaxParametersV2021,
			options
		);
	}
	if (parameters !== null && typeof parameters === 'object' && parameters.version === 'V2027') {
		return deIncomeTaxV2027(income, parameters, options);
	}
	if (typeof parameters === 'number' && Object.hasOwn(deSupportedTaxParametersV2027, parameters)) {
		return deIncomeTaxV2027(
			income,
			parameters as keyof typeof deSupportedTaxParametersV2027,
			options
		);
	}
	throw new Error('Unsupported tax parameters version or year');
}
