import { filterListParams } from '@/shared/api/createListApi'
import { getTotal, request } from '@/shared'
import type { ActivityLog, ActivityLogAttributeChanges, ListActivityLogParams } from '../types'

const ACTIVITY_LOG_URL = '/api/admin/activity-log'

const normalizeAttributeChanges = (value: unknown): ActivityLogAttributeChanges | null => {
	if (!value || typeof value !== 'object') return null
	const raw = value as ActivityLogAttributeChanges
	const attributes = raw.attributes && typeof raw.attributes === 'object' ? raw.attributes : {}
	const old = raw.old && typeof raw.old === 'object' ? raw.old : {}
	if (!Object.keys(attributes).length && !Object.keys(old).length) return null
	return { attributes, old }
}

const normalizeCauser = (value: unknown): ActivityLog['causer'] => {
	if (!value || typeof value !== 'object') return null
	const item = value as Record<string, unknown>
	const id = Number(item.id)
	if (!Number.isFinite(id)) return null
	return {
		id,
		name: item.name != null ? String(item.name) : null,
		email: String(item.email ?? '')
	}
}

const normalizeActivityLog = (item: Record<string, unknown>): ActivityLog => ({
	id: Number(item.id ?? 0),
	log_name: String(item.log_name ?? ''),
	description: String(item.description ?? ''),
	subject_type: String(item.subject_type ?? ''),
	subject_id: Number(item.subject_id ?? 0),
	event: String(item.event ?? ''),
	causer_type: item.causer_type != null ? String(item.causer_type) : null,
	causer_id: item.causer_id != null ? Number(item.causer_id) : null,
	attribute_changes: normalizeAttributeChanges(item.attribute_changes),
	properties: Array.isArray(item.properties) ? item.properties : [],
	created_at: String(item.created_at ?? ''),
	updated_at: String(item.updated_at ?? ''),
	causer: normalizeCauser(item.causer)
})

async function listActivityLog(params: ListActivityLogParams) {
	const response = await request({
		url: ACTIVITY_LOG_URL,
		method: 'GET',
		params: filterListParams(params as Record<string, unknown>)
	})

	const rawItems = Array.isArray(response) ? response : response?.data || []
	const items = Array.isArray(rawItems) ? rawItems.map((row) => normalizeActivityLog(row as Record<string, unknown>)) : []

	return {
		items,
		total: getTotal(response, items.length)
	}
}

async function clearActivityLog(): Promise<void> {
	await request({ url: `${ACTIVITY_LOG_URL}/clear`, method: 'DELETE' })
}

export const activityLogApi = {
	listActivityLog,
	clearActivityLog
}
