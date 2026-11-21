import type {
	DEIncomeTaxOptionsV2021,
	DEIncomeTaxParametersV2021,
	DEIncomeTaxSupportedYearsV2021
} from './V2021/types.js';
import type { DEIncomeTaxParametersV2027, DEIncomeTaxSupportedYearsV2027 } from './V2027/types.js';

export type DEIncomeTaxParameters = DEIncomeTaxParametersV2021 | DEIncomeTaxParametersV2027;

export type DEIncomeTaxOptions = DEIncomeTaxOptionsV2021;

export type DEIncomeTaxSupportedYears =
	DEIncomeTaxSupportedYearsV2021 | DEIncomeTaxSupportedYearsV2027;

export const defaultDETaxOptions: DEIncomeTaxOptions = {
	split: false
};
