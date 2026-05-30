import { request } from '@/shared'
import type { UserActivityLog, UserActivityLogAttributeChanges } from '../types/user-activity-log'

const USERS_URL = '/api/admin/users'

const normalizeAttributeChanges = (value: any): UserActivityLogAttributeChanges | null => {
	if (!value || typeof value !== 'object') return null
	const attributes = value.attributes && typeof value.attributes === 'object' ? value.attributes : {}
	const old = value.old && typeof value.old === 'object' ? value.old : {}
	if (!Object.keys(attributes).length && !Object.keys(old).length) return null
	return { attributes, old }
}

const normalizeUserActivityLog = (item: any): UserActivityLog => ({
	id: Number(item?.id),
	log_name: String(item?.log_name ?? ''),
	description: String(item?.description ?? ''),
	subject_type: String(item?.subject_type ?? ''),
	subject_id: Number(item?.subject_id ?? 0),
	event: String(item?.event ?? ''),
	causer_type: String(item?.causer_type ?? ''),
	causer_id: Number(item?.causer_id ?? 0),
	attribute_changes: normalizeAttributeChanges(item?.attribute_changes),
	properties: Array.isArray(item?.properties) ? item.properties : [],
	created_at: String(item?.created_at ?? ''),
	updated_at: String(item?.updated_at ?? '')
})

async function getUserActivityLogs(userId: number): Promise<UserActivityLog[]> {
	const response = await request({ url: `${USERS_URL}/${userId}/activity-log`, method: 'GET' })
	const rawItems = Array.isArray(response) ? response : response?.data || []
	return Array.isArray(rawItems) ? rawItems.map(normalizeUserActivityLog) : []
}

export const userActivityLogsApi = {
	getUserActivityLogs
}
