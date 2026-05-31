<script setup lang="ts">
	import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
	import { toast } from 'vue3-toastify'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import NameSlugTable from '../components/NameSlugTable.vue'
	const NameSlugCreateModal = defineAsyncComponent(() => import('../components/NameSlugCreateModal.vue'))

	import { DiscountTypesIcon } from '@/shared/icons'
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
			items.value = await api.listDiscountTypes()
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
			await api.deleteDiscountType(selectedItem.value.id)
			showDeleteModal.value = false
			selectedItem.value = null
			toast.success('Тип скидки удалён')
			await load()
		} finally {
			loadingDeleteModal.value = false
		}
	}
</script>

<template>
	<div class="space-y-6">
		<Banner
			title="Типы скидок"
			subtitle="Список типов скидок и управление ими."
			:icon="DiscountTypesIcon"
			:total="total"
		>
			<template #actions>
				<Button type="button" size="sm" :on-click="openCreate">Добавить тип скидки</Button>
			</template>
		</Banner>

		<NameSlugTable
			:items="items"
			:loading="loading"
			empty-text="Пока нет типов скидок."
			@edit="editItem"
			@delete="deleteItem"
		/>

		<NameSlugCreateModal
			v-if="showModal"
			:open="showModal"
			:item="selectedItem"
			title-create="Добавить тип скидки"
			title-edit="Редактировать тип скидки"
			success-create-message="Тип скидки добавлен"
			success-update-message="Тип скидки обновлён"
			:on-create="api.createDiscountType"
			:on-update="api.updateDiscountType"
			@close="closeModal"
			@saved="load"
		/>

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedItem?.name"
			entity-name="тип скидки"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
