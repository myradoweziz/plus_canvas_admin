<script setup lang="ts">
	import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import SingleImageUpload from '@/shared/ui/SingleImageUpload.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { debounce, slugify } from '@/shared'
	import { mediaApi } from '@/shared/api/media'
	import { categoriesApi } from '../../api'
	import type { FeaturedCategory, SubCategory } from '../../types/category'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; category: SubCategory | null }>()

	const saving = ref(false)
	const loadingFeaturedCategories = ref(false)
	const featuredCategories = ref<FeaturedCategory[]>([])
	const featuredCategoriesRequestId = ref(0)
	const slugManuallyEdited = ref(false)
	const lastGeneratedSlug = ref('')

	const form = reactive({
		id: null as number | null,
		category_id: null as number | null,
		name: '',
		slug: '',
		image: '',
		image_url: '',
		is_active: false,
		featured_order: 0,
		meta_title: '',
		meta_description: '',
		discount: 0
	})

	const fieldErrors = reactive({
		category_id: '',
		name: '',
		slug: '',
		image: '',
		featured_order: '',
		discount: ''
	})

	const resetLocalForm = () => {
		Object.assign(form, {
			id: null,
			category_id: null,
			name: '',
			slug: '',
			image: '',
			image_url: '',
			is_active: false,
			featured_order: 0,
			meta_title: '',
			meta_description: '',
			discount: 0
		})
		fieldErrors.category_id = ''
		fieldErrors.name = ''
		fieldErrors.slug = ''
		fieldErrors.image = ''
		fieldErrors.featured_order = ''
		fieldErrors.discount = ''
		slugManuallyEdited.value = false
		lastGeneratedSlug.value = ''
	}

	const validate = () => {
		fieldErrors.category_id = ''
		fieldErrors.name = ''
		fieldErrors.slug = ''
		fieldErrors.image = ''
		fieldErrors.featured_order = ''
		fieldErrors.discount = ''

		let ok = true
		if (form.category_id === null) {
			fieldErrors.category_id = 'Выберите категорию'
			ok = false
		}
		if (!form.name.trim()) {
			fieldErrors.name = 'Укажите название'
			ok = false
		}
		if (!form.slug.trim()) {
			fieldErrors.slug = 'Укажите slug'
			ok = false
		}
		const featuredOrder = Number(form.featured_order)
		if (!Number.isFinite(featuredOrder) || featuredOrder < 0) {
			fieldErrors.featured_order = 'Укажите корректный порядок'
			ok = false
		}
		if (!String(form.image || form.image_url || '').trim()) {
			fieldErrors.image = 'Загрузите изображение'
			ok = false
		}
		const discount = Number(form.discount)
		if (!Number.isFinite(discount) || discount < 0) {
			fieldErrors.discount = 'Укажите корректную скидку'
			ok = false
		}
		return ok
	}

	watch(
		() => [props.open, props.category] as const,
		([open, category]) => {
			if (!open) return
			if (!category) {
				resetLocalForm()
				return
			}

			Object.assign(form, {
				id: category.id ?? null,
				category_id: category.category_id ?? null,
				name: category.name ?? '',
				slug: category.slug ?? '',
				image: category.image_url ?? category.image ?? '',
				image_url: category.image_url ?? category.image ?? '',
				is_active: !!category.is_active,
				featured_order: category.featured_order ?? 0,
				meta_title: category.meta_title ?? '',
				meta_description: category.meta_description ?? '',
				discount: category.discount ?? 0
			})
			fieldErrors.category_id = ''
			fieldErrors.name = ''
			fieldErrors.slug = ''
			fieldErrors.image = ''
			fieldErrors.featured_order = ''
			lastGeneratedSlug.value = slugify(category.name ?? '')
			slugManuallyEdited.value = Boolean(category.slug && category.slug !== lastGeneratedSlug.value)
		},
		{ immediate: true }
	)

	watch(
		() => form.name,
		(name) => {
			const generatedSlug = slugify(name ?? '')

			if (!slugManuallyEdited.value || !form.slug || form.slug === lastGeneratedSlug.value) {
				form.slug = generatedSlug
				slugManuallyEdited.value = false
			}

			lastGeneratedSlug.value = generatedSlug
		}
	)

	watch(
		() => form.image,
		(image) => {
			if (String(image || '').trim()) fieldErrors.image = ''
		}
	)

	const featuredCategoryOptions = computed(() =>
		featuredCategories.value
			.filter((category): category is FeaturedCategory & { id: number } => category.id !== null)
			.map((category) => ({
				label: `${category.name} (${category.main_category?.name})`,
				value: category.id
			}))
	)

	const loadFeaturedCategories = async (name = '') => {
		const requestId = featuredCategoriesRequestId.value + 1
		featuredCategoriesRequestId.value = requestId
		loadingFeaturedCategories.value = true
		try {
			const result = await categoriesApi.listFeaturedCategories({
				name: name || undefined,
				limit: 100,
				offset: 0
			})

			if (requestId !== featuredCategoriesRequestId.value) return
			featuredCategories.value = result.items || []
		} finally {
			if (requestId === featuredCategoriesRequestId.value) {
				loadingFeaturedCategories.value = false
			}
		}
	}

	const searchFeaturedCategories = debounce((name: string) => {
		loadFeaturedCategories(name)
	}, 300)

	watch(
		() => props.open,
		(open) => {
			if (!open) {
				searchFeaturedCategories.cancel()
				return
			}

			loadFeaturedCategories()
		},
		{ immediate: true }
	)

	onBeforeUnmount(searchFeaturedCategories.cancel)

	const onSlugInput = (value: string | number) => {
		form.slug = String(value)
		slugManuallyEdited.value = String(value) !== lastGeneratedSlug.value
	}

	const onSubmit = async () => {
		if (!validate()) return

		saving.value = true
		try {
			const payload: SubCategory = {
				id: form.id ?? null,
				category_id: form.category_id,
				name: form.name.trim(),
				slug: form.slug.trim(),
				image: form.image || form.image_url || '',
				is_active: !!form.is_active,
				featured_order: Number(form.featured_order) || 0,
				meta_title: form.meta_title.trim(),
				meta_description: form.meta_description.trim(),
				discount: Number(form.discount) || 0
			}
			if (payload.id) {
				await categoriesApi.updateSubCategory(payload)
			} else {
				await categoriesApi.createSubCategory(payload)
			}

			emit('saved')
			emit('close')

			if (!props.category) {
				resetLocalForm()
			}
		} finally {
			saving.value = false
		}
	}
