export type UserActivityLogAttributeChanges = {
	attributes: Record<string, unknown>
	old: Record<string, unknown>
}

export type UserActivityLog = {
	id: number
	log_name: string
	description: string
	subject_type: string
	subject_id: number
	event: string
	causer_type: string
	causer_id: number
	attribute_changes: UserActivityLogAttributeChanges | null
	properties: unknown[]
	created_at: string
	updated_at: string
}
