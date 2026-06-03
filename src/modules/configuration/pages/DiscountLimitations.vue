<script setup lang="ts">
	import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
	import { toast } from 'vue3-toastify'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import NameSlugTable from '../components/name-slug/NameSlugTable.vue'
	const NameSlugCreateModal = defineAsyncComponent(() => import('../components/name-slug/NameSlugCreateModal.vue'))

	import { DiscountLimitationsIcon } from '@/shared/icons'
	import { api } from '../api'
	import type { NameSlugEntity } from '../types'

	const loading = ref(false)
	const items = ref<NameSlugEntity[]>([])
	const showModal = ref(false)
	const selectedItem = ref<NameSlugEntity | null>(null)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)

	const total = computed(() => items.value.length)

	const load = async () => {
		loading.value = true
		try {
			items.value = await api.listDiscountLimitations()
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const openCreate = () => {
		selectedItem.value = null
		showModal.value = true
	}

	const closeModal = () => {
		showModal.value = false
		selectedItem.value = null
	}

	const editItem = (item: NameSlugEntity) => {
		selectedItem.value = item
		showModal.value = true
	}

	const deleteItem = (item: NameSlugEntity) => {
		selectedItem.value = item
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedItem.value?.id) return

		loadingDeleteModal.value = true
		try {
			await api.deleteDiscountLimitation(selectedItem.value.id)
			showDeleteModal.value = false
			selectedItem.value = null
			toast.success('Ограничение скидки удалено')
			await load()
		} finally {
			loadingDeleteModal.value = false
		}
	}
</script>

<template>
	<div class="space-y-6">
		<Banner
			title="Ограничения скидок"
			subtitle="Список ограничений скидок и управление ими."
			:icon="DiscountLimitationsIcon"
			:total="total"
		>
			<template #actions>
				<Button type="button" size="sm" :on-click="openCreate">Добавить ограничение</Button>
			</template>
		</Banner>

		<NameSlugTable
			:items="items"
			:loading="loading"
			empty-text="Пока нет ограничений скидок."
			@edit="editItem"
			@delete="deleteItem"
		/>

		<NameSlugCreateModal
			v-if="showModal"
			:open="showModal"
			:item="selectedItem"
			title-create="Добавить ограничение скидки"
			title-edit="Редактировать ограничение скидки"
			success-create-message="Ограничение скидки добавлено"
			success-update-message="Ограничение скидки обновлено"
			:on-create="api.createDiscountLimitation"
			:on-update="api.updateDiscountLimitation"
			@close="closeModal"
			@saved="load"
		/>

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedItem?.name"
			entity-name="ограничение скидки"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
