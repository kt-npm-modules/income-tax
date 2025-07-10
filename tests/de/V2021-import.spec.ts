import {
	DEIncome as DEIncomeMain,
	deIncomeTaxV2021 as deIncomeTaxV2021Main
} from '@ktarmyshov/income-tax';
import {
	DEIncome as DEIncomeDE,
	deIncomeTaxV2021 as deIncomeTaxV2021DE
} from '@ktarmyshov/income-tax/de';
import { describe, expect, it } from 'vitest';

describe('German Income Tax V2021', () => {
	it('import .', () => {
		const income: DEIncomeMain = {
			taxable: 0
		};
		const tax = deIncomeTaxV2021Main(2025, income);
		expect(tax).toEqual({
			income: 0,
			solidarity: 0,
			total: 0,
			rates: {
				incomeMarginal: 0,
				incomeAverage: 0,
				solidarity: 0,
				total: 0
			}
		});
	});
	it('import ./de', () => {
		const income: DEIncomeDE = {
			taxable: 0
		};
		const tax = deIncomeTaxV2021DE(2025, income);
		expect(tax).toEqual({
			income: 0,
			solidarity: 0,
			total: 0,
			rates: {
				incomeMarginal: 0,
				incomeAverage: 0,
				solidarity: 0,
				total: 0
			}
		});
	});
});
