<script setup lang="ts">
	import { computed, onMounted, ref } from 'vue'
	import { toast } from 'vue3-toastify'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { apiBase } from '@/shared'

	type ProfileRole = { id?: number | null; name?: string | null } | string
	type ProfileAddress = { address?: string | null; city?: string | null; is_default?: boolean | null }

	type ProfileResponse = {
		id?: number | null
		name?: string | null
		email?: string | null
		phone_number?: string | null
		roles?: ProfileRole[] | null
		addresses?: ProfileAddress[] | null
	}

	const loading = ref(false)
	const error = ref(false)
	const saving = ref(false)
	const profile = ref<ProfileResponse | null>(null)

	const editing = ref(false)
	const form = ref<{
		name: string
		email: string
		phone_number: string
		password: string
		password_confirmation: string
	}>({
		name: '',
		email: '',
		phone_number: '',
		password: '',
		password_confirmation: ''
	})

	const rolesLabel = computed(() => {
		const roles = profile.value?.roles ?? []
		if (!roles?.length) return '—'
		const names = roles.map((r) => (typeof r === 'string' ? r : r?.name)).filter((v): v is string => !!v)
		return names.length ? names.join(', ') : '—'
	})

	const syncFormFromProfile = () => {
		form.value = {
			name: profile.value?.name ? String(profile.value.name) : '',
			email: profile.value?.email ? String(profile.value.email) : '',
			phone_number: profile.value?.phone_number ? String(profile.value.phone_number) : '',
			password: '',
			password_confirmation: ''
		}
	}

	const load = async () => {
		loading.value = true
		error.value = false
		try {
			const { data } = await apiBase.getProfile()
			profile.value = (data?.data ?? data) as ProfileResponse
			syncFormFromProfile()
		} catch (e) {
			error.value = true
			profile.value = null
		} finally {
			loading.value = false
		}
	}

	const toggleEdit = () => {
		editing.value = !editing.value
		if (!editing.value) {
			syncFormFromProfile()
		}
	}

	const save = async () => {
		if (!profile.value?.id) return
		if (form.value.password || form.value.password_confirmation) {
			if (!form.value.password || !form.value.password_confirmation) {
				toast.error('Введите пароль и подтверждение пароля')
				return
			}
			if (form.value.password !== form.value.password_confirmation) {
				toast.error('Пароли не совпадают')
				return
			}
		}

		saving.value = true
		try {
			const payload: {
				name?: string
				email?: string
				phone_number?: string | null
				password?: string
				password_confirmation?: string
			} = {}

			payload.name = form.value.name || ''
			payload.email = form.value.email || ''
			payload.phone_number = form.value.phone_number ? form.value.phone_number : null

			if (form.value.password) {
				payload.password = form.value.password
				payload.password_confirmation = form.value.password_confirmation
			}

			const { data } = await apiBase.updateProfile(payload)
			profile.value = (data?.data ?? data) as ProfileResponse
			syncFormFromProfile()
			editing.value = false
			toast.success('Профиль обновлён')
			await load()
		} catch (e) {
			toast.error('Не удалось обновить профиль')
		} finally {
			saving.value = false
		}
	}

	onMounted(() => {
		load()
	})
</script>

<template>
	<form class="space-y-6" @submit.prevent="save">
		<Banner title="Профиль" subtitle="Данные вашей учётной записи."> </Banner>

		<section class="rounded-2xl border border-gray-200 bg-white p-6">
			<div v-if="loading" class="text-sm text-gray-600">Загрузка...</div>

			<div v-else-if="error" class="text-sm text-red-600">Не удалось загрузить профиль.</div>

			<form v-else @submit.prevent="save" class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="min-w-0">
					<div class="text-xs font-medium uppercase tracking-wide text-gray-500">Имя</div>
					<div v-if="!editing" class="mt-1 truncate text-sm font-medium text-gray-900">{{ profile?.name || '—' }}</div>
					<div v-else class="mt-2">
						<TextField v-model.trim="form.name" name="name" placeholder="Имя" />
					</div>
				</div>

				<div class="min-w-0">
					<div class="text-xs font-medium uppercase tracking-wide text-gray-500">Email</div>
					<div v-if="!editing" class="mt-1 truncate text-sm font-medium text-gray-900">{{ profile?.email || '—' }}</div>
					<div v-else class="mt-2">
						<TextField v-model.trim="form.email" name="email" placeholder="Email" />
					</div>
				</div>

				<div class="min-w-0">
					<div class="text-xs font-medium uppercase tracking-wide text-gray-500">Телефон</div>
					<div v-if="!editing" class="mt-1 truncate text-sm font-medium text-gray-900">
						{{ profile?.phone_number || '—' }}
					</div>
					<div v-else class="mt-2">
						<TextField v-model.trim="form.phone_number" name="phone_number" placeholder="Телефон" />
					</div>
				</div>

				<div class="min-w-0">
					<div class="text-xs font-medium uppercase tracking-wide text-gray-500">Пароль</div>
					<div v-if="!editing" class="mt-1 truncate text-sm font-medium text-gray-900">••••••••</div>
					<div v-else class="mt-2">
						<TextField v-model.trim="form.password" name="password" placeholder="Новый пароль" type="password" />
					</div>
				</div>

				<div class="min-w-0">
					<div class="text-xs font-medium uppercase tracking-wide text-gray-500">Подтверждение</div>
					<div v-if="!editing" class="mt-1 truncate text-sm font-medium text-gray-900">••••••••</div>
					<div v-else class="mt-2">
						<TextField
							v-model.trim="form.password_confirmation"
							name="password_confirmation"
							placeholder="Подтверждение пароля"
							type="password"
						/>
					</div>
				</div>

				<div class="min-w-0">
					<div class="text-xs font-medium uppercase tracking-wide text-gray-500">Роли</div>
					<div class="mt-1 text-sm font-medium text-gray-900">
						{{ rolesLabel }}
					</div>
				</div>

				<div class="md:col-span-2">
					<div class="text-xs font-medium uppercase tracking-wide text-gray-500">Адреса</div>
					<div class="mt-2 space-y-2">
						<div v-if="!profile?.addresses?.length" class="text-sm text-gray-600">Адресов нет.</div>
						<div
							v-for="(address, idx) in profile?.addresses || []"
							:key="idx"
							class="rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-800"
						>
							<div class="font-medium">{{ address.city || '—' }}</div>
							<div class="mt-0.5 text-gray-700">{{ address.address || '—' }}</div>
							<div v-if="address.is_default" class="mt-1 text-xs font-medium text-blue-700">Адрес по умолчанию</div>
						</div>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						:disabled="loading || saving || error"
						:on-click="toggleEdit"
					>
						{{ editing ? 'Отмена' : 'Редактировать' }}
					</Button>
					<Button type="submit" size="sm" :disabled="!editing || loading || saving || error" :loading="saving">
						Сохранить
					</Button>
				</div>
			</form>
		</section>
	</form>
</template>
