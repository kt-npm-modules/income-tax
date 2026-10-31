/** Annual solidarity surcharge under sections 3–4 SolzG, without special tax bases. */
export type DESolidaritySurchargeYearParamsV2021 = {
	/** Single-assessment income-tax exemption (Freigrenze), doubled for splitting. */
	exemption: number;
	/** Standard surcharge as a fraction of assessed income tax: 0.055. */
	rate: number;
	/** Maximum fraction of tax exceeding the exemption: 0.119. */
	mitigationRate: number;
};
