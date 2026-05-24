<script setup lang="ts">
	import { computed, defineAsyncComponent, onMounted, ref } from 'vue'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import PermissionsTable from '../components/PermissionsTable.vue'
	const PermissionCreateModal = defineAsyncComponent(() => import('../components/PermissionCreateModal.vue'))

	import { PermissionsIcon } from '@/shared/icons'
	import { api as permissionsApi } from '../api'
	import type { Permission } from '../types'

	const loading = ref(false)
	const permissions = ref<Permission[]>([])
	const showPermissionModal = ref(false)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)
	const selectedPermission = ref<Permission | null>(null)
	const selectedEditPermission = ref<Permission | null>(null)
	const total = ref(0)
	const limit = ref(10)
	const offset = ref(0)
	const filters = ref({
		search: ''
	})
	const openCreate = () => {
		selectedEditPermission.value = null
		showPermissionModal.value = true
	}

	const editPermission = (permission: Permission) => {
		selectedEditPermission.value = permission
		showPermissionModal.value = true
	}

	const closeEdit = () => {
		showPermissionModal.value = false
		selectedEditPermission.value = null
	}

	const load = async () => {
		loading.value = true
		try {
			const result = await permissionsApi.listPermissions({
				name: filters.value.search,
				limit: limit.value,
				offset: offset.value
			})
			permissions.value = result.items
			total.value = result.total
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const deletePermission = (permission: Permission) => {
		selectedPermission.value = permission
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedPermission.value?.id) return
		loadingDeleteModal.value = true
		try {
			await permissionsApi.deletePermission(selectedPermission.value.id)
			showDeleteModal.value = false
			selectedPermission.value = null
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

	const modalPermission = computed(() => selectedEditPermission.value)
</script>

<template>
	<div class="space-y-6">
		<Banner title="Права" subtitle="Список прав и управление ими." :icon="PermissionsIcon" :total="total">
			<template #actions>
				<Button type="button" size="sm" :on-click="openCreate">Добавить право</Button>
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

		<PermissionsTable :permissions="permissions" :loading="loading" @edit="editPermission" @delete="deletePermission" />

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<PermissionCreateModal
			v-if="showPermissionModal"
			:open="showPermissionModal"
			:permission="modalPermission"
			@close="closeEdit"
			@saved="load"
		/>

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedPermission?.name"
			entity-name="permission"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
