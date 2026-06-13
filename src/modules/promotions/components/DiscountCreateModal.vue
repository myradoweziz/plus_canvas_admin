<script setup lang="ts">
	import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { api as categoriesApi } from '@/modules/categories/api'
	import type { FeaturedCategory, SubCategory } from '@/modules/categories/types'
	import { api as configurationApi } from '@/modules/configuration/api'
	import type { NameSlugEntity } from '@/modules/configuration/types'
	import { api as productsApi } from '@/modules/products/api'
	import type { CanvasProduct } from '@/modules/products/types'
	import { slugify } from '@/shared'
	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { TurkishLiraIcon } from '@/shared/icons'
	import { api } from '../api'
	import type { Discount } from '../types'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; discount: Discount | null }>()

	const saving = ref(false)
	const loadingDictionaries = ref(false)
	const dictionariesRequestId = ref(0)
	const discountTypes = ref<NameSlugEntity[]>([])
	const featuredCategories = ref<FeaturedCategory[]>([])
	const subCategories = ref<SubCategory[]>([])
	const products = ref<CanvasProduct[]>([])
	const selectedFeaturedCategoryId = ref<number | null>(null)
	const selectedSubCategoryId = ref<number | null>(null)
	const selectedProductId = ref<number | null>(null)
	const slugManuallyEdited = ref(false)
	const lastGeneratedSlug = ref('')

	const form = reactive({
		id: null as number | null,
		name: '',
		slug: '',
		discount_type_id: null as number | null,
		is_percentage: true,
		amount: 0 as number | string,
		start_date: '',
		end_date: '',
		is_active: true,
		min_order_amount: 0 as number | string,
		target_categories: [] as number[],
		target_sub_categories: [] as number[],
		target_products: [] as number[]
	})

	const fieldErrors = reactive({
		name: '',
		slug: '',
		discount_type_id: '',
		amount: '',
		start_date: '',
		end_date: '',
		min_order_amount: ''
	})

	const resetLocalForm = () => {
		Object.assign(form, {
			id: null,
			name: '',
			slug: '',
			discount_type_id: null,
			is_percentage: true,
			amount: 0,
			start_date: '',
			end_date: '',
			is_active: true,
			min_order_amount: 0,
			target_categories: [],
			target_sub_categories: [],
			target_products: []
		})
		selectedFeaturedCategoryId.value = null
		selectedSubCategoryId.value = null
		selectedProductId.value = null
		slugManuallyEdited.value = false
		lastGeneratedSlug.value = ''
		Object.keys(fieldErrors).forEach((key) => {
			fieldErrors[key as keyof typeof fieldErrors] = ''
		})
	}

	const discountTypeOptions = computed(() =>
		discountTypes.value
			.filter((item): item is NameSlugEntity & { id: number } => item.id !== null)
			.map((item) => ({ label: item.name, value: item.id }))
	)

	const featuredCategoryOptions = computed(() =>
		featuredCategories.value
			.filter((item): item is FeaturedCategory & { id: number } => item.id !== null)
			.filter((item) => !form.target_categories.includes(item.id))
			.map((item) => ({ label: item.name, value: item.id }))
	)

	const subCategoryOptions = computed(() =>
		subCategories.value
			.filter((item): item is SubCategory & { id: number } => item.id !== null)
			.filter((item) => !form.target_sub_categories.includes(item.id))
			.map((item) => ({ label: item.name, value: item.id }))
	)

	const productOptions = computed(() =>
		products.value
			.filter((item): item is CanvasProduct & { id: number } => item.id !== null)
			.filter((item) => !form.target_products.includes(item.id))
			.map((item) => ({ label: item.name, value: item.id }))
	)

	const selectedFeaturedCategories = computed(() =>
		form.target_categories.map((id) => ({
			id,
			label: featuredCategories.value.find((item) => item.id === id)?.name ?? `#${id}`
		}))
	)

	const selectedSubCategories = computed(() =>
		form.target_sub_categories.map((id) => ({
			id,
			label: subCategories.value.find((item) => item.id === id)?.name ?? `#${id}`
		}))
	)

	const selectedProducts = computed(() =>
		form.target_products.map((id) => ({
			id,
			label: products.value.find((item) => item.id === id)?.name ?? `#${id}`
		}))
	)

	const validate = () => {
		Object.keys(fieldErrors).forEach((key) => {
			fieldErrors[key as keyof typeof fieldErrors] = ''
		})

		let ok = true
		if (!form.name.trim()) {
			fieldErrors.name = 'Укажите название'
			ok = false
		}
		if (!form.slug.trim()) {
			fieldErrors.slug = 'Укажите slug'
			ok = false
		}
		if (!form.discount_type_id) {
			fieldErrors.discount_type_id = 'Выберите тип акции'
			ok = false
		}
		const amount = Number(form.amount)
		if (!Number.isFinite(amount) || amount < 0) {
			fieldErrors.amount = 'Укажите корректный размер скидки'
			ok = false
		}

		const minOrderAmount = Number(form.min_order_amount)
		if (!Number.isFinite(minOrderAmount) || minOrderAmount < 0) {
			fieldErrors.min_order_amount = 'Укажите корректную минимальную сумму заказа'
			ok = false
		}
		return ok
	}

	const loadDictionaries = async () => {
		const requestId = dictionariesRequestId.value + 1
		dictionariesRequestId.value = requestId
		loadingDictionaries.value = true
		try {
			const [types, featuredResult, subCategoriesResult, productsResult] = await Promise.all([
				configurationApi.listDiscountTypes(),
				categoriesApi.listFeaturedCategories(),
				categoriesApi.listSubCategories({ limit: 1000, offset: 0 }),
				productsApi.listCanvasProducts()
			])
			if (requestId !== dictionariesRequestId.value) return
			discountTypes.value = types
			featuredCategories.value = featuredResult.items || []
			subCategories.value = subCategoriesResult.items || []
			products.value = productsResult.items || []
		} finally {
			if (requestId === dictionariesRequestId.value) {
				loadingDictionaries.value = false
			}
		}
	}

	const addFeaturedCategory = (value: string | number | null) => {
		selectedFeaturedCategoryId.value = null
		if (value === null) return

		const id = Number(value)
		if (Number.isFinite(id) && !form.target_categories.includes(id)) {
			form.target_categories.push(id)
		}
	}

	const removeFeaturedCategory = (id: number) => {
		form.target_categories = form.target_categories.filter((item) => item !== id)
	}

	const addSubCategory = (value: string | number | null) => {
		selectedSubCategoryId.value = null
		if (value === null) return

		const id = Number(value)
		if (Number.isFinite(id) && !form.target_sub_categories.includes(id)) {
			form.target_sub_categories.push(id)
		}
	}

	const removeSubCategory = (id: number) => {
		form.target_sub_categories = form.target_sub_categories.filter((item) => item !== id)
	}

	const addProduct = (value: string | number | null) => {
		selectedProductId.value = null
		if (value === null) return

		const id = Number(value)
		if (Number.isFinite(id) && !form.target_products.includes(id)) {
			form.target_products.push(id)
		}
	}

	const removeProduct = (id: number) => {
		form.target_products = form.target_products.filter((item) => item !== id)
	}

	const onSlugInput = () => {
		slugManuallyEdited.value = true
	}

	watch(
		() => form.name,
		(name) => {
			if (slugManuallyEdited.value) return

			const generatedSlug = slugify(name ?? '')
			lastGeneratedSlug.value = generatedSlug
			form.slug = generatedSlug
		}
	)

	watch(
		() => [props.open, props.discount] as const,
		([open, discount]) => {
			if (!open) return
			if (!discount) {
				resetLocalForm()
				return
			}

			Object.assign(form, {
				id: discount.id ?? null,
				name: discount.name ?? '',
				slug: discount.slug ?? '',
				discount_type_id: discount.discount_type_id,
				is_percentage: !!discount.is_percentage,
				amount: discount.amount ?? 0,
				start_date: discount.start_date ?? '',
				end_date: discount.end_date ?? '',
				is_active: discount.is_active !== false,
				min_order_amount: discount.min_order_amount ?? 0,
				target_categories: [...(discount.target_categories ?? [])],
				target_sub_categories: [...(discount.target_sub_categories ?? [])],
				target_products: [...(discount.target_products ?? [])]
			})
			selectedFeaturedCategoryId.value = null
			selectedSubCategoryId.value = null
			selectedProductId.value = null
			slugManuallyEdited.value = true
			lastGeneratedSlug.value = discount.slug ?? ''
			Object.keys(fieldErrors).forEach((key) => {
				fieldErrors[key as keyof typeof fieldErrors] = ''
			})
		},
		{ immediate: true }
	)

	watch(
		() => props.open,
		(open) => {
			if (open) loadDictionaries()
		},
		{ immediate: true }
	)

	onBeforeUnmount(() => {
		dictionariesRequestId.value += 1
	})

	const onSubmit = async () => {
		if (!validate()) return

		saving.value = true
		try {
			const payload: Discount = {
				id: form.id ?? null,
				name: form.name.trim(),
				slug: form.slug.trim(),
				discount_type_id: form.discount_type_id,
				is_percentage: form.is_percentage,
				amount: Number(form.amount) || 0,
				start_date: form.start_date,
				end_date: form.end_date,
				is_active: form.is_active,
				min_order_amount: Number(form.min_order_amount) || 0,
				target_categories: [...form.target_categories],
				target_sub_categories: [...form.target_sub_categories],
				target_products: [...form.target_products]
			}

			if (payload.id) {
				await api.updateDiscount(payload)
				toast.success('Скидка обновлена')
			} else {
				await api.createDiscount(payload)
				toast.success('Скидка добавлена')
			}

			emit('saved')
			emit('close')

			if (!props.discount) resetLocalForm()
		} catch (err) {
			const msg = getFirstBackendValidationMessage(err)
			if (msg) toast.error(msg)
			else throw err
		} finally {
			saving.value = false
		}
	}
