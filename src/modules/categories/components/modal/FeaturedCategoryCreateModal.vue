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
	import type { FeaturedCategory, MainCategory } from '../../types/category'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; category: FeaturedCategory | null }>()

	const saving = ref(false)
	const loadingMainCategories = ref(false)
	const mainCategories = ref<MainCategory[]>([])
	const mainCategoriesRequestId = ref(0)
	const slugManuallyEdited = ref(false)
	const lastGeneratedSlug = ref('')
	const categoryTypeOptions = [
		{ label: 'Default', value: 'Default' },
		{ label: 'Öne Çıkan Kategoriler', value: 'Öne Çıkan Kategoriler' },
		{ label: 'En Çok Aranan Kategoriler', value: 'En Çok Aranan Kategoriler' }
	]

	const form = reactive({
		id: null as number | null,
		main_category_id: null as number | null,
		name: '',
		slug: '',
		description: '',
		image: '',
		image_url: '',
		is_active: false,
		featured_order: 0,
		category_type: 'Default',
		meta_title: '',
		meta_description: '',
		discount: 0
	})

	const fieldErrors = reactive({
		main_category_id: '',
		name: '',
		slug: '',
		description: '',
		image: '',
		featured_order: '',
		category_type: '',
		discount: ''
	})

	const resetLocalForm = () => {
		Object.assign(form, {
			id: null,
			main_category_id: null,
			name: '',
			slug: '',
			description: '',
			image: '',
			is_active: false,
			featured_order: 0,
			category_type: 'Default',
			meta_title: '',
			meta_description: '',
			discount: 0
		})
		fieldErrors.main_category_id = ''
		fieldErrors.name = ''
		fieldErrors.slug = ''
		fieldErrors.description = ''
		fieldErrors.image = ''
		fieldErrors.featured_order = ''
		fieldErrors.category_type = ''
		fieldErrors.discount = ''
		slugManuallyEdited.value = false
		lastGeneratedSlug.value = ''
	}

	const validate = () => {
		fieldErrors.main_category_id = ''
		fieldErrors.name = ''
		fieldErrors.slug = ''
		fieldErrors.description = ''
		fieldErrors.image = ''
		fieldErrors.featured_order = ''
		fieldErrors.category_type = ''
		fieldErrors.discount = ''

		let ok = true
		if (form.main_category_id === null) {
			fieldErrors.main_category_id = 'Выберите главную категорию'
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
		if (!String(form.category_type || '').trim()) {
			fieldErrors.category_type = 'Выберите тип категории'
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
				main_category_id: category.main_category_id ?? null,
				name: category.name ?? '',
				slug: category.slug ?? '',
				description: category.description ?? '',
				image: category.image_url ?? '',
				is_active: !!category.is_active,
				featured_order: category.featured_order ?? 0,
				category_type: category.category_type ?? 'Default',
				meta_title: category.meta_title ?? '',
				meta_description: category.meta_description ?? '',
				discount: category.discount ?? 0
			})
			fieldErrors.main_category_id = ''
			fieldErrors.name = ''
			fieldErrors.slug = ''
			fieldErrors.description = ''
			fieldErrors.image = ''
			fieldErrors.featured_order = ''
			fieldErrors.category_type = ''
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

	const mainCategoryOptions = computed(() =>
		mainCategories.value
			.filter((category): category is MainCategory & { id: number } => category.id !== null)
			.map((category) => ({
				label: category.name,
				value: category.id
			}))
	)

	const loadMainCategories = async (name = '') => {
		const requestId = mainCategoriesRequestId.value + 1
		mainCategoriesRequestId.value = requestId
		loadingMainCategories.value = true
		try {
			const result = await categoriesApi.listMainCategories({
				name: name || undefined,
				limit: 100,
				offset: 0
			})

			if (requestId !== mainCategoriesRequestId.value) return
			mainCategories.value = result.items || []
		} finally {
			if (requestId === mainCategoriesRequestId.value) {
				loadingMainCategories.value = false
			}
		}
	}

	const searchMainCategories = debounce((name: string) => {
		loadMainCategories(name)
	}, 300)

	watch(
		() => props.open,
		(open) => {
			if (!open) {
				searchMainCategories.cancel()
				return
			}

			loadMainCategories()
		},
		{ immediate: true }
	)

	onBeforeUnmount(searchMainCategories.cancel)

	const onSlugInput = (value: string | number) => {
		form.slug = String(value)
		slugManuallyEdited.value = String(value) !== lastGeneratedSlug.value
	}

	const onSubmit = async () => {
		if (!validate()) return

		saving.value = true
		try {
			const payload: FeaturedCategory = {
				id: form.id ?? null,
				main_category_id: form.main_category_id,
				name: form.name.trim(),
				slug: form.slug.trim(),
				description: form.description?.trim?.() ? form.description.trim() : (form.description ?? ''),
				image: form.image || form.image_url || '',
				is_active: !!form.is_active,
				featured_order: Number(form.featured_order) || 0,
				category_type: form.category_type as FeaturedCategory['category_type'],
				meta_title: form.meta_title.trim(),
				meta_description: form.meta_description.trim(),
				discount: Number(form.discount) || 0
			}
			if (payload.id) {
				await categoriesApi.updateFeaturedCategory(payload)
			} else {
				await categoriesApi.createFeaturedCategory(payload)
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
		<div
			class="relative z-100000 mx-auto w-[92vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
		>
			<div class="flex items-start justify-between gap-4">
				<h3 class="text-lg font-semibold text-gray-900">
					{{ category ? 'Редактировать категорию' : 'Добавить категорию' }}
				</h3>
				<Button type="button" variant="ghost" size="icon" :on-click="() => $emit('close')" aria-label="Close">
					✕
				</Button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
				<div class="md:col-span-1">
					<SelectField
						v-model="form.main_category_id"
						label="Главная категория"
						required
						name="main_category_id"
						placeholder="Выберите главную категорию"
						:options="mainCategoryOptions"
						:disabled="loadingMainCategories"
						:error-message="fieldErrors.main_category_id"
						remote-search
						@search="searchMainCategories"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField
						v-model="form.name"
						label="Название"
						required
						name="name"
						placeholder="Название"
						:error-message="fieldErrors.name"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField
						v-model="form.slug"
						label="Slug"
						required
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
						required
						name="featured_order"
						type="number"
						min="0"
						:error-message="fieldErrors.featured_order"
					/>
				</div>

				<div class="md:col-span-1">
					<SelectField
						v-model="form.category_type"
						label="Тип категории"
						required
						name="category_type"
						placeholder="Выберите тип категории"
						:options="categoryTypeOptions"
						:error-message="fieldErrors.category_type"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField
						v-model.number="form.discount"
						label="Скидка"
						required
						name="discount"
						type="number"
						min="0"
						:error-message="fieldErrors.discount"
					/>
				</div>

				<div class="md:col-span-2">
					<TextareaField
						v-model="form.description"
						label="Описание"
						name="description"
						placeholder="Описание"
						:error-message="fieldErrors.description"
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
						label="Изображение"
						required
						description="Файл будет загружен сразу, в форму сохранится URL."
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
