import { request } from './request'

export type UploadedMedia = { path: string; url: string }

async function uploadImage(file: File, onUploadProgress?: (progressEvent: ProgressEvent) => void): Promise<UploadedMedia> {
	const response = await request({
		url: '/api/admin/media/upload/',
		method: 'POST',
		isFormData: true,
		data: { file },
		onUploadProgress: onUploadProgress ? { onUploadProgress } : {}
	})

	return response?.data || response
}

async function uploadImages(files: File[], onProgress?: (percent: number) => void): Promise<UploadedMedia[]> {
	const uploaded: UploadedMedia[] = []
	const total = Math.max(files.length, 1)

	for (let i = 0; i < files.length; i += 1) {
		const media = await uploadImage(files[i], (evt) => {
			if (!onProgress) return
			const loaded = evt.loaded || 0
			const totalBytes = evt.total || 1
			const filePercent = Math.min(100, Math.round((loaded / totalBytes) * 100))
			const overall = Math.min(100, Math.round(((i + filePercent / 100) / total) * 100))
			onProgress(overall)
		})
		uploaded.push(media)
		onProgress?.(Math.round(((i + 1) / total) * 100))
	}

	return uploaded
}

export const mediaApi = {
	uploadImages
}

