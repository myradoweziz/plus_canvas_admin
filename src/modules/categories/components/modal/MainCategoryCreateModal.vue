<script setup lang="ts">
	import { toTypedSchema } from '@vee-validate/zod'
	import { useForm } from 'vee-validate'
	import { computed, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'
	import { z } from 'zod'

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

	const { errors, defineField, handleSubmit, resetForm, setValues, values } = useForm({
		initialValues: {
			id: null as number | null,
			name: '',
			slug: '',
			description: '',
			images: [] as string[],
			is_active: false,
			featured_order: 0,
			category_type: 'Kişiye Özel Kanvas '
		},
		validationSchema: toTypedSchema(
			z.object({
				id: z.number().nullable().optional(),
				name: z.string().trim().min(1, 'Укажите название'),
				slug: z.string().trim().min(1, 'Укажите slug'),
				description: z.string().trim().optional().nullable(),
				images: z.array(z.string()).optional(),
				is_active: z.boolean(),
				featured_order: z.coerce.number().min(0, 'Укажите корректный порядок'),
				category_type: z.string().trim().min(1, 'Выберите тип категории')
			})
		)
	})

	const imagesModel = computed<Array<string | File>>({
		get: () => values.images || [],
		set: (value) => {
			setValues({ ...values, images: value.filter((item): item is string => typeof item === 'string') } as any)
		}
	})

	const [name, nameProps] = defineField('name')
	const [slug, slugProps] = defineField('slug')
	const [featuredOrder, featuredOrderProps] = defineField('featured_order')
	const [categoryType, categoryTypeProps] = defineField('category_type')
	const [description, descriptionProps] = defineField('description')
	const [isActive] = defineField('is_active')

	const resetLocalForm = () => {
		resetForm({
			values: {
				id: null,
				name: '',
				slug: '',
				description: '',
				images: [],
				is_active: false,
				featured_order: 0,
				category_type: 'Kişiye Özel Kanvas '
			}
		})
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

			setValues({
				id: category.id ?? null,
				name: category.name ?? '',
				slug: category.slug ?? '',
				description: category.description ?? '',
				images: Array.isArray(category.images) ? category.images : [],
				is_active: !!category.is_active,
				featured_order: category.featured_order ?? 0,
				category_type: category.category_type ?? 'Kişiye Özel Kanvas '
			})
			lastGeneratedSlug.value = slugify(category.name ?? '')
			slugManuallyEdited.value = Boolean(category.slug && category.slug !== lastGeneratedSlug.value)
		},
		{ immediate: true }
	)

	watch(
		() => values.name,
		(name) => {
			const generatedSlug = slugify(name ?? '')

			if (!slugManuallyEdited.value || !values.slug || values.slug === lastGeneratedSlug.value) {
				setValues({ ...values, slug: generatedSlug } as any)
				slugManuallyEdited.value = false
			}

			lastGeneratedSlug.value = generatedSlug
		}
	)

	const onSlugInput = (value: string | number) => {
		setValues({ ...values, slug: String(value) } as any)
		slugManuallyEdited.value = String(value) !== lastGeneratedSlug.value
	}

	const onSubmit = handleSubmit(async (v) => {
		saving.value = true
		try {
			const payload: MainCategory = {
				id: v.id ?? null,
				name: v.name,
				slug: v.slug,
				description: v.description ?? '',
				images: v.images ?? [],
				is_active: !!v.is_active,
				featured_order: v.featured_order ?? 0,
				category_type: v.category_type as MainCategory['category_type']
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
	})
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
						v-model="name"
						v-bind="nameProps"
						label="Название *"
						name="name"
						placeholder="Название"
						:error-message="errors.name"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField
						v-model="slug"
						v-bind="slugProps"
						label="Slug"
						name="slug"
						placeholder="Slug"
						:error-message="errors.slug"
						@update:model-value="onSlugInput"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField
						:model-value="featuredOrder as any"
						v-bind="featuredOrderProps"
						label="Порядок"
						name="featured_order"
						type="number"
						min="0"
						:error-message="errors.featured_order"
						@update:model-value="(v) => ((featuredOrder as any).value = v)"
					/>
				</div>

				<div class="md:col-span-1">
					<SelectField
						v-model="categoryType"
						v-bind="categoryTypeProps"
						label="Тип категории *"
						name="category_type"
						placeholder="Выберите тип категории"
						:options="categoryTypeOptions"
						:error-message="errors.category_type"
					/>
				</div>

				<div class="md:col-span-2">
					<TextareaField
						:model-value="description as any"
						v-bind="descriptionProps"
						label="Описание"
						name="description"
						placeholder="Описание"
						:error-message="errors.description"
						@update:model-value="(v) => ((description as any).value = v)"
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
					:model-value="isActive as any"
					label="Активно"
					name="is_active"
					class="md:col-span-2"
					@update:model-value="(v) => ((isActive as any).value = v)"
				/>

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
					<Button type="button" variant="outline" size="sm" @click="$emit('close')"> Отмена </Button>
					<Button type="submit" size="sm" :disabled="saving || Object.values(errors).some(Boolean)" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>
