<script setup lang="ts">
	import { computed, defineAsyncComponent, onMounted, reactive, ref } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	import { toast } from 'vue3-toastify'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import SingleImageUpload from '@/shared/ui/SingleImageUpload.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { api as configurationApi } from '@/modules/configuration/api'
	import type { EmailAccount, Store } from '@/modules/configuration/types'
	import { mediaApi } from '@/shared/api/media'
	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { DocsIcon } from '@/shared/icons'
	import { api } from '../api'
	import type { MessageTemplate } from '../types'

	const route = useRoute()
	const router = useRouter()

	const id = computed(() => {
		const raw = route.params.id
		const value = typeof raw === 'string' ? Number(raw) : Array.isArray(raw) ? Number(raw[0]) : NaN
		return Number.isFinite(value) ? value : null
	})

	const loading = ref(false)
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

	const load = async () => {
		if (!id.value) return

		loading.value = true
		try {
			const template = await api.getMessageTemplateById(id.value)
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
		} finally {
			loading.value = false
		}
	}

	onMounted(async () => {
		await Promise.all([loadStores(), loadEmailAccounts(), load()])
	})

	const onSubmit = async () => {
		if (!id.value) return
		if (!validate()) return

		saving.value = true
		try {
			const payload: MessageTemplate = {
				id: id.value,
				name: form.name.trim(),
				subject: form.subject.trim(),
				is_active: !!form.is_active,
				bcc: form.bcc.trim(),
				body: form.body,
				email_account_id: Number(form.email_account_id) || 0,
				store_id: Number(form.store_id) || 0,
				attached_file: form.attached_file.trim()
			}

			await api.updateMessageTemplate(payload)
			toast.success('Шаблон обновлён')
		} catch (err) {
			const msg = getFirstBackendValidationMessage(err)
			if (msg) toast.error(msg)
			else throw err
		} finally {
			saving.value = false
		}
	}

	const goBack = () => router.push('/admin-panel/content-management/message-templates')

	const RichTextEditor = defineAsyncComponent(() => import('@/shared/ui/RichTextEditor.vue'))
</script>

<template>
	<div class="space-y-6">
		<Banner
			:title="form.name ? `Message templates — ${form.name}` : 'Редактировать шаблон'"
			subtitle="Редактирование шаблона email-сообщения."
			:icon="DocsIcon"
		>
			<template #actions>
				<Button type="button" variant="outline" size="sm" :on-click="goBack">Назад</Button>
				<Button type="button" size="sm" :disabled="saving || loading" :loading="saving" :on-click="onSubmit">Сохранить</Button>
			</template>
		</Banner>

		<div v-if="!id" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
			Некорректный id шаблона в URL.
		</div>

		<form v-else class="grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
			<TextField
				v-model="form.name"
				label="Name"
				required
				name="name"
				placeholder="Name"
				:error-message="fieldErrors.name"
				:disabled="loading"
			/>

			<SelectField
				:model-value="form.store_id || null"
				label="Магазин"
				required
				name="store_id"
				placeholder="Выберите магазин"
				:disabled="loading || loadingStores"
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
				:disabled="loading || loadingEmailAccounts"
				:options="emailAccounts"
				:error-message="fieldErrors.email_account_id"
				@update:model-value="onEmailAccountChange"
			/>

			<CheckboxField v-model="form.is_active" label="Активен" name="is_active" class="md:col-span-1" :disabled="loading" />

			<TextField
				v-model="form.subject"
				class="md:col-span-2"
				label="Subject"
				required
				name="subject"
				placeholder="Subject"
				:error-message="fieldErrors.subject"
				:disabled="loading"
			/>

			<TextField v-model="form.bcc" class="md:col-span-2" label="BCC" name="bcc" placeholder="bcc@example.com" :disabled="loading" />

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
				<Button type="button" variant="outline" size="sm" :on-click="goBack">Отмена</Button>
				<Button type="submit" size="sm" :disabled="saving || loading" :loading="saving">Сохранить</Button>
			</div>
		</form>
	</div>
</template>

