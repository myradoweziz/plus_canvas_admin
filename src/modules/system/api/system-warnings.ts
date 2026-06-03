import { request } from '@/shared'
import type { SystemWarning, SystemWarningsResponse } from '../types'

const SYSTEM_WARNINGS_URL = '/api/admin/system-warnings'

const normalizeWarning = (item: Record<string, unknown>): SystemWarning => {
	const type = String(item.type ?? 'info')
	const warningType = type === 'warning' || type === 'error' ? type : 'info'

	return {
		type: warningType,
		title: String(item.title ?? ''),
		message: String(item.message ?? ''),
		count: Number(item.count ?? 0)
	}
}

async function getSystemWarnings(): Promise<SystemWarningsResponse> {
	const response = await request({ url: SYSTEM_WARNINGS_URL, method: 'GET' })
	const payload = (response ?? {}) as Record<string, unknown>
	const raw = Array.isArray(payload.warnings) ? payload.warnings : []
	const warnings = raw.map((row) => normalizeWarning(row as Record<string, unknown>))

	return {
		warnings,
		total_count: Number(payload.total_count ?? warnings.length)
	}
}

export const systemWarningsApi = {
	getSystemWarnings
}
