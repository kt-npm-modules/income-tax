import type {
	DEIncomeTaxOptionsV2021,
	DEIncomeTaxParametersV2021,
	DEIncomeTaxSupportedYearsV2021
} from './V2021/types.js';

export type DEIncomeTaxParameters = DEIncomeTaxParametersV2021;

export type DEIncomeTaxOptions = DEIncomeTaxOptionsV2021;

export type DEIncomeTaxSupportedYears = DEIncomeTaxSupportedYearsV2021;

export const defaultDETaxOptions: DEIncomeTaxOptions = {
	split: false
};
