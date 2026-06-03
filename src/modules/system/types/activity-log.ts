export type ActivityLogAttributeChanges = {
	attributes: Record<string, unknown>
	old: Record<string, unknown>
}

export type ActivityLogCauser = {
	id: number
	name: string | null
	email: string
}

export type ActivityLog = {
	id: number
	log_name: string
	description: string
	subject_type: string
	subject_id: number
	event: string
	causer_type: string | null
	causer_id: number | null
	attribute_changes: ActivityLogAttributeChanges | null
	properties: unknown[]
	created_at: string
	updated_at: string
	causer: ActivityLogCauser | null
}

export type ListActivityLogParams = {
	page?: number
	per_page?: number
	date?: string
	event?: string
	email?: string
}
