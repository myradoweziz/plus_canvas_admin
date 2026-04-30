import { request } from '@/shared'
import type { IFormLogin } from '@/shared/types'

const AUTH_URL = '/api/auth/login'
const PROFILE_URL = '/api/auth/me'
const LOGOUT_URL = '/api/auth/logout'

export const apiBase = {
	login,
	getProfile,
	logout
} as const

async function getProfile() {
	try {
		return await request({ url: PROFILE_URL, method: 'GET' })
	} catch (e) {
		throw new Error('ERROR ON GET USER')
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
