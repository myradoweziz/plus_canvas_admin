<script setup lang="ts">
	import { computed, defineAsyncComponent, onMounted, ref } from 'vue'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import RolesTable from '../components/RolesTable.vue'
	const RoleCreateModal = defineAsyncComponent(() => import('../components/RoleCreateModal.vue'))

	import { UsersIcon } from '@/shared/icons'
	import { api as rolesApi } from '../api'
	import type { Role } from '../types'

	const loading = ref(false)
	const roles = ref<Role[]>([])
	const showRoleModal = ref(false)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)
	const selectedRole = ref<Role | null>(null)
	const selectedEditRole = ref<Role | null>(null)
	const total = ref(0)
	const limit = ref(10)
	const offset = ref(0)
	const filters = ref({
		search: ''
	})

	const load = async () => {
		loading.value = true
		try {
			const result = await rolesApi.listRoles({
				name: filters.value.search,
				limit: limit.value,
				offset: offset.value
			})
			roles.value = result.items
			total.value = result.total
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const openCreate = () => {
		selectedEditRole.value = null
		showRoleModal.value = true
	}

	const editRole = (role: Role) => {
		selectedEditRole.value = role
		showRoleModal.value = true
	}

	const closeRoleModal = () => {
		showRoleModal.value = false
		selectedEditRole.value = null
	}

	const deleteRole = (role: Role) => {
		selectedRole.value = role
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedRole.value?.id) return
		loadingDeleteModal.value = true
		try {
			await rolesApi.deleteRole(selectedRole.value.id)
			showDeleteModal.value = false
			selectedRole.value = null
			await load()
		} finally {
			loadingDeleteModal.value = false
		}
	}

	const applyFilters = async () => {
		offset.value = 0
		await load()
	}

	const resetFilters = async () => {
		filters.value = { search: '' }
		limit.value = 10
		offset.value = 0
		await load()
	}

	const changeOffset = async (value: number) => {
		offset.value = value
		await load()
	}

	const modalRole = computed(() => selectedEditRole.value)
</script>

<template>
	<div class="space-y-6">
		<Banner title="Роли" subtitle="Список ролей и управление ими." :icon="UsersIcon" :total="total">
			<template #actions>
				<Button type="button" size="sm" :on-click="openCreate">Добавить роль</Button>
			</template>
		</Banner>

		<form
			class="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-4"
			@submit.prevent="applyFilters"
		>
			<TextField v-model.trim="filters.search" label="Поиск" name="search" placeholder="Поиск" />

			<div class="flex items-end gap-2">
				<Button type="submit" size="sm">Фильтр</Button>
				<Button type="button" variant="outline" size="sm" :on-click="resetFilters">Сброс</Button>
			</div>
		</form>

		<RolesTable
			:roles="roles"
			:loading="loading"
			:pagination="{ limit, offset }"
			@edit="editRole"
			@delete="deleteRole"
		/>

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<RoleCreateModal
			v-if="showRoleModal"
			:open="showRoleModal"
			:role="modalRole"
			@close="closeRoleModal"
			@saved="load"
		/>

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedRole?.name"
			entity-name="role"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
