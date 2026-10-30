export type DEIncome = {
	taxable: number;
	// progression?: number;
};

export type DEIncomeTaxRates = {
	incomeMarginal: number;
	incomeAverage: number;
	solidarity: number;
	// church: number;
	/** Sum of the rounded incomeAverage and solidarity rates, matching BMF display. */
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
