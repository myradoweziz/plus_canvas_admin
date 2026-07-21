import type { CanvasProductComment } from '../types/product-comment'
import type {
	CanvasProduct,
	CanvasProductCategoryMapping,
	CanvasProductDetails,
	CanvasProductDiscount,
	CanvasProductSeo
} from '../types/product'
import { isHtmlEmpty } from '@/shared/utils'
import { resolveProductImageUrl } from './product-image'
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
	setRequiredProductError(errors, form, 'price', 'Price')

	setRequiredProductError(errors, form, 'sku', 'SKU')
	setRequiredProductError(errors, form, 'main_category_id', 'Main Category')
	setRequiredProductError(errors, form, 'category_id', 'Category')

	if (!Number.isFinite(Number(form.price)) || Number(form.price) <= 0) {
		errors.price = 'Цена должна быть больше 0.'
	}

	if (!resolveProductImageUrl(form.image)) {
		errors.image = 'Изображение обязательно.'
	}

	return errors
}

export const validateProductDetails = (details: CanvasProductDetails): Record<string, string> => {
	const errors: Record<string, string> = {}

	if (isHtmlEmpty(details.description)) {
		errors.description = 'Поле "Описание" обязательно.'
	}

	details.faq.forEach((item, index) => {
		const prefix = `faq.${index}`

		if (!String(item.question || '').trim()) {
			errors[`${prefix}.question`] = 'Укажите вопрос'
		}

		if (!String(item.answer || '').trim()) {
			errors[`${prefix}.answer`] = 'Укажите ответ'
		}
	})

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

export const validateProductComment = (comment: CanvasProductComment): Record<string, string> => {
	const errors: Record<string, string> = {}

	if (!String(comment.author_name || '').trim()) {
		errors.author_name = 'Укажите имя автора'
	}

	if (!String(comment.comment || '').trim()) {
		errors.comment = 'Укажите текст комментария'
	}

	const rating = Number(comment.rating)
	if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
		errors.rating = 'Рейтинг должен быть от 1 до 5'
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
