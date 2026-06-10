import type { CanvasProduct, CanvasProductImage } from '../types'

export type ProductImageValue = string | CanvasProductImage | null | undefined

export const resolveProductImageUrl = (image: ProductImageValue): string => {
	if (!image) return ''
	if (typeof image === 'string') return image.trim()
	const url = image.url?.trim()
	if (url) return url
	return image.path?.trim() ?? ''
}

export const getProductListImageUrl = (product: CanvasProduct) => {
	const image = resolveProductImageUrl(product.image)
	return image || null
}
