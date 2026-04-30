import axios from 'axios'
import { useCookies } from 'vue3-cookies'

import type { Request } from './types'

const baseURL = import.meta.env.VITE_APP_BASE_URL

export const request = async ({
	url,
	method = 'POST',
	headers = {},
	params = {},
	data = {},
	onUploadProgress = {},
	isFormData = false,
	responseType // ← сюда
}: Request) => {
	const { cookies } = useCookies()

	if (isFormData) {
		const formData = new FormData()
		headers['Accept'] = 'application/json'
		headers['Content-Type'] = 'multipart/form-data'

		for (let [key, value] of Object.entries(data)) {
			formData.append(key, value)
		}
		data = formData
	}

	if (cookies.get('online_application_authorization')) {
		headers['Authorization'] = `Bearer ${cookies.get('online_application_authorization')}`
	}

	const response = await axios({
		url: `${baseURL}${url}`,
		method,
		headers,
		params,
		data,
		responseType,
		...onUploadProgress
	})

	return response.data
}
