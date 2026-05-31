export type NameSlugEntity = {
	id: number | null
	name: string
	slug: string
}

export type NameSlugEntityPayload = Omit<NameSlugEntity, 'id'>
