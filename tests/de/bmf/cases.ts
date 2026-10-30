import type { DEIncomeTaxSupportedYearsV2021 } from '../../../src/de/V2021/types.js';

export type TaxCase = {
	id: string;
	year: DEIncomeTaxSupportedYearsV2021;
	taxable: number;
	split: boolean;
};

// Independent case-selection data from the final BMF annual tariffs (docs/plan.md).
// Never derive test inputs or expected amounts from the production calculator.
export const yearBoundaries = [
	{ year: 2021, boundaries: [9744, 14753, 57918, 274612], exemption: 16956, subtrahend: 9136.63 },
	{ year: 2022, boundaries: [10347, 14926, 58596, 277825], exemption: 16956, subtrahend: 9336.45 },
	{ year: 2023, boundaries: [10908, 15999, 62809, 277825], exemption: 17543, subtrahend: 9972.98 },
	{ year: 2024, boundaries: [11784, 17005, 66760, 277825], exemption: 18130, subtrahend: 10636.31 },
	{ year: 2025, boundaries: [12096, 17443, 68480, 277825], exemption: 19950, subtrahend: 10911.92 },
	{ year: 2026, boundaries: [12348, 17799, 69878, 277825], exemption: 20350, subtrahend: 11135.63 }
] as const;

export const taxCases: TaxCase[] = [];
for (const { year, boundaries, exemption, subtrahend } of yearBoundaries) {
	for (const split of [false, true]) {
		const factor = split ? 2 : 1;
		const incomes = new Set([
			0,
			0.01,
			0.99,
			1,
			50000 * factor,
			50000.99 * factor,
			500000 * factor,
			1000000 * factor
		]);
		let lower = 0;
		for (const boundary of boundaries) {
			for (let offset = -4; offset <= 4; offset++) incomes.add(boundary * factor + offset);
			incomes.add(Math.floor((lower + boundary) / 2) * factor);
			incomes.add(boundary * factor + 0.99);
			incomes.add(boundary * factor + 1.01);
			lower = boundary;
		}
		// Select zvE around the first positive Soli and the full-rate crossover.
		const firstSoliTax = exemption + 1;
		const fullSoliTax = Math.ceil((exemption * 0.119) / (0.119 - 0.055));
		for (const tax of [firstSoliTax, fullSoliTax]) {
			const boundary = Math.ceil((tax + subtrahend) / 0.42) * factor;
			for (let offset = -4; offset <= 4; offset++) incomes.add(boundary + offset);
		}
		// Counterexamples to the former preceding-zone accumulation.
		for (const income of year === 2021
			? [14899, 15635, 18557, 96821]
			: year === 2025
				? [17480, 17684, 17792, 68483, 277828]
				: [])
			incomes.add(income * factor);
		for (const taxable of [...incomes].sort((a, b) => a - b)) {
			taxCases.push({
				id: `${year}-${split ? 'split' : 'single'}-${taxable.toFixed(2)}`,
				year,
				taxable,
				split
			});
		}
	}
}
