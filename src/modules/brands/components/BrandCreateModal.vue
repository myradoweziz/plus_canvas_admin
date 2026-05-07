<script setup lang="ts">
	import { toTypedSchema } from '@vee-validate/zod'
	import { useForm } from 'vee-validate'
import { ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'
	import { z } from 'zod'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { slugify } from '@/shared'
	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { brandsApi } from '../api/brands'
	import type { Brand } from '../types/brand'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; brand: Brand | null }>()

	const saving = ref(false)
	const slugManuallyEdited = ref(false)
	const lastGeneratedSlug = ref('')

	const { errors, defineField, handleSubmit, resetForm, setValues, values } = useForm({
		initialValues: {
			id: null as number | null,
			name: '',
			slug: '',
			is_active: false,
			featured_order: 0
		},
		validationSchema: toTypedSchema(
			z.object({
				id: z.number().nullable().optional(),
				name: z.string().trim().min(1, 'Укажите название'),
				slug: z.string().trim().min(1, 'Укажите slug'),
				is_active: z.boolean(),
				featured_order: z.coerce.number().min(0, 'Укажите корректный порядок')
			})
		)
	})

	const [name, nameProps] = defineField('name')
	const [slug, slugProps] = defineField('slug')
	const [featuredOrder, featuredOrderProps] = defineField('featured_order')
	const [isActive] = defineField('is_active')

	const resetLocalForm = () => {
		resetForm({ values: { id: null, name: '', slug: '', is_active: false, featured_order: 0 } })
		slugManuallyEdited.value = false
		lastGeneratedSlug.value = ''
	}

	watch(
		() => [props.open, props.brand] as const,
		([open, brand]) => {
			if (!open) return
			if (!brand) {
				resetLocalForm()
				return
			}

			setValues({
				id: brand.id ?? null,
				name: brand.name ?? '',
				slug: brand.slug ?? '',
				is_active: !!brand.is_active,
				featured_order: brand.featured_order ?? 0
			})
			lastGeneratedSlug.value = slugify(brand.name ?? '')
			slugManuallyEdited.value = Boolean(brand.slug && brand.slug !== lastGeneratedSlug.value)
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
			const payload: Brand = {
				id: v.id ?? null,
				name: v.name,
				slug: v.slug,
				is_active: !!v.is_active,
				featured_order: v.featured_order ?? 0
			}

			if (payload.id) {
				await brandsApi.updateBrand(payload)
			} else {
				await brandsApi.createBrand(payload)
			}

			emit('saved')
			emit('close')

			if (!props.brand) resetLocalForm()
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
						{{ brand ? 'Редактировать бренд' : 'Добавить бренд' }}
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
						v-model="(featuredOrder as any)"
						v-bind="featuredOrderProps"
						label="Порядок"
						name="featured_order"
						type="number"
						min="0"
						:error-message="errors.featured_order"
					/>
				</div>

				<CheckboxField v-model="(isActive as any)" label="Активно" name="is_active" class="md:col-span-2" />

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
