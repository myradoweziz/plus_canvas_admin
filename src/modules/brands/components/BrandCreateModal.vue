<script setup lang="ts">
	import { reactive, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

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

	const form = reactive({
		id: null as number | null,
		name: '',
		slug: '',
		is_active: false,
		featured_order: 0 as number | string
	})

	const fieldErrors = reactive({
		name: '',
		slug: '',
		featured_order: ''
	})

	const resetLocalForm = () => {
		Object.assign(form, { id: null, name: '', slug: '', is_active: false, featured_order: 0 })
		fieldErrors.name = ''
		fieldErrors.slug = ''
		fieldErrors.featured_order = ''
		slugManuallyEdited.value = false
		lastGeneratedSlug.value = ''
	}

	const validate = () => {
		fieldErrors.name = ''
		fieldErrors.slug = ''
		fieldErrors.featured_order = ''

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
		return ok
	}

	watch(
		() => [props.open, props.brand] as const,
		([open, brand]) => {
			if (!open) return
			if (!brand) {
				resetLocalForm()
				return
			}

			Object.assign(form, {
				id: brand.id ?? null,
				name: brand.name ?? '',
				slug: brand.slug ?? '',
				is_active: !!brand.is_active,
				featured_order: brand.featured_order ?? 0
			})
			fieldErrors.name = ''
			fieldErrors.slug = ''
			fieldErrors.featured_order = ''
			lastGeneratedSlug.value = slugify(brand.name ?? '')
			slugManuallyEdited.value = Boolean(brand.slug && brand.slug !== lastGeneratedSlug.value)
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
			const payload: Brand = {
				id: form.id ?? null,
				name: form.name.trim(),
				slug: form.slug.trim(),
				is_active: !!form.is_active,
				featured_order: Number(form.featured_order) || 0
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
	}
</script>

<template>
	<Modal v-if="open" @close="$emit('close')">
		<div class="relative z-100000 mx-auto w-[92vw] max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0">
					<h3 class="text-lg font-semibold text-gray-900">
						{{ brand ? 'Редактировать тег' : 'Добавить тег' }}
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
