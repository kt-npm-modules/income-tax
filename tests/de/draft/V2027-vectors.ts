import type { TaxCase } from '../bmf/cases.js';
import { taxCases } from '../bmf/cases.js';

export const draftRevision = {
	status: 'government-draft',
	source: 'https://dserver.bundestag.de/btd/21/082/2108235.pdf',
	document: 'BT-Drs. 21/8235',
	legislativeRevision: '2026-09-28',
	vectorRevision: '2026-10-31',
	articles: { 2027: 1, 2028: 2 },
	verification: 'Independent exact rational statutory calculation; not BMF-verified'
} as const;

// Independent transcription. Coefficients/subtrahends are integer hundredths,
// not imported from production parameters or calculated by the Decimal evaluator.
export const draftCoefficients = {
	2027: {
		allowance: 12564,
		firstQuadratic: 95224,
		constant: 99386,
		offsets: [1124173, 1874170, 2434168]
	},
	2028: {
		allowance: 12900,
		firstQuadratic: 101755,
		constant: 93008,
		offsets: [1130552, 1880549, 2440547]
	}
} as const;

/** Exact rational oracle. Expanded integer polynomials use a 10^10 denominator. */
export function statutoryDraftExpected(input: Pick<TaxCase, 'year' | 'taxable' | 'split'>) {
	if (input.year !== 2027 && input.year !== 2028)
		throw new Error('Draft vectors only cover 2027-2028');
	const p = draftCoefficients[input.year];
	const factor = input.split ? 2n : 1n;
	const [whole, fraction = ''] = String(input.taxable).split('.');
	const scale = 10n ** BigInt(fraction.length);
	const taxable = BigInt(whole + fraction);
	const x = taxable / (scale * factor);
	let taxNumerator = 0n;
	let marginalNumerator = 0n;
	const denominator = 10000000000n;
	if (x > BigInt(p.allowance) && x <= 17799n) {
		const d = x - BigInt(p.allowance);
		taxNumerator = BigInt(p.firstQuadratic) * d * d + 1400n * d * 1000000n;
		marginalNumerator = 2n * BigInt(p.firstQuadratic) * d + 1400n * 1000000n;
	} else if (x > 17799n && x <= 70600n) {
		const d = x - 17799n;
		taxNumerator = 17074n * d * d + 2397n * d * 1000000n + BigInt(p.constant) * 100000000n;
		marginalNumerator = 2n * 17074n * d + 2397n * 1000000n;
	} else if (x > 70600n) {
		const zone = x <= 249999n ? 0 : x <= 279999n ? 1 : 2;
		const percent = [42n, 45n, 47n][zone];
		taxNumerator = (percent * x - BigInt(p.offsets[zone])) * 100000000n;
		marginalNumerator = percent * 100000000n;
	}
	const income = (taxNumerator / denominator) * factor;
	const excess = income - 20350n * factor;
	// Standard and mitigation candidates have a 1000 denominator, then floor cents.
	const solidarityNumerator =
		excess <= 0n ? 0n : income * 55n < excess * 119n ? income * 55n : excess * 119n;
	const solidarityCents = solidarityNumerator / 10n;
	const roundedRate = (amountNumerator: bigint, amountDenominator: bigint) => {
		if (taxable === 0n) return 0n;
		const n = amountNumerator * scale * 10000n;
		const d = amountDenominator * taxable;
		return (2n * n + d) / (2n * d);
	};
	const incomeAverage = roundedRate(income, 1n);
	const solidarityRate = roundedRate(solidarityCents, 100n);
	return {
		income: Number(income),
		solidarity: Number(solidarityCents) / 100,
		total: Number(income * 100n + solidarityCents) / 100,
		rates: {
			incomeMarginal: Number(marginalNumerator / 1000000n) / 10000,
			incomeAverage: Number(incomeAverage) / 10000,
			solidarity: Number(solidarityRate) / 10000,
			total: Number(incomeAverage + solidarityRate) / 10000
		}
	};
}

/** Separate draft reference vectors, never written into the official fixture directory. */
export const draftReferenceVectors = taxCases
	.filter((input) => input.year === 2027 || input.year === 2028)
	.map((input) => ({ input, expected: statutoryDraftExpected(input) }));
