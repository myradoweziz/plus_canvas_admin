import { request } from '@/shared'
import type { IFormLogin } from '@/shared/types'

const AUTH_URL = '/api/auth/login'
const PROFILE_URL = '/api/auth/me'
const UPDATE_PROFILE_URL = '/api/auth/profile'
const LOGOUT_URL = '/api/auth/logout'

export const apiBase = {
	login,
	getProfile,
	updateProfile,
	logout
} as const

async function getProfile() {
	try {
		return await request({ url: PROFILE_URL, method: 'GET' })
	} catch (e) {
		throw new Error('ERROR ON GET USER')
	}
}

async function updateProfile(payload: {
	name?: string
	email?: string
	phone_number?: string | null
	password?: string
	password_confirmation?: string
}) {
	try {
		return await request({ url: UPDATE_PROFILE_URL, method: 'PUT', data: payload })
	} catch (e) {
		throw new Error('ERROR ON UPDATE USER')
	}
}

async function login(form: IFormLogin) {
	try {
		return request({ url: AUTH_URL, method: 'POST', data: form })
	} catch (error) {
		throw Error('ERROR ON LOGIN')
	}
}

async function logout() {
	try {
		return request({ url: LOGOUT_URL, method: 'POST' })
	} catch (error) {
		throw new Error('ERROR ON LOGOUT')
	}
}
