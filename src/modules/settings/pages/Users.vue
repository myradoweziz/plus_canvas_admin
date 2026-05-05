<script setup lang="ts">
	import { computed, onMounted, ref } from 'vue'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { UsersIcon } from '@/shared/icons'
	import { usersApi } from '../api/users'
	import UserCreateModal from '../components/UserCreateModal.vue'
	import UsersTable from '../components/UsersTable.vue'
	import type { User } from '../types/user'

	const loading = ref(false)
	const users = ref<User[]>([])
	const showUserModal = ref(false)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)
	const selectedUser = ref<User | null>(null)
	const selectedEditUser = ref<User | null>(null)
	const total = ref(0)
	const limit = ref(10)
	const offset = ref(0)
	const filters = ref({
		search: ''
	})

	const load = async () => {
		loading.value = true
		try {
			const result = await usersApi.listUsers({
				name: filters.value.search,
				limit: limit.value,
				offset: offset.value
			})
			users.value = result.items
			total.value = result.total
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const openCreate = () => {
		selectedEditUser.value = null
		showUserModal.value = true
	}

	const editUser = (user: User) => {
		selectedEditUser.value = user
		showUserModal.value = true
	}

	const closeUserModal = () => {
		showUserModal.value = false
		selectedEditUser.value = null
	}

	const deleteUser = (user: User) => {
		selectedUser.value = user
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedUser.value?.id) return
		loadingDeleteModal.value = true
		try {
			await usersApi.deleteUser(selectedUser.value.id)
			showDeleteModal.value = false
			selectedUser.value = null
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

	const modalUser = computed(() => selectedEditUser.value)
</script>

<template>
	<div class="space-y-6">
		<Banner title="Users" subtitle="Список users и управление ими." :icon="UsersIcon">
			<template #actions>
				<Button type="button" size="sm" :on-click="openCreate">Добавить user</Button>
			</template>
		</Banner>

		<form
			class="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-4"
			@submit.prevent="applyFilters"
		>
			<TextField v-model.trim="filters.search" label="Search" name="search" placeholder="Search" />

			<div class="flex items-end gap-2">
				<Button type="submit" size="sm">Фильтр</Button>
				<Button type="button" variant="outline" size="sm" :on-click="resetFilters">Сброс</Button>
			</div>
		</form>

		<UsersTable :users="users" :loading="loading" @edit="editUser" @delete="deleteUser" />

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<UserCreateModal :open="showUserModal" :user="modalUser" @close="closeUserModal" @saved="load" />

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedUser?.name"
			entity-name="user"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>

