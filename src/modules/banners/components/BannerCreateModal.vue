<script setup lang="ts">
	import { reactive, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import SingleImageUpload from '@/shared/ui/SingleImageUpload.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'

	import { mediaApi } from '@/shared/api/media'
	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { bannersApi } from '../api/banners'
	import type { Banner } from '../types/banner'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'created'): void }>()

	const props = defineProps<{ open: boolean; banner: Banner | null }>()

	const saving = ref(false)

	const normalizeUrl = (raw: string) => {
		const trimmed = raw.trim()
		if (!trimmed) return ''
		return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
	}

	const isValidUrl = (raw: string) => {
		const value = normalizeUrl(raw)
		if (!value) return false
		try {
			// eslint-disable-next-line no-new
			new URL(value)
			return true
		} catch {
			return false
		}
	}

	const form = reactive({
		id: null as number | null,
		title: '',
		description: '',
		image: '',
		url: '',
		order: 0,
		is_active: false
	})

	const fieldErrors = reactive({
		title: '',
		url: '',
		image: ''
	})

	const clearFieldErrors = () => {
		fieldErrors.title = ''
		fieldErrors.url = ''
		fieldErrors.image = ''
	}

	const validate = () => {
		clearFieldErrors()
		let ok = true

		if (!form.title.trim()) {
			fieldErrors.title = 'Укажите заголовок'
			ok = false
		}

		const urlTrim = form.url.trim()
		if (!urlTrim) {
			fieldErrors.url = 'Укажите URL'
			ok = false
		} else if (!isValidUrl(urlTrim)) {
			fieldErrors.url = 'Некорректный URL'
			ok = false
		}

		if (!form.id && !form.image.trim()) {
			fieldErrors.image = 'Выберите изображение'
			ok = false
		}

		return ok
	}

	const resetLocalForm = () => {
		Object.assign(form, {
			id: null,
			title: '',
			description: '',
			url: '',
			order: 0,
			is_active: false,
			image: ''
		})
		clearFieldErrors()
	}

	watch(
		() => [props.open, props.banner] as const,
		([open, banner]) => {
			if (!open) return
			if (!banner) {
				resetLocalForm()
				return
			}
			Object.assign(form, {
				id: banner.id ?? null,
				title: banner.title ?? '',
				description: banner.description ?? '',
				url: banner.url ?? '',
				order: banner.order ?? 0,
				is_active: !!banner.is_active,
				image: banner.image_url ?? ''
			})
			clearFieldErrors()
		},
		{ immediate: true }
	)

	const onSubmit = async () => {
		if (!validate()) return

		saving.value = true
		try {
			const payload: Banner = {
				id: form.id,
				title: form.title.trim(),
				description: form.description.trim(),
				url: normalizeUrl(form.url),
				order: Number(form.order) || 0,
				is_active: form.is_active,
				image: form.image || ''
			}

			if (props.banner?.id) {
				await bannersApi.updateBanner(payload)
			} else {
				await bannersApi.createBanner(payload)
			}

			emit('created')
			emit('close')

			if (!props.banner) {
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
						{{ banner ? 'Редактировать баннер' : 'Добавить баннер' }}
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
						v-model="form.title"
						label="Заголовок"
						name="title"
						placeholder="Заголовок"
						:error-message="fieldErrors.title"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField v-model.number="form.order" label="Порядок" name="order" type="number" min="0" />
				</div>

				<div class="md:col-span-2">
					<TextareaField v-model="form.description" label="Описание" name="description" />
				</div>

				<div class="md:col-span-2">
					<TextField v-model="form.url" label="URL" name="url" placeholder="URL" :error-message="fieldErrors.url" />
				</div>

				<div class="md:col-span-2">
					<SingleImageUpload
						v-model="form.image"
						:current-url="form.image || ''"
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
