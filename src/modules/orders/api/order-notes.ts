import { request } from '@/shared'
import type { OrderNote } from '../types'

const ordersUrl = (orderId: number) => `/api/admin/orders/${orderId}`

export type CreateOrderNotePayload = {
	note: string
	display_to_customer: boolean
	attached_file: string
}

const normalizeOrderNote = (row: Record<string, unknown>): OrderNote => ({
	id: Number(row.id ?? 0),
	order_id: Number(row.order_id ?? 0),
	note: String(row.note ?? ''),
	display_to_customer: Boolean(row.display_to_customer),
	attached_file: row.attached_file ? String(row.attached_file) : null,
	created_at: String(row.created_at ?? ''),
	updated_at: String(row.updated_at ?? '')
})

async function createOrderNote(orderId: number, data: CreateOrderNotePayload): Promise<OrderNote> {
	const response = await request({
		url: `${ordersUrl(orderId)}/notes`,
		method: 'POST',
		data
	})
	return normalizeOrderNote((response as { data?: Record<string, unknown> })?.data ?? (response as Record<string, unknown>))
}

async function deleteOrderNote(orderId: number, noteId: number): Promise<void> {
	await request({
		url: `${ordersUrl(orderId)}/notes/${noteId}`,
		method: 'DELETE'
	})
}

export const orderNotesApi = {
	createOrderNote,
	deleteOrderNote
}
