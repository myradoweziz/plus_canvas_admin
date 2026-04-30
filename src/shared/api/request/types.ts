export interface Request {
	url: string
	method?: 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'DELETE' | 'get' | 'post' | 'put' | 'delete' | undefined
	headers?: any
	params?: object
	data?: object
	onUploadProgress?: object
	isFormData?: boolean
	responseType?: 'arraybuffer' | 'blob' | 'json' | 'text' // ← добавлено
}
