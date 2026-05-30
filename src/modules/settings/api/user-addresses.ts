import { request } from '@/shared'
import type { UserProfileAddress, UserProfileAddressPayload } from '../types/user-address'

const USERS_URL = '/api/admin/users'

const userAddressesUrl = (userId: number) => `${USERS_URL}/${userId}/addresses`

const normalizeUserProfileAddress = (item: any): UserProfileAddress => ({
	id: Number(item?.id),
	first_name: String(item?.first_name ?? ''),
	last_name: String(item?.last_name ?? ''),
	email: String(item?.email ?? ''),
	phone_number: String(item?.phone_number ?? ''),
	fax_number: String(item?.fax_number ?? ''),
	address: String(item?.address ?? ''),
	city: String(item?.city ?? ''),
	is_default: !!item?.is_default
})

const buildUserProfileAddressPayload = (payload: UserProfileAddressPayload) => ({
	first_name: payload.first_name.trim(),
	last_name: payload.last_name.trim(),
	email: payload.email.trim(),
	phone_number: payload.phone_number.trim(),
	fax_number: payload.fax_number.trim(),
	address: payload.address.trim(),
	city: payload.city.trim(),
	is_default: !!payload.is_default
})

async function listUserAddresses(userId: number): Promise<UserProfileAddress[]> {
	const response = await request({ url: userAddressesUrl(userId), method: 'GET' })
	const rawItems = Array.isArray(response) ? response : response?.data || []
	return Array.isArray(rawItems) ? rawItems.map(normalizeUserProfileAddress) : []
}

async function createUserAddress(
	userId: number,
	payload: UserProfileAddressPayload
): Promise<UserProfileAddress> {
	const response = await request({
		url: userAddressesUrl(userId),
		method: 'POST',
		data: buildUserProfileAddressPayload(payload)
	})
	return normalizeUserProfileAddress(response?.data ?? response)
}

async function updateUserAddress(
	userId: number,
	addressId: number,
	payload: UserProfileAddressPayload
): Promise<UserProfileAddress> {
	const response = await request({
		url: `${userAddressesUrl(userId)}/${addressId}`,
		method: 'PUT',
		data: buildUserProfileAddressPayload(payload)
	})
	return normalizeUserProfileAddress(response?.data ?? response)
}

async function deleteUserAddress(userId: number, addressId: number): Promise<void> {
	await request({ url: `${userAddressesUrl(userId)}/${addressId}`, method: 'DELETE' })
}

export const userAddressesApi = {
	listUserAddresses,
	createUserAddress,
	updateUserAddress,
	deleteUserAddress
}
