import { request } from '@/shared'
import type { IFormLogin } from '@/shared/types'

const AUTH_URL = '/api/login'
const PROFILE_URL = '/api/user'

export const apiBase = {
	login,
	getProfile
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
