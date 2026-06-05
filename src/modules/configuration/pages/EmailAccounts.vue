<script setup lang="ts">
	import { onMounted, ref } from 'vue'
	import { useRouter } from 'vue-router'
	import { toast } from 'vue3-toastify'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import EmailAccountsTable from '../components/email-accounts/EmailAccountsTable.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { ConfigurationIcon } from '@/shared/icons'
	import { api } from '../api'
	import type { EmailAccount } from '../types'

	const router = useRouter()

	const loading = ref(false)
	const items = ref<EmailAccount[]>([])
	const selectedItem = ref<EmailAccount | null>(null)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)
	const total = ref(0)
	const limit = ref(15)
	const offset = ref(0)

	const load = async () => {
		loading.value = true
		try {
			const result = await api.listEmailAccounts({ limit: limit.value, offset: offset.value })
			items.value = result.items
			total.value = result.total
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const openCreate = () => {
		router.push('/admin-panel/configuration/email-accounts/create')
	}

	const editItem = (item: EmailAccount) => {
		if (!item.id) return
		router.push(`/admin-panel/configuration/email-accounts/${item.id}/edit`)
	}

	const deleteItem = (item: EmailAccount) => {
		selectedItem.value = item
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedItem.value?.id) return

		loadingDeleteModal.value = true
		try {
			await api.deleteEmailAccount(selectedItem.value.id)
			toast.success('Email-аккаунт удалён')
			showDeleteModal.value = false
			selectedItem.value = null
			await load()
		} catch (err) {
			const msg = getFirstBackendValidationMessage(err)
			if (msg) toast.error(msg)
			else throw err
		} finally {
			loadingDeleteModal.value = false
		}
	}

	const changeOffset = async (value: number) => {
		offset.value = value
		await load()
	}
</script>

<template>
	<div class="space-y-6">
		<Banner
			title="Email-аккаунты"
			subtitle="Список email-аккаунтов и управление ими."
			:icon="ConfigurationIcon"
			:total="total"
		>
			<template #actions>
				<Button type="button" size="sm" :on-click="openCreate">Добавить email-аккаунт</Button>
			</template>
		</Banner>

		<EmailAccountsTable :items="items" :loading="loading" @edit="editItem" @delete="deleteItem" />

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedItem?.email"
			entity-name="email-аккаунт"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
