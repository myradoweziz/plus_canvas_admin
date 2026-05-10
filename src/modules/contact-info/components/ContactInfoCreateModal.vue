<script setup lang="ts">
	import { reactive, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import ImageUpload from '@/shared/ui/ImageUpload.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { contactInfoApi } from '../api/contact-info'
	import type { ContactInfo } from '../types/contact-info'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()
	const props = defineProps<{ open: boolean; contactInfo?: ContactInfo | null }>()

	const saving = ref(false)

	const form = reactive({
		id: null as number | null,
		phone_number: '',
		address: '',
		email: '',
		slogan: '',
		logo: null as File | null
	})

	const fieldErrors = reactive({
		phone_number: '',
		address: '',
		email: '',
		slogan: '',
		logo: ''
	})

	const reset = () => {
		Object.assign(form, { id: null, phone_number: '', address: '', email: '', slogan: '', logo: null })
		fieldErrors.phone_number = ''
		fieldErrors.address = ''
		fieldErrors.email = ''
		fieldErrors.slogan = ''
		fieldErrors.logo = ''
	}

	const validate = () => {
		fieldErrors.phone_number = ''
		fieldErrors.address = ''
		fieldErrors.email = ''
		fieldErrors.slogan = ''
		fieldErrors.logo = ''

		let ok = true
		if (!form.phone_number.trim()) {
			fieldErrors.phone_number = 'Укажите телефон'
			ok = false
		}
		if (!form.address.trim()) {
			fieldErrors.address = 'Укажите адрес'
			ok = false
		}
		const email = form.email.trim()
		if (!email) {
			fieldErrors.email = 'Укажите email'
			ok = false
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			fieldErrors.email = 'Некорректный email'
			ok = false
		}
		if (!form.slogan.trim()) {
			fieldErrors.slogan = 'Укажите слоган'
			ok = false
		}
		return ok
	}

	watch(
		() => [props.open, props.contactInfo] as const,
		([open, contactInfo]) => {
			if (!open) {
				reset()
				return
			}

			Object.assign(form, {
				id: contactInfo?.id ?? null,
				phone_number: contactInfo?.phone_number ? String(contactInfo.phone_number) : '',
				address: contactInfo?.address ? String(contactInfo.address) : '',
				email: contactInfo?.email ? String(contactInfo.email) : '',
				slogan: contactInfo?.slogan ? String(contactInfo.slogan) : '',
				logo: null
			})
			fieldErrors.phone_number = ''
			fieldErrors.address = ''
			fieldErrors.email = ''
			fieldErrors.slogan = ''
			fieldErrors.logo = ''
		}
	)

	const onSubmit = async () => {
		if (!validate()) return

		saving.value = true
		try {
			await contactInfoApi.saveContactInfo({
				id: props.contactInfo?.id ?? null,
				phone_number: form.phone_number.trim(),
				address: form.address.trim(),
				email: form.email.trim(),
				slogan: form.slogan.trim(),
				logo: form.logo ?? null
			})
			toast.success('Данные сохранены')
			emit('saved')
			emit('close')
		} catch (err) {
			const msg = getFirstBackendValidationMessage(err)
			toast.error(msg || 'Не удалось сохранить данные')
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
						{{ props.contactInfo?.id ? 'Редактировать контактную информацию' : 'Добавить контактную информацию' }}
					</h3>
					<p class="mt-1 text-sm text-gray-600">Заполните поля и сохраните.</p>
				</div>
				<Button type="button" variant="ghost" size="icon" :on-click="() => $emit('close')" aria-label="Close">
					✕
				</Button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
				<TextField
					v-model="form.phone_number"
					label="Телефон"
					name="phone_number"
					:error-message="fieldErrors.phone_number"
					type="tel"
				/>
				<TextField
					v-model="form.email"
					label="Email"
					name="email"
					type="email"
					placeholder="email@example.com"
					:error-message="fieldErrors.email"
				/>

				<div class="md:col-span-2">
					<TextareaField
						v-model="form.address"
						label="Адрес"
						name="address"
						placeholder="Адрес"
						:error-message="fieldErrors.address"
					/>
				</div>

				<div class="md:col-span-2">
					<TextareaField
						v-model="form.slogan"
						label="Слоган"
						name="slogan"
						placeholder="Слоган"
						:error-message="fieldErrors.slogan"
					/>
				</div>

				<div class="md:col-span-2">
					<ImageUpload
						:model-value="form.logo"
						label="Логотип"
						description="Выберите изображение — отправим как файл при сохранении."
						:current-url="props.contactInfo?.logo || ''"
						:error-message="fieldErrors.logo"
						@update:model-value="(v) => (form.logo = v)"
					/>
				</div>

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
					<Button type="button" variant="outline" size="sm" :on-click="() => $emit('close')">Отмена</Button>
					<Button type="submit" size="sm" :disabled="saving" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>
