<script setup lang="ts">
	import { defineAsyncComponent, reactive, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import SingleImageUpload from '@/shared/ui/SingleImageUpload.vue'
	import TextField from '@/shared/ui/TextField.vue'
	const RichTextEditor = defineAsyncComponent(() => import('@/shared/ui/RichTextEditor.vue'))

	import { api as configurationApi } from '@/modules/configuration/api'
	import type { EmailAccount, Store } from '@/modules/configuration/types'
	import { mediaApi } from '@/shared/api/media'
	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { api } from '../api'
	import type { MessageTemplate } from '../types'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; template: MessageTemplate | null }>()

	const saving = ref(false)
	const stores = ref<{ label: string; value: number }[]>([])
	const emailAccounts = ref<{ label: string; value: number }[]>([])
	const loadingStores = ref(false)
	const loadingEmailAccounts = ref(false)

	const loadStores = async () => {
		loadingStores.value = true
		try {
			const items = await configurationApi.listAllStores()
			stores.value = items
				.filter((item: Store) => item.id != null)
				.map((item: Store) => ({ label: item.name, value: item.id as number }))
		} finally {
			loadingStores.value = false
		}
	}

	const loadEmailAccounts = async () => {
		loadingEmailAccounts.value = true
		try {
			const items = await configurationApi.listAllEmailAccounts()
			emailAccounts.value = items
				.filter((item: EmailAccount) => item.id != null)
				.map((item: EmailAccount) => ({
					label: item.display_name?.trim() ? `${item.display_name} (${item.email})` : item.email,
					value: item.id as number
				}))
		} finally {
			loadingEmailAccounts.value = false
		}
	}

	const onStoreChange = (value: string | number | null) => {
		if (value === null || value === undefined || String(value).trim() === '') {
			form.store_id = 0
			return
		}
		form.store_id = Number(value) || 0
	}

	const onEmailAccountChange = (value: string | number | null) => {
		if (value === null || value === undefined || String(value).trim() === '') {
			form.email_account_id = 0
			return
		}
		form.email_account_id = Number(value) || 0
	}

	const form = reactive({
		id: null as number | null,
		name: '',
		subject: '',
		is_active: true,
		bcc: '',
		body: '',
		email_account_id: 0,
		store_id: 0,
		attached_file: ''
	})

	const fieldErrors = reactive({
		name: '',
		subject: '',
		body: '',
		email_account_id: '',
		store_id: ''
	})

	const resetLocalForm = () => {
		Object.assign(form, {
			id: null,
			name: '',
			subject: '',
			is_active: true,
			bcc: '',
			body: '',
			email_account_id: 0,
			store_id: 0,
			attached_file: ''
		})
		Object.keys(fieldErrors).forEach((key) => {
			fieldErrors[key as keyof typeof fieldErrors] = ''
		})
	}

	const validate = () => {
		Object.keys(fieldErrors).forEach((key) => {
			fieldErrors[key as keyof typeof fieldErrors] = ''
		})

		let ok = true
		if (!form.name.trim()) {
			fieldErrors.name = 'Укажите название'
			ok = false
		}
		if (!form.subject.trim()) {
			fieldErrors.subject = 'Укажите subject'
			ok = false
		}
		if (!form.body.trim()) {
			fieldErrors.body = 'Укажите body'
			ok = false
		}

		const emailAccountId = Number(form.email_account_id)
		if (!Number.isInteger(emailAccountId) || emailAccountId <= 0) {
			fieldErrors.email_account_id = 'Укажите корректный email_account_id'
			ok = false
		}

		const storeId = Number(form.store_id)
		if (!Number.isInteger(storeId) || storeId <= 0) {
			fieldErrors.store_id = 'Укажите корректный store_id'
			ok = false
		}

		return ok
	}

	watch(
		() => [props.open, props.template] as const,
		([open, template]) => {
			if (!open) return
			loadStores()
			loadEmailAccounts()
			if (!template) {
				resetLocalForm()
				return
			}

			Object.assign(form, {
				id: template.id ?? null,
				name: template.name ?? '',
				subject: template.subject ?? '',
				is_active: !!template.is_active,
				bcc: template.bcc ?? '',
				body: template.body ?? '',
				email_account_id: Number(template.email_account_id) || 0,
				store_id: Number(template.store_id) || 0,
				attached_file: template.attached_file ?? ''
			})

			Object.keys(fieldErrors).forEach((key) => {
				fieldErrors[key as keyof typeof fieldErrors] = ''
			})
		},
		{ immediate: true }
	)

	const onSubmit = async () => {
		if (!validate()) return

		saving.value = true
		try {
			const payload: MessageTemplate = {
				id: form.id ?? null,
				name: form.name.trim(),
				subject: form.subject.trim(),
				is_active: !!form.is_active,
				bcc: form.bcc.trim(),
				body: form.body,
				email_account_id: Number(form.email_account_id) || 0,
				store_id: Number(form.store_id) || 0,
				attached_file: form.attached_file.trim()
			}

			if (payload.id) {
				await api.updateMessageTemplate(payload)
				toast.success('Шаблон обновлён')
			} else {
				await api.createMessageTemplate(payload)
				toast.success('Шаблон добавлен')
			}

			emit('saved')
			emit('close')

			if (!props.template) resetLocalForm()
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
		<div
			class="relative z-100000 mx-auto h-[90vh] w-[92vw] max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
		>
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0">
					<h3 class="text-lg font-semibold text-gray-900">
						{{ template ? 'Редактировать шаблон' : 'Добавить шаблон' }}
					</h3>
					<p class="mt-1 text-sm text-gray-600">Заполните поля и сохраните.</p>
				</div>
				<Button type="button" variant="ghost" size="icon" :on-click="() => $emit('close')" aria-label="Close">
					✕
				</Button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
				<TextField
					v-model="form.name"
					label="Name"
					required
					name="name"
					placeholder="Name"
					:error-message="fieldErrors.name"
				/>

				<SelectField
					:model-value="form.store_id || null"
					label="Магазин"
					required
					name="store_id"
					placeholder="Выберите магазин"
					:disabled="loadingStores"
					:options="stores"
					:error-message="fieldErrors.store_id"
					@update:model-value="onStoreChange"
				/>

				<SelectField
					:model-value="form.email_account_id || null"
					label="Email аккаунт"
					required
					name="email_account_id"
					placeholder="Выберите email аккаунт"
					:disabled="loadingEmailAccounts"
					:options="emailAccounts"
					:error-message="fieldErrors.email_account_id"
					@update:model-value="onEmailAccountChange"
				/>

				<CheckboxField v-model="form.is_active" label="Активен" name="is_active" class="md:col-span-1" />

				<TextField
					v-model="form.subject"
					class="md:col-span-2"
					label="Subject"
					required
					name="subject"
					placeholder="Subject"
					:error-message="fieldErrors.subject"
				/>

				<TextField v-model="form.bcc" class="md:col-span-2" label="BCC" name="bcc" placeholder="bcc@example.com" />

				<div class="md:col-span-2">
					<SingleImageUpload
						v-model="form.attached_file"
						label="Attached file"
						:current-url="form.attached_file || ''"
						:uploader="mediaApi.uploadImages"
					/>
				</div>

				<div class="md:col-span-2">
					<RichTextEditor v-model="form.body" label="Body" name="body" :error-message="fieldErrors.body" required />
				</div>

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
