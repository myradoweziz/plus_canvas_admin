import { getTotal, request } from '@/shared'
import type { User, UserPayload } from '../types/user'

const USERS_URL = '/api/admin/users'

export type ListUsersParams = {
	name?: string
	email?: string
	phone_number?: string
	limit: number
	offset: number
}

export type ListUsersResult = {
	items: User[]
	total: number
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
	email: item?.email ?? '',
	phone_number: item?.phone_number ?? '',
	roles: toRoleNames(item?.roles),
	addresses: Array.isArray(item?.addresses) ? item.addresses : []
})

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

async function createUser(user: User): Promise<User> {
	const payload: UserPayload = {
		name: user.name,
		email: user.email,
		phone_number: user.phone_number,
		password: user.password || '',
		password_confirmation: user.password_confirmation || '',
		roles: user.roles,
		addresses: user.addresses
	}

	return await request({ url: USERS_URL, method: 'POST', data: payload })
}

async function updateUser(user: User): Promise<User> {
	const payload: UserPayload = {
		name: user.name,
		email: user.email,
		phone_number: user.phone_number,
		roles: user.roles,
		addresses: user.addresses
	}

	// allow password update if provided
	if (user.password) {
		payload.password = user.password
		payload.password_confirmation = user.password_confirmation || ''
	}

	return await request({ url: `${USERS_URL}/${user.id}`, method: 'PUT', data: payload })
}

async function deleteUser(id: number): Promise<void> {
	await request({ url: `${USERS_URL}/${id}`, method: 'DELETE' })
}

export const usersApi = {
	listUsers,
	createUser,
	updateUser,
	deleteUser
}

