import { describe } from 'vitest';
import { BmfClient } from './bmf/client.js';
import { yearBoundaries } from './bmf/cases.js';
import { registerTaxCases } from './bmf/shared.js';

const client = new BmfClient();
// Discovery errors fail the run; only explicitly unavailable historical years skip.
const available = await client.availableYears();
for (const { year } of yearBoundaries) {
	const supported = available.includes(year);
	if (!supported)
		console.warn(
			`BMF live comparison unavailable: year ${year} is no longer offered; offline fixtures remain valid.`
		);
	describe.skipIf(!supported)(
		supported ? 'BMF live annual income tax' : `BMF year ${year} unavailable`,
		() => {
			registerTaxCases(year, async (input) => (await client.calculate(input)).expected);
		}
	);
}
