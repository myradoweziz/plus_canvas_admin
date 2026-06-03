<script setup lang="ts">
	import { computed, onMounted, reactive, ref, watch } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	import { toast } from 'vue3-toastify'

	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { api } from '../../api'
	import type { EmailAccount } from '../../types'

	const route = useRoute()
	const router = useRouter()

	const accountId = computed(() => {
		const id = Number(route.params.id)
		return Number.isFinite(id) ? id : null
	})

	const isEditMode = computed(() => accountId.value != null)
	const pageTitle = computed(() =>
		isEditMode.value ? 'Редактировать email-аккаунт' : 'Добавить email-аккаунт'
	)

	const loading = ref(false)
	const saving = ref(false)
	const testEmailLoading = ref(false)

	const form = reactive({
		id: null as number | null,
		email: '',
		display_name: '',
		host: '',
		port: 22,
		username: '',
		password: '',
		ssl: true,
		use_default_credentials: true,
		is_default: false
	})

	const testEmailForm = reactive({
		test_email: ''
	})

	const fieldErrors = reactive({
		email: '',
		host: '',
		port: '',
		username: '',
		password: ''
	})

	const testEmailErrors = reactive({
		test_email: ''
	})

	const resetForm = () => {
		Object.assign(form, {
			id: null,
			email: '',
			display_name: '',
			host: '',
			port: 22,
			username: '',
			password: '',
			ssl: true,
			use_default_credentials: true,
			is_default: false
		})
		Object.assign(testEmailForm, { test_email: '' })
		Object.keys(fieldErrors).forEach((key) => {
			fieldErrors[key as keyof typeof fieldErrors] = ''
		})
		Object.keys(testEmailErrors).forEach((key) => {
			testEmailErrors[key as keyof typeof testEmailErrors] = ''
		})
	}

	const validate = () => {
		Object.keys(fieldErrors).forEach((key) => {
			fieldErrors[key as keyof typeof fieldErrors] = ''
		})

		let ok = true
		if (!form.email.trim()) {
			fieldErrors.email = 'Укажите email'
			ok = false
		}
		if (!form.host.trim()) {
			fieldErrors.host = 'Укажите host'
			ok = false
		}
		const port = Number(form.port)
		if (!Number.isInteger(port) || port <= 0) {
			fieldErrors.port = 'Укажите корректный port'
			ok = false
		}
		if (!form.use_default_credentials) {
			if (!form.username.trim()) {
				fieldErrors.username = 'Укажите username'
				ok = false
			}
			if (!form.password.trim()) {
				fieldErrors.password = 'Укажите password'
				ok = false
			}
		}
		return ok
	}

	watch(
		() => form.use_default_credentials,
		(value) => {
			if (value) {
				form.username = ''
				form.password = ''
				fieldErrors.username = ''
				fieldErrors.password = ''
			}
		}
	)

	const loadAccount = async () => {
		if (!accountId.value) return

		loading.value = true
		try {
			const account = await api.getEmailAccountById(accountId.value)
			Object.assign(form, {
				id: account.id ?? null,
				email: account.email ?? '',
				display_name: account.display_name ?? '',
				host: account.host ?? '',
				port: Number(account.port) || 0,
				username: account.username ?? '',
				password: account.password ?? '',
				ssl: !!account.ssl,
				use_default_credentials: !!account.use_default_credentials,
				is_default: !!account.is_default
			})
			Object.assign(testEmailForm, { test_email: account.email ?? '' })
		} finally {
			loading.value = false
		}
	}

	onMounted(async () => {
		if (accountId.value) {
			await loadAccount()
		} else {
			resetForm()
		}
	})

	const goBack = () => router.push('/admin-panel/configuration/email-accounts')

	const sendTestEmail = async () => {
		testEmailErrors.test_email = ''
		if (!accountId.value) return

		const email = testEmailForm.test_email.trim()
		if (!email) {
			testEmailErrors.test_email = 'Укажите email для теста'
			return
		}

		testEmailLoading.value = true
		try {
			await api.testEmailAccount(accountId.value, email)
			toast.success('Тестовое письмо отправлено')
		} catch (err) {
			const msg = getFirstBackendValidationMessage(err)
			if (msg) toast.error(msg)
			else throw err
		} finally {
			testEmailLoading.value = false
		}
	}

	const onSubmit = async () => {
		if (!validate()) return

		saving.value = true
		try {
			const payload: EmailAccount = {
				id: isEditMode.value ? accountId.value : null,
				email: form.email.trim(),
				display_name: form.display_name.trim(),
				host: form.host.trim(),
				port: Number(form.port) || 0,
				username: form.username.trim(),
				password: form.password,
				ssl: !!form.ssl,
				use_default_credentials: !!form.use_default_credentials,
				is_default: !!form.is_default
			}

			if (isEditMode.value) {
				await api.updateEmailAccount(payload)
				toast.success('Email-аккаунт обновлён')
			} else {
				await api.createEmailAccount(payload)
				toast.success('Email-аккаунт добавлен')
			}

			goBack()
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
	<div class="space-y-6">
		<div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
			<div class="flex items-start justify-between gap-4">
				<h3 class="text-lg font-semibold text-gray-900">{{ pageTitle }}</h3>

				<Button type="button" variant="outline" size="sm" :on-click="goBack">Назад</Button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
				<TextField
					v-model="form.email"
					label="Email"
					required
					name="email"
					placeholder="email@example.com"
					:error-message="fieldErrors.email"
					:disabled="loading"
				/>

				<TextField
					v-model="form.display_name"
					label="Display name"
					name="display_name"
					placeholder="Display name"
					:disabled="loading"
				/>

				<TextField
					v-model="form.host"
					label="Host"
					required
					name="host"
					placeholder="smtp.example.com"
					:error-message="fieldErrors.host"
					:disabled="loading"
				/>

				<TextField
					v-model.number="form.port"
					label="Port"
					required
					name="port"
					type="number"
					min="1"
					step="1"
					:error-message="fieldErrors.port"
					:disabled="loading"
				/>

				<div class="md:col-span-2 grid grid-cols-1 gap-3 md:grid-cols-3">
					<CheckboxField v-model="form.ssl" label="SSL" name="ssl" :disabled="loading" />
					<CheckboxField
						v-model="form.use_default_credentials"
						label="Default credentials"
						name="use_default_credentials"
						:disabled="loading"
					/>
					<CheckboxField v-model="form.is_default" label="Default account" name="is_default" :disabled="loading" />
				</div>

				<TextField
					v-model="form.username"
					:disabled="loading || form.use_default_credentials"
					:required="!form.use_default_credentials"
					label="Username"
					name="username"
					placeholder="Username"
					:error-message="fieldErrors.username"
				/>

				<TextField
					v-model="form.password"
					:disabled="loading || form.use_default_credentials"
					:required="!form.use_default_credentials"
					label="Password"
					name="password"
					type="password"
					placeholder="Password"
					:error-message="fieldErrors.password"
				/>

				<div v-if="isEditMode" class="rounded-xl border border-gray-200 bg-gray-50 p-4 md:col-span-2">
					<p class="text-sm font-medium text-gray-900">Тестовое письмо</p>
					<p class="mt-1 text-sm text-gray-600">Отправит тестовое письмо на указанный адрес.</p>

					<div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
						<TextField
							v-model="testEmailForm.test_email"
							class="md:col-span-2"
							label="Test email"
							name="test_email"
							placeholder="test@example.com"
							:error-message="testEmailErrors.test_email"
							:disabled="loading"
						/>
						<div class="flex items-end justify-end">
							<Button
								type="button"
								size="sm"
								:disabled="testEmailLoading || loading"
								:loading="testEmailLoading"
								:on-click="sendTestEmail"
							>
								Отправить
							</Button>
						</div>
					</div>
				</div>

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
					<Button type="button" variant="outline" size="sm" :on-click="goBack">Отмена</Button>
					<Button type="submit" size="sm" :disabled="saving || loading" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</div>
</template>
