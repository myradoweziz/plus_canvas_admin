<script setup lang="ts">
	import { computed, reactive, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import MultiImageUpload from '@/shared/ui/MultiImageUpload.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { slugify } from '@/shared'
	import { mediaApi } from '@/shared/api/media'
	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { categoriesApi } from '../../api'
	import type { MainCategory } from '../../types/category'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; category: MainCategory | null }>()

	const saving = ref(false)
	const slugManuallyEdited = ref(false)
	const lastGeneratedSlug = ref('')
	const categoryTypeOptions = [
		{ label: 'Kişiye Özel Kanvas', value: 'Kişiye Özel Kanvas ' },
		{ label: 'Tablo Kanvas Tablo Galerisi', value: 'Tablo  Kanvas Tablo Galerisi' }
	]

	const form = reactive({
		id: null as number | null,
		name: '',
		slug: '',
		description: '',
		images: [] as string[],
		is_active: false,
		featured_order: 0 as number | string,
		category_type: 'Kişiye Özel Kanvas '
	})

	const fieldErrors = reactive({
		name: '',
		slug: '',
		description: '',
		featured_order: '',
		category_type: ''
	})

	const imagesModel = computed<Array<string | File>>({
		get: () => form.images || [],
		set: (value) => {
			form.images = value.filter((item): item is string => typeof item === 'string')
		}
	})

	const resetLocalForm = () => {
		Object.assign(form, {
			id: null,
			name: '',
			slug: '',
			description: '',
			images: [],
			is_active: false,
			featured_order: 0,
			category_type: 'Kişiye Özel Kanvas '
		})
		fieldErrors.name = ''
		fieldErrors.slug = ''
		fieldErrors.description = ''
		fieldErrors.featured_order = ''
		fieldErrors.category_type = ''
	}

	const validate = () => {
		fieldErrors.name = ''
		fieldErrors.slug = ''
		fieldErrors.description = ''
		fieldErrors.featured_order = ''
		fieldErrors.category_type = ''

		let ok = true
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
		return ok
	}

	watch(
		() => [props.open, props.category] as const,
		([open, category]) => {
			if (!open) return
			if (!category) {
				resetLocalForm()
				slugManuallyEdited.value = false
				lastGeneratedSlug.value = ''
				return
			}

			Object.assign(form, {
				id: category.id ?? null,
				name: category.name ?? '',
				slug: category.slug ?? '',
				description: category.description ?? '',
				images: Array.isArray(category.images) ? category.images : [],
				is_active: !!category.is_active,
				featured_order: category.featured_order ?? 0,
				category_type: category.category_type ?? 'Kişiye Özel Kanvas '
			})
			fieldErrors.name = ''
			fieldErrors.slug = ''
			fieldErrors.description = ''
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

	const onSlugInput = (value: string | number) => {
		form.slug = String(value)
		slugManuallyEdited.value = String(value) !== lastGeneratedSlug.value
	}

	const onSubmit = async () => {
		if (!validate()) return

		saving.value = true
		try {
			const payload: MainCategory = {
				id: form.id ?? null,
				name: form.name.trim(),
				slug: form.slug.trim(),
				description: form.description?.trim?.() ? form.description.trim() : form.description ?? '',
				images: form.images ?? [],
				is_active: !!form.is_active,
				featured_order: Number(form.featured_order) || 0,
				category_type: form.category_type as MainCategory['category_type']
			}
			if (payload.id) {
				await categoriesApi.updateMainCategory(payload)
			} else {
				await categoriesApi.createMainCategory(payload)
			}

			emit('saved')
			emit('close')

			if (!props.category) {
				resetLocalForm()
			}
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
		<div class="relative z-100000 mx-auto w-[92vw] max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0">
					<h3 class="text-lg font-semibold text-gray-900">
						{{ props.category ? 'Редактировать главную категорию' : 'Добавить главную категорию' }}
					</h3>
					<p class="mt-1 text-sm text-gray-600">Заполните поля и сохраните.</p>
				</div>
				<Button type="button" variant="ghost" size="icon" :on-click="() => $emit('close')" aria-label="Close">
					✕
				</Button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
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
					<SelectField
						v-model="form.category_type"
						label="Тип категории *"
						name="category_type"
						placeholder="Выберите тип категории"
						:options="categoryTypeOptions"
						:error-message="fieldErrors.category_type"
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
					<MultiImageUpload
						v-model="imagesModel"
						label="Изображения"
						description="Загрузите одну или несколько картинок для категории."
						:uploader="(files, onProgress) => mediaApi.uploadImages(files, onProgress)"
					/>
				</div>

				<CheckboxField
					v-model="form.is_active"
					label="Активно"
					name="is_active"
					class="md:col-span-2"
				/>

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
