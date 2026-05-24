import { request } from '@/shared'
import { createListApi } from '@/shared/api/createListApi'
import type { Stock } from '../types'

const STOCKS_URL = '/api/admin/stocks'

export type ListStocksParams = {
	title?: string
	limit: number
	offset: number
}

export type ListStocksResult = {
	items: Stock[]
	total: number
}

const listStocks = createListApi<Stock, ListStocksParams>({ url: STOCKS_URL })

async function createStock(data: Stock): Promise<Stock> {
	return await request({ url: STOCKS_URL, method: 'POST', data })
}

async function updateStock(data: Stock): Promise<Stock> {
	return await request({
		url: `${STOCKS_URL}/${data.id}`,
		method: 'PUT',
		data
	})
}

async function deleteStock(id: number): Promise<void> {
	await request({ url: `${STOCKS_URL}/${id}`, method: 'DELETE' })
}

type ReorderStocksPayload = {
	items: Array<{
		id: number
		order: number
	}>
}

async function reorderStocks(data: ReorderStocksPayload): Promise<Stock[]> {
	return await request({ url: `${STOCKS_URL}/reorder`, method: 'POST', data })
}

export const stocksApi = {
	listStocks,
	createStock,
	updateStock,
	deleteStock,
	reorderStocks
}
