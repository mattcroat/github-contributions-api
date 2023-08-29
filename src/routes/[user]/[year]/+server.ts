import { json } from '@sveltejs/kit'
// import { parseHTML } from 'linkedom'
import type { RouteParams } from './$types.js'

export async function GET({ params, setHeaders }) {
	const year = 60 * 60 * 24 * 365

	// https://vercel.com/docs/edge-network/caching#cdn-cache-control
	setHeaders({
		'Access-Control-Allow-Origin': '*',
		'Cache-Control': `public, s-maxage=${year}`,
		'CDN-Cache-Control': `public, s-maxage=${year}`,
		'Vercel-CDN-Cache-Control': `public, s-maxage=${year}`,
	})

	return json('test')

	// const html = await getContributions(params)
	// return json(parseContributions(html))
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

	const rows = document.querySelectorAll<HTMLTableRowElement>('tbody > tr')

	const contributions = []

	for (const row of rows) {
		const days = row.querySelectorAll<HTMLTableCellElement>('td:not(.ContributionCalendar-label)')

		const currentRow = []

		for (const day of days) {
			const data = day.innerText.split(' ')

			if (data.length > 1) {
				const contribution = {
					count: data[0] === 'No' ? 0 : +data[0],
					name: data[3].replace(',', ''),
					month: data[4],
					day: +data[5].replace(',', ''),
					year: +data[6],
					level: +day.dataset.level!,
				}
				currentRow.push(contribution)
			} else {
				currentRow.push(null)
			}
		}

		contributions.push(currentRow)
	}

	return contributions
}
