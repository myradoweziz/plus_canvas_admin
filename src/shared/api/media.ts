import { request } from './request'

export type UploadedMedia = { path: string; url: string }

const apiBase = () => String(import.meta.env.VITE_APP_BASE_URL ?? '').replace(/\/+$/, '')

/** Build a storage URL that always hits the admin API host (ignores stale APP_URL ports). */
export function resolveUploadedMediaUrl(pathOrUrl: string, pathHint = ''): string {
	const raw = String(pathOrUrl ?? '').trim()
	const path = String(pathHint ?? '').trim()
	const base = apiBase()

	if (path && base) {
		const normalized = path.replace(/^\/+/, '').replace(/^storage\//, '')
		return `${base}/storage/${normalized}`
	}

	if (!raw) return ''
	if (raw.startsWith('blob:') || raw.startsWith('data:')) return raw

	if (base) {
		try {
			const u = new URL(raw, base)
			if (u.pathname.includes('/storage/')) {
				return `${base}${u.pathname}${u.search}`
			}
		} catch {
			/* keep raw */
		}
		if (raw.startsWith('/')) return `${base}${raw}`
		if (!/^https?:\/\//i.test(raw)) {
			return `${base}/storage/${raw.replace(/^\/+/, '')}`
		}
	}

	return raw
}

function normalizeUploadResponse(response: unknown): UploadedMedia {
	const root = (response as { data?: unknown } | null)?.data ?? response
	const record = (root && typeof root === 'object' ? root : {}) as Record<string, unknown>
	const items = Array.isArray(record.items) ? record.items : []
	const first = (items[0] && typeof items[0] === 'object' ? items[0] : record) as Record<string, unknown>

	const path = String(first.path ?? record.path ?? '').trim()
	const urlRaw = String(first.url ?? record.url ?? '').trim()
	const url = resolveUploadedMediaUrl(urlRaw || path, path)

	return { path, url }
}

async function uploadImage(file: File, onUploadProgress?: (progressEvent: ProgressEvent) => void): Promise<UploadedMedia> {
	const response = await request({
		url: '/api/admin/media/upload/',
		method: 'POST',
		isFormData: true,
		data: { file },
		onUploadProgress: onUploadProgress ? { onUploadProgress } : {}
	})

	return normalizeUploadResponse(response)
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
	uploadImages,
	resolveUploadedMediaUrl
}
