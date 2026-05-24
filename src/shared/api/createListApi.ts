import { getTotal, request } from '@/shared'

export const filterListParams = <T extends Record<string, unknown>>(params: T) =>
	Object.fromEntries(
		Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
	) as Partial<T>

type CreateListApiOptions<TItem> = {
	url: string
	normalize?: (row: Record<string, unknown>) => TItem
}

export const createListApi = <TItem, TParams extends { limit: number; offset: number }>(
	options: CreateListApiOptions<TItem>
) => {
	const normalize = options.normalize ?? ((row: Record<string, unknown>) => row as TItem)

	return async (params: TParams) => {
		const response = await request({
			url: options.url,
			method: 'GET',
			params: filterListParams(params as Record<string, unknown>)
		})

		const rawItems = Array.isArray(response) ? response : response?.data || []
		const items = rawItems.map((item: Record<string, unknown>) => normalize(item))

		return {
			items,
			total: getTotal(response, rawItems.length)
		}
	}
}
