<script setup lang="ts">
	import { computed, onMounted, ref } from 'vue'
	import { useRouter } from 'vue-router'
	import { toast } from 'vue3-toastify'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import UsersTable from '../components/user/UsersTable.vue'

	import { UsersIcon } from '@/shared/icons'
	import { api as rolesApi, api as usersApi } from '../api'
	import type { ExportUsersParams } from '../api/users'
	import type { Role, User } from '../types'

	const router = useRouter()
	const loading = ref(false)

	const users = ref<User[]>([])
	const selectedUsers = ref<User[]>([])
	const total = ref(0)
	const limit = ref(15)
	const offset = ref(0)
	const filters = ref({
		role_type: null as string | null,
		email: '',
		first_name: '',
		last_name: '',
		phone_number: ''
	})

	const loadingRoles = ref(false)
	const roles = ref<Role[]>([])

	const roleOptions = computed(() =>
		roles.value
			.map((r) => r.name)
			.filter((name): name is string => typeof name === 'string' && name.length > 0)
			.map((name) => ({ label: name, value: name }))
	)

	const load = async () => {
		loading.value = true

		try {
			const result = await usersApi.listUsers({
				role_type: filters.value.role_type || undefined,
				email: filters.value.email || undefined,
				first_name: filters.value.first_name || undefined,
				last_name: filters.value.last_name || undefined,
				phone_number: filters.value.phone_number || undefined,
				limit: limit.value,
				offset: offset.value
			})

			users.value = result.items
			total.value = result.total
		} finally {
			loading.value = false
		}
	}

	const loadRoles = async () => {
		loadingRoles.value = true

		try {
			const result = await rolesApi.listRoles({ limit: 1000, offset: 0 })

			roles.value = result.items || []
		} finally {
			loadingRoles.value = false
		}
	}

	onMounted(async () => {
		await Promise.all([loadRoles(), load()])
	})

	const openCreate = () => {
		router.push('/admin-panel/settings/users/create')
	}

	const editUser = (user: User) => {
		if (!user.id) return

		router.push(`/admin-panel/settings/users/${user.id}/edit`)
	}

	const applyFilters = async () => {
		offset.value = 0

		await load()
	}

	const resetFilters = async () => {
		filters.value = {
			role_type: null,
			email: '',
			first_name: '',
			last_name: '',
			phone_number: ''
		}
		limit.value = 15
		offset.value = 0
		await load()
	}

	const changeOffset = async (value: number) => {
		offset.value = value
		await load()
	}

	const buildExportParams = (): ExportUsersParams | null => {
		const ids = selectedUsers.value.map((u) => u.id).filter((id): id is number => typeof id === 'number')
		if (!ids.length) return null
		return { ids }
	}

	const exportXml = async () => {
		const params = buildExportParams()
		if (!params) {
			toast.error('Выберите пользователей для экспорта')
			return
		}

		try {
			await usersApi.exportUsersXml(params)
			toast.success('XML файл скачан')
		} catch {
			toast.error('Не удалось экспортировать XML')
		}
	}

	const exportExcel = async () => {
		const params = buildExportParams()
		if (!params) {
			toast.error('Выберите пользователей для экспорта')
			return
		}

		try {
			await usersApi.exportUsersExcel(params)
			toast.success('Excel файл скачан')
		} catch {
			toast.error('Не удалось экспортировать Excel')
		}
	}

	const deleteUser = async (user: User) => {
		if (!user.id) return

		usersApi.deleteUser(user.id)
		await load()
		toast.success('Пользователь удален')
	}
</script>

<template>
	<div class="space-y-6">
		<Banner title="Пользователи" subtitle="Список пользователей и управление ими." :icon="UsersIcon" :total="total">
			<template #actions>
				<div class="flex flex-wrap items-center gap-2">
					<Button type="button" size="sm" variant="outline" :disabled="!selectedUsers.length" :on-click="exportExcel">
						Экспорт Excel{{ selectedUsers.length ? ` (${selectedUsers.length})` : '' }}
					</Button>

					<Button type="button" size="sm" variant="outline" :disabled="!selectedUsers.length" :on-click="exportXml">
						Экспорт XML{{ selectedUsers.length ? ` (${selectedUsers.length})` : '' }}
					</Button>

					<Button type="button" size="sm" :on-click="openCreate">Добавить пользователя</Button>
				</div>
			</template>
		</Banner>

		<form
			class="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-3 xl:grid-cols-6"
			@submit.prevent="applyFilters"
		>
			<SelectField
				v-model="filters.role_type"
				label="Роль покупателя"
				name="role_type"
				placeholder="Выберите роль"
				:options="roleOptions"
				:disabled="loadingRoles"
			/>

			<TextField v-model.trim="filters.email" label="Email" name="email" placeholder="Email" />
			<TextField v-model.trim="filters.first_name" label="Имя" name="first_name" placeholder="Имя" />
			<TextField v-model.trim="filters.last_name" label="Фамилия" name="last_name" placeholder="Фамилия" />
			<TextField v-model.trim="filters.phone_number" label="Телефон" name="phone_number" placeholder="Телефон" />
			<div class="flex items-end gap-2">
				<Button type="submit" size="sm">Фильтр</Button>
				<Button type="button" variant="outline" size="sm" :on-click="resetFilters">Сброс</Button>
			</div>
		</form>

		<UsersTable
			v-model:selected-users="selectedUsers"
			:users="users"
			:loading="loading"
			:pagination="{ limit, offset }"
			@edit="editUser"
			@delete="deleteUser"
		/>

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />
	</div>
</template>
