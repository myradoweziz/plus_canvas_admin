import { request } from '@/shared'
import type { CanvasProductComment, CanvasProductCommentPayload } from '../types/product-comment'

const CANVAS_PRODUCTS_URL = '/api/admin/canvas-products'

const commentsUrl = (productId: number) => `${CANVAS_PRODUCTS_URL}/${productId}/comments`
const commentUrl = (productId: number, commentId: number) => `${commentsUrl(productId)}/${commentId}`

const normalizeCanvasProductComment = (row: Record<string, unknown>): CanvasProductComment => ({
	id: row.id != null ? Number(row.id) : null,
	author_name: String(row.author_name ?? ''),
	comment: String(row.comment ?? ''),
	rating: Number(row.rating ?? 5),
	is_active: row.is_active !== false
})

function toCanvasProductCommentPayload(comment: CanvasProductComment): CanvasProductCommentPayload {
	return {
		author_name: comment.author_name.trim(),
		comment: comment.comment.trim(),
		rating: Number(comment.rating) || 0,
		is_active: !!comment.is_active
	}
}

async function listCanvasProductComments(productId: number): Promise<CanvasProductComment[]> {
	const response = await request({ url: commentsUrl(productId), method: 'GET' })
	const raw = Array.isArray(response) ? response : response?.data || []

	return raw.map((item: Record<string, unknown>) => normalizeCanvasProductComment(item))
}

async function createCanvasProductComment(
	productId: number,
	comment: CanvasProductComment
): Promise<CanvasProductComment> {
	const response = await request({
		url: commentsUrl(productId),
		method: 'POST',
		data: toCanvasProductCommentPayload(comment)
	})

	return normalizeCanvasProductComment((response?.data ?? response) as Record<string, unknown>)
}

async function updateCanvasProductComment(
	productId: number,
	comment: CanvasProductComment
): Promise<CanvasProductComment> {
	if (!comment.id) {
		throw new Error('Comment id is required for update')
	}

	const response = await request({
		url: commentUrl(productId, comment.id),
		method: 'PUT',
		data: toCanvasProductCommentPayload(comment)
	})

	return normalizeCanvasProductComment((response?.data ?? response) as Record<string, unknown>)
}

async function deleteCanvasProductComment(productId: number, commentId: number): Promise<void> {
	await request({ url: commentUrl(productId, commentId), method: 'DELETE' })
}

export const productCommentsApi = {
	listCanvasProductComments,
	createCanvasProductComment,
	updateCanvasProductComment,
	deleteCanvasProductComment
}
