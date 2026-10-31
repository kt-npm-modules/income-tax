import { describe, expect, expectTypeOf, it } from 'vitest';
import {
	deIncomeTax,
	deIncomeTaxV2027,
	deSupportedTaxParametersV2027
} from '../../src/de/index.js';
import { calculateIncomeTaxYear } from '../../src/de/V2027/income.js';
import type {
	DEIncome,
	DEIncomeTax,
	DEIncomeTaxParameters,
	DEIncomeTaxParametersV2021,
	DEIncomeTaxParametersV2027,
	DEIncomeTaxSupportedYears,
	DEIncomeTaxSupportedYearsV2027
} from '@ktarmyshov/income-tax';
import type { DEIncomeTaxParametersV2027 as ParametersFromDE } from '@ktarmyshov/income-tax/de';
import {
	draftCoefficients,
	draftReferenceVectors,
	draftRevision,
	statutoryDraftExpected
} from './draft/V2027-vectors.js';
import { registerTaxCases } from './bmf/shared.js';
import { taxCases, yearBoundaries } from './bmf/cases.js';

describe('V2027 independent statutory draft vectors (not BMF verified)', () => {
	for (const year of [2027, 2028] as const) {
		registerTaxCases(year, (input) => {
			const vector = draftReferenceVectors.find((row) => row.input.id === input.id);
			if (!vector) throw new Error(`Missing statutory draft vector: ${input.id}`);
			return vector.expected;
		});
		it(`${year}: exact statutory parameters and deeply frozen objects`, () => {
			const p = draftCoefficients[year];
			const parameters = deSupportedTaxParametersV2027[year];
			expect(parameters).toStrictEqual({
				version: 'V2027',
				income: {
					basicAllowance: p.allowance,
					firstProgression: {
						upperBoundary: 17799,
						quadraticCoefficient: p.firstQuadratic / 100,
						linearCoefficient: 1400
					},
					secondProgression: {
						upperBoundary: 70600,
						quadraticCoefficient: 170.74,
						linearCoefficient: 2397,
						constant: p.constant / 100
					},
					firstLinear: { upperBoundary: 249999, rate: 0.42, subtrahend: p.offsets[0] / 100 },
					secondLinear: { upperBoundary: 279999, rate: 0.45, subtrahend: p.offsets[1] / 100 },
					thirdLinear: { rate: 0.47, subtrahend: p.offsets[2] / 100 }
				},
				solidarity: { exemption: 20350, rate: 0.055, mitigationRate: 0.119 }
			});
			for (const object of [
				deSupportedTaxParametersV2027,
				parameters,
				parameters.income,
				parameters.solidarity,
				...Object.values(parameters.income).filter((value) => typeof value === 'object')
			]) {
				expect(Object.isFrozen(object)).toBe(true);
			}
			expect(() => Object.assign(parameters.income.thirdLinear, { rate: 0 })).toThrow(TypeError);
		});
		it(`${year}: default options and fractional/odd joint assessment`, () => {
			for (const calculate of [deIncomeTax, deIncomeTaxV2027]) {
				const expected = statutoryDraftExpected({ year, taxable: 50000, split: false });
				for (const options of [
					undefined,
					{},
					{ split: undefined },
					{ split: null as unknown as boolean }
				]) {
					expect(calculate({ taxable: 50000 }, year, options)).toStrictEqual(expected);
				}
				for (const taxable of [
					12564.999, 17799.999, 70600.999, 249999.999, 279999.999, 100001, 100001.99
				]) {
					for (const split of [false, true])
						expect(calculate({ taxable }, year, { split })).toStrictEqual(
							statutoryDraftExpected({ year, taxable, split })
						);
				}
				expect(calculate({ taxable: 100001 }, year, { split: true }).income).toBe(
					2 * calculate({ taxable: 50000 }, year).income
				);
			}
		});
		it(`${year}: exact analytic derivatives and unrounded upper-zone discrepancies`, () => {
			const p = deSupportedTaxParametersV2027[year].income;
			expect(calculateIncomeTaxYear(p.basicAllowance, p).marginalTaxRate.toNumber()).toBe(0);
			expect(calculateIncomeTaxYear(p.basicAllowance + 1, p).marginalTaxRate.toString()).toBe(
				year === 2027 ? '0.1400190448' : '0.140020351'
			);
			expect(calculateIncomeTaxYear(17800, p).marginalTaxRate.toString()).toBe('0.2397034148');
			for (const [x, rate] of [
				[70601, 0.42],
				[250000, 0.45],
				[280000, 0.47]
			]) {
				expect(calculateIncomeTaxYear(x, p).marginalTaxRate.toNumber()).toBe(rate);
			}
			const at250000 = calculateIncomeTaxYear(250000, p).tax;
			const firstExtended = calculateIncomeTaxYear(249999, p).tax.plus(0.42);
			expect(at250000.minus(firstExtended).toNumber()).toBe(0.03);
			const at280000 = calculateIncomeTaxYear(280000, p).tax;
			const secondExtended = calculateIncomeTaxYear(279999, p).tax.plus(0.45);
			expect(at280000.minus(secondExtended).toNumber()).toBe(0.02);
		});
		it(`${year}: solidarity onset, mitigation and full-rate crossover`, () => {
			for (const split of [false, true]) {
				const factor = split ? 2 : 1;
				const offset = draftCoefficients[year].offsets[0];
				const first = Math.ceil((2035100 + offset) / 42) * factor;
				expect(deIncomeTax({ taxable: first - factor }, year, { split }).solidarity).toBe(0);
				expect(deIncomeTax({ taxable: first }, year, { split }).solidarity).toBe(
					split ? 0.23 : 0.11
				);
				const crossover = Math.ceil((Math.ceil((20350 * 119) / 64) * 100 + offset) / 42) * factor;
				for (const taxable of [
					first,
					first + 1000,
					crossover - factor,
					crossover,
					crossover + factor
				]) {
					expect(deIncomeTax({ taxable }, year, { split })).toStrictEqual(
						statutoryDraftExpected({ year, taxable, split })
					);
				}
			}
		});
	}
	it('retains all 902 official historical inputs and separates draft metadata', () => {
		expect(taxCases.filter((input) => input.year <= 2026)).toHaveLength(902);
		expect(
			yearBoundaries.filter((entry) => entry.hasOfficialFixtures).map((entry) => entry.year)
		).toStrictEqual([2021, 2022, 2023, 2024, 2025, 2026]);
		expect(draftRevision.status).toBe('government-draft');
		expect(draftRevision.articles).toStrictEqual({ 2027: 1, 2028: 2 });
		for (const year of [2027, 2028]) {
			const entry = yearBoundaries.find((entry) => entry.year === year)!;
			for (const split of [false, true]) {
				const inputs = taxCases
					.filter((input) => input.year === year && input.split === split)
					.map((input) => input.taxable);
				for (const boundary of entry.boundaries)
					for (let offset = -4; offset <= 4; offset++)
						expect(inputs).toContain(boundary * (split ? 2 : 1) + offset);
			}
		}
	});
});

