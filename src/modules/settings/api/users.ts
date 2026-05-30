import { downloadBlob, downloadTextFile } from '@/composables'
import { getTotal, request } from '@/shared'
import { filterListParams } from '@/shared/api/createListApi'
import type { Order } from '@/modules/orders/types'
import type { SendUserEmailPayload, SendUserMessagePayload, User, UserPayload } from '../types/user'

const USERS_URL = '/api/admin/users'

export type ListUsersParams = {
	first_name?: string
	last_name?: string
	email?: string
	phone_number?: string
	role_type?: string
	limit: number
	offset: number
}

export type ListUsersResult = {
	items: User[]
	total: number
}

export type ExportUsersParams = {
	ids: number[]
}

type RoleItem = string | { name?: string | null }

const toRoleNames = (items: RoleItem[] | null | undefined): string[] => {
	if (!Array.isArray(items)) return []
	return items
		.map((item) => (typeof item === 'string' ? item : item.name))
		.filter((name): name is string => typeof name === 'string' && name.length > 0)
}

const normalizeUser = (item: any): User => ({
	id: item?.id ?? null,
	name: item?.name ?? '',
	first_name: item?.first_name ?? '',
	last_name: item?.last_name ?? '',
	admin_comment: item?.admin_comment ?? '',
	is_tax_exempt: item?.is_tax_exempt ?? false,
	email: item?.email ?? '',
	phone_number: item?.phone_number ?? '',
	is_active: item?.is_active ?? true,
	created_at: item?.created_at ?? '',
	last_activity_at: item?.last_activity_at ?? item?.last_activity ?? item?.last_login_at ?? '',
	roles: toRoleNames(item?.roles)
})

const buildPayload = (user: User): UserPayload => {
	const payload: UserPayload = {
		name: user.name.trim(),
		first_name: user.first_name?.trim() || '',
		last_name: user.last_name?.trim() || '',
		admin_comment: user.admin_comment?.trim() || '',
		is_tax_exempt: !!user.is_tax_exempt,
		email: user.email.trim(),
		is_active: !!user.is_active,
		roles: user.roles
	}

	const phone = user.phone_number?.trim()
	if (phone) payload.phone_number = phone

	if (user.password) {
		payload.password = user.password
		payload.password_confirmation = user.password_confirmation || ''
	}

	return payload
}

async function listUsers(params: ListUsersParams): Promise<ListUsersResult> {
	const filteredParams = Object.fromEntries(
		Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
	)
	const response = await request({ url: USERS_URL, method: 'GET', params: filteredParams })
	const rawItems = Array.isArray(response) ? response : response?.data || []
	const items = Array.isArray(rawItems) ? rawItems.map(normalizeUser) : []

	return {
		items,
		total: getTotal(response, items.length)
	}
}

async function getUser(id: number): Promise<User> {
	const response = await request({ url: `${USERS_URL}/${id}`, method: 'GET' })
	return normalizeUser(response?.data ?? response)
}

async function createUser(user: User): Promise<User> {
	return await request({ url: USERS_URL, method: 'POST', data: buildPayload(user) })
}

async function updateUser(user: User): Promise<User> {
	return await request({ url: `${USERS_URL}/${user.id}`, method: 'PUT', data: buildPayload(user) })
}

async function deleteUser(id: number): Promise<void> {
	await request({ url: `${USERS_URL}/${id}`, method: 'DELETE' })
}

async function sendUserEmail(id: number, payload: SendUserEmailPayload): Promise<void> {
	await request({
		url: `${USERS_URL}/${id}/send-email`,
		method: 'POST',
		data: {
			subject: payload.subject.trim(),
			message: payload.message.trim()
		}
	})
}

async function sendUserMessage(id: number, payload: SendUserMessagePayload): Promise<void> {
	await request({
		url: `${USERS_URL}/${id}/send-message`,
		method: 'POST',
		data: {
			subject: payload.subject.trim(),
			message: payload.message.trim()
		}
	})
}

const normalizeUserOrder = (item: any): Order => ({
	...(item as Order),
	items: Array.isArray(item?.items) ? item.items : []
})

async function getUserOrders(id: number): Promise<Order[]> {
	const response = await request({ url: `${USERS_URL}/${id}/orders`, method: 'GET' })
	const rawItems = Array.isArray(response) ? response : response?.data || []
	return Array.isArray(rawItems) ? rawItems.map(normalizeUserOrder) : []
}

const exportParams = (params?: ExportUsersParams) => filterListParams((params ?? {}) as Record<string, unknown>)

async function exportUsersXml(params?: ExportUsersParams): Promise<void> {
	const response = await request({
		url: `${USERS_URL}/export/xml`,
		method: 'GET',
		params: exportParams(params),
		headers: { Accept: 'application/xml, text/xml' },
		responseType: 'text'
	})

	const xml =
		typeof response === 'string'
			? response
			: typeof (response as { data?: string })?.data === 'string'
				? (response as { data: string }).data
				: ''

	if (!xml.trim()) {
		throw new Error('Пустой ответ XML')
	}

	downloadTextFile(xml, 'users.xml', 'application/xml;charset=utf-8')
}

async function exportUsersExcel(params?: ExportUsersParams): Promise<void> {
	const response = await request({
		url: `${USERS_URL}/export/excel`,
		method: 'GET',
		params: exportParams(params),
		responseType: 'blob'
	})

	downloadBlob(response as Blob, 'users.xlsx')
}

export const usersApi = {
	listUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser,
	sendUserEmail,
	sendUserMessage,
	getUserOrders,
	exportUsersXml,
	exportUsersExcel
}