</script>

<template>
	<Modal v-if="open" @close="$emit('close')">
		<div
			class="relative z-[100000] mx-auto h-[90vh] w-[92vw] max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
		>
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0">
					<h3 class="text-lg font-semibold text-gray-900">
						{{ discount ? 'Редактировать скидку' : 'Добавить скидку' }}
					</h3>
					<p class="mt-1 text-sm text-gray-600">Заполните поля и сохраните.</p>
				</div>
				<Button type="button" variant="ghost" size="icon" :on-click="() => $emit('close')" aria-label="Close">
					✕
				</Button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
				<div class="md:col-span-2">
					<TextField
						v-model="form.name"
						label="Название"
						required
						name="name"
						placeholder="Название"
						:error-message="fieldErrors.name"
					/>
				</div>

				<div class="md:col-span-2">
					<TextField
						v-model="form.slug"
						label="Slug"
						required
						name="slug"
						placeholder="summer-sale"
						:error-message="fieldErrors.slug"
						@update:model-value="onSlugInput"
					/>
				</div>

				<SelectField
					v-model="form.discount_type_id"
					label="Тип акции"
					required
					name="discount_type_id"
					placeholder="Выберите тип акции"
					:options="discountTypeOptions"
					:disabled="loadingDictionaries"
					:error-message="fieldErrors.discount_type_id"
				/>

				<TextField
					v-model.number="form.amount"
					label="Значение (% или ₺)"
					required
					name="amount"
					type="number"
					min="0"
					step="0.01"
					:error-message="fieldErrors.amount"
				/>

				<TextField
					v-model.number="form.min_order_amount"
					label="Мин. сумма заказа"
					name="min_order_amount"
					type="number"
					min="0"
					step="0.01"
					:append-icon="TurkishLiraIcon"
					:error-message="fieldErrors.min_order_amount"
				/>

				<TextField
					v-model="form.start_date"
					label="Дата начала"
					name="start_date"
					type="datetime-local"
					:error-message="fieldErrors.start_date"
				/>

				<TextField
					v-model="form.end_date"
					label="Дата окончания"
					name="end_date"
					type="datetime-local"
					:error-message="fieldErrors.end_date"
				/>

				<CheckboxField
					v-model="form.is_percentage"
					label="Процентная скидка"
					name="is_percentage"
					class="md:col-span-2"
				/>

				<CheckboxField v-model="form.is_active" label="Активна" name="is_active" class="md:col-span-1" />

				<div class="md:col-span-2">
					<SelectField
						:model-value="selectedFeaturedCategoryId"
						label="Категории"
						name="target_categories"
						placeholder="Выберите категорию"
						:options="featuredCategoryOptions"
						:disabled="loadingDictionaries"
						@update:model-value="addFeaturedCategory"
					/>
					<div v-if="selectedFeaturedCategories.length" class="mt-3 flex flex-wrap gap-2">
						<span
							v-for="category in selectedFeaturedCategories"
							:key="category.id"
							class="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
						>
							{{ category.label }}
							<Button
								type="button"
								variant="ghost"
								size="icon"
								class-name="h-5 w-5 text-gray-500 hover:text-red-600"
								:on-click="() => removeFeaturedCategory(category.id)"
							>
								✕
							</Button>
						</span>
					</div>
				</div>

				<div class="md:col-span-2">
					<SelectField
						:model-value="selectedSubCategoryId"
						label="Подкатегории"
						name="target_sub_categories"
						placeholder="Выберите подкатегорию"
						:options="subCategoryOptions"
						:disabled="loadingDictionaries"
						@update:model-value="addSubCategory"
					/>
					<div v-if="selectedSubCategories.length" class="mt-3 flex flex-wrap gap-2">
						<span
							v-for="subCategory in selectedSubCategories"
							:key="subCategory.id"
							class="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
						>
							{{ subCategory.label }}
							<Button
								type="button"
								variant="ghost"
								size="icon"
								class-name="h-5 w-5 text-gray-500 hover:text-red-600"
								:on-click="() => removeSubCategory(subCategory.id)"
							>
								✕
							</Button>
						</span>
					</div>
				</div>

				<div class="md:col-span-2">
					<SelectField
						:model-value="selectedProductId"
						label="Товары"
						name="target_products"
						placeholder="Выберите товар"
						:options="productOptions"
						:disabled="loadingDictionaries"
						@update:model-value="addProduct"
					/>
					<div v-if="selectedProducts.length" class="mt-3 flex flex-wrap gap-2">
						<span
							v-for="product in selectedProducts"
							:key="product.id"
							class="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
						>
							{{ product.label }}
							<Button
								type="button"
								variant="ghost"
								size="icon"
								class-name="h-5 w-5 text-gray-500 hover:text-red-600"
								:on-click="() => removeProduct(product.id)"
							>
								✕
							</Button>
						</span>
					</div>
				</div>

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
					<Button type="button" variant="outline" size="sm" @click="$emit('close')"> Отмена </Button>
					<Button type="submit" size="sm" :disabled="saving" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>
