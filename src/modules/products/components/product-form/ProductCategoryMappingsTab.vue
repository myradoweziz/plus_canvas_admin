<script setup lang="ts">
	import { computed, onMounted, ref } from 'vue'
	import { toast } from 'vue3-toastify'

	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { categoriesApi } from '@/modules/categories/api'
	import type { FeaturedCategory } from '@/modules/categories/types/category'
	import IconTrash from '@/shared/icons/TrashIcon.vue'
	import { api } from '../../api'
	import { getErrorMessage, getValidationErrors } from '../../helpers/form-errors'
	import { createEmptyCategoryMapping } from '../../helpers/product-form'
	import { validateProductCategoryMappings } from '../../helpers/product-form-validation'
	import type { CanvasProductCategoryMapping } from '../../types/product'

	const props = defineProps<{
		productId: number | null
	}>()

	const categoryMappings = defineModel<CanvasProductCategoryMapping[]>('categoryMappings', { required: true })

	const emit = defineEmits<{
		saved: [mappings: CanvasProductCategoryMapping[]]
	}>()

	const saving = ref(false)
	const loadingCategories = ref(false)
	const featuredCategories = ref<FeaturedCategory[]>([])
	const validationErrors = ref<Record<string, string>>({})

	const categoryOptions = computed(() =>
		featuredCategories.value
			.filter((category): category is FeaturedCategory & { id: number } => category.id !== null)
			.map((category) => ({
				label: category.main_category?.name ? `${category.name} (${category.main_category.name})` : category.name,
				value: category.id
			}))
	)

	const loadFeaturedCategories = async () => {
		loadingCategories.value = true
		try {
			const result = await categoriesApi.listFeaturedCategories({ limit: 500, offset: 0 })
			featuredCategories.value = result.items || []
		} finally {
			loadingCategories.value = false
		}
	}

	const clearRowError = (index: number, field: 'category_id' | 'display_order') => {
		const key = `category_mappings.${index}.${field}`
		if (!validationErrors.value[key]) return
		const next = { ...validationErrors.value }
		delete next[key]
		validationErrors.value = next
	}

	const addMapping = () => {
		categoryMappings.value = [...categoryMappings.value, createEmptyCategoryMapping()]
	}

	const removeMapping = (index: number) => {
		categoryMappings.value = categoryMappings.value.filter((_, itemIndex) => itemIndex !== index)
		validationErrors.value = validateProductCategoryMappings(categoryMappings.value)
	}

	const updateCategoryId = (index: number, value: string | number | null) => {
		const id = value === null ? 0 : Number(value)
		categoryMappings.value[index].category_id = Number.isFinite(id) ? id : 0
		clearRowError(index, 'category_id')
	}

	const updateDisplayOrder = (index: number, value: string | number | null) => {
		const num = value === '' || value === null ? 0 : Number(value)
		categoryMappings.value[index].display_order = Number.isFinite(num) ? num : 0
		clearRowError(index, 'display_order')
	}

	const onSave = async () => {
		if (!props.productId) {
			toast.error('Сначала сохраните продукт на вкладке Product Info')
			return
		}

		validationErrors.value = validateProductCategoryMappings(categoryMappings.value)
		if (Object.keys(validationErrors.value).length > 0) {
			toast.error(Object.values(validationErrors.value)[0] || 'Исправьте ошибки в привязках категорий')
			return
		}

		saving.value = true

		try {
			const saved = await api.saveCanvasProductCategories(props.productId, categoryMappings.value)
			categoryMappings.value = saved
			emit('saved', saved)
			toast.success('Привязки категорий сохранены')
		} catch (error) {
			validationErrors.value = getValidationErrors(error)
			toast.error(getErrorMessage(error, 'Не удалось сохранить привязки категорий'))
		} finally {
			saving.value = false
		}
	}

	onMounted(() => {
		loadFeaturedCategories()
	})
</script>

<template>
	<div class="contents">
		<div
			v-if="!productId"
			class="md:col-span-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
		>
			Сначала сохраните продукт на вкладке <strong>Product Info</strong>, затем настройте привязки категорий.
		</div>

		<div class="md:col-span-3 flex items-center justify-between gap-3">
			<p class="text-sm text-gray-600">Связь продукта с категориями (categories).</p>
			<Button type="button" variant="outline" size="sm" :disabled="!productId" :on-click="addMapping">
				Добавить категорию
			</Button>
		</div>

		<div
			v-for="(mapping, index) in categoryMappings"
			:key="index"
			class="md:col-span-3 rounded-xl border border-gray-200 bg-gray-50 p-4"
		>
			<div class="mb-3 flex items-center justify-between gap-2">
				<p class="text-sm font-semibold text-gray-900">Привязка #{{ index + 1 }}</p>
				<Button type="button" variant="ghost" size="sm" :disabled="!productId" :on-click="() => removeMapping(index)">
					<IconTrash size="16" class="text-gray-500 hover:text-red-600" />
				</Button>
			</div>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<SelectField
					:model-value="mapping.category_id || null"
					label="Категория"
					required
					:name="`category_mapping_category_${index}`"
					placeholder="Выберите категорию"
					:options="categoryOptions"
					:disabled="!productId || loadingCategories"
					:error-message="validationErrors[`category_mappings.${index}.category_id`]"
					@update:model-value="(value) => updateCategoryId(index, value)"
				/>

				<TextField
					:model-value="mapping.display_order"
					label="Порядок отображения"
					required
					:name="`category_mapping_order_${index}`"
					type="number"
					min="0"
					:disabled="!productId"
					:error-message="validationErrors[`category_mappings.${index}.display_order`]"
					@update:model-value="(value) => updateDisplayOrder(index, value)"
				/>

				<div class="flex items-end pb-1">
					<CheckboxField
						v-model="mapping.is_featured"
						label="Featured"
						:name="`category_mapping_featured_${index}`"
						:disabled="!productId"
					/>
				</div>
			</div>
		</div>

		<div class="mt-2 flex items-center justify-end gap-3 md:col-span-3">
			<Button type="button" size="sm" :disabled="!productId || saving" :loading="saving" :on-click="onSave">
				{{ saving ? 'Сохранение...' : 'Сохранить привязки' }}
			</Button>
		</div>
	</div>
</template>
