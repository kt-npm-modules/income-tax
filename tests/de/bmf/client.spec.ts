import { afterEach, describe, expect, it, vi } from 'vitest';
import type * as Vitest from 'vitest';
import type { registerTaxCases } from './shared.js';
import { BmfClient, BmfYearUnavailableError, BMF_URL } from './client.js';
import { discoverLiveYears, parseFixtureYear, selectFixtureYears } from './availability.js';
import { taxCases, yearBoundaries } from './cases.js';
import { loadFixtures } from './fixtures.js';

vi.mock('node:timers/promises', () => ({ setTimeout: vi.fn().mockResolvedValue(undefined) }));

function form(years: number[]) {
	return `<form id="bmf_form_ekst"><input name="javax.faces.ViewState" value="state&amp;token" />
		<select name="bmf_form_ekst:ekst_bj">${years.map((year) => `<option value="${year}">${year}</option>`).join('')}</select></form>`;
}

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	vi.doUnmock('vitest');
	vi.doUnmock('./shared.js');
	vi.doUnmock('./client.js');
	vi.resetModules();
});

describe('BMF successful discovery and explicit availability policy', () => {
	it('distinguishes implemented, stored-official and currently available years', async () => {
		const client = new BmfClient();
		vi.spyOn(client, 'request').mockResolvedValue(form([2026]));
		const years = await discoverLiveYears(client);
		expect(years).toHaveLength(8);
		expect(years.find((entry) => entry.year === 2021)).toMatchObject({
			available: false,
			hasOfficialFixtures: true,
			diagnostic: expect.stringContaining('no longer offered')
		});
		expect(years.find((entry) => entry.year === 2026)).toMatchObject({
			available: true,
			hasOfficialFixtures: true,
			diagnostic: undefined
		});
		for (const entry of yearBoundaries.filter((entry) => entry.year >= 2027))
			expect(years.find((row) => row.year === entry.year)).toMatchObject({
				available: false,
				hasOfficialFixtures: entry.hasOfficialFixtures,
				diagnostic: expect.stringContaining(
					entry.hasOfficialFixtures ? 'no longer offered' : 'not yet offered'
				)
			});
	});
	it.each([2027, 2028])(
		'discovers available V2027 year %s independently of stored fixtures',
		async (year) => {
			const client = new BmfClient();
			vi.spyOn(client, 'request').mockResolvedValue(form([2026, year]));
			const discovered = await discoverLiveYears(client);
			expect(discovered.find((entry) => entry.year === year)).toMatchObject({
				available: true,
				hasOfficialFixtures: yearBoundaries.find((entry) => entry.year === year)!
					.hasOfficialFixtures,
				diagnostic: undefined
			});
			expect(taxCases.filter((input) => input.year === year).length).toBeGreaterThan(150);
		}
	);
	it('never turns a discovery network error into unavailable years', async () => {
		const client = new BmfClient();
		vi.spyOn(client, 'request').mockRejectedValue(new Error('Network failure'));
		await expect(discoverLiveYears(client)).rejects.toThrow('Network failure');
	});
	it.each([
		'<html>Maintenance</html>',
		'<form id="bmf_form_ekst"></form>',
		form([]),
		form([2026]).replace('value="state&amp;token"', 'value=""'),
		form([2026]).replace('name="bmf_form_ekst:ekst_bj"', 'name="unexpected"')
	])('fails discovery for malformed form %s', async (html) => {
		const client = new BmfClient();
		vi.spyOn(client, 'request').mockResolvedValue(html);
		await expect(discoverLiveYears(client)).rejects.toThrow();
	});
	it('fails if an available year disappears during active comparisons, without retry/POST', async () => {
		const client = new BmfClient();
		const request = vi
			.spyOn(client, 'request')
			.mockResolvedValueOnce(form([2028]))
			.mockResolvedValueOnce(form([2026]));
		expect((await discoverLiveYears(client)).find((entry) => entry.year === 2028)?.available).toBe(
			true
		);
		const input = taxCases.find((input) => input.year === 2028)!;
		await expect(client.calculate(input)).rejects.toBeInstanceOf(BmfYearUnavailableError);
		expect(request).toHaveBeenCalledTimes(2);
	});
});

/** Collect live registrations without running comparison requests or Vitest groups. */
async function mockLiveRegistration(html: string | Error) {
	const vitest = await vi.importActual<typeof Vitest>('vitest');
	const register = vi.fn<typeof registerTaxCases>();
	const skipIf = vi.fn((skip: boolean) => (_name: string, body: () => void) => {
		if (!skip) body();
	});
	const request = vi.spyOn(BmfClient.prototype, 'request');
	if (html instanceof Error) request.mockRejectedValue(html);
	else request.mockResolvedValue(html);
	vi.spyOn(console, 'warn').mockImplementation(() => {});
	vi.stubGlobal(
		'fetch',
		vi.fn(() => {
			throw new Error('Unexpected unmocked BMF request');
		})
	);
	vi.resetModules();
	vi.doMock('vitest', () => ({ ...vitest, describe: { skipIf } }));
	vi.doMock('./client.js', () => ({ BmfClient, BmfYearUnavailableError, BMF_URL }));
	vi.doMock('./shared.js', () => ({ registerTaxCases: register }));
	return { register, skipIf, request };
}

