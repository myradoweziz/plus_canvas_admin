import { stocksApi } from './stocks'

export const api = {
	...stocksApi
} as const
