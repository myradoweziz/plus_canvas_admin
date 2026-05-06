<template>
	<div class="space-y-6">
		<Banner title="Профиль" subtitle="Данные вашей учётной записи." />

		<section class="rounded-2xl border border-gray-200 bg-white p-6">
			<div v-if="loading" class="text-sm text-gray-600">Загрузка...</div>

			<div v-else-if="error" class="text-sm text-red-600">
				Не удалось загрузить профиль.
			</div>

			<div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="min-w-0">
					<div class="text-xs font-medium uppercase tracking-wide text-gray-500">Имя</div>
					<div class="mt-1 truncate text-sm font-medium text-gray-900">{{ profile?.name || '—' }}</div>
				</div>

				<div class="min-w-0">
					<div class="text-xs font-medium uppercase tracking-wide text-gray-500">Email</div>
					<div class="mt-1 truncate text-sm font-medium text-gray-900">{{ profile?.email || '—' }}</div>
				</div>

				<div class="min-w-0">
					<div class="text-xs font-medium uppercase tracking-wide text-gray-500">Телефон</div>
					<div class="mt-1 truncate text-sm font-medium text-gray-900">{{ profile?.phone_number || '—' }}</div>
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
	import Banner from '@/shared/ui/Banner.vue'
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
	const profile = ref<ProfileResponse | null>(null)

	const rolesLabel = computed(() => {
		const roles = profile.value?.roles ?? []
		if (!roles?.length) return '—'
		const names = roles
			.map((r) => (typeof r === 'string' ? r : r?.name))
			.filter((v): v is string => !!v)
		return names.length ? names.join(', ') : '—'
	})

	const load = async () => {
		loading.value = true
		error.value = false
		try {
			const { data } = await apiBase.getProfile()
			// /api/auth/me обычно возвращает { data: {...} } или сразу объект пользователя.
			profile.value = (data?.data ?? data) as ProfileResponse
		} catch (e) {
			error.value = true
			profile.value = null
		} finally {
			loading.value = false
		}
	}

	onMounted(() => {
		load()
	})
</script>

