import { setTimeout as delay } from 'node:timers/promises';
import { Decimal } from 'decimal.js';
import type { DEIncomeTax } from '../../../src/de/_common/types.js';
import type { TaxCase } from './cases.js';

export type BmfExpected = DEIncomeTax;

export const BMF_URL = 'https://www.bmf-steuerrechner.de/ekst/eingabeformekst.xhtml';

export class BmfYearUnavailableError extends Error {}

function decode(text: string) {
	return text
		.replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
		.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
		.replace(
			/&(amp|quot|apos|nbsp|lt|gt);/g,
			(_, name) =>
				(
					({ amp: '&', quot: '"', apos: "'", nbsp: ' ', lt: '<', gt: '>' }) as Record<
						string,
						string
					>
				)[name]
		);
}
function plain(text: string) {
	return decode(text.replace(/<[^>]*>/g, ' '))
		.replace(/[\u200b\u00ad]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}
function element(html: string, attribute: string, value: string) {
	const matches = [
		...html.matchAll(
			new RegExp(
				`<([a-z][a-z0-9]*)\\b[^>]*\\b${attribute}="${value}"[^>]*>([\\s\\S]*?)<\\/\\1>`,
				'gi'
			)
		)
	];
	if (matches.length !== 1)
		throw new Error(
			`Expected exactly one BMF element ${attribute}=${value}, found ${matches.length}`
		);
	return plain(matches[0][2]);
}
function germanNumber(value: string) {
	if (!/^-?\d[\d.]*,\d{2}(?: (?:Euro|%))?$/.test(value))
		throw new Error(`Unexpected BMF number: ${value}`);
	return Number(
		value
			.replaceAll('.', '')
			.replace(',', '.')
			.replace(/ (Euro|%)$/, '')
	);
}
export function parseBmfResult(html: string, input: TaxCase): BmfExpected {
	const year = Number(element(html, 'id', 'ekst_result_bj'));
	const taxable = germanNumber(element(html, 'id', 'ekst_result_zve'));
	const status = element(html, 'id', 'ekst_result_pv');
	if (
		year !== input.year ||
		taxable !== input.taxable ||
		(input.split ? !/verheiratet|verpartnert/.test(status) : status !== 'alleinstehend')
	)
		throw new Error(`BMF echoed different inputs for ${input.id}`);
	const cell = (row: string, column: string) =>
		germanNumber(element(html, 'headers', `${row} ${column}`));
	const income = cell('ekst_best_table_r_ekst', 'ekst_best_table_betrag');
	const solidarity = cell('ekst_best_table_soli', 'ekst_best_table_betrag');
	const total = cell('ekst_best_table_summe', 'ekst_best_table_betrag');
	if (Math.round(total * 100) !== Math.round(income * 100) + Math.round(solidarity * 100))
		throw new Error(`Inconsistent BMF total for ${input.id}`);
	return {
		income,
		solidarity,
		total,
		rates: {
			incomeAverage: new Decimal(cell('ekst_best_table_r_ekst', 'ekst_best_table_db'))
				.div(100)
				.toNumber(),
			incomeMarginal: new Decimal(cell('ekst_best_table_r_ekst', 'ekst_best_table_gb'))
				.div(100)
				.toNumber(),
			solidarity: new Decimal(cell('ekst_best_table_soli', 'ekst_best_table_db'))
				.div(100)
				.toNumber(),
			total: new Decimal(cell('ekst_best_table_summe', 'ekst_best_table_db')).div(100).toNumber()
		}
	};
}

/** Preserve the unmodified result section, excluding navigation and random JSF state. */
export function extractBmfResultHtml(html: string): string {
	const start = html.indexOf('<div class="ekst_ergebnis">');
	const end = html.indexOf('</table>', start);
	if (start < 0 || end < 0) throw new Error('BMF result section is missing');
	return html.slice(start, end + '</table>'.length);
}

export class BmfClient {
	cookies = new Map<string, string>();
	years: number[] | undefined;
	async request(url: string, init: RequestInit = {}): Promise<string> {
		for (let redirects = 0; redirects <= 4; redirects++) {
			await delay(100);
			const response = await fetch(url, {
				...init,
				redirect: 'manual',
				signal: AbortSignal.timeout(20000),
				headers: {
					...init.headers,
					Cookie: [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; ')
				}
			});
			for (const cookie of response.headers.getSetCookie()) {
				const pair = cookie.split(';')[0];
				const equals = pair.indexOf('=');
				this.cookies.set(pair.slice(0, equals), pair.slice(equals + 1));
			}
			if ([301, 302, 303, 307, 308].includes(response.status)) {
				const location = response.headers.get('location');
				if (!location) throw new Error('BMF redirect has no location');
				url = new URL(location, url).href;
				if (new URL(url).origin !== new URL(BMF_URL).origin)
					throw new Error('Unexpected BMF redirect origin');
				if ([301, 302, 303].includes(response.status)) init = {};
				continue;
			}
			if (!response.ok) throw new Error(`BMF HTTP ${response.status}`);
			if (!response.headers.get('content-type')?.includes('text/html'))
				throw new Error('BMF did not return HTML');
			return response.text();
		}
		throw new Error('Too many BMF redirects');
	}
	async form() {
		const html = await this.request(BMF_URL);
		const form = /<form\b[^>]*id="bmf_form_ekst"[\s\S]*?<\/form>/.exec(html)?.[0];
		if (!form) throw new Error('BMF income-tax form not found');
		const state = /name="javax.faces.ViewState"[^>]*value="([^"]+)"/.exec(form)?.[1];
		const select = /<select\b[^>]*name="bmf_form_ekst:ekst_bj"[^>]*>([\s\S]*?)<\/select>/.exec(
			form
		)?.[1];
		if (!state || !select) throw new Error('BMF view state or year selector missing');
		this.years = [...select.matchAll(/<option\b[^>]*value="(\d{4})"/g)].map((x) => Number(x[1]));
		if (!this.years.length) throw new Error('BMF returned no available years');
		return decode(state);
	}
	async availableYears() {
		await this.form();
		return this.years!;
	}
	async calculate(input: TaxCase) {
		// Retry the whole form/session exchange, never turn an outage into a skipped test.
		for (let attempt = 0; ; attempt++) {
			try {
				const state = await this.form();
				if (!this.years?.includes(input.year))
					throw new BmfYearUnavailableError(`BMF no longer offers ${input.year}`);
				const body = new URLSearchParams({
					bmf_form_ekst: 'bmf_form_ekst',
					'bmf_form_ekst:ekst_zve': input.taxable.toFixed(2).replace('.', ','),
					'bmf_form_ekst:ekst_pv': String(input.split),
					'bmf_form_ekst:ekst_bj': String(input.year),
					'bmf_form_ekst:income_ekst': 'Berechnen',
					'javax.faces.ViewState': state
				});
				const html = await this.request(BMF_URL, {
					method: 'POST',
					body,
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
				});
				return {
					expected: parseBmfResult(html, input),
					html: extractBmfResultHtml(html),
					retrievedAt: new Date().toISOString()
				};
			} catch (error) {
				if (error instanceof BmfYearUnavailableError || attempt >= 1) throw error;
				await delay(1000);
			}
		}
	}
}
