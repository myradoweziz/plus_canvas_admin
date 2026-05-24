export interface CanvasProductComment {
	id: number | null
	author_name: string
	comment: string
	rating: number
	is_active: boolean
}

export type CanvasProductCommentPayload = Omit<CanvasProductComment, 'id'>
