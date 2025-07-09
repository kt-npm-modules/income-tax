import { DEIncomeTaxYearParamsV2021 } from './V2021/income-params';
import { DESolidaritySurchargeYearParamsV2021 } from './V2021/solidarity-params';

export type DEIncome = {
	taxable: number;
	progression?: number;
};

export type DETaxOptions = {
	split?: boolean;
	church?: DEFederalLandCode;
	incomeTaxParams?: DEIncomeTaxYearParamsV2021;
	solidaritySurchargeParams?: DESolidaritySurchargeYearParamsV2021;
};

export type DEIncomeTaxRates = {
	incomeMarginal: number;
	incomeAverage: number;
	solidarity: number;
	// church: number;
	total: number;
};

export type DEIncomeTax = {
	income: number;
	solidarity: number;
	// church: number;
	total: number;
	rates: DEIncomeTaxRates;
};

export type DEFederalLandCode =
	| 'BB' // Brandenburg
	| 'BE' // Berlin
	| 'BW' // Baden-Württemberg
	| 'BY' // Bavaria
	| 'HB' // Bremen
	| 'HH' // Hamburg
	| 'HE' // Hesse
	| 'MV' // Mecklenburg-Western Pomerania
	| 'NI' // Lower Saxony
	| 'NW' // North Rhine-Westphalia
	| 'RP' // Rhineland-Palatinate
	| 'SH' // Schleswig-Holstein
	| 'SL' // Saarland
	| 'SN' // Saxony
	| 'ST' // Saxony-Anhalt
	| 'TH'; // Thuringia

export const defaultDETaxOptions: DETaxOptions = {
	split: false
};
