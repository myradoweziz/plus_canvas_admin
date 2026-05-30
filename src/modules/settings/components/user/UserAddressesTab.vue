<script setup lang="ts">
	import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import UserAddressesTable from './UserAddressesTable.vue'

	const UserAddressModal = defineAsyncComponent(() => import('./UserAddressModal.vue'))

	import { api } from '../../api'
	import type { User, UserProfileAddress } from '../../types'

	const props = defineProps<{ userId: number; user?: User | null }>()

	const loading = ref(false)
	const loadingDeleteModal = ref(false)
	const addresses = ref<UserProfileAddress[]>([])
	const showAddressModal = ref(false)
	const showDeleteModal = ref(false)
	const selectedAddress = ref<UserProfileAddress | null>(null)
	const selectedEditAddress = ref<UserProfileAddress | null>(null)

	const modalAddress = computed(() => selectedEditAddress.value)

	const loadAddresses = async () => {
		loading.value = true
		try {
			addresses.value = await api.listUserAddresses(props.userId)
		} catch {
			addresses.value = []
			toast.error('Не удалось загрузить адреса')
		} finally {
			loading.value = false
		}
	}

	const openCreate = () => {
		selectedEditAddress.value = null
		showAddressModal.value = true
	}

	const editAddress = (address: UserProfileAddress) => {
		selectedEditAddress.value = address
		showAddressModal.value = true
	}

	const closeAddressModal = () => {
		showAddressModal.value = false
		selectedEditAddress.value = null
	}

	const deleteAddress = (address: UserProfileAddress) => {
		selectedAddress.value = address
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedAddress.value?.id) return
		loadingDeleteModal.value = true
		try {
			await api.deleteUserAddress(props.userId, selectedAddress.value.id)
			toast.success('Адрес удалён')
			showDeleteModal.value = false
			selectedAddress.value = null
			await loadAddresses()
		} catch {
			toast.error('Не удалось удалить адрес')
		} finally {
			loadingDeleteModal.value = false
		}
	}

	const deleteTitle = computed(() => {
		const address = selectedAddress.value
		if (!address) return ''
		const name = [address.first_name, address.last_name].filter(Boolean).join(' ').trim()
		return name || address.address || `Адрес #${address.id}`
	})

	onMounted(loadAddresses)

	watch(
		() => props.userId,
		() => loadAddresses()
	)
</script>

<template>
	<div class="space-y-4">
		<div class="flex items-center justify-end">
			<Button type="button" size="sm" :on-click="openCreate">Добавить адрес</Button>
		</div>

		<UserAddressesTable
			:addresses="addresses"
			:loading="loading"
			@edit="editAddress"
			@delete="deleteAddress"
		/>

		<UserAddressModal
			v-if="showAddressModal"
			:open="showAddressModal"
			:user-id="userId"
			:address="modalAddress"
			:user="user"
			@close="closeAddressModal"
			@saved="loadAddresses"
		/>

		<DeleteModal
			:open="showDeleteModal"
			:title="deleteTitle"
			entity-name="address"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
