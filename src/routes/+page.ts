import { error } from '@sveltejs/kit'

export async function load({ fetch }) {
	try {
		const response = await fetch('mattcroat/2022')

		if (!response.ok) {
			throw new Error(`Failed to fetch: ${response.status}`)
		}

		return { contributions: await response.json() }
	} catch (e) {
		throw error(500, 'Something went wrong.')
	}
}