</script>

<template>
	<Modal v-if="open" @close="$emit('close')">
		<div class="relative z-100000 mx-auto w-[92vw] max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
			<div class="flex items-start justify-between gap-4">
				<h3 class="text-lg font-semibold text-gray-900">
					{{ props.category ? 'Редактировать категорию' : 'Добавить категорию' }}
				</h3>
				<Button type="button" variant="ghost" size="icon" :on-click="() => $emit('close')" aria-label="Close">
					✕
				</Button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
				<div class="md:col-span-1">
					<SelectField
						v-model="form.category_id"
						label="Категория *"
						name="category_id"
						placeholder="Выберите категорию"
						:options="featuredCategoryOptions"
						:disabled="loadingFeaturedCategories"
						:error-message="fieldErrors.category_id"
						remote-search
						@search="searchFeaturedCategories"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField
						v-model="form.name"
						label="Название *"
						name="name"
						placeholder="Название"
						:error-message="fieldErrors.name"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField
						v-model="form.slug"
						label="Slug"
						name="slug"
						placeholder="Slug"
						:error-message="fieldErrors.slug"
						@update:model-value="onSlugInput"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField
						v-model.number="form.featured_order"
						label="Порядок"
						name="featured_order"
						type="number"
						min="0"
						:error-message="fieldErrors.featured_order"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField
						v-model.number="form.discount"
						label="Скидка"
						name="discount"
						type="number"
						min="0"
						:error-message="fieldErrors.discount"
					/>
				</div>

				<div class="md:col-span-2">
					<TextField
						v-model.trim="form.meta_title"
						label="Meta title (SEO)"
						name="meta_title"
						placeholder="Meta title"
					/>
				</div>

				<div class="md:col-span-2">
					<TextareaField
						v-model.trim="form.meta_description"
						label="Meta description (SEO)"
						name="meta_description"
						placeholder="Meta description"
					/>
				</div>

				<div class="md:col-span-2">
					<SingleImageUpload
						v-model="form.image"
						label="Изображение *"
						description="Обязательно. Файл будет загружен сразу, в форму сохранится URL."
						:error-message="fieldErrors.image"
						:uploader="mediaApi.uploadImages"
					/>
				</div>

				<CheckboxField v-model="form.is_active" label="Активно" name="is_active" class="md:col-span-2" />

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
