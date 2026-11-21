import { yearBoundaries } from './cases.js';
import { BmfYearUnavailableError } from './client.js';
import type { BmfClient } from './client.js';

/** Only a successfully parsed form may mark a registered year unavailable. */
export async function discoverLiveYears(client: BmfClient) {
	const available = await client.availableYears();
	return yearBoundaries.map((entry) => ({
		...entry,
		available: available.includes(entry.year),
		diagnostic: available.includes(entry.year)
			? undefined
			: `BMF live comparison unavailable: year ${entry.year} ${
					entry.hasOfficialFixtures
						? 'is no longer offered; offline fixtures remain valid'
						: 'is not yet offered; draft statutory vectors are not BMF verification'
				}.`
	}));
}

export function parseFixtureYear(args: string[]): number | undefined {
	if (args.length === 0) return undefined;
	if (args.length !== 1 || !/^--year=\d{4}$/.test(args[0])) {
		throw new Error('Usage: npm run bmf:update-fixtures -- [--year=2021..2028]');
	}
	const year = Number(args[0].slice('--year='.length));
	if (!yearBoundaries.some((entry) => entry.year === year))
		throw new Error(`Unsupported fixture year: ${year}`);
	return year;
}

/** Defaults preserve the approved stored-year set; new years require explicit capture. */
export async function selectFixtureYears(client: BmfClient, selectedYear?: number) {
	const entries = yearBoundaries.filter((entry) =>
		selectedYear === undefined ? entry.hasOfficialFixtures : entry.year === selectedYear
	);
	if (!entries.length) throw new Error(`Unsupported fixture year: ${selectedYear}`);
	const available = await client.availableYears();
	for (const { year } of entries) {
		if (!available.includes(year))
			throw new BmfYearUnavailableError(`Cannot capture BMF fixtures: year ${year} is unavailable`);
	}
	return entries;
}
