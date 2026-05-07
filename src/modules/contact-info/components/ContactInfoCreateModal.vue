<script setup lang="ts">
	import { toTypedSchema } from '@vee-validate/zod'
	import { useForm } from 'vee-validate'
	import { ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'
	import { z } from 'zod'

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

	const { errors, defineField, handleSubmit, resetForm, setValues } = useForm({
		initialValues: {
			id: null as number | null,
			phone_number: '',
			address: '',
			email: '',
			slogan: '',
			logo: null as File | null
		},
		validationSchema: toTypedSchema(
			z.object({
				id: z.number().nullable().optional(),
				phone_number: z.string().trim().min(1, 'Укажите телефон'),
				address: z.string().trim().min(1, 'Укажите адрес'),
				email: z.string().trim().min(1, 'Укажите email').email('Некорректный email'),
				slogan: z.string().trim().min(1, 'Укажите слоган'),
				logo: z.custom<File | null>().optional()
			})
		)
	})

	const [phoneNumber, phoneNumberProps] = defineField('phone_number')
	const [email, emailProps] = defineField('email')
	const [address, addressProps] = defineField('address')
	const [slogan, sloganProps] = defineField('slogan')
	const [logo, logoProps] = defineField('logo')

	const reset = () => {
		resetForm({
			values: { id: null, phone_number: '', address: '', email: '', slogan: '', logo: null }
		})
	}

	watch(
		() => [props.open, props.contactInfo] as const,
		([open, contactInfo]) => {
			if (!open) {
				reset()
				return
			}

			setValues({
				id: contactInfo?.id ?? null,
				phone_number: contactInfo?.phone_number ? String(contactInfo.phone_number) : '',
				address: contactInfo?.address ? String(contactInfo.address) : '',
				email: contactInfo?.email ? String(contactInfo.email) : '',
				slogan: contactInfo?.slogan ? String(contactInfo.slogan) : '',
				logo: null
			})
		}
	)

	const onSubmit = handleSubmit(async (v) => {
		saving.value = true
		try {
			await contactInfoApi.saveContactInfo({
				id: props.contactInfo?.id ?? null,
				phone_number: v.phone_number,
				address: v.address,
				email: v.email,
				slogan: v.slogan,
				logo: (v.logo as File | null) ?? null
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
	})
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
					v-model="phoneNumber"
					v-bind="phoneNumberProps"
					label="Телефон"
					name="phone_number"
					:error-message="errors.phone_number"
					type="tel"
				/>
				<TextField
					:model-value="email as any"
					v-bind="emailProps"
					label="Email"
					name="email"
					type="email"
					placeholder="email@example.com"
					:error-message="errors.email"
					@update:model-value="(v) => ((email as any).value = v)"
				/>

				<div class="md:col-span-2">
					<TextareaField
						:model-value="address as any"
						v-bind="addressProps"
						label="Адрес"
						name="address"
						placeholder="Адрес"
						:error-message="errors.address"
						@update:model-value="(v) => ((address as any).value = v)"
					/>
				</div>

				<div class="md:col-span-2">
					<TextareaField
						:model-value="slogan as any"
						v-bind="sloganProps"
						label="Слоган"
						name="slogan"
						placeholder="Слоган"
						:error-message="errors.slogan"
						@update:model-value="(v) => ((slogan as any).value = v)"
					/>
				</div>

				<div class="md:col-span-2">
					<ImageUpload
						:model-value="logo as any"
						v-bind="logoProps"
						label="Логотип"
						description="Выберите изображение — отправим как файл при сохранении."
						:current-url="props.contactInfo?.logo || ''"
						:error-message="errors.logo"
						@update:model-value="(v) => ((logo as any).value = v)"
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