describe('V2027 validation and custom versioned parameters', () => {
	const parameters = deSupportedTaxParametersV2027[2027];
	const invalid = (value: unknown) => {
		for (const calculate of [deIncomeTaxV2027, deIncomeTax])
			expect(() => calculate({ taxable: 50000 }, value as DEIncomeTaxParametersV2027)).toThrow();
	};
	it.each([-1, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1])(
		'rejects invalid income %s',
		(taxable) => {
			for (const calculate of [deIncomeTaxV2027, deIncomeTax])
				expect(() => calculate({ taxable }, 2027)).toThrow(/Taxable income/);
		}
	);
	it('rejects absent income and invalid options', () => {
		for (const calculate of [deIncomeTaxV2027, deIncomeTax]) {
			for (const income of [null, undefined, {}, { taxable: '50000' }])
				expect(() => calculate(income as unknown as DEIncome, 2027)).toThrow(/Taxable income/);
			for (const split of [0, 1, '', 'true', {}, []])
				expect(() => calculate({ taxable: 50000 }, 2028, { split: split as boolean })).toThrow(
					/split option/
				);
		}
	});
	it('rejects absent parameter objects and formula fields', () => {
		for (const value of [
			undefined,
			null,
			{},
			{ version: 'V2028' },
			{ ...parameters, income: undefined },
			{ ...parameters, solidarity: undefined }
		])
			invalid(value);
		for (const key of [
			'firstProgression',
			'secondProgression',
			'firstLinear',
			'secondLinear',
			'thirdLinear'
		] as const) {
			for (const value of [undefined, null, 1])
				invalid({ ...parameters, income: { ...parameters.income, [key]: value } });
		}
	});
	it('validates every boundary, coefficient, subtrahend and rate', () => {
		for (const value of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, undefined, '1']) {
			invalid({ ...parameters, income: { ...parameters.income, basicAllowance: value } });
			for (const key of [
				'firstProgression',
				'secondProgression',
				'firstLinear',
				'secondLinear'
			] as const) {
				invalid({
					...parameters,
					income: {
						...parameters.income,
						[key]: { ...parameters.income[key], upperBoundary: value }
					}
				});
			}
		}
		const boundaries = [
			'basicAllowance',
			'firstProgression',
			'secondProgression',
			'firstLinear',
			'secondLinear'
		] as const;
		for (let i = 1; i < boundaries.length; i++) {
			const previous =
				i === 1
					? parameters.income.basicAllowance
					: parameters.income[
							boundaries[i - 1] as Exclude<(typeof boundaries)[number], 'basicAllowance'>
						].upperBoundary;
			const key = boundaries[i] as Exclude<(typeof boundaries)[number], 'basicAllowance'>;
			invalid({
				...parameters,
				income: {
					...parameters.income,
					[key]: { ...parameters.income[key], upperBoundary: previous }
				}
			});
		}
		for (const key of [
			'firstProgression',
			'secondProgression',
			'firstLinear',
			'secondLinear',
			'thirdLinear'
		] as const) {
			for (const field of Object.keys(parameters.income[key]).filter(
				(field) => field !== 'upperBoundary'
			)) {
				for (const value of [
					-1,
					NaN,
					Infinity,
					undefined,
					'1',
					...(field === 'rate' ? [1.01] : [])
				])
					invalid({
						...parameters,
						income: { ...parameters.income, [key]: { ...parameters.income[key], [field]: value } }
					});
			}
		}
		for (const field of ['exemption', 'rate', 'mitigationRate'])
			for (const value of [
				-1,
				NaN,
				Infinity,
				undefined,
				'1',
				...(field !== 'exemption' ? [1.01] : [])
			])
				invalid({ ...parameters, solidarity: { ...parameters.solidarity, [field]: value } });
	});
	it('rejects years belonging to another model and unsupported future years', () => {
		for (const year of [2021, 2026, 2029, 2027.5, NaN])
			expect(() =>
				deIncomeTaxV2027({ taxable: 50000 }, year as DEIncomeTaxSupportedYearsV2027)
			).toThrow(/Unsupported tax year/);
		expect(() => deIncomeTax({ taxable: 50000 }, 2029 as DEIncomeTaxSupportedYears)).toThrow(
			/Unsupported/
		);
	});
	it('accepts custom non-continuous coefficients without mutating them', () => {
		const custom: DEIncomeTaxParametersV2027 = {
			version: 'V2027',
			income: {
				basicAllowance: 0,
				firstProgression: { upperBoundary: 10, quadraticCoefficient: 0, linearCoefficient: 10000 },
				secondProgression: {
					upperBoundary: 20,
					quadraticCoefficient: 0,
					linearCoefficient: 10000,
					constant: 5
				},
				firstLinear: { upperBoundary: 30, rate: 0.5, subtrahend: 1 },
				secondLinear: { upperBoundary: 40, rate: 0.6, subtrahend: 2 },
				thirdLinear: { rate: 1, subtrahend: 3 }
			},
			solidarity: { exemption: 0, rate: 0, mitigationRate: 1 }
		};
		const before = structuredClone(custom);
		for (const [taxable, expected] of [
			[0, 0],
			[5, 5],
			[15, 10],
			[25, 11],
			[35, 19],
			[45, 42]
		]) {
			expect(deIncomeTax({ taxable }, custom).income).toBe(expected);
			expect(deIncomeTaxV2027({ taxable }, custom)).toStrictEqual(deIncomeTax({ taxable }, custom));
		}
		expect(custom).toStrictEqual(before);
	});
	it('accepts the maximum safe taxable income', () => {
		for (const year of [2027, 2028] as const)
			for (const split of [false, true]) {
				const result = deIncomeTax({ taxable: Number.MAX_SAFE_INTEGER }, year, { split });
				expect(Number.isFinite(result.total)).toBe(true);
				expect(result.income).toBe(
					statutoryDraftExpected({ year, taxable: Number.MAX_SAFE_INTEGER, split }).income
				);
				expect(result.rates.incomeMarginal).toBe(0.47);
			}
	});
	it('preserves half-up average rates, truncated marginal rates and cents, and component-rate addition', () => {
		const custom: DEIncomeTaxParametersV2027 = {
			...parameters,
			income: {
				...parameters.income,
				firstLinear: { upperBoundary: 249999, rate: 0.47005, subtrahend: 0 }
			}
		};
		// 47005 * .055 = 2585.275, truncated to 2585.27. The average
		// .47005 rounds up; the analytic .47005 truncates. Rounded rates sum to .496.
		expect(deIncomeTax({ taxable: 100000 }, custom)).toStrictEqual({
			income: 47005,
			solidarity: 2585.27,
			total: 49590.27,
			rates: { incomeMarginal: 0.47, incomeAverage: 0.4701, solidarity: 0.0259, total: 0.496 }
		});
	});
	it('floors half-income tax before doubling, not after', () => {
		// At half-income 100001 the tariff is 30758.69; doubling before flooring would give 61517.
		expect(deIncomeTax({ taxable: 200003.99 }, 2027, { split: true }).income).toBe(61516);
	});
	it('accepts very small positive fractional income without nonzero tax', () => {
		for (const year of [2027, 2028] as const) {
			expect(deIncomeTax({ taxable: 1e-7 }, year)).toStrictEqual({
				income: 0,
				solidarity: 0,
				total: 0,
				rates: { incomeMarginal: 0, incomeAverage: 0, solidarity: 0, total: 0 }
			});
		}
	});
	it('rejects a different parameter discriminant in the version-specific API', () => {
		expect(() =>
			deIncomeTaxV2027({ taxable: 50000 }, {
				...parameters,
				version: 'V2021'
			} as unknown as DEIncomeTaxParametersV2027)
		).toThrow(/Expected V2027/);
	});
	it('keeps public declarations additive and discriminated', () => {
		expectTypeOf<DEIncomeTaxSupportedYears>().toEqualTypeOf<
			2021 | 2022 | 2023 | 2024 | 2025 | 2026 | 2027 | 2028
		>();
		expectTypeOf<DEIncomeTaxSupportedYearsV2027>().toEqualTypeOf<2027 | 2028>();
		expectTypeOf<ParametersFromDE>().toEqualTypeOf<DEIncomeTaxParametersV2027>();
		expectTypeOf<
			Extract<DEIncomeTaxParameters, { version: 'V2021' }>
		>().toEqualTypeOf<DEIncomeTaxParametersV2021>();
		expectTypeOf<
			Extract<DEIncomeTaxParameters, { version: 'V2027' }>
		>().toEqualTypeOf<DEIncomeTaxParametersV2027>();
		expectTypeOf(deIncomeTaxV2027({ taxable: 50000 }, 2028)).toEqualTypeOf<DEIncomeTax>();
		const assertRejectedCalls = () => {
			// @ts-expect-error V2027 does not accept historical years.
			deIncomeTaxV2027({ taxable: 50000 }, 2026);
			// @ts-expect-error Future years are not supported.
			deIncomeTax({ taxable: 50000 }, 2029);
			// @ts-expect-error Built-in third linear parameters are readonly.
			deSupportedTaxParametersV2027[2028].income.thirdLinear.rate = 0.5;
		};
		expectTypeOf(assertRejectedCalls).toBeFunction();
	});
});
