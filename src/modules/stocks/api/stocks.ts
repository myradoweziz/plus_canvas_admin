import { getTotal, request } from '@/shared'
import type { Stock } from '../types/stock'

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

async function listStocks(params: ListStocksParams): Promise<ListStocksResult> {
	const filteredParams = Object.fromEntries(
		Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
	)
	const response = await request({ url: STOCKS_URL, method: 'GET', params: filteredParams })
	const items = Array.isArray(response) ? response : response?.data || []

	return {
		items,
		total: getTotal(response, items.length)
	}
}

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