describe('Version-specific live suite registration (offline mocks)', () => {
	it('V2021 never registers V2027 years, even when the form offers both versions', async () => {
		const { register, request } = await mockLiveRegistration(form([2026, 2027, 2028]));
		await import('../V2021-live.spec.js');
		expect(register.mock.calls.map(([year]) => year)).toStrictEqual([2026]);
		expect(request).toHaveBeenCalledTimes(1);
	});
	it('V2027 explicitly skips both unavailable years and never registers historical years', async () => {
		const { register, skipIf } = await mockLiveRegistration(form([2026]));
		await import('../V2027-live.spec.js');
		expect(register).not.toHaveBeenCalled();
		expect(skipIf.mock.calls).toStrictEqual([[true], [true]]);
		for (const year of [2027, 2028])
			expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(`year ${year}`));
	});
	it('V2027 activates both years from live availability independently of stored fixtures', async () => {
		const { register, skipIf } = await mockLiveRegistration(form([2026, 2027, 2028]));
		await import('../V2027-live.spec.js');
		expect(register.mock.calls.map(([year]) => year)).toStrictEqual([2027, 2028]);
		expect(skipIf.mock.calls).toStrictEqual([[false], [false]]);
	});
	it.each([new Error('Network failure'), '<html>Malformed form</html>'])(
		'V2027 discovery errors fail suite loading instead of skipping',
		async (response) => {
			const { register, skipIf } = await mockLiveRegistration(response);
			await expect(import('../V2027-live.spec.js')).rejects.toThrow();
			expect(register).not.toHaveBeenCalled();
			expect(skipIf).not.toHaveBeenCalled();
		}
	);
	it('a disappearing year fails the registered V2027 comparison provider', async () => {
		const { register, request } = await mockLiveRegistration(form([2027]));
		await import('../V2027-live.spec.js');
		request.mockResolvedValue(form([2026]));
		const [year, expectedFor] = register.mock.calls[0];
		const input = taxCases.find((input) => input.year === year)!;
		await expect(expectedFor(input)).rejects.toBeInstanceOf(BmfYearUnavailableError);
	});
});

describe('BMF comparison failures and session exchange', () => {
	const input = taxCases.find((input) => input.id === '2026-single-50000.00')!;
	const html = loadFixtures(2026).html[input.id];
	it('posts the discovered year, amount, splitting and decoded JSF state', async () => {
		const client = new BmfClient();
		const request = vi
			.spyOn(client, 'request')
			.mockResolvedValueOnce(form([2026]))
			.mockResolvedValueOnce(html);
		const result = await client.calculate(input);
		expect(result.expected).toStrictEqual(
			loadFixtures(2026).fixture.records.find((row) => row.input.id === input.id)?.expected
		);
		expect(Number.isFinite(Date.parse(result.retrievedAt))).toBe(true);
		const init = request.mock.calls[1][1]!;
		expect(init.method).toBe('POST');
		expect(init.body).toBeInstanceOf(URLSearchParams);
		const body = init.body as URLSearchParams;
		expect(body.get('bmf_form_ekst:ekst_bj')).toBe('2026');
		expect(body.get('bmf_form_ekst:ekst_zve')).toBe('50000,00');
		expect(body.get('bmf_form_ekst:ekst_pv')).toBe('false');
		expect(body.get('javax.faces.ViewState')).toBe('state&token');
	});
	it('retries one complete session after a transient failure', async () => {
		const client = new BmfClient();
		const request = vi
			.spyOn(client, 'request')
			.mockRejectedValueOnce(new Error('Transient'))
			.mockResolvedValueOnce(form([2026]))
			.mockResolvedValueOnce(html);
		await expect(client.calculate(input)).resolves.toHaveProperty('expected.income', 10548);
		expect(request).toHaveBeenCalledTimes(3);
	});
	it('persistent network failures fail instead of skipping', async () => {
		const client = new BmfClient();
		const request = vi.spyOn(client, 'request').mockRejectedValue(new Error('Offline'));
		await expect(client.calculate(input)).rejects.toThrow('Offline');
		expect(request).toHaveBeenCalledTimes(2);
	});
	it.each(['<html>No result</html>', html.replace('id="ekst_result_bj"', 'id="wrong_id"')])(
		'persistent parser errors fail instead of skipping',
		async (response) => {
			const client = new BmfClient();
			const request = vi
				.spyOn(client, 'request')
				.mockResolvedValueOnce(form([2026]))
				.mockResolvedValueOnce(response)
				.mockResolvedValueOnce(form([2026]))
				.mockResolvedValueOnce(response);
			await expect(client.calculate(input)).rejects.toThrow();
			expect(request).toHaveBeenCalledTimes(4);
		}
	);
	it('does not suppress a numerical mismatch in comparison assertions', async () => {
		const client = new BmfClient();
		vi.spyOn(client, 'request')
			.mockResolvedValueOnce(form([2026]))
			.mockResolvedValueOnce(html);
		const result = await client.calculate(input);
		expect(() =>
			expect(result.expected).toStrictEqual({
				...result.expected,
				income: result.expected.income + 1
			})
		).toThrow();
	});
});

