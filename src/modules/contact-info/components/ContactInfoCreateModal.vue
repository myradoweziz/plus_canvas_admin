<script setup lang="ts">
	import { reactive, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import SingleImageUpload from '@/shared/ui/SingleImageUpload.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { mediaApi } from '@/shared/api/media'
	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { contactInfoApi } from '../api/contact-info'
	import type { ContactInfo } from '../types/contact-info'

	type SocialFormRow = {
		platform: string
		url: string
		image: string
		image_url?: string
	}

	const emptySocialRow = (): SocialFormRow => ({
		platform: '',
		url: '',
		image: '',
		image_url: ''
	})

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()
	const props = defineProps<{ open: boolean; contactInfo?: ContactInfo | null }>()

	const saving = ref(false)

	const form = reactive({
		id: null as number | null,
		phone_number: '',
		address: '',
		email: '',
		slogan: '',
		logo: '',
		logo_url: '',
		social_links: [] as SocialFormRow[]
	})

	const fieldErrors = reactive({
		phone_number: '',
		address: '',
		email: '',
		slogan: '',
		logo: '',
		social_links: ''
	})

	const reset = () => {
		Object.assign(form, {
			id: null,
			phone_number: '',
			address: '',
			email: '',
			slogan: '',
			logo: '',
			logo_url: '',
			social_links: [emptySocialRow()]
		})
		fieldErrors.phone_number = ''
		fieldErrors.address = ''
		fieldErrors.email = ''
		fieldErrors.slogan = ''
		fieldErrors.logo = ''
		fieldErrors.social_links = ''
	}

	const validate = () => {
		fieldErrors.phone_number = ''
		fieldErrors.address = ''
		fieldErrors.email = ''
		fieldErrors.slogan = ''
		fieldErrors.logo = ''
		fieldErrors.social_links = ''

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

		form.social_links.forEach((row, index) => {
			const hasAny = row.platform.trim() || row.url.trim() || row.image
			if (!hasAny) return
			if (!row.platform.trim() || !row.url.trim()) {
				fieldErrors.social_links = `Строка ${index + 1}: укажите platform и url`
				ok = false
			}
		})

		return ok
	}

	const addSocialRow = () => {
		form.social_links.push(emptySocialRow())
	}

	const removeSocialRow = (index: number) => {
		if (form.social_links.length <= 1) {
			form.social_links = [emptySocialRow()]
			return
		}
		form.social_links.splice(index, 1)
	}

	watch(
		() => [props.open, props.contactInfo] as const,
		([open, contactInfo]) => {
			if (!open) {
				reset()
				return
			}

			const links = contactInfo?.social_links?.length
				? contactInfo.social_links.map((l) => {
						const icon = String(l.image_url ?? '').trim()
						return {
							platform: l.platform ?? '',
							url: l.url ?? '',
							image: icon,
							image_url: String(l.image_url ?? '').trim() || undefined
						}
					})
				: [emptySocialRow()]

			const logoFromApi = contactInfo?.logo_path

			Object.assign(form, {
				id: contactInfo?.id ?? null,
				phone_number: contactInfo?.phone_number ? String(contactInfo.phone_number) : '',
				address: contactInfo?.address ? String(contactInfo.address) : '',
				email: contactInfo?.email ? String(contactInfo.email) : '',
				slogan: contactInfo?.slogan ? String(contactInfo.slogan) : '',
				logo: logoFromApi || '',
				social_links: links
			})
			fieldErrors.phone_number = ''
			fieldErrors.address = ''
			fieldErrors.email = ''
			fieldErrors.slogan = ''
			fieldErrors.logo = ''
			fieldErrors.social_links = ''
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
				logo: form.logo || form.logo_url || '',
				social_links: form.social_links
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
		<div
			class="relative z-100000 mx-auto h-[90vh] w-[92vw] max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
		>
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
					required
					name="phone_number"
					:error-message="fieldErrors.phone_number"
					type="tel"
				/>
				<TextField
					v-model="form.email"
					label="Email"
					required
					name="email"
					type="email"
					placeholder="email@example.com"
					:error-message="fieldErrors.email"
				/>

				<div class="md:col-span-2">
					<TextareaField
						v-model="form.address"
						label="Адрес"
						required
						name="address"
						placeholder="Адрес"
						:error-message="fieldErrors.address"
					/>
				</div>

				<div class="md:col-span-2">
					<TextareaField
						v-model="form.slogan"
						label="Слоган"
						required
						name="slogan"
						placeholder="Слоган"
						:error-message="fieldErrors.slogan"
					/>
				</div>

				<div class="md:col-span-2">
					<SingleImageUpload
						v-model="form.logo"
						label="Логотип"
						description="Необязательно. Файл будет загружен сразу, в форму сохранится URL."
						:error-message="fieldErrors.logo"
						:uploader="mediaApi.uploadImages"
					/>
				</div>

				<div class="md:col-span-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
					<div class="flex items-center justify-between gap-3">
						<p class="text-sm font-semibold text-gray-900">Ссылки (соцсети и др.)</p>
						<Button type="button" variant="outline" size="sm" :on-click="addSocialRow">Добавить</Button>
					</div>
					<p v-if="fieldErrors.social_links" class="mt-2 text-sm text-red-600">{{ fieldErrors.social_links }}</p>
					<p class="mt-1 text-xs text-gray-500">
						Необязательно. Для каждой строки: platform, url; иконка — по желанию.
					</p>

					<div class="mt-4 space-y-6">
						<div
							v-for="(row, index) in form.social_links"
							:key="index"
							class="rounded-lg border border-gray-200 bg-white p-4"
						>
							<div class="mb-3 flex items-center justify-between gap-2">
								<span class="text-xs font-medium text-gray-500">Строка {{ index + 1 }}</span>
								<Button type="button" variant="ghost" size="sm" :on-click="() => removeSocialRow(index)">
									Удалить
								</Button>
							</div>
							<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
								<TextField
									v-model="row.platform"
									label="Platform"
									:name="`platform_${index}`"
									placeholder="instagram"
								/>
								<TextField v-model="row.url" label="URL" :name="`url_${index}`" placeholder="https://..." />
							</div>
							<div class="mt-3">
								<SingleImageUpload
									:model-value="row.image || ''"
									label="Иконка"
									description="Необязательно. Файл будет загружен сразу, в форму сохранится URL."
									:uploader="mediaApi.uploadImages"
									@update:model-value="(v) => (row.image = v || '')"
								/>
							</div>
						</div>
					</div>
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
