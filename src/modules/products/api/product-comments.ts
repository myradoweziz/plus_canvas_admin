import { createSubresourceApi } from '@/shared/api/createSubresourceApi'
import type { CanvasProductComment, CanvasProductCommentPayload } from '../types/product-comment'

const CANVAS_PRODUCTS_URL = '/api/admin/canvas-products'

const normalizeCanvasProductComment = (row: Record<string, unknown>): CanvasProductComment => ({
	id: row.id != null ? Number(row.id) : null,
	author_name: String(row.author_name ?? ''),
	comment: String(row.comment ?? ''),
	rating: Number(row.rating ?? 5),
	is_active: row.is_active !== false
})

const toCanvasProductCommentPayload = (comment: CanvasProductComment): CanvasProductCommentPayload => ({
	author_name: comment.author_name.trim(),
	comment: comment.comment.trim(),
	rating: Number(comment.rating) || 0,
	is_active: !!comment.is_active
})

const commentsApi = createSubresourceApi<CanvasProductComment, CanvasProductCommentPayload>({
	baseUrl: CANVAS_PRODUCTS_URL,
	resourcePath: 'comments',
	normalize: normalizeCanvasProductComment,
	toPayload: toCanvasProductCommentPayload
})

export const productCommentsApi = {
	listCanvasProductComments: commentsApi.list,
	createCanvasProductComment: commentsApi.create,
	updateCanvasProductComment: commentsApi.update,
	deleteCanvasProductComment: commentsApi.remove
}