describe('BMF transport guards', () => {
	it('keeps cookies and follows same-origin redirects', async () => {
		const fetchMock = vi
			.fn<typeof fetch>()
			.mockResolvedValueOnce(
				new Response(null, {
					status: 302,
					headers: { location: '/ekst/next', 'set-cookie': 'session=123; Path=/' }
				})
			)
			.mockResolvedValueOnce(
				new Response(form([2026]), { headers: { 'content-type': 'text/html' } })
			);
		vi.stubGlobal('fetch', fetchMock);
		const client = new BmfClient();
		expect(await client.availableYears()).toStrictEqual([2026]);
		expect(fetchMock.mock.calls[1][0]).toBe('https://www.bmf-steuerrechner.de/ekst/next');
		expect(fetchMock.mock.calls[1][1]?.headers).toMatchObject({ Cookie: 'session=123' });
	});
	it.each([
		new Response(null, { status: 503 }),
		new Response('{}', { headers: { 'content-type': 'application/json' } }),
		new Response(null, { status: 302 }),
		new Response(null, { status: 302, headers: { location: 'https://example.com/' } })
	])('fails invalid HTTP/content/redirect responses', async (response) => {
		vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(response));
		await expect(new BmfClient().request(BMF_URL)).rejects.toThrow();
	});
	it('fails redirect loops', async () => {
		const fetchMock = vi
			.fn<typeof fetch>()
			.mockImplementation(
				async () => new Response(null, { status: 307, headers: { location: BMF_URL } })
			);
		vi.stubGlobal('fetch', fetchMock);
		await expect(new BmfClient().request(BMF_URL)).rejects.toThrow('Too many BMF redirects');
		expect(fetchMock).toHaveBeenCalledTimes(5);
	});
});

describe('Explicit fixture capture selection (no capture performed)', () => {
	it.each([2027, 2028])('accepts --year=%s but fails clearly if unavailable', async (year) => {
		expect(parseFixtureYear([`--year=${year}`])).toBe(year);
		const client = new BmfClient();
		vi.spyOn(client, 'request').mockResolvedValue(form([2026]));
		await expect(selectFixtureYears(client, year)).rejects.toThrow(`year ${year} is unavailable`);
	});
	it('permits future official capture once either new year is offered', async () => {
		const client = new BmfClient();
		vi.spyOn(client, 'request').mockResolvedValue(form([2027, 2028]));
		for (const year of [2027, 2028])
			expect((await selectFixtureYears(client, year)).map((entry) => entry.year)).toStrictEqual([
				year
			]);
	});
	it('defaults only to approved stored years even if draft years become available', async () => {
		const client = new BmfClient();
		vi.spyOn(client, 'request').mockResolvedValue(
			form([2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028])
		);
		expect(parseFixtureYear([])).toBeUndefined();
		expect((await selectFixtureYears(client)).map((entry) => entry.year)).toStrictEqual(
			yearBoundaries.filter((entry) => entry.hasOfficialFixtures).map((entry) => entry.year)
		);
	});
	it('fails default capture when a historical year is no longer offered', async () => {
		const client = new BmfClient();
		vi.spyOn(client, 'request').mockResolvedValue(form([2026]));
		await expect(selectFixtureYears(client)).rejects.toBeInstanceOf(BmfYearUnavailableError);
	});
	it('does not hide network or parser errors in capture selection', async () => {
		const client = new BmfClient();
		vi.spyOn(client, 'request').mockRejectedValue(new Error('Outage'));
		await expect(selectFixtureYears(client, 2027)).rejects.toThrow('Outage');
	});
	it.each([
		{ args: ['--year=2029'] },
		{ args: ['--year=2027', '--year=2028'] },
		{ args: ['2027'] },
		{ args: ['--year=NaN'] }
	])('rejects invalid arguments $args', ({ args }) => {
		expect(() => parseFixtureYear(args)).toThrow();
	});
});
