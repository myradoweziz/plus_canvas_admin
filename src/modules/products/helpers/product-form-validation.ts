import type { CollageLayout } from '../types/collage-layout'
import type {
	CanvasProduct,
	CanvasProductCategoryMapping,
	CanvasProductDiscount,
	CanvasProductSeo
} from '../types/product'
import { INNER_IMAGES_MAIN_CATEGORY_SLUG } from './product-form'

export const uploadImageCountFromLayout = (layout: CollageLayout | null): number => {
	if (!layout) return 0
	const slots = layout.layout_json?.length ?? 0
	if (slots > 0) return slots
	const maxImages = layout.max_images ?? 0
	return maxImages > 0 ? maxImages : 0
}

const setRequiredProductError = (
	errors: Record<string, string>,
	form: CanvasProduct,
	field: keyof CanvasProduct,
	label: string
) => {
	const value = form[field]
	if (value === null || value === undefined || value === '') {
		errors[field] = `Поле "${label}" обязательно.`
	}
}

const setRequiredSeoError = (
	errors: Record<string, string>,
	seo: CanvasProductSeo,
	field: keyof CanvasProductSeo,
	label: string
) => {
	if (!String(seo[field] || '').trim()) {
		errors[field] = `Поле "${label}" обязательно.`
	}
}

export const validateProductInfo = (form: CanvasProduct): Record<string, string> => {
	const errors: Record<string, string> = {}

	setRequiredProductError(errors, form, 'name', 'Name')
	setRequiredProductError(errors, form, 'description', 'Description')
	setRequiredProductError(errors, form, 'price', 'Price')
	setRequiredProductError(errors, form, 'product_qode', 'Product Qode')
	setRequiredProductError(errors, form, 'sku', 'SKU')
	setRequiredProductError(errors, form, 'main_category_id', 'Main Category')
	setRequiredProductError(errors, form, 'category_id', 'Category')

	if (!Number.isFinite(Number(form.price)) || Number(form.price) <= 0) {
		errors.price = 'Цена должна быть больше 0.'
	}

	if (!form.images.length) {
		errors.images = 'Изображения обязательны.'
	}

	if (!form.colors.length) {
		errors.colors = 'Выберите хотя бы один цвет.'
	}

	if (!form.canvas_formats.length) {
		errors.canvas_formats = 'Выберите хотя бы один формат.'
	}

	if (!form.frames.length) {
		errors.frames = 'Выберите хотя бы одну рамку.'
	}

	if (form.main_category_slug !== INNER_IMAGES_MAIN_CATEGORY_SLUG) {
		if (form.collage_layout_id == null) {
			errors.collage_layout_id = 'Импортируйте SVG layout.'
		}

		const slots = uploadImageCountFromLayout(form.collage_layout ?? null)
		if (slots > 0 && form.inner_images.length !== slots) {
			errors.inner_images = `Загрузите ровно ${slots} внутренних изображений — по числу слотов в SVG layout.`
		}
	}

	return errors
}

export const validateProductSeo = (seo: CanvasProductSeo): Record<string, string> => {
	const errors: Record<string, string> = {}

	setRequiredSeoError(errors, seo, 'slug', 'Slug')
	setRequiredSeoError(errors, seo, 'meta_title', 'Meta title')
	setRequiredSeoError(errors, seo, 'meta_description', 'Meta description')
	setRequiredSeoError(errors, seo, 'meta_keywords', 'Meta keywords')

	return errors
}

export const validateProductDiscount = (discount: CanvasProductDiscount): Record<string, string> => {
	const errors: Record<string, string> = {}

	if (!Number.isFinite(Number(discount.discount)) || Number(discount.discount) < 0) {
		errors.discount = 'Укажите корректную скидку'
	}

	if (!Number.isFinite(Number(discount.special_price)) || Number(discount.special_price) < 0) {
		errors.special_price = 'Укажите корректную спец. цену'
	}

	if (!String(discount.special_price_start || '').trim()) {
		errors.special_price_start = 'Укажите дату начала'
	}

	if (!String(discount.special_price_end || '').trim()) {
		errors.special_price_end = 'Укажите дату окончания'
	}

	return errors
}

export const validateProductCategoryMappings = (
	mappings: CanvasProductCategoryMapping[]
): Record<string, string> => {
	const errors: Record<string, string> = {}
	const seenCategoryIds = new Set<number>()

	mappings.forEach((mapping, index) => {
		const prefix = `category_mappings.${index}`

		if (!mapping.category_id || mapping.category_id <= 0) {
			errors[`${prefix}.category_id`] = 'Выберите категорию'
		} else if (seenCategoryIds.has(mapping.category_id)) {
			errors[`${prefix}.category_id`] = 'Эта категория уже добавлена'
		} else {
			seenCategoryIds.add(mapping.category_id)
		}

		if (!Number.isFinite(Number(mapping.display_order)) || Number(mapping.display_order) < 0) {
			errors[`${prefix}.display_order`] = 'Укажите корректный порядок отображения'
		}
	})

	return errors
}
