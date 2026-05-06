<template>
	<div class="space-y-6">
		<Banner title="Профиль" subtitle="Данные вашей учётной записи.">
			<template #actions>
				<div class="flex items-center gap-2">
					<Button type="button" variant="outline" size="sm" :disabled="loading || saving || error" :on-click="toggleEdit">
						{{ editing ? 'Отмена' : 'Редактировать' }}
					</Button>
					<Button type="button" size="sm" :disabled="!editing || loading || saving || error" :loading="saving" :on-click="save">
						Сохранить
					</Button>
				</div>
			</template>
		</Banner>

		<section class="rounded-2xl border border-gray-200 bg-white p-6">
			<div v-if="loading" class="text-sm text-gray-600">Загрузка...</div>

			<div v-else-if="error" class="text-sm text-red-600">
				Не удалось загрузить профиль.
			</div>

			<div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="min-w-0">
					<div class="text-xs font-medium uppercase tracking-wide text-gray-500">Имя</div>
					<div v-if="!editing" class="mt-1 truncate text-sm font-medium text-gray-900">{{ profile?.name || '—' }}</div>
					<div v-else class="mt-2">
						<TextField v-model.trim="form.name" label="Имя" name="name" placeholder="Имя" />
					</div>
				</div>

				<div class="min-w-0">
					<div class="text-xs font-medium uppercase tracking-wide text-gray-500">Email</div>
					<div class="mt-1 truncate text-sm font-medium text-gray-900">{{ profile?.email || '—' }}</div>
				</div>

				<div class="min-w-0">
					<div class="text-xs font-medium uppercase tracking-wide text-gray-500">Телефон</div>
					<div v-if="!editing" class="mt-1 truncate text-sm font-medium text-gray-900">{{ profile?.phone_number || '—' }}</div>
					<div v-else class="mt-2">
						<TextField
							v-model.trim="form.phone_number"
							label="Телефон"
							name="phone_number"
							placeholder="Телефон"
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
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
	import { apiBase } from '@/shared'
	import Button from '@/shared/ui/Button.vue'
	import Banner from '@/shared/ui/Banner.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import { toast } from 'vue3-toastify'
	import { computed, onMounted, ref } from 'vue'

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
	const form = ref<{ name: string; phone_number: string }>({ name: '', phone_number: '' })

	const rolesLabel = computed(() => {
		const roles = profile.value?.roles ?? []
		if (!roles?.length) return '—'
		const names = roles
			.map((r) => (typeof r === 'string' ? r : r?.name))
			.filter((v): v is string => !!v)
		return names.length ? names.join(', ') : '—'
	})

	const syncFormFromProfile = () => {
		form.value = {
			name: profile.value?.name ? String(profile.value.name) : '',
			phone_number: profile.value?.phone_number ? String(profile.value.phone_number) : ''
		}
	}

	const load = async () => {
		loading.value = true
		error.value = false
		try {
			const { data } = await apiBase.getProfile()
			// /api/auth/me обычно возвращает { data: {...} } или сразу объект пользователя.
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
		saving.value = true
		try {
			const payload = {
				name: form.value.name || '',
				phone_number: form.value.phone_number ? form.value.phone_number : null
			}
			const { data } = await apiBase.updateProfile(payload)
			profile.value = (data?.data ?? data) as ProfileResponse
			syncFormFromProfile()
			editing.value = false
			toast.success('Профиль обновлён')
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

