import { request } from './request'

type SubresourceApiOptions<TItem, TPayload> = {
	baseUrl: string
	resourcePath: string
	normalize: (row: Record<string, unknown>) => TItem
	toPayload?: (item: TItem) => TPayload
}

export const createSubresourceApi = <TItem extends { id: number | null }, TPayload = Omit<TItem, 'id'>>(
	options: SubresourceApiOptions<TItem, TPayload>
) => {
	const collectionUrl = (parentId: number) => `${options.baseUrl}/${parentId}/${options.resourcePath}`
	const itemUrl = (parentId: number, itemId: number) => `${collectionUrl(parentId)}/${itemId}`

	const unwrapList = (response: unknown) => {
		return Array.isArray(response) ? response : (response as { data?: unknown[] })?.data || []
	}

	const list = async (parentId: number): Promise<TItem[]> => {
		const response = await request({ url: collectionUrl(parentId), method: 'GET' })
		return unwrapList(response).map((item) => options.normalize(item as Record<string, unknown>))
	}

	const create = async (parentId: number, item: TItem): Promise<TItem> => {
		const payload = options.toPayload ? options.toPayload(item) : (item as unknown as TPayload)
		const response = await request({
			url: collectionUrl(parentId),
			method: 'POST',
			data: payload as object
		})

		return options.normalize((response as { data?: Record<string, unknown> })?.data ?? (response as Record<string, unknown>))
	}

	const update = async (parentId: number, item: TItem): Promise<TItem> => {
		if (item.id == null) {
			throw new Error('Item id is required for update')
		}

		const payload = options.toPayload ? options.toPayload(item) : (item as unknown as TPayload)
		const response = await request({
			url: itemUrl(parentId, item.id),
			method: 'PUT',
			data: payload as object
		})

		return options.normalize((response as { data?: Record<string, unknown> })?.data ?? (response as Record<string, unknown>))
	}

	const remove = async (parentId: number, itemId: number): Promise<void> => {
		await request({ url: itemUrl(parentId, itemId), method: 'DELETE' })
	}

	return { list, create, update, remove }
}
