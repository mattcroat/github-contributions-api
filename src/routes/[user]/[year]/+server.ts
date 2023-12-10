import { json } from '@sveltejs/kit'
import { parseHTML } from 'linkedom'
import type { RouteParams } from './$types.js'

type Contribution = {
	count: number
	month: string
	day: number
	level: number
} | null

export async function GET({ params, setHeaders }) {
	const year = 60 * 60 * 24 * 365

	// https://vercel.com/docs/edge-network/caching#cdn-cache-control
	setHeaders({
		'Access-Control-Allow-Origin': '*',
		'Cache-Control': `public, s-maxage=${year}`,
		'CDN-Cache-Control': `public, s-maxage=${year}`,
		'Vercel-CDN-Cache-Control': `public, s-maxage=${year}`,
	})

	const html = await getContributions(params)
	return json(parseContributions(html))
}

async function getContributions({ user, year }: RouteParams) {
	let api = `https://github.com/users/${user}/contributions?from=${year}-12-01&to=${year}-12-31`

	const isCurrentYear = new Date().getFullYear().toString() === year

	if (isCurrentYear) {
		const date = new Date().toLocaleDateString('en-CA')
		const month = date.split('-')[1]
		api = `https://github.com/users/${user}/contributions?from=${year}-${month}-01&to=${date}`
	}

	try {
		const response = await fetch(api)

		if (!response.ok) {
			throw new Error(`Failed to fetch: ${response.status}`)
		}

		return await response.text()
	} catch (e) {
		throw new Error(`Something went wrong: ${e}`)
	}
}

function parseContributions(html: string) {
	const { document } = parseHTML(html)

	const days = document.querySelectorAll<Element>('tool-tip')

	const contributions: Contribution[][] = [
		[], // Sundays
		[], // Mondays
		[], // Tuesdays
		[], // Wednesdays
		[], // Thursdays
		[], // Fridays
		[], // Saturdays
	]

	for (const [_, day] of days.entries()) {
		const data = day.innerHTML.split(' ')

		const forDayRaw = day.getAttribute('for')
		if (!forDayRaw) continue

		const forDay = forDayRaw.replace('contribution-day-component-', '')
		const [weekday, week] = forDay.split('-').map(Number)

		if (data.length > 1) {
			const td = document.getElementById(forDayRaw)
			if (!td) continue

			const level = td.dataset.level || '0'
			const contribution = {
				count: data[0] === 'No' ? 0 : +data[0],
				month: data[3],
				day: +data[4].replace(/(st|nd|rd|th)/, ''),
				level: +level,
			}
			contributions[weekday][week] = contribution
		}
	}

	return contributions
}
